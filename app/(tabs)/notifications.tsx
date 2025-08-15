import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ActivityIndicator, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, auth, storage } from '@/FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { parseISO, format, addMinutes, isValid } from 'date-fns';
import { styles, darkStyles } from '../styles/notificationsStyle';

// Configure notifications with updated API
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

const NotificationsScreen = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notificationSounds, setNotificationSounds] = useState({
    red: null,    // High priority
    orange: null, // Medium priority
    green: null,  // Low priority
  });
  const [loading, setLoading] = useState(true);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userDarkMode, setUserDarkMode] = React.useState({darkMode: false})

  // Check for user authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User is signed in:', user.uid);
        setCurrentUser(user);
        checkNotificationPreference(user.uid);
      } else {
        console.log('User is signed out');
        setCurrentUser(null);
        setNotificationSounds({ red: null, orange: null, green: null });
        setTasks([]);
        setNotificationsEnabled(false);
      }
    });
    return unsubscribe;
  }, []);

  // Check if notifications are enabled in user preferences
  const checkNotificationPreference = async (userId) => {
    try {
      const userRef = doc(firestore, `users/${userId}`);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const preferences = userData.preferences || {};
        
        // Check if notifications preference exists and is true
        const notificationsOn = preferences.notifications === true;
        console.log('Notifications preference:', notificationsOn);
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
          console.log('Notification permissions not granted');
          return;
        }

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('task-reminders', {
            name: 'Task Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#6200EE',
            sound: 'default', // Use default sound for Android channel
          });
        }

        console.log('Notification permissions granted');
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
        Alert.alert('Error', `Failed to request permissions: ${error.message}`);
      }
    };

    requestPermissions();
  }, []);

  // Set up notification listeners
  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    const notificationReceivedListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification
    const notificationResponseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      const { data } = response.notification.request.content;
      
      // Handle notification tap based on data
      if (data && data.taskId && data.type === 'task_reminder') {
        // Navigate to task details or handle as needed
        console.log('Task reminder tapped for task:', data.taskId);
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationReceivedListener);
      Notifications.removeNotificationSubscription(notificationResponseListener);
    };
  }, []);

  // Load data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (currentUser) {
        loadNotificationSounds();
        loadTasks();
        checkScheduledNotifications();
      }
      return () => {};
    }, [currentUser])
  );

  // Load notification sounds
  const loadNotificationSounds = async () => {
    try {
    setLoading(true);
    const userDocRef = doc(firestore, `users`, currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      const sounds = data.prioritySounds || {};

      setNotificationSounds({
        red: sounds.red || null,
        orange: sounds.orange || null,
        green: sounds.green || null
      });

      // Cache
      await AsyncStorage.setItem('notificationSound_red', sounds.red || '');
      await AsyncStorage.setItem('notificationSound_orange', sounds.orange || '');
      await AsyncStorage.setItem('notificationSound_green', sounds.green || '');
    }

    setLoading(false);
  } catch (error) {
    console.error('Error loading sounds:', error);
    setLoading(false);
  }
};

