import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, ScrollView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { iconList } from '@/assets/icons/iconList';
import { styles as lightStyles, darkStyles } from '@/utilities/styles/addStyle';

const formatDate = (date: Date) => 
  date.toLocaleDateString(undefined, 
  { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });

const formatTime = (time: Date) => 
  time.toLocaleTimeString(undefined, 
  { 
    hour: '2-digit',
    minute: '2-digit' 
  });

export const TaskForm = ({ initialData, onSubmit, onCancel, submitButtonText = "Add Task", isDarkMode = false, reset }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('red');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [enableReminder, setEnableReminder] = useState(true);

  const [dueDateTime, setDueDateTime] = useState(() => {
    const newDate = new Date();
    newDate.setHours(newDate.getHours() + 1, Math.ceil(newDate.getMinutes() / 5) * 5, 0, 0);
    return newDate;
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showIcons, setShowIcons] = useState(false);

  const selectedStyle = isDarkMode ? darkStyles : lightStyles;

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPriority(initialData.priority || 'red');
      setSelectedIcon(initialData.icon || null);
      setEnableReminder(initialData.enableReminder ?? true);
            
      if (initialData.due_date && initialData.due_time) {
        setDueDateTime(new Date(`${initialData.due_date}T${initialData.due_time}`));
      }
    }
  }, [initialData]);

  const onDateChange = (event, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newDateTime = new Date(dueDateTime);
      newDateTime.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDueDateTime(newDateTime);
    }
  };

  const onTimeChange = (event, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDateTime = new Date(dueDateTime);
      newDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDueDateTime(newDateTime);
    }
  };
   const resetForm = () => {
          setTitle('');
          setDescription('');
          setPriority('red');
          setSelectedIcon(null);
          setEnableReminder(true);
          setDueDateTime(new Date());
          setShowDatePicker(false);
          setShowTimePicker(false);
          setShowIcons(false);
        }

  const handleSubmit = () => {
    const taskData = {
      title,
      description,
      priority,
      dueDateTime: dueDateTime,
      //due_date: `${dueDateTime.getFullYear()}-${String(dueDateTime.getMonth() + 1).padStart(2, '0')}-${String(dueDateTime.getDate()).padStart(2, '0')}`,
      //due_time: `${String(dueDateTime.getHours()).padStart(2, '0')}:${String(dueDateTime.getMinutes()).padStart(2, '0')}`,
      icon: selectedIcon,
      enableReminder,
    };
    if(taskData.title.trim()){
    onSubmit(taskData);
      if(reset){
      resetForm();
      reset = false;
      }
    }
    else {
      Alert.alert('Error', 'Title is required.');
    }
  };

  const handleIconSelect = (iconName) => {
    setSelectedIcon(iconName);
    setShowIcons(false);
  };
  
  return (
    <ScrollView style={selectedStyle.formContainer}>
      <View style={selectedStyle.inputGroup}>
        <Text style={selectedStyle.label}>Title</Text>
        <TextInput style={selectedStyle.input} placeholder="What needs to be done?" value={title} onChangeText={setTitle} placeholderTextColor="#888"/>
      </View>

      <View style={selectedStyle.inputGroup}>
        <Text style={selectedStyle.label}>Description</Text>
        <TextInput style={[selectedStyle.input, selectedStyle.textArea]} placeholder="Add details about this task..." value={description} onChangeText={setDescription} multiline numberOfLines={4} placeholderTextColor="#888"/>
      </View>

      <View style={selectedStyle.inputGroup}>
        <Text style={selectedStyle.label}>Priority</Text>
        <View style={selectedStyle.prioritySelector}>
          <TouchableOpacity style={[selectedStyle.priorityButton, selectedStyle.priorityHigh, priority === 'red' && selectedStyle.priorityButtonSelectedRed]} onPress={() => setPriority('red')}>
            <Text style={selectedStyle.priorityButtonText}>High</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[selectedStyle.priorityButton, selectedStyle.priorityMedium, priority === 'orange' && selectedStyle.priorityButtonSelectedOrange]} onPress={() => setPriority('orange')}>
            <Text style={selectedStyle.priorityButtonText}>Medium</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[selectedStyle.priorityButton, selectedStyle.priorityLow, priority === 'green' && selectedStyle.priorityButtonSelectedGreen]} onPress={() => setPriority('green')}>
            <Text style={selectedStyle.priorityButtonText}>Low</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={selectedStyle.inputGroup}>
        <Text style={selectedStyle.label}>Due Date</Text>
        <TouchableOpacity style={selectedStyle.dateTimeButton} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color="#6200EE" />
          <Text style={selectedStyle.dateTimeButtonText}>{formatDate(dueDateTime)}</Text>
        </TouchableOpacity>
        {showDatePicker && <DateTimePicker value={dueDateTime} mode="date" display="default" onChange={onDateChange} minimumDate={new Date()} />}
      </View>
      
      <View style={selectedStyle.inputGroup}>
        <Text style={selectedStyle.label}>Due Time</Text>
        <TouchableOpacity style={selectedStyle.dateTimeButton} onPress={() => setShowTimePicker(true)}>
          <Ionicons name="time-outline" size={20} color="#6200EE" />
          <Text style={selectedStyle.dateTimeButtonText}>{formatTime(dueDateTime)}</Text>
        </TouchableOpacity>
        {showTimePicker && <DateTimePicker value={dueDateTime} mode="time" display="default" onChange={onTimeChange} />}
      </View>

      <View style={selectedStyle.inputGroup}>
        <Text style={selectedStyle.label}>Icon</Text>
        <TouchableOpacity style={selectedStyle.iconSelector} onPress={() => setShowIcons(!showIcons)}>
          {selectedIcon ? <Ionicons name={selectedIcon as any} size={24} color="#6200EE" /> : <Ionicons name="image-outline" size={24} color="#6200EE" />}
          <Text style={selectedStyle.iconSelectorText}>{selectedIcon ? `Selected: ${selectedIcon}` : 'Select an icon'}</Text>
        </TouchableOpacity>
        {showIcons && (
          <View style={selectedStyle.iconGrid}>
            {iconList.map(iconName => (
              <TouchableOpacity key={iconName} style={[selectedStyle.iconButton, selectedIcon === iconName && selectedStyle.iconButtonSelected]} onPress={() => handleIconSelect(iconName)}>
                <Ionicons name={iconName as any} size={24} color={selectedIcon === iconName ? '#fff' : '#6200EE'} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={selectedStyle.inputGroup}>
        <View style={selectedStyle.switchRow}>
          <Text style={selectedStyle.label}>Enable Reminder</Text>
          <Switch value={enableReminder} onValueChange={setEnableReminder} trackColor={{ false: '#767577', true: '#6200EE' }} thumbColor={enableReminder ? '#fff' : '#f4f3f4'} />
        </View>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 10 }}>
        {onCancel && (
           <TouchableOpacity style={{...selectedStyle.addButton, backgroundColor: '#888', flex: 1, marginRight: 10}} onPress={onCancel}>
             <Text style={selectedStyle.addButtonText}>Cancel</Text>
           </TouchableOpacity>
        )}
        <TouchableOpacity style={{...selectedStyle.addButton, flex: 1}} onPress={handleSubmit}>
          <Text style={selectedStyle.addButtonText}>{submitButtonText}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};