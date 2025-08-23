import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore } from '@/FirebaseConfig';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { isBefore, parseISO } from 'date-fns';

import { styles, darkStyles } from '../../utilities/styles/homeStyle';
import { useAuth } from '@/utilities/hooks/useAuth';
import { useUserPreferences } from '@/utilities/hooks/useUserPreferences';

const Home = () => {
  const { user } = useAuth();
  const { preferences, isLoading: prefsLoading } = useUserPreferences();
  const selectedStyle = preferences.darkMode ? darkStyles : styles;

  const [userName, setUserName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigation = useNavigation();

  
  useEffect(() => {
    // if no user is logged, do not load anything
    if (!user) {
      setIsLoading(false);
      setUserName('');
      setTasks([]);
      return;
    }

    // getting user name or email from firebase
    const userDocRef = doc(firestore, `users/${user.uid}`);
    const unsubscribeUser = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setUserName(userData.displayName || user.email?.split('@')[0] || 'User');
      } else {
        setUserName(user.email?.split('@')[0] || 'User');
      }
    });
    
    // getting tasks from the users tasks collection (using onSnapshot for dinamic real-time updats)
    const tasksCollectionRef = collection(firestore, `users/${user.uid}/tasks`);
    const unsubscribeTasks = onSnapshot(tasksCollectionRef, (snapshot) => {
      const allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(allTasks);
      setIsLoading(false);
    });

    return () => {
      unsubscribeUser();
      unsubscribeTasks();
    };
  }, [user]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  // statistics of tasks
  const stats = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        pending: tasks.filter(t => t.status !== 'completed').length,
        overdue: tasks.filter(t => t.status === 'unfinished').length,
    };
  }, [tasks]);

  // recent tasks by date they are created
  const recentTasks = React.useMemo(() => {
      return [...tasks]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
        
  }, [tasks]);
  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const renderTaskItem = (task) => {
    const priorityColor =
      task.priority === 'red' ? selectedStyle.priorityHigh.color :
      task.priority === 'orange' ? selectedStyle.priorityMedium.color :
      selectedStyle.priorityLow.color;

    return (
      <TouchableOpacity key={task.id} style={selectedStyle.taskItem} onPress={() => navigation.navigate('tasks')}>
        <View style={[selectedStyle.priorityIndicator, { backgroundColor: priorityColor }]} />
        <View style={selectedStyle.taskContent}>
          <Text style={[selectedStyle.taskTitle, task.status === 'completed' && selectedStyle.completedTaskTitle]} numberOfLines={1}>{task.title}</Text>
          <View style={selectedStyle.taskMeta}>
            {task.due_date && <View style={selectedStyle.metaItem}><Ionicons name="calendar-outline" size={14} color={selectedStyle.metaIcon.color} /><Text style={selectedStyle.metaText}>{task.due_date}</Text></View>}
            {task.icon && <Ionicons name={task.icon} size={16} color={selectedStyle.taskIcon.color} />}
          </View>
        </View>
        <Ionicons name={task.status === 'completed' ? "checkmark-circle" : "ellipse-outline"} size={24} color={task.status === 'completed' ? selectedStyle.completedCheckIcon.color : selectedStyle.pendingCheckIcon.color} />
      </TouchableOpacity>
    );
  };

  // loading indicator
  if (isLoading || prefsLoading) {
    return (
      <View style={selectedStyle.loadingContainer}>
        <ActivityIndicator size="large" color={selectedStyle.loadingIndicator.color} />
      </View>
    );
  }

  return (
    <SafeAreaView style={selectedStyle.safeAreaViewContainer}>
      <LinearGradient colors={selectedStyle.headerGradientColors} style={selectedStyle.header}>
        <View style={selectedStyle.headerContent}>
          <View>
            <Text style={selectedStyle.greeting}>{getTimeOfDay()},</Text>
            <Text style={selectedStyle.userName}>{userName}</Text>
          </View>
          <TouchableOpacity style={selectedStyle.addButton} onPress={() => navigation.navigate('add')}>
            <Ionicons name="add" size={24} color={selectedStyle.addButtonIcon.color} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={selectedStyle.container}>
        <View style={selectedStyle.statsContainer}>
          <View style={selectedStyle.statsCard}>
            <View style={selectedStyle.statsHeader}>
              <Text style={selectedStyle.statsTitle}>Task Progress</Text>
              <Text style={selectedStyle.statsPercentage}>{completionPercentage}%</Text>
            </View>
            <View style={selectedStyle.progressBarContainer}>
              <View style={[selectedStyle.progressBar, { width: `${completionPercentage}%` }]}/>
            </View>
            <View style={selectedStyle.statsGrid}>
              <View style={selectedStyle.statItem}><Text style={selectedStyle.statValue}>{stats.total}</Text><Text style={selectedStyle.statLabel}>Total</Text></View>
              <View style={selectedStyle.statItem}><Text style={selectedStyle.statValue}>{stats.completed}</Text><Text style={selectedStyle.statLabel}>Completed</Text></View>
              <View style={selectedStyle.statItem}><Text style={selectedStyle.statValue}>{stats.pending}</Text><Text style={selectedStyle.statLabel}>Pending</Text></View>
              <View style={selectedStyle.statItem}><Text style={[selectedStyle.statValue, stats.overdue > 0 && selectedStyle.overdueValue]}>{stats.overdue}</Text><Text style={selectedStyle.statLabel}>Overdue</Text></View>
            </View>
          </View>
        </View>

        <View style={selectedStyle.sectionContainer}>
          <View style={selectedStyle.sectionHeader}>
            <Text style={selectedStyle.sectionTitle}>Recent Tasks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('tasks')}><Text style={selectedStyle.seeAllText}>See All</Text></TouchableOpacity>
          </View>
          <View style={selectedStyle.recentTasksContainer}>
            {recentTasks.length > 0 ? (
              recentTasks.map(task => renderTaskItem(task))
            ) : (
              <View style={selectedStyle.emptyTasksContainer}>
                <Ionicons name="list" size={48} color={selectedStyle.emptyTasksIcon.color} />
                <Text style={selectedStyle.emptyTasksText}>No tasks yet</Text>
                <TouchableOpacity style={selectedStyle.createTaskButton} onPress={() => navigation.navigate('add')}>
                  <Text style={selectedStyle.createTaskButtonText}>Create a Task</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={selectedStyle.sectionContainer}>
            <Text style={selectedStyle.sectionTitle}>Quick Actions</Text>
            <View style={selectedStyle.quickActionsContainer}>
                <TouchableOpacity style={selectedStyle.quickActionButton} onPress={() => navigation.navigate('add')}>
                    <View style={[selectedStyle.quickActionIcon, { backgroundColor: selectedStyle.quickActionNewTaskBg.color }]}><Ionicons name="add-circle" size={24} color={selectedStyle.quickActionNewTaskIcon.color} /></View>
                    <Text style={selectedStyle.quickActionText}>New Task</Text>
                </TouchableOpacity>
                <TouchableOpacity style={selectedStyle.quickActionButton} onPress={() => navigation.navigate("notifications")}>
                    <View style={[selectedStyle.quickActionIcon, { backgroundColor: selectedStyle.quickActionNotificationsBg.color }]}><Ionicons name="notifications" size={24} color={selectedStyle.quickActionNotificationsIcon.color} /></View>
                    <Text style={selectedStyle.quickActionText}>Notifications</Text>
                </TouchableOpacity>
                <TouchableOpacity style={selectedStyle.quickActionButton} onPress={() => navigation.navigate("profile")}>
                    <View style={[selectedStyle.quickActionIcon, { backgroundColor: selectedStyle.quickActionProfileBg.color }]}><Ionicons name="person" size={24} color={selectedStyle.quickActionProfileIcon.color} /></View>
                    <Text style={selectedStyle.quickActionText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>

        <View style={selectedStyle.tipContainer}>
          <View style={selectedStyle.tipContent}>
            <Ionicons name="bulb" size={24} color={selectedStyle.tipIcon.color} style={selectedStyle.tipIcon} />
            <View>
              <Text style={selectedStyle.tipTitle}>Productivity Tip</Text>
              <Text style={selectedStyle.tipText}>Break large tasks into smaller, manageable subtasks to make progress more achievable.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;