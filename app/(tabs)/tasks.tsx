import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, Switch, Platform, ScrollView, FlatList, FlatListComponent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore, auth } from '@/FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { isToday, isWithinInterval, addDays, parseISO, isBefore } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { styles, darkStyles } from '../styles/tasksStyle';
import { addListener, removeListener } from '../listeners';
import {iconList} from '../iconList'


const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [visibleDescription, setVisibleDescription] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    due_date: '',
    due_time: '',
    priority: '',
    icon: '',
    enableReminder: true,
    tags: []
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    today: true,
    sevenDays: false,
    thirtyDays: false,
    allTasks: false,
  });

  const [todayTasks, setTodayTasks] = useState([]);
  const [sevenDays, setSevenDays] = useState([]);
  const [thirtyDays, setThirtyDays] = useState([]);

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
  const unsub = onAuthStateChanged(auth, (user) => {
    if (user) {
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
      setTasks([]);
      setSearchResults([]);
    }
  });
  addListener(unsub);
  return () => {
    removeListener(unsub);
    unsub();
    };
  }, []);

  useEffect(() => {
  if (!currentUser) return;

  const tasksRef = collection(firestore, `users/${currentUser.uid}/tasks`);
  const unsub = onSnapshot(
    tasksRef,
    (snapshot) => {
      const loadedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      checkExpiredTasks(loadedTasks);
      setTasks(loadedTasks);
      
    },
    (err) => {
      if (err.code === 'permission-denied') return;
      console.error('Error loading tasks:', err);
    }
  );
  addListener(unsub);
  return () => {
    removeListener(unsub);
    unsub();
  };
}, [currentUser]);

  useEffect(() => {

    if(!currentUser || !searchQuery){

      setSearchResults([]);

      const todayTasksFiltered = tasks.filter(task => task.due_date && isToday(parseISO(task.due_date)));
      
      const sevenDaysFiltered = tasks.filter(task => task.due_date && isWithinInterval(parseISO(task.due_date), {
        start: addDays(new Date(), 0),
        end: addDays(new Date(), 7),
      }));
      
      const thirtyDaysFiltered = tasks.filter(task => task.due_date && isWithinInterval(parseISO(task.due_date), {
        start: addDays(new Date(), 7),
        end: addDays(new Date(), 30),
      }));
      
      setTodayTasks(todayTasksFiltered);
      setSevenDays(sevenDaysFiltered);
      setThirtyDays(thirtyDaysFiltered);
      return;
    }

    const lowerQ = searchQuery.toLowerCase();
    const filtered = tasks.filter(task => {
      const inTitle = task.title?.toLowerCase().includes(lowerQ);
      const inDescription = task.description?.toLowerCase().includes(lowerQ);
      const inTags = task.tags?.some(tag => tag.toLowerCase().includes(lowerQ));
      return inTitle || inDescription || inTags;
    });

  setSearchResults(filtered)

  }, [currentUser, searchQuery, tasks]);
  
  const toggleTaskCompletion = async (id) => {
    try {
      const task = tasks.find(task => task.id === id);
      if (task.status === 'completed') {
        Alert.alert('Info', 'Completed tasks cannot be unmarked.');
        return;
      }

      Alert.alert(
        'Complete Task',
        'Are you sure you completed this task',
        [{
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Complete',
          style: 'default',

          onPress: async () => {
            const taskRef = doc(firestore, `users/${currentUser.uid}/tasks`, id);
            await updateDoc(taskRef, {
              status: 'completed',
              enableReminder: false,
              completedAt: new Date().toISOString(),
            });
          }
        }],
        {cancelable: true}
      )

      
    } catch (error) {
      console.error('Error updating task:', error);
      let errorMessage = 'Could not update task.';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your authentication status.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const deleteTask = async (id) => {
    try {
      const taskRef = doc(firestore, `users/${currentUser.uid}/tasks`, id);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      let errorMessage = 'Could not delete task.';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your authentication status.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const startEditing = (task) => {
    setEditingTask(task.id);
    setEditForm({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || new Date().toISOString().split('T')[0],
      due_time: task.due_time || '00:00',
      priority: task.priority || 'red',
      icon: task.icon || '',
      enableReminder: task.enableReminder || false,
      tags: task.tags || []
    });
  };

  const generateTags = (title, description) => {
    const words = `${title} ${description || ''}`
    .toLowerCase().split(/\s+/).filter(word => word.length > 2)
    .filter((word, index, self) => self.indexOf(word) === index)
    return words
  }

  const saveEditedTask = async (id) => {
    if (!editForm.title.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }

    try {
      const taskRef = doc(firestore, `users/${currentUser.uid}/tasks`, id);
      await updateDoc(taskRef, {
        title: editForm.title,
        description: editForm.description,
        due_date: editForm.due_date,
        due_time: editForm.due_time,
        priority: editForm.priority,
        icon: editForm.icon,
        enableReminder: editForm.enableReminder,
        tags: generateTags(editForm.title, editForm.description)
      });
      setEditingTask(null);
      setShowDatePicker(false);
      setShowTimePicker(false);
      setShowIconPicker(false);
      Alert.alert('Success', 'Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      let errorMessage = 'Could not update task.';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your authentication status.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditForm({
      title: '',
      description: '',
      due_date: new Date().toISOString().split('T')[0],
      due_time: '00:00',
      priority: 'red',
      icon: '',
      enableReminder: false,
      tags: []
    });
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowIconPicker(false);
  };

  const checkExpiredTasks = async (tasksList) => {
    const today = new Date();

    for (const task of tasksList){


      if(
        task.due_date && !task.completedAt && task.status !== 'completed' && !isToday(parseISO(task.due_date)) && isBefore(parseISO(task.due_date), new Date()) && task.status !== 'unfinished'
      )

      try{
        const taskRef = doc(firestore, `users/${currentUser.uid}/tasks/`, task.id)
        await updateDoc(taskRef, {status: 'unfinished'});
        console.log(`Updated task "${task.title}" to status unfinised`)
      }catch(error){
        Alert.alert('Error updating expired task:', error)
      }

    }


  }

  const toggleDatePicker = () => {
    setShowDatePicker(prev => !prev);
    if (showTimePicker) setShowTimePicker(false);
  };

  const toggleTimePicker = () => {
    setShowTimePicker(prev => !prev);
    if (showDatePicker) setShowDatePicker(false);
  };

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'set' && selectedDate) {
      setEditForm(prev => ({
        ...prev,
        due_date: selectedDate.toISOString().split('T')[0],
      }));
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (event, selectedTime) => {
    if (event.type === 'set' && selectedTime) {
      setEditForm(prev => ({
        ...prev,
        due_time: `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`,
      }));
    }
    setShowTimePicker(false);
  };

  const handleIconSelect = (iconName) => {
    setEditForm(prev => ({ ...prev, icon: iconName }));
    setShowIconPicker(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Select Date';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Select Time';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Time';
    }
  };

  const toggleDescriptionVisibility = (id) => {
    setVisibleDescription(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isDescriptionVisible = (id) => {
    return visibleDescription[id] || false;
  };

  const toggleSection = (section) => {
    setExpandedSections (prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }

  const [userDarkMode, setUserDarkMode] = React.useState({darkMode: false})

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
        if (err.code === 'permission-denied') return;
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


  const renderTask = ({ item }) => {
    const priorityColor =
      item.priority === 'red' ? '#ff0303' :
      item.priority === 'orange' ? '#e6720e' :
      '#89ff03';

    if (editingTask === item.id) {
      return (
        <View style={[selectedStyle.taskItem, selectedStyle.editContainer]}>
          <View style={selectedStyle.inputGroup}>
            <Text style={selectedStyle.label}>Title</Text>
            <TextInput
              style={selectedStyle.input}
              value={editForm.title}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, title: text }))}
              placeholder="Task title"
            />
          </View>

          <View style={selectedStyle.inputGroup}>
            <Text style={selectedStyle.label}>Description</Text>
            <TextInput
              style={[selectedStyle.input, selectedStyle.textArea]}
              value={editForm.description}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, description: text }))}
              placeholder="Task description"
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
                  editForm.priority === 'red' && selectedStyle.priorityButtonSelectedRed,
                ]}
                onPress={() => setEditForm(prev => ({ ...prev, priority: 'red' }))}
              >
                <Text style={selectedStyle.priorityButtonText}>High</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  selectedStyle.priorityButton,
                  selectedStyle.priorityMedium,
                  editForm.priority === 'orange' && selectedStyle.priorityButtonSelectedOrange,
                ]}
                onPress={() => setEditForm(prev => ({ ...prev, priority: 'orange' }))}
              >
                <Text style={selectedStyle.priorityButtonText}>Medium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  selectedStyle.priorityButton,
                  selectedStyle.priorityLow,
                  editForm.priority === 'green' && selectedStyle.priorityButtonSelectedGreen,
                ]}
                onPress={() => setEditForm(prev => ({ ...prev, priority: 'green' }))}
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
              <Text style={selectedStyle.dateTimeButtonText}>{formatDate(editForm.due_date)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date(editForm.due_date || new Date())}
                mode="date"
                display={Platform.OS === 'ios' ? 'default' : 'calendar'}
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
              <Text style={selectedStyle.dateTimeButtonText}>{formatTime(editForm.due_time)}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={new Date(`${editForm.due_date || new Date().toISOString().split('T')[0]}T${editForm.due_time || '00:00'}:00`)}
                mode="time"
                display={Platform.OS === 'ios' ? 'inline' : 'clock'}
                onChange={handleTimeChange}
              />
            )}
          </View>

          <View style={selectedStyle.inputGroup}>
            <Text style={selectedStyle.label}>Icon</Text>
            <TouchableOpacity
              style={selectedStyle.iconSelector}
              onPress={() => setShowIconPicker(!showIconPicker)}
            >
              {editForm.icon ? (
                <Ionicons name={editForm.icon} size={24} color="#6200EE" />
              ) : (
                <Ionicons name="image-outline" size={24} color="#6200EE" />
              )}
              <Text style={selectedStyle.iconSelectorText}>
                {editForm.icon ? `Selected: ${editForm.icon}` : 'Select an icon'}
              </Text>
            </TouchableOpacity>
            {showIconPicker && (
              <View style={selectedStyle.iconGrid}>
                {iconList.map(iconName => (
                  <TouchableOpacity
                    key={iconName}
                    style={[
                      selectedStyle.iconButton,
                      editForm.icon === iconName && selectedStyle.iconButtonSelected,
                    ]}
                    onPress={() => handleIconSelect(iconName)}
                  >
                    <Ionicons name={iconName} size={24} color={editForm.icon === iconName ? '#fff' : '#6200EE'} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={selectedStyle.inputGroup}>
            <View style={selectedStyle.switchRow}>
              <Text style={selectedStyle.label}>Enable Reminder</Text>
              <Switch
                value={editForm.enableReminder}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, enableReminder: value }))}
                trackColor={{ false: '#767577', true: '#6200EE' }}
                thumbColor={editForm.enableReminder ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={selectedStyle.editButtons}>
            <TouchableOpacity
              style={[selectedStyle.editButton, selectedStyle.saveButton]}
              onPress={() => saveEditedTask(item.id)}
            >
              <Text style={selectedStyle.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[selectedStyle.editButton, selectedStyle.cancelButton]}
              onPress={cancelEditing}
            >
              <Text style={selectedStyle.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={selectedStyle.taskItem}
        onPress={() => toggleDescriptionVisibility(item.id)}
        onLongPress={() => startEditing(item)}
      >
        <View style={[selectedStyle.priorityBar, { backgroundColor: priorityColor }]} />

        <TouchableOpacity
          style={selectedStyle.checkbox}
          onPress={() => toggleTaskCompletion(item.id)}
          disabled={item.status === 'completed'}
        >
          <Ionicons
            name={item.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={item.status === 'completed' ? '#888' : '#6200EE'}

          />
        </TouchableOpacity>

        <View style={selectedStyle.taskContent}>
          <Text
            style={[
              selectedStyle.taskTitle,
              item.status === 'completed' && selectedStyle.completedText,
              item.status === 'unfinished' && selectedStyle.unfinishedText
            ]}
          >
            {item.title}
          </Text>

          {item.description && isDescriptionVisible(item.id) && (
            <Text style={selectedStyle.taskDescription}>
              {item.description}
            </Text>
          )}

          <View style={selectedStyle.taskMeta}>
            {item.due_date && (
              <View style={selectedStyle.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="#666" />
                <Text style={selectedStyle.metaText}>{formatDate(item.due_date)}</Text>
              </View>
            )}

            {item.due_time && (
              <View style={selectedStyle.metaItem}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={selectedStyle.metaText}>{formatTime(item.due_time)}</Text>
              </View>
            )}

            {item.completedAt && (
              <View style={selectedStyle.metaItem}>
                <Ionicons name="checkmark-done-outline" size={14} color="#666" />
                <Text style={selectedStyle.metaText}>
                  Completed: {new Date(item.completedAt).toLocaleString()}
                </Text>
              </View>
            )}

            {item.icon && (
              <Ionicons name={item.icon} size={16} color="#6200EE" />
            )}
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
                  onPress: () => deleteTask(item.id),
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

  const renderSection = (title, data, sectionKey) => (
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
        <FlatList
          data={data}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          contentContainerStyle={selectedStyle.taskList}
          scrollEnabled={false}
        />
      )}
    </View>
  );

  return (
    
    <View style={selectedStyle.container}>
      <LinearGradient colors={selectedStyle.headerGradientColors} style={selectedStyle.header}>
      <View style={selectedStyle.header}>
        <Text style={selectedStyle.headerTitle}>My Tasks</Text>
      </View>
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
          <Text style={selectedStyle.emptySubText}>Add a new task to get started</Text>
        </View>
      ) : searchResults.length > 0 || searchQuery ? (
        <ScrollView style = {selectedStyle.sectionsContainer}>
          <View style={selectedStyle.section}>
            <Text style={selectedStyle.sectionTitle}>Search Results ({searchResults.length})</Text>
            <FlatList
              data={searchResults}
              renderItem={renderTask}
              keyExtractor={item => item.id}
              contentContainerStyle={selectedStyle.taskList}
              scrollEnabled={false}            
            />
          </View>
        </ScrollView> 
      
      ) : (
        <ScrollView style={selectedStyle.sectionsContainer}>
          {renderSection('Today', todayTasks, 'today')}
          {renderSection('Next 7 Days', sevenDays, 'sevenDays')}
          {renderSection('Next 30 Days', thirtyDays, 'thirtyDays')}
          {renderSection('All Tasks', tasks, 'allTasks')}
        </ScrollView>
      )}
    </View>
  );
};

export default Tasks;