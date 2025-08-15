import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore, auth } from '@/FirebaseConfig';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { onAuthStateChanged } from 'firebase/auth';
import { isBefore, parseISO } from 'date-fns';
import { styles, darkStyles} from '../styles/homeStyle';
import { addListener, removeListener } from '../listeners'

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [recentTasks, setRecentTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  });
  const [userDarkMode, setUserDarkMode] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    let unsubscribeUser = () => {};
    let unsubscribeTasks = () => {};
    let unsubscribeAuth = () => {};

   unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        try {
          // Real-time listener for user data
          const userDocRef = doc(firestore, `users/${user.uid}`);
          unsubscribeUser = onSnapshot(userDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
              const userData = docSnapshot.data();
              setUserName(userData.displayName || user.email.split('@')[0]);
              setUserDarkMode(userData.preferences?.darkMode || false);
            } else {
              setUserName(user.email ? user.email.split('@')[0] : 'User');
              setUserDarkMode(false);
            }
            setLoading(false);
          }, (error) => {
            console.error('Error fetching user data:', error);
            if (error.code === 'permission-denied') {
              setUserName(user.email ? user.email.split('@')[0] : 'User');
              setUserDarkMode(false);
            }
            setLoading(false);
          });
          addListener(unsubscribeUser)

          // Real-time listener for tasks
          const tasksCollectionRef = collection(firestore, `users/${user.uid}/tasks`);
          unsubscribeTasks = onSnapshot(tasksCollectionRef, (snapshot) => {
            const allTasks = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            // Sort & get recent tasks
            const sortedRecentTasks = [...allTasks].sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
              const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
              return dateB.getTime() - dateA.getTime();
            }).slice(0, 3);
            setRecentTasks(sortedRecentTasks);

            // Stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const taskStats = {
              total: allTasks.length,
              completed: allTasks.filter(task => task.status === 'completed').length,
              pending: allTasks.filter(task => task.status !== 'completed').length,
              overdue: allTasks.filter(task => {
                if (task.status === 'completed') return false;
                if (!task.due_date) return false;
                const dueDate = parseISO(task.due_date);
                return isBefore(dueDate, today);
              }).length
            };
            setStats(taskStats);
          }, (error) => {
            console.error('Error fetching tasks:', error);
            if (error.code === 'permission-denied') {
              setRecentTasks([]);
              setStats({ total: 0, completed: 0, pending: 0, overdue: 0 });
            }
          });
        } catch (err) {
          console.error('Error setting up listeners:', err);
          setLoading(false);
        }
        addListener(unsubscribeTasks)
      } else {
        setUserName('');
        setRecentTasks([]);
        setStats({ total: 0, completed: 0, pending: 0, overdue: 0 });
        setLoading(false);
      }
    });
    addListener(unsubscribeAuth)

    return () => {
      removeListener(unsubscribeAuth);
      removeListener(unsubscribeUser);
      removeListener(unsubscribeTasks);
      unsubscribeAuth();
      unsubscribeUser();
      unsubscribeTasks();
    };
  }, []);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getCompletionPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const selectedStyle = userDarkMode ? darkStyles : styles;

  const renderTaskItem = (task) => {
    const priorityColor =
      task.priority === 'red' ? selectedStyle.priorityHigh.color :
      task.priority === 'orange' ? selectedStyle.priorityMedium.color :
      selectedStyle.priorityLow.color;

    return (
      <TouchableOpacity
        key={task.id}
        style={selectedStyle.taskItem}
        onPress={() => navigation.navigate('tasks')}
      >
        <View style={[selectedStyle.priorityIndicator, { backgroundColor: priorityColor }]} />
        <View style={selectedStyle.taskContent}>
          <Text
            style={[
              selectedStyle.taskTitle,
              task.status === 'completed' && selectedStyle.completedTaskTitle
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <View style={selectedStyle.taskMeta}>
            {task.due_date && (
              <View style={selectedStyle.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={selectedStyle.metaIcon.color} />
                <Text style={selectedStyle.metaText}>{task.due_date}</Text>
              </View>
            )}
            {task.icon && (
              <Ionicons name={task.icon} size={16} color={selectedStyle.taskIcon.color} />
            )}
          </View>
        </View>
        <Ionicons
          name={task.status === 'completed' ? "checkmark-circle" : "ellipse-outline"}
          size={24}
          color={task.status === 'completed' ? selectedStyle.completedCheckIcon.color : selectedStyle.pendingCheckIcon.color}
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={selectedStyle.loadingContainer}>
        <ActivityIndicator size="large" color={selectedStyle.loadingIndicator.color} />
      </View>
    );
  }

  return (
    <SafeAreaView style={selectedStyle.safeAreaViewContainer}>
      <LinearGradient
        colors={selectedStyle.headerGradientColors}
        style={selectedStyle.header}
      >
        <View style={selectedStyle.headerContent}>
          <View>
            <Text style={selectedStyle.greeting}>{getTimeOfDay()},</Text>
            <Text style={selectedStyle.userName}>{userName}</Text>
          </View>
          <TouchableOpacity
            style={selectedStyle.addButton}
            onPress={() => navigation.navigate('add')}
          >
            <Ionicons name="add" size={24} color={selectedStyle.addButtonIcon.color} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={selectedStyle.container}>
        {/* Stats */}
        <View style={selectedStyle.statsContainer}>
          <View style={selectedStyle.statsCard}>
            <View style={selectedStyle.statsHeader}>
              <Text style={selectedStyle.statsTitle}>Task Progress</Text>
              <Text style={selectedStyle.statsPercentage}>{getCompletionPercentage()}%</Text>
            </View>

            <View style={selectedStyle.progressBarContainer}>
              <View
                style={[
                  selectedStyle.progressBar,
                  { width: `${getCompletionPercentage()}%` }
                ]}
              />
            </View>

            <View style={selectedStyle.statsGrid}>
              <View style={selectedStyle.statItem}>
                <Text style={selectedStyle.statValue}>{stats.total}</Text>
                <Text style={selectedStyle.statLabel}>Total</Text>
              </View>
              <View style={selectedStyle.statItem}>
                <Text style={selectedStyle.statValue}>{stats.completed}</Text>
                <Text style={selectedStyle.statLabel}>Completed</Text>
              </View>
              <View style={selectedStyle.statItem}>
                <Text style={selectedStyle.statValue}>{stats.pending}</Text>
                <Text style={selectedStyle.statLabel}>Pending</Text>
              </View>
              <View style={selectedStyle.statItem}>
                <Text style={[selectedStyle.statValue, stats.overdue > 0 && selectedStyle.overdueValue]}>
                  {stats.overdue}
                </Text>
                <Text style={selectedStyle.statLabel}>Overdue</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Tasks */}
        <View style={selectedStyle.sectionContainer}>
          <View style={selectedStyle.sectionHeader}>
            <Text style={selectedStyle.sectionTitle}>Recent Tasks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('tasks')}>
              <Text style={selectedStyle.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={selectedStyle.recentTasksContainer}>
            {recentTasks.length > 0 ? (
              recentTasks.map(task => renderTaskItem(task))
            ) : (
              <View style={selectedStyle.emptyTasksContainer}>
                <Ionicons name="list" size={48} color={selectedStyle.emptyTasksIcon.color} />
                <Text style={selectedStyle.emptyTasksText}>No tasks yet</Text>
                <TouchableOpacity
                  style={selectedStyle.createTaskButton}
                  onPress={() => navigation.navigate('add')}
                >
                  <Text style={selectedStyle.createTaskButtonText}>Create a Task</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={selectedStyle.sectionContainer}>
          <Text style={selectedStyle.sectionTitle}>Quick Actions</Text>
          <View style={selectedStyle.quickActionsContainer}>
            <TouchableOpacity
              style={selectedStyle.quickActionButton}
              onPress={() => navigation.navigate('add')}
            >
              <View style={[selectedStyle.quickActionIcon, { backgroundColor: selectedStyle.quickActionNewTaskBg.color }]}>
                <Ionicons name="add-circle" size={24} color={selectedStyle.quickActionNewTaskIcon.color} />
              </View>
              <Text style={selectedStyle.quickActionText}>New Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={selectedStyle.quickActionButton}
              onPress={() => navigation.navigate("notifications")}
            >
              <View style={[selectedStyle.quickActionIcon, { backgroundColor: selectedStyle.quickActionNotificationsBg.color }]}>
                <Ionicons name="notifications" size={24} color={selectedStyle.quickActionNotificationsIcon.color} />
              </View>
              <Text style={selectedStyle.quickActionText}>Notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={selectedStyle.quickActionButton}
              onPress={() => navigation.navigate("profile")}
            >
              <View style={[selectedStyle.quickActionIcon, { backgroundColor: selectedStyle.quickActionProfileBg.color }]}>
                <Ionicons name="person" size={24} color={selectedStyle.quickActionProfileIcon.color} />
              </View>
              <Text style={selectedStyle.quickActionText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tip */}
        <View style={selectedStyle.tipContainer}>
          <View style={selectedStyle.tipContent}>
            <Ionicons name="bulb" size={24} color={selectedStyle.tipIcon.color} style={selectedStyle.tipIcon} />
            <View>
              <Text style={selectedStyle.tipTitle}>Productivity Tip</Text>
              <Text style={selectedStyle.tipText}>
                Break large tasks into smaller, manageable subtasks to make progress more achievable.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
