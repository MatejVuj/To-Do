import { Stack, usePathname } from "expo-router";
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from '@/FirebaseConfig';
import { Colors} from '@/assets/colors/colors.ts';
import { LinearGradient } from "expo-linear-gradient";

const StackLayout = () => {
  const [userDarkMode, setUserDarkMode] = useState(false);

 useEffect(() => {
  let unsubDoc;

  const unsubAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      unsubDoc = onSnapshot(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setUserDarkMode(snapshot.data()?.preferences?.darkMode ?? false);
          }
        },
        (error) => {
          if (error.code === 'permission-denied') return; // ignore after logout
          console.error(error);
        }
      );
    } else {
      unsubDoc?.();
      setUserDarkMode(false);
    }
  });

  return () => {
    unsubDoc?.();
    unsubAuth();
  };
}, []);

  const containerStyle = userDarkMode ? darkStyles.container : styles.container;

  const pathname = usePathname();
  const isIndex = pathname === '/'; //index screen is /

   return (
    <LinearGradient colors={isIndex ? [Colors.primary, Colors.primary] : userDarkMode ? [Colors.bgDark, Colors.bgDark] : [Colors.gradientLight[0], Colors.primary, Colors.success]} style={{ flex: 1 }}>
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


