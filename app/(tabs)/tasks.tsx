import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, writeBatch, setDoc } from 'firebase/firestore';
import { firestore } from '@/FirebaseConfig';
import { isToday, isWithinInterval, addDays, parseISO, startOfToday, endOfToday, isBefore } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

import { styles, darkStyles } from '../../utilities/styles/tasksStyle';
import { useAuth } from '@/utilities/hooks/useAuth';
import { useUserPreferences } from '@/utilities/hooks/useUserPreferences';
import { TaskForm } from '@/utilities/components/taskForm';
import { cancelTaskNotifications, generateTags, scheduleTaskNotification } from '@/utilities/hooks/taskAddUtility';

const Tasks = () => {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const selectedStyle = preferences.darkMode ? darkStyles : styles;
  const [tasks, setTasks] = useState([]);
  const [visibleDescription, setVisibleDescription] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [expandedSections, setExpandedSections] = useState({
    today: true,
    sevenDays: false,
    thirtyDays: false,
    allTasks: false,
  });

  const [searchQuery, setSearchQuery] = useState('');

  const checkForExpiredTasks = async (tasksList) => {
    if (!user) return;
    const batch = writeBatch(firestore);
    const today = startOfToday();
    let tasksToUpdate = 0;

    tasksList.forEach(task => {
      if (task.status === 'pending' && task.due_date) {
        const dueDate = parseISO(task.due_date);
        if (isBefore(dueDate, today)) {
          const taskRef = doc(firestore, `users/${user.uid}/tasks`, task.id);
          batch.update(taskRef, { status: 'unfinished' });
          tasksToUpdate++;
        }
      }
    });

    if (tasksToUpdate > 0) {
      console.log(`Updating ${tasksToUpdate} expired tasks.`);
      await batch.commit();
    }
  };

  //fetching tasks
  useEffect(() => {
    //no user logged show no tasks
    if (!user) {
      setTasks([]);
      return;
    }

    const tasksRef = collection(firestore, `users/${user.uid}/tasks`);
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const loadedTasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTasks(loadedTasks);
      checkForExpiredTasks(loadedTasks);
    }, (err) => {
      console.error("Error fetching tasks:", err);
    });

    return () => unsubscribe();
  }, [user]);

  // filtering tasks for search
  const filteredTasks = useMemo(() => {
    if (searchQuery.trim() === '') return tasks;
    
    const lowerQ = searchQuery.toLowerCase();
    return tasks.filter(task => {
      const inTitle = task.title?.toLowerCase().includes(lowerQ);
      const inDescription = task.description?.toLowerCase().includes(lowerQ);
      const inTags = task.tags?.some((tag) => tag.toLowerCase().includes(lowerQ));
      return inTitle || inDescription || inTags;
    });
  }, [searchQuery, tasks]);

  // filtering tasks fro sections
  const todayTasks = useMemo(() => filteredTasks.filter(t => t.due_date && isToday(parseISO(t.due_date))), [filteredTasks]);
  const sevenDays = useMemo(() => {
    const today = new Date();
    return filteredTasks.filter(t => t.due_date && isWithinInterval(parseISO(t.due_date), {
      start: addDays(startOfToday(today), 1),
      end: addDays(endOfToday(today), 7)
    }));
  }, [filteredTasks]);
  const thirtyDays = useMemo(() => {
    const today = new Date();
    return filteredTasks.filter(t => t.due_date && isWithinInterval(parseISO(t.due_date), {
      start: addDays(startOfToday(today), 8),
      end: addDays(endOfToday(today), 30)
    }));
  }, [filteredTasks]);

  const deleteTask = async (id) => {
    if (!user) return;
    try {
      const taskRef = doc(firestore, `users/${user.uid}/tasks`, id);
      await deleteDoc(taskRef);
      cancelTaskNotifications(id);

    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Could not delete task.');
    }
  };

