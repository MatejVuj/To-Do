import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, ActivityIndicator, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, collection, getDocs, updateDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { firestore, auth } from '@/FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { parseISO, format, addMinutes, isValid } from 'date-fns';
import { styles, darkStyles } from '../styles/notificationsStyle';

// Configure notifications with updated API
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NotificationsScreen = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userDarkMode, setUserDarkMode] = React.useState(false);

  // Check for user authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        checkNotificationPreference(user.uid);
      } else {
        setCurrentUser(null);
        setTasks([]);
        setNotificationsEnabled(false);
      }
    });
    return unsubscribe;
  }, []);

  // Check if notifications are enabled in user preferences
  const checkNotificationPreference = async (userId) => {
    try {
      const userRef = doc(firestore, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const preferences = userData.preferences || {};
        const notificationsOn = preferences.notifications === true;
        setNotificationsEnabled(notificationsOn);
        return notificationsOn;
      }
      return false;
    } catch (error) {
      console.error('Error checking notification preference:', error);
      return false;
    }
  };

  // Request notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Notification permissions are required to send task reminders.',
            [{ text: 'OK' }]
          );
          return;
        }

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('task-reminders', {
            name: 'Task Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#6200EE',
            sound: 'default',
          });
        }
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
        Alert.alert('Error', `Failed to request permissions: ${error.message}`);
      }
    };

    requestPermissions();
  }, []);

  // Set up notification listeners
  useEffect(() => {
    const notificationReceivedListener = Notifications.addNotificationReceivedListener(notification => {
      // No-op: could update in-app state if needed
    });

    const notificationResponseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      if (data && data.taskId && data.type === 'task_reminder') {
        // Handle navigation to a task if desired
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationReceivedListener);
      Notifications.removeNotificationSubscription(notificationResponseListener);
    };
  }, []);

  // Load tasks correctly
  const loadTasks = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const tasksRef = collection(firestore, `users/${currentUser.uid}/tasks`);
      const snapshot = await getDocs(tasksRef);

      const loadedTasks = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));

      setTasks(loadedTasks);
      setLoading(false);
      return loadedTasks;
    } catch (error) {
      console.error('Error loading tasks:', error);
      setLoading(false);
      return [];
    }
  };

  // Check for scheduled notifications and synchronize with tasks
  const checkScheduledNotifications = async (tasksToCheck = null) => {
    if (!currentUser) return;
    try {
      const effectiveTasks = Array.isArray(tasksToCheck) ? tasksToCheck : tasks;

      // Always refresh currently scheduled notifications for display
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      setScheduledNotifications(scheduled);

      // If user disabled notifications, do not schedule anything new
      if (!notificationsEnabled) return;

      const expoScheduledIds = new Set(scheduled.map(n => n.identifier));
      let needsUpdate = false;
      const updatedTasks = [...effectiveTasks];

      for (let i = 0; i < updatedTasks.length; i++) {
        const task = updatedTasks[i];
        if (!task.enableReminder) continue;
        if (!task.due_date || !task.due_time) continue;

        const dueDateTime = parseISO(`${task.due_date}T${task.due_time}:00`);
        if (!isValid(dueDateTime)) continue;

        const notificationTime = addMinutes(dueDateTime, -75);
        const now = new Date();

        // If notification time already passed, clear any scheduled marker
        if (notificationTime <= now) {
          if (task.notificationScheduled) {
            const taskRef = doc(firestore, `users/${currentUser.uid}/tasks/${task.id}`);
            await updateDoc(taskRef, {
              notificationScheduled: false,
              notificationId: null,
              notificationTime: null,
            });
            updatedTasks[i] = { ...task, notificationScheduled: false, notificationId: null, notificationTime: null };
            needsUpdate = true;
          }
          continue;
        }

        const hasExpoNotification = task.notificationId && expoScheduledIds.has(task.notificationId);
        const targetTimeIso = notificationTime.toISOString();

        if (!hasExpoNotification || !task.notificationScheduled || task.notificationTime !== targetTimeIso) {
          if (task.notificationId) {
            try {
              await Notifications.cancelScheduledNotificationAsync(task.notificationId);
            } catch {
              // ignore cancellation errors
            }
          }

          try {
            const newNotificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: `Reminder: ${task.title}`,
                body: task.description || 'Your task is due soon!',
                data: { taskId: task.id, type: 'task_reminder' },
                sound: 'default',
              },
              trigger: { date: notificationTime },
            });

            const taskRef = doc(firestore, `users/${currentUser.uid}/tasks/${task.id}`);
            await updateDoc(taskRef, {
              notificationId: newNotificationId,
              notificationScheduled: true,
              notificationTime: targetTimeIso,
            });

            updatedTasks[i] = {
              ...task,
              notificationId: newNotificationId,
              notificationScheduled: true,
              notificationTime: targetTimeIso,
            };
            needsUpdate = true;
          } catch (error) {
            console.error(`Error scheduling notification for task ${task.id}:`, error);
          }
        }
      }

      if (needsUpdate) {
        setTasks(updatedTasks);
        const refreshedScheduled = await Notifications.getAllScheduledNotificationsAsync();
        setScheduledNotifications(refreshedScheduled);
      }
    } catch (error) {
      console.error('Error checking scheduled notifications:', error);
      Alert.alert('Error', `Failed to check scheduled notifications: ${error.message}`);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (currentUser) {
      const loaded = await loadTasks();
      await checkScheduledNotifications(loaded);
    }
    setRefreshing(false);
  };

  const toggleNotificationsEnabled = async (value) => {
    setNotificationsEnabled(value);
    try {
      const userRef = doc(firestore, 'users', currentUser.uid);
      await updateDoc(userRef, { 'preferences.notifications': value });

      if (!value) {
        // Cancel all scheduled notifications and clear related fields
        await Notifications.cancelAllScheduledNotificationsAsync();

        const tasksRef = collection(firestore, `users/${currentUser.uid}/tasks`);
        const snapshot = await getDocs(tasksRef);
        const batch = writeBatch(firestore);
        snapshot.docs.forEach(taskDoc => {
          const taskRef = doc(firestore, `users/${currentUser.uid}/tasks/${taskDoc.id}`);
          batch.update(taskRef, { notificationId: null, notificationScheduled: false, notificationTime: null });
        });
        await batch.commit();

        // Reflect changes locally
        setTasks(prev => prev.map(t => ({ ...t, notificationId: null, notificationScheduled: false, notificationTime: null })));
        setScheduledNotifications([]);
      } else {
        // Re-check and (re)schedule as needed
        const loaded = await loadTasks();
        await checkScheduledNotifications(loaded);
      }
    } catch (error) {
      console.error('Error toggling notifications preference:', error);
      Alert.alert('Error', 'Failed to update notification preference.');
    }
  };

  // Listen to user dark mode preference
  React.useEffect(() => {
    let unsubscribeAuth;
    let unsubscribeSnapshot;

    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        unsubscribeSnapshot = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setUserDarkMode(Boolean(data?.preferences?.darkMode));
          }
        });
      } else {
        setUserDarkMode(false);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  const selectedStyle = userDarkMode ? darkStyles : styles;

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const load = async () => {
        if (!currentUser) return;
        const loaded = await loadTasks();
        if (!isActive) return;
        await checkScheduledNotifications(loaded);
      };
      load();
      return () => {
        isActive = false;
      };
    }, [currentUser, notificationsEnabled])
  );

  return (
    <View style={selectedStyle.container}>
      <LinearGradient
        colors={selectedStyle.headerGradientColors}
        style={selectedStyle.header}
      >
        <Text style={selectedStyle.headerTitle}>Notifications & Reminders</Text>
        <TouchableOpacity onPress={handleRefresh} style={selectedStyle.refreshButton}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <View style={selectedStyle.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={selectedStyle.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <ScrollView style={selectedStyle.scrollViewContent}>
          <View style={selectedStyle.section}>
            <View style={selectedStyle.switchRow}>
              <Text style={selectedStyle.sectionTitle}>Enable All Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotificationsEnabled}
                trackColor={{ false: "#767577", true: "#6200EE" }}
                thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
              />
            </View>
            <Text style={selectedStyle.infoText}>
              Turn off to disable all task reminders. You can re-enable them at any time.
            </Text>
          </View>

          <View style={selectedStyle.section}>
            <Text style={selectedStyle.sectionTitle}>Scheduled Task Reminders</Text>
            <Text style={selectedStyle.infoText}>
              Notifications are automatically scheduled 1 hour and 15 minutes before the task due time when you create a task with "Enable Reminder" turned on.
            </Text>
            <Text style={selectedStyle.debugText}>
              Loaded {tasks.filter(t => t.enableReminder).length} tasks with reminders. Found {scheduledNotifications.length} scheduled notifications.
            </Text>
            {tasks.filter(task => task.enableReminder).length === 0 ? (
              <Text style={selectedStyle.noTasksText}>No tasks with reminders found.</Text>
            ) : (
              tasks.filter(task => task.enableReminder).map(task => (
                <View key={task.id} style={selectedStyle.taskItem}>
                  <View style={[selectedStyle.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
                  <View style={selectedStyle.taskContent}>
                    <Text style={selectedStyle.taskTitle}>{task.title}</Text>
                    {task.due_date && task.due_time && (
                      <Text style={selectedStyle.taskDateTime}>
                        Due: {format(parseISO(`${task.due_date}T${task.due_time}:00`), 'MMM dd, yyyy HH:mm')}
                      </Text>
                    )}
                    {task.notificationScheduled ? (
                      <Text style={selectedStyle.notificationStatusScheduled}>
                        Notification Scheduled for: {task.notificationTime ? format(parseISO(task.notificationTime), 'MMM dd, yyyy HH:mm') : 'N/A'}
                      </Text>
                    ) : (
                      <Text style={selectedStyle.notificationStatusNotScheduled}>
                        Notification Not Scheduled
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'red': return '#ff5252';
    case 'orange': return '#ffa726';
    case 'green': return '#b2ff59';
    default: return '#ccc';
  }
};

export default NotificationsScreen;