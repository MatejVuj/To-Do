import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Switch, ScrollView, Platform, Alert } from 'react-native'
import * as React from 'react'
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker';
import { firestore, serverTimestamp } from '@/FirebaseConfig'
import { collection, addDoc, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth } from '@/FirebaseConfig';
import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { styles, darkStyles} from '../styles/addStyle'
import { addListener, removeListener } from '../listeners';
import {iconList} from '../iconList'


// notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

const add = () => {
  //User state
  const [currentUser, setCurrentUser] = useState(null);

  // Task states
  //Priority button 
  const [priority, setPriority] = useState('red');
  // Task details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [showIcons, setShowIcons] = useState(false);
  
  // Notification (reminder) states
  const [enableReminder, setEnableReminder] = useState(true); // Notification state

  //Date and Time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Request notification permissions on component mount
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
            sound: 'default',
          });
        }

        console.log('Notification permissions granted');
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
      }
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const toggleDatePicker = () => {
    setShowDatePicker(prev => !prev);
    if (showTimePicker) setShowTimePicker(false);
  };

  const toggleTimePicker = () => {
    setShowTimePicker(prev => !prev);
    if (showDatePicker) setShowDatePicker(false);
  };
 
  const handleIconSelect = (iconName) => {
    setSelectedIcon(iconName);
    setShowIcons(false);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate)
  }

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
  }

  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  const formatTime = (time) => {
    return time.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const generateTags = (title, description) => {
    const words = `${title} ${description || ''}` 
    .toLowerCase().split(/\s+/).filter(word => word.length > 2)
    .filter((word, index, self) => self.indexOf(word) === index);
    return words
  }

  // Schedule notification for a task
  const scheduleTaskNotification = async (taskData, taskId) => {
    try {
      if (!enableReminder) {
        console.log('Reminder not enabled, skipping notification scheduling');
        return null;
      }

      // Parse the due date and time
      const [year, month, day] = taskData.due_date.split('-').map(Number);
      const [hours, minutes] = taskData.due_time.split(':').map(Number);

      const taskDateTime = new Date(year, month - 1, day, hours, minutes);
      const notificationTime = new Date(taskDateTime.getTime() - (75 * 60 * 1000)); // 1 hour 15 minutes before

      // Don't schedule if notification time is in the past
      if (notificationTime <= new Date()) {
        console.log('Notification time is in the past, not scheduling.');
        return null;
      }

      console.log(`Scheduling notification for task "${taskData.title}" at ${notificationTime.toISOString()}`);

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Task Reminder: ${taskData.title}`,
          body: taskData.description || 'Your task is due in 1 hour and 15 minutes!',
          data: { 
            taskId: taskId,
            type: 'task_reminder',
            priority: taskData.priority 
          },
          sound: 'default',
          badge: 1,
        },
        trigger: {
          date: notificationTime,
        },
      });

      console.log(`Notification scheduled with ID: ${identifier}`);
      return {
        notificationId: identifier,
        notificationTime: notificationTime.toISOString(),
        notificationScheduled: true
      };

    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  };

  // Save task to Firebase
  const saveTaskToFirebase = async (task) => {
    try {
      const user = auth.currentUser

      if(!user) {
        throw new Error('User not authenticated');
      }

      const docRef = await addDoc(collection(firestore, `users/${user.uid}/tasks`), {
        ...task,
        status: 'pending',
        createdAt: serverTimestamp(),
        userId: user.uid,
        tags: generateTags(title, description)
      });
      
      console.log('Task saved to Firebase with ID:', docRef.id);
      return { id: docRef.id, ...task };

    } catch (error) {
      console.error('Error saving task to Firebase:', error);
      throw error;
    }
  };

  // Handle adding a task
  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the task.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated. Please log in.');
      return;
    }

    const taskData = { 
      title: title,
      description: description,
      priority: priority,
      due_date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
      due_time: `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`,
      icon: selectedIcon,
      enableReminder: enableReminder,
      notificationId: null,
      notificationScheduled: false,
      notificationTime: null,
      tags: generateTags(title, description)
    };

    try {
      // First save the task to Firebase
      const savedTask = await saveTaskToFirebase(taskData);

      // If reminder is enabled, schedule notification
      if (enableReminder) {
        console.log('Attempting to schedule notification for task:', savedTask.id);
        const notificationData = await scheduleTaskNotification(taskData, savedTask.id);
        
        if (notificationData) {
          // Update the task with notification details
          const taskRef = doc(firestore, `users/${user.uid}/tasks/${savedTask.id}`);
          await updateDoc(taskRef, notificationData);
          console.log('Task updated with notification data:', notificationData);
        } else {
          console.log('No notification was scheduled (likely due to past time or disabled reminders)');
        }
      }

      resetForm();
      Alert.alert('Success', 'Task saved successfully!' + (enableReminder ? ' Notification scheduled.' : ''));
      router.replace('/(tabs)/tasks');
    } catch (error) {
      console.error('Error in handleAddTask:', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    }
  };

  // function used for reseting the from after saving task to firebase
  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDate(new Date())
    setTime(new Date())
    setSelectedIcon(null)
    setPriority("red")
    setEnableReminder(true)
  }

  const [userDarkMode, setUserDarkMode] = useState({darkMode: false})

  useEffect(() => {
  let unsub = () => {};
  unsub = onAuthStateChanged(auth, (user) => {
    if (!user) return;
    const ref = doc(firestore, 'users', user.uid);
    const inner = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) setUserDarkMode(snap.data().preferences.darkMode);
      },
      (err) => {
        if (err.code === 'permission-denied') return; // expected after logout
        console.error(err);
      }
    );
    addListener(inner);
    return () => removeListener(inner);
  });
  addListener(unsub);
  return () => {
    removeListener(unsub);
    unsub();
  };
}, []);

  const selectedStyle = userDarkMode ? darkStyles : styles
  
  return (
    
    <SafeAreaView style={selectedStyle.safeAreaViewContainer}>

      <LinearGradient colors={selectedStyle.headerGradientColors} style={selectedStyle.header}>
      <View style={selectedStyle.header}>
        <Text style={selectedStyle.headerTitle}>Create New Task</Text>      
      </View>
      </LinearGradient>


      <ScrollView  style={ selectedStyle.container}>
      <View style={selectedStyle.formContainer}>
        <View style={selectedStyle.inputGroup}>
          <Text style={selectedStyle.label}>Title</Text>
          <TextInput
            style={selectedStyle.input}
            placeholder="What needs to be done?"
            value={title}
            onChangeText={setTitle}
          />
        </View>
        
        <View style={selectedStyle.inputGroup}>
          <Text style={selectedStyle.label}>Description</Text>
          <TextInput
            style={[selectedStyle.input, selectedStyle.textArea]}
            placeholder="Add details about this task..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={selectedStyle.inputGroup}>
          <Text style={selectedStyle.label}>Priority</Text>
          <View style={selectedStyle.prioritySelector}>
            <TouchableOpacity
              style={[
                selectedStyle.priorityButton,
                selectedStyle.priorityHigh,
                priority === 'red' && selectedStyle.priorityButtonSelectedRed
              ]}
              onPress={() => setPriority('red')}
            >
              <Text style={selectedStyle.priorityButtonText}>High</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                selectedStyle.priorityButton,
                selectedStyle.priorityMedium,
                priority === 'orange' && selectedStyle.priorityButtonSelectedOrange
              ]}
              onPress={() => setPriority('orange')}
            >
              <Text style={selectedStyle.priorityButtonText}>Medium</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                selectedStyle.priorityButton,
                selectedStyle.priorityLow,
                priority === 'green' && selectedStyle.priorityButtonSelectedGreen
              ]}
              onPress={() => setPriority('green')}
            >
              <Text style={selectedStyle.priorityButtonText}>Low</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={selectedStyle.inputGroup}>
          <Text style={selectedStyle.label}>Due Date</Text>
          <TouchableOpacity
            style={selectedStyle.dateTimeButton}
            onPress={toggleDatePicker}
          >
            <Ionicons name="calendar-outline" size={20} color="#6200EE" />
            <Text style={selectedStyle.dateTimeButtonText}>{formatDate(date)}</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
        
        <View style={selectedStyle.inputGroup}>
          <Text style={selectedStyle.label}>Due Time</Text>
          <TouchableOpacity
            style={selectedStyle.dateTimeButton}
            onPress={toggleTimePicker}
          >
            <Ionicons name="time-outline" size={20} color="#6200EE" />
            <Text style={selectedStyle.dateTimeButtonText}>{formatTime(time)}</Text>
          </TouchableOpacity>
          
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>
        
        <View style={selectedStyle.inputGroup}>
          <Text style={selectedStyle.label}>Icon</Text>
          <TouchableOpacity
            style={selectedStyle.iconSelector}
            onPress={() => setShowIcons(!showIcons)}
          >
            {selectedIcon ? (
              <Ionicons name={selectedIcon} size={24} color="#6200EE" />
            ) : (
              <Ionicons name="image-outline" size={24} color="#6200EE" />
            )}
            <Text style={selectedStyle.iconSelectorText}>
              {selectedIcon ? `Selected: ${selectedIcon}` : 'Select an icon'}
            </Text>
          </TouchableOpacity>
          
          {showIcons && (
            <View style={selectedStyle.iconGrid}>
              {iconList.map(iconName => (
                <TouchableOpacity
                  key={iconName}
                  style={[
                    selectedStyle.iconButton,
                    selectedIcon === iconName && selectedStyle.iconButtonSelected
                  ]}
                  onPress={() => handleIconSelect(iconName)}
                >
                  <Ionicons name={iconName} size={24} color={selectedIcon === iconName ? '#fff' : '#6200EE'} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        <View style={selectedStyle.inputGroup}>
          <View style={selectedStyle.switchRow}>
            <Text style={selectedStyle.label}>Enable Reminder</Text>
            <Switch
              value={enableReminder}
              onValueChange={setEnableReminder}
              trackColor={{ false: "#767577", true: "#6200EE" }}
              thumbColor={enableReminder ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View> 
        
        <TouchableOpacity
          style={selectedStyle.addButton}
          onPress={handleAddTask}
        >
          <Text style={selectedStyle.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default add;