const saveEditedTask = async (taskId, taskData) => {
        if (!user || !taskData.title.trim()) {
            Alert.alert('Error', 'Title cannot be empty.');
            return;
        }

        const { dueDateTime, ...taskDetails } = taskData;

        const formattedDueDate = `${dueDateTime.getFullYear()}-${String(dueDateTime.getMonth() + 1).padStart(2, '0')}-${String(dueDateTime.getDate()).padStart(2, '0')}`;
        const formattedDueTime = `${String(dueDateTime.getHours()).padStart(2, '0')}:${String(dueDateTime.getMinutes()).padStart(2, '0')}`;
        
          // Generate new tags
          const updatedTags = generateTags(taskDetails.title, taskDetails.description);

          const taskForFirestore = {
              ...taskDetails,
              due_date: formattedDueDate,
              due_time: formattedDueTime,
              tags: updatedTags,
          };

          try {
              const taskRef = doc(firestore, `users/${user.uid}/tasks`, taskId);
              await setDoc(taskRef, taskForFirestore, { merge: true });
              
              if(taskDetails.enableReminder){
                // scheduling with ne date and time
                await scheduleTaskNotification(dueDateTime, taskId, taskDetails);
              }
              else{
                // if the reminder was turned off
                await cancelTaskNotifications(taskData.id);
              }
              
              setEditingTask(null); 
              Alert.alert('Success', 'Task saved!');
          } catch (err) {
              Alert.alert('Error', err.message || 'Could not save task.');
          }
      };
  
  const toggleTaskCompletion = async (task) => {
    if (!user) return;
    if (task.status === 'completed') {
        Alert.alert('Info', 'This task is already completed.');
        return;
    }
    
    const taskRef = doc(firestore, `users/${user.uid}/tasks`, task.id);
    await updateDoc(taskRef, {
        status: 'completed',
        completedAt: new Date().toISOString(),
    });
    cancelTaskNotifications(task.id)
  };

  const toggleDescriptionVisibility = (id) => {
    setVisibleDescription(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const formatDate = (dateString) => new Date(dateString + 'T00:00:00').toLocaleDateString();
  const formatTime = (timeString) => {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderTask = ({ item: task }) => {
    const priorityColor =
      task.priority === 'red' ? '#ff0303' :
      task.priority === 'orange' ? '#e6720e' :
      '#89ff03';

    if (editingTask === task.id) {
      return (
        <View style={[selectedStyle.taskItem, selectedStyle.editContainer]}>
          <TaskForm
            initialData={task}
            onSubmit={(updatedData) => saveEditedTask(task.id, updatedData)}
            onCancel={() => setEditingTask(null)}
            submitButtonText="Save Changes"
            isDarkMode={preferences.darkMode}
            
          />
        </View>
      );
    }

    // every task functions (UI, UX)
    return (
      <TouchableOpacity
        style={selectedStyle.taskItem}
        onPress={() => toggleDescriptionVisibility(task.id)}
        onLongPress={() => setEditingTask(task.id)}
      >
        <View style={[selectedStyle.priorityBar, { backgroundColor: priorityColor }]} />
        <TouchableOpacity 
          style={selectedStyle.checkbox} 
          onPress={() => {
            Alert.alert(
              'Complete Task',
              'Mark "${task.title}" as completed?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Complete',
                  onPress: () => toggleTaskCompletion(task),
                  style: 'default',
                },
              ]
            );
          }}
          >
          <Ionicons name={task.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={task.status === 'completed' ? '#888' : '#6200EE'}/>
        </TouchableOpacity>
        <View style={selectedStyle.taskContent}>
          <Text style={[selectedStyle.taskTitle, task.status === 'completed' ? selectedStyle.completedText : task.status === "unfinished" ? selectedStyle.unfinishedText : null]}>{task.title}</Text>
          {visibleDescription[task.id] && <Text style={selectedStyle.taskDescription}>{task.description}</Text>}
          <View style={selectedStyle.taskMeta}>
            {task.due_date && <View style={selectedStyle.metaItem}><Ionicons name="calendar-outline" size={14} color="#666" /><Text style={selectedStyle.metaText}>{formatDate(task.due_date)}</Text></View>}
            {task.due_time && <View style={selectedStyle.metaItem}><Ionicons name="time-outline" size={14} color="#666" /><Text style={selectedStyle.metaText}>{formatTime(task.due_time)}</Text></View>}
            {task.icon && <Ionicons name={task.icon as any} size={16} color="#6200EE" />}
          </View>
        </View>
        
        
        <TouchableOpacity
          style={selectedStyle.deleteButton}
          onPress={() => {
            Alert.alert(
              'Delete Task',
              'Are you sure you want to delete this task?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  onPress: () => deleteTask(task.id),
                  style: 'destructive',
                },
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#ff3b30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  
  const renderSection = (title: string, data: any[], sectionKey: string) =>
    data.length > 0 && (
      <View style={selectedStyle.section}>
        <TouchableOpacity
          style={selectedStyle.sectionHeader}
          onPress={() => toggleSection(sectionKey)}
        >
          <Text style={selectedStyle.sectionTitle}>{`${title} (${data.length})`}</Text>
          <Ionicons
            name={expandedSections[sectionKey] ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#6200EE"
          />
        </TouchableOpacity>

        {expandedSections[sectionKey] && (
          <View style={selectedStyle.taskList}>
            {data.map(task => (
              <View key={task.id}>{renderTask({ item: task })}</View>
            ))}
          </View>
        )}
      </View>
  );

  // main 
  return (
    <View style={selectedStyle.container}>
      <LinearGradient colors={selectedStyle.headerGradientColors} style={selectedStyle.header}>
        <Text style={selectedStyle.headerTitle}>My Tasks</Text>
      </LinearGradient>
      <View style={selectedStyle.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={selectedStyle.searchIcon} />
        <TextInput
          style={selectedStyle.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {tasks.length === 0 ? (
        <View style={selectedStyle.emptyContainer}>
          <Ionicons name="list" size={64} color="#ccc" />
          <Text style={selectedStyle.emptyText}>No tasks yet</Text>
        </View>
      ) : (
        <ScrollView style={selectedStyle.sectionsContainer}>
          {searchQuery ? (
            <View style={selectedStyle.taskList}>
              <Text style={selectedStyle.sectionTitle}>Search Results ({filteredTasks.length})</Text>
              {filteredTasks.map(task => (
                <View key={task.id}>{renderTask({ item: task })}</View>
              ))}
            </View>
          ) : (
            <>
              {renderSection('Today', todayTasks, 'today')}
              {renderSection('Next 7 Days', sevenDays, 'sevenDays')}
              {renderSection('Next 30 Days', thirtyDays, 'thirtyDays')}
              {renderSection('All Tasks', tasks, 'allTasks')}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default Tasks;