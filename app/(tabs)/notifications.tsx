import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '@/FirebaseConfig';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';

import { styles, darkStyles } from '../../utilities/styles/notificationsStyle';
import { useUserPreferences } from '@/utilities/hooks/useUserPreferences';
import { useAuth } from '@/utilities/hooks/useAuth';
import { Colors } from '@/assets/colors/colors';

type ReminderOption = 'at_time' | '5_min_before' | '15_min_before' | '1_hour_before';

const reminderOptions: { key: ReminderOption; label: string }[] = [
  { key: 'at_time', label: 'At the exact time' },
  { key: '5_min_before', label: '5 minutes before' },
  { key: '15_min_before', label: '15 minutes before' },
  { key: '1_hour_before', label: '1 hour before' },
];

const NotificationsScreen = () => {
  const { user } = useAuth();
  const { preferences, isLoading } = useUserPreferences();
  const selectedStyle = preferences.darkMode ? darkStyles : styles;
  const iconColor = preferences.darkMode ? Colors.primaryDark : Colors.primary;
  const secondaryIconColor = preferences.darkMode ? Colors.textDarkSecondary : Colors.textLightSecondary;

  const [tempReminderTime, setTempReminderTime] = useState(preferences.reminderTime);

  // local state 
  useEffect(() => {
    if (!isLoading) {
      setTempReminderTime(preferences.reminderTime);
    }
  }, [preferences, isLoading]);

  const updatePreference = async (key, value) => {
    if (!user) return;
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        preferences: {
          ...preferences, 
          [key]: value,  
        },
      }, { merge: true });
    } catch (error) {
      console.error("Error updating preference:", error);
      Alert.alert("Error", `Could not update ${key}.`);
    }
  };

  const handleSaveSettings = () => {
    updatePreference('reminderTime', tempReminderTime);
    Alert.alert('Success', 'Settings have been saved.');
  };

  const handleSendTestNotification = async () => {
    if (!preferences.notifications) {
      Alert.alert("Reminders Disabled", "Please enable reminders in your Profile to send a test notification.");
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: 'Testing',
        sound: true,
      },
      trigger: { seconds: 2 },
    });
    Alert.alert('Sent', 'A test notification has been sent.');
  };

  return (
    <SafeAreaView style={selectedStyle.safeArea}>
      <View style={selectedStyle.container}>
        <LinearGradient colors={selectedStyle.headerGradientColors} style={selectedStyle.header}>
          <Text style={selectedStyle.headerTitle}>Notifications</Text>
        </LinearGradient>
        <ScrollView contentContainerStyle={selectedStyle.contentContainer}>
          <View style={selectedStyle.section}>
            <Text style={selectedStyle.sectionTitle}>General Settings</Text>
            <View style={selectedStyle.settingRow}>
              <View style={selectedStyle.settingLeft}>
                <Ionicons name="notifications-circle" size={24} color={secondaryIconColor} />
                <Text style={selectedStyle.settingText}>Enable All Reminders</Text>
              </View>
              <Switch
                value={preferences.notifications}
                onValueChange={(newValue) => updatePreference('notifications', newValue)}
                trackColor={{ false: Colors.greyMedium, true: iconColor }}
                thumbColor={preferences.darkMode ? Colors.bgDark : Colors.white}
              />
            </View>
          </View>

          <View style={selectedStyle.section}>
            <Text style={selectedStyle.sectionTitle}>Default Reminder Time</Text>
            {reminderOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={selectedStyle.optionRow}
                onPress={() => setTempReminderTime(option.key)}
                disabled={!preferences.notifications}
              >
                <Ionicons
                  name={tempReminderTime === option.key ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={!preferences.notifications ? Colors.greyMedium : (tempReminderTime === option.key ? iconColor : secondaryIconColor)}
                />
                <Text style={[
                    selectedStyle.optionText,
                    tempReminderTime === option.key && selectedStyle.selectedOptionText,
                    !preferences.notifications && { color: Colors.greyMedium }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={[selectedStyle.button, selectedStyle.saveButton]} onPress={handleSaveSettings}>
            <Text style={selectedStyle.buttonText}>Save Time Preference</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[selectedStyle.button, selectedStyle.testButton]} onPress={handleSendTestNotification}>
            <Text style={selectedStyle.buttonText}>Send Test Notification</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default NotificationsScreen;