// Load tasks correctly
const loadTasks = async () => {
  try {
    setLoading(true);
    const tasksRef = collection(firestore, `users/${currentUser.uid}/tasks`);
    const snapshot = await getDocs(tasksRef);

    const loadedTasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTasks(loadedTasks);
    setLoading(false);
  } catch (error) {
    console.error('Error loading tasks:', error);
    setLoading(false);
  }
  };

  // Check for scheduled notifications and synchronize with tasks
  const checkScheduledNotifications = async () => {
    try {
      // Get all scheduled notifications from Expo
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`Found ${scheduled.length} scheduled notifications in Expo`);
      
      // Create a map of notification identifiers to make lookup faster
      const expoScheduledIds = new Set(scheduled.map(n => n.identifier));
      
      let needsUpdate = false;
      const updatedTasks = [...tasks];
      
      for (let i = 0; i < updatedTasks.length; i++) {
        const task = updatedTasks[i];
        
        // Only process tasks that have enableReminder set to true
        if (!task.enableReminder) continue;

        // Skip tasks without due date/time
        if (!task.due_date || !task.due_time) continue;
        
        // Parse due date and time
        const dueDateTime = parseISO(`${task.due_date}T${task.due_time}:00`);
        
        if (!isValid(dueDateTime)) {
          console.log(`Task ${task.id} has invalid date/time: ${task.due_date} ${task.due_time}`);
          continue;
        }
        
        // Calculate notification time (1 hour and 15 minutes before due time)
        const notificationTime = addMinutes(dueDateTime, -75); // 75 minutes = 1h15m
        
        // Only process if notification time is in the future
        const now = new Date();
        if (notificationTime <= now) {
          console.log(`Task ${task.id} notification time is in the past, skipping`);
          // Ensure notification is marked as unscheduled if time has passed
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
        
        // Check if this task has a notification scheduled in Expo's system and in Firestore
        const hasExpoNotification = task.notificationId && expoScheduledIds.has(task.notificationId);
        
        // If task should have a notification but doesn't have one in Expo or Firestore is inconsistent
        if (!hasExpoNotification || !task.notificationScheduled || task.notificationTime !== format(notificationTime, 'yyyy-MM-dd HH:mm:ss')) {
          console.log(`Task ${task.id} needs a notification scheduled or updated`);
          
          // Cancel existing notification if any (e.g., if due time changed)
          if (task.notificationId) {
            try {
              await Notifications.cancelScheduledNotificationAsync(task.notificationId);
              console.log(`Canceled old notification ${task.notificationId} for task ${task.id}`);
            } catch (cancelError) {
              console.warn(`Could not cancel notification ${task.notificationId}:`, cancelError);
            }
          }

          try {
            // Schedule a new notification
            const newNotificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: `Reminder: ${task.title}`,
                body: task.description || 'New task has been added!',
                data: { taskId: task.id, type: 'task_reminder' },
                sound: notificationSounds[task.priority] || 'default',
              },
              trigger: {
                date: notificationTime,
              },
            });
            
            console.log(`Scheduled new notification ${newNotificationId} for task ${task.id}`);
            
            // Update task with new notification ID
            const taskRef = doc(firestore, `users/${currentUser.uid}/tasks/${task.id}`);
            await updateDoc(taskRef, { 
              notificationId: newNotificationId,
              notificationScheduled: true,
              notificationTime: format(notificationTime, 'yyyy-MM-dd HH:mm:ss')
            });
            
            // Update local task data
            updatedTasks[i] = {
              ...task,
              notificationId: newNotificationId,
              notificationScheduled: true,
              notificationTime: format(notificationTime, 'yyyy-MM-dd HH:mm:ss')
            };
            
            needsUpdate = true;
          } catch (error) {
            console.error(`Error scheduling notification for task ${task.id}:`, error);
          }
        }
      }
      
      // Update tasks state if needed
      if (needsUpdate) {
        setTasks(updatedTasks);
        
        // Refresh scheduled notifications list
        const refreshedScheduled = await Notifications.getAllScheduledNotificationsAsync();
        setScheduledNotifications(refreshedScheduled);
        console.log(`After synchronization: Found ${refreshedScheduled.length} scheduled notifications`);
      }
    } catch (error) {
      console.error('Error checking scheduled notifications:', error);
      Alert.alert('Error', `Failed to check scheduled notifications: ${error.message}`);
    }
  };

  // Upload a custom sound for a priority level
  const uploadSound = async (priority) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/mpeg',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || !result.assets[0]) {
        console.log('Document picking canceled');
        return;
      }

      const file = result.assets[0];

      if (!file.name.toLowerCase().endsWith('.mp3')) {
        Alert.alert('Error', 'File must be an MP3');
        return;
      }

      const fileInfo = await FileSystem.getInfoAsync(file.uri);
      if (fileInfo.size > 5 * 1024 * 1024) {
        Alert.alert('Error', 'Audio file must be smaller than 5MB');
        return;
      }

      setLoading(true);

      const response = await fetch(file.uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `users/${currentUser.uid}/notificationSounds/${priority}.mp3`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Save to Firestore - ensure we're using the correct structure based on your screenshots
      const userDocRef = doc(firestore, `users/${currentUser.uid}`);
      
      // Get current user data first
      const userSnap = await getDoc(userDocRef);
      let userData = {};
      
      if (userSnap.exists()) {
        userData = userSnap.data();
      }
      
      // Update or create prioritySounds object
      const prioritySounds = userData.prioritySounds || {};
      prioritySounds[priority] = downloadURL;
      
      // Update Firestore with the new structure
      await setDoc(userDocRef, {
        ...userData,
        prioritySounds
      }, { merge: true });

      // Update state
      setNotificationSounds(prev => ({ ...prev, [priority]: downloadURL }));
      
      // Cache locally
      await AsyncStorage.setItem(`notificationSound_${priority}`, downloadURL);

      setLoading(false);
      Alert.alert('Success', `Notification sound for ${getPriorityName(priority)} priority uploaded.`);
    } catch (error) {
      console.error(`Error uploading sound for ${priority}:`, error);
      setLoading(false);
      Alert.alert('Error', `Failed to upload sound: ${error.message}`);
    }
  };

  // Test a notification sound
  const testNotificationSound = async (priority) => {
    try {
      // Note: Due to Expo limitations, custom sounds in local notifications
      // may not work as expected. We'll use the default sound for testing.
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Test ${getPriorityName(priority)} Priority Sound`,
          body: `This is a test notification with ${getPriorityName(priority)} priority sound.`,
          data: { type: 'test', priority },
          // Using default sound as Expo has limitations with custom sounds
          sound: notificationSounds[priority] || 'default',
        },
        trigger: null, // Immediate notification
      });

      Alert.alert(
        'Notification Sent', 
        'A test notification has been sent. Note: Custom sounds may only work for scheduled notifications, not test notifications.'
      );
    } catch (error) {
      console.error(`Error testing ${priority} sound:`, error);
      Alert.alert('Error', `Failed to test sound: ${error.message}`);
    }
  };

  // Schedule a notification for a task
  const scheduleTaskNotification = async (task) => {
    try {
      if (!task.enableReminder) return; // Only schedule if reminder is enabled

      if (!task.due_date || !task.due_time) {
        Alert.alert('Error', 'Task must have a due date and time to schedule a notification.');
        return;
      }

      // Parse due date and time
      const dueDateTime = parseISO(`${task.due_date}T${task.due_time}:00`);
      
      if (!isValid(dueDateTime)) {
        Alert.alert('Error', 'Invalid date or time format.');
        return;
      }
      
      // Calculate notification time (1 hour and 15 minutes before due time)
      const notificationTime = addMinutes(dueDateTime, -75); // 75 minutes = 1h15m
      
      // Don't schedule if the notification time is in the past
      const now = new Date();
      if (notificationTime <= now) {
        Alert.alert('Error', 'The notification time is in the past. Cannot schedule.');
        return;
      }

      // Cancel any existing notification for this task
      if (task.notificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(task.notificationId);
          console.log(`Canceled existing notification ${task.notificationId} for task ${task.id}`);
        } catch (cancelError) {
          console.warn(`Could not cancel notification ${task.notificationId}:`, cancelError);
        }
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Reminder: ${task.title}`,
          body: task.description || 'Your task is due soon!',
          data: { taskId: task.id, type: 'task_reminder' },
          sound: notificationSounds[task.priority] || 'default',
        },
        trigger: {
          date: notificationTime,
        },
      });

      console.log(`Scheduled notification ${identifier} for task ${task.id}`);
      
      // Update task in Firestore with new notification details
      const taskRef = doc(firestore, `users/${currentUser.uid}/tasks/${task.id}`);
      await updateDoc(taskRef, {
        notificationId: identifier,
        notificationScheduled: true,
        notificationTime: format(notificationTime, 'yyyy-MM-dd HH:mm:ss'),
      });

      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === task.id 
            ? { ...t, notificationId: identifier, notificationScheduled: true, notificationTime: format(notificationTime, 'yyyy-MM-dd HH:mm:ss') } 
            : t
        )
      );
      Alert.alert('Success', 'Notification scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('Error', `Failed to schedule notification: ${error.message}`);
    }
  };

  // Cancel a notification for a task
  const cancelTaskNotification = async (task) => {
    try {
      if (task.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(task.notificationId);
        console.log(`Canceled notification ${task.notificationId} for task ${task.id}`);
        
        // Update task in Firestore
        const taskRef = doc(firestore, `users/${currentUser.uid}/tasks/${task.id}`);
        await updateDoc(taskRef, {
          notificationId: null,
          notificationScheduled: false,
          notificationTime: null,
        });

        // Update local state
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === task.id 
              ? { ...t, notificationId: null, notificationScheduled: false, notificationTime: null } 
              : t
          )
        );
        Alert.alert('Success', 'Notification canceled successfully!');
      } else {
        Alert.alert('Info', 'No notification found to cancel for this task.');
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
      Alert.alert('Error', `Failed to cancel notification: ${error.message}`);
    }
  };

  const getPriorityName = (priority) => {
    switch (priority) {
      case 'red': return 'High';
      case 'orange': return 'Medium';
      case 'green': return 'Low';
      default: return 'Unknown';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'red': return '#ff5252';
      case 'orange': return '#ffa726';
      case 'green': return '#b2ff59';
      default: return '#ccc';
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (currentUser) {
      await loadTasks();
      await checkScheduledNotifications();
    }
    setRefreshing(false);
  };

  const toggleNotificationsEnabled = async (value) => {
    setNotificationsEnabled(value);
    try {
      const userRef = doc(firestore, `users/${currentUser.uid}`);
      await updateDoc(userRef, { 'preferences.notifications': value });
      if (!value) {
        // If notifications are disabled, cancel all scheduled notifications
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('All scheduled notifications canceled due to user preference.');
        // Also update all tasks in Firestore to reflect this change
        const tasksRef = collection(firestore, `users/${currentUser.uid}/tasks`);
        const snapshot = await getDocs(tasksRef);
        const batch = firestore.batch();
        snapshot.docs.forEach(taskDoc => {
          const taskRef = doc(firestore, `users/${currentUser.uid}/tasks/${taskDoc.id}`);
          batch.update(taskRef, { notificationId: null, notificationScheduled: false, notificationTime: null });
        });
        await batch.commit();
        await loadTasks(); // Reload tasks to reflect changes
      } else {
        // If re-enabled, re-check and schedule notifications
        await checkScheduledNotifications();
      }
    } catch (error) {
      console.error('Error toggling notifications preference:', error);
      Alert.alert('Error', 'Failed to update notification preference.');
    }
  };

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) =>{
      if(user){
        const userRef = doc(firestore, `users/`, user.uid)
        const unsubscribeSnaphot =  onSnapshot(userRef, (snapshot) =>{
        if(snapshot.exists()){
          const data = snapshot.data()
          setUserDarkMode(data.preferences.darkMode)
          
        }
        })
        return unsubscribeSnaphot
      }
    })
    return unsubscribe
  }, [])

  const selectedStyle = userDarkMode ? darkStyles : styles

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
            <Text style={selectedStyle.sectionTitle}>Custom Notification Sounds</Text>
            <Text style={selectedStyle.infoText}>
              Upload custom MP3 files for each priority level. Max 5MB.
            </Text>
            {/* Removed individual schedule/cancel buttons as per user request */}
            {['red', 'orange', 'green'].map(priority => (
              <View key={priority} style={selectedStyle.soundRow}>
                <Text style={selectedStyle.soundLabel}>{getPriorityName(priority)} Priority:</Text>
                <TouchableOpacity 
                  style={selectedStyle.uploadButton}
                  onPress={() => uploadSound(priority)}
                >
                  <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                  <Text style={selectedStyle.uploadButtonText}>Upload MP3</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={selectedStyle.testButton}
                  onPress={() => testNotificationSound(priority)}
                >
                  <Ionicons name="play-circle-outline" size={20} color="#fff" />
                  <Text style={selectedStyle.testButtonText}>Test</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={selectedStyle.section}>
            <Text style={selectedStyle.sectionTitle}>Scheduled Task Reminders</Text>
            <Text style={selectedStyle.infoText}>
              Notifications are automatically scheduled 1 hour and 15 minutes before the task due time when you create a task with "Enable Reminder" turned on.
            </Text>
            <Text style={selectedStyle.debugText}>
              Loaded {tasks.length} tasks with reminders. Found {scheduledNotifications.length} scheduled notifications in Expo.
            </Text>
            {tasks.length === 0 ? (
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

export default NotificationsScreen;