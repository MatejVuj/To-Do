import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '@/FirebaseConfig';
import * as Notifications from 'expo-notifications';
import { isValid, subMinutes, subHours } from 'date-fns';
import { Alert } from 'react-native';

export const generateTags = (title, description) => {
  const words = `${title} ${description || ''}`.toLowerCase()
  .split(/\s+/).filter(word => word.length > 2);
  return [...new Set(words)];
};

export const saveTaskToFirebase = async (taskData) => {
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    const tasksRef = collection(firestore, `users/${user.uid}/tasks`);
    const docRef = await addDoc(tasksRef, {
      ...taskData,
      createdAt: new Date().toISOString(),
      status: 'pending',
      tags: generateTags(taskData.title, taskData.description),
    });
    return { id: docRef.id, ...taskData };
  } catch (error) {
    console.error('Error saving task to Firebase:', error);
    throw new Error('Failed to save task.');
  }
};

export const scheduleTaskNotification = async (dueDateTime, taskId, taskDetails) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("Cannot schedule, user not found.");
    return;
  }

  try {
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const preferences = userDoc.data()?.preferences || {};

    if (preferences.notifications === false) {
      console.log('Notifications are disabled in user preferences. Skipping schedule.');
      return;
    }

    const reminderTime = preferences.reminderTime || 'at_time';
    let triggerDate = new Date(dueDateTime);

    if (!isValid(triggerDate)) {
        console.error("Invalid dueDateTime provided for notification scheduling.");
        return;
    }

    // based on user preference
    switch (reminderTime) {
      case '5_min_before':
        triggerDate = subMinutes(triggerDate, 5);
        break;
      case '15_min_before':
        triggerDate = subMinutes(triggerDate, 15);
        break;
      case '1_hour_before':
        triggerDate = subHours(triggerDate, 1);
        break;
      case 'at_time':
      default:
        break;
    }
    
    // canceling to prevent from duplicating
    await cancelTaskNotifications(taskId);

    // schedule the new notification if the trigger date is in the future
    if (triggerDate > new Date()) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Reminder: ${taskDetails.title}`,
          body: taskDetails.description || 'Your task is due soon.',
          data: { taskId: taskId },
        },
        trigger: triggerDate,
      });
      console.log(`Notification scheduled for task |${taskId}| at |${triggerDate.toLocaleString()}| (ID: |${notificationId})|`);
    }

  } catch (error) {
    console.error("Error scheduling notification:", error);
    Alert.alert("Error", "Could not schedule a reminder for the task.");
  }
};

export const cancelTaskNotifications = async (taskId) => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduledNotifications) {
      if (notification.content.data && notification.content.data.taskId === taskId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        console.log(`Cancelled notification for task ${taskId}`);
      }
    }
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
};
