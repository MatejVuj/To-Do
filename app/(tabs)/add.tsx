import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { styles, darkStyles } from '../../utilities/styles/addStyle';
import { useUserPreferences } from '@/utilities/hooks/useUserPreferences';
import { TaskForm }  from '@/utilities/components/taskForm';
import { saveTaskToFirebase, scheduleTaskNotification } from '@/utilities/hooks/taskAddUtility';

const Add = () => {
  const { preferences } = useUserPreferences();
  const selectedStyle = preferences.darkMode ? darkStyles : styles;

  const handleAddTask = async (formData) => {
    try {
      const { dueDateTime, ...taskDetails } = formData;

      // setting date and time 
      const taskForFirebase = {
        ...taskDetails,
        due_date: `${dueDateTime.getFullYear()}-${String(dueDateTime.getMonth() + 1).padStart(2, '0')}-${String(dueDateTime.getDate()).padStart(2, '0')}`,
        due_time: `${String(dueDateTime.getHours()).padStart(2, '0')}:${String(dueDateTime.getMinutes()).padStart(2, '0')}`,
      };

      const savedTask = await saveTaskToFirebase(taskForFirebase);
      
      if (taskDetails.enableReminder) {
        // sending original dueDateTime
        await scheduleTaskNotification(dueDateTime, savedTask.id, taskDetails);
      }
 
      Alert.alert('Success', 'Task saved successfully!');
      router.replace('/(tabs)/tasks');
    } catch (error) {
      console.error('Error in handleAddTask:', error);
      Alert.alert('Error', error.message || 'Failed to save task. Please try again.');
    }
  };

  return (
    <SafeAreaView style={selectedStyle.safeAreaViewContainer}>
      <LinearGradient colors={selectedStyle.headerGradientColors} style={selectedStyle.header}>
        <View style={selectedStyle.header}>
          <Text style={selectedStyle.headerTitle}>Create New Task</Text>
        </View>
      </LinearGradient>

      <TaskForm
        onSubmit={handleAddTask}
        submitButtonText="Create Task"
        isDarkMode={preferences.darkMode}
        reset = {true}
      />
    </SafeAreaView>
  );
};

export default Add;