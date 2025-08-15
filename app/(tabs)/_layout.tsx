import * as React from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from '@/FirebaseConfig';
import { Colors } from '@/assets/colors/colors'; 

const TabBarStyle = {
  tabBarShowLabel: false,
  headerShown: false,
  tabBarStyle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    //backgroundColor: Colors.primary,       
    height: 60,
    borderTopColor: Colors.bgDark,

  },
};

export default () => {
  const [userDarkMode, setUserDarkMode] = React.useState(false);

  React.useEffect(() => {
  let unsubDoc;

  const unsubAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      unsubDoc = onSnapshot(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const newDark = snapshot.data()?.preferences?.darkMode ?? false;
            setUserDarkMode((prev) => (prev === newDark ? prev : newDark));
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

  const tabBg = userDarkMode ? Colors.bgDark : Colors.primary;
  const tabBorderColor = userDarkMode ? Colors.bgDark : Colors.bgLight
  const focusedColor = Colors.white;
  const unfocusedColor = userDarkMode ? Colors.primaryDark : Colors.secondary;
  const addIconBg = userDarkMode ? Colors.primaryDark : Colors.white;
  const addIconColor = userDarkMode ? Colors.bgDark : Colors.primary;

  return (
    <Tabs
      screenOptions={{
        ...TabBarStyle,
        tabBarStyle: { ...TabBarStyle.tabBarStyle, backgroundColor: tabBg, borderTopColor: tabBorderColor},
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={30}
              color={focused ? focusedColor : unfocusedColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "layers" : "layers-outline"}
              size={24}
              color={focused ? focusedColor : unfocusedColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                position: "absolute",
                top: -12,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: addIconBg,
                width: 55,
                height: 55,
                borderRadius: 15,
                //shadowColor: Colors.black,
                //shadowOffset: { width: 0, height: focused ? 10 : 0 },
                //shadowOpacity: 0.25,
                //shadowRadius: 3.5,
                elevation: 5,
              }}
            >
              <Ionicons
                name={focused ? "add-circle-sharp" : "add-circle-outline"}
                size={30}
                color={addIconColor}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={focused ? focusedColor : unfocusedColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={24}
              color={focused ? focusedColor : unfocusedColor}
            />
          ),
        }}
      />
    </Tabs>
  );
};