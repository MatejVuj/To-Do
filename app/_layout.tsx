import { Stack, usePathname } from "expo-router";
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Colors} from '@/assets/colors/colors';
import { LinearGradient } from "expo-linear-gradient";
import { useUserPreferences } from "@/utilities/hooks/useUserPreferences"; // Importiramo hook
import * as Notifications from "expo-notifications"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const StackLayout = () => {
  
  const { preferences } = useUserPreferences();
  const userDarkMode = preferences.darkMode;

  const pathname = usePathname();
  const isIndex = pathname === '/'; // if index.tsx (login)

  const containerStyle = userDarkMode ? darkStyles.container : styles.container;

  // if we are on index.tsx (login) primary is used always 
  const gradientColors = isIndex 
    ? [Colors.primary, Colors.primary] 
    : userDarkMode 
    ? [Colors.bgDark, Colors.bgDark] 
    : [Colors.gradientLight[0], Colors.primary, Colors.success];

  // requestin premission for notification from operating system (user)
  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Notification permissions are needed for reminders.');
        return;
      }
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
      }
    };
    setupNotifications();
  }, []);

  // linear gradient is used for header colors
  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <SafeAreaView style={containerStyle}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default StackLayout;