import React, { useState } from "react";
import { router, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/FirebaseConfig";
import { Colors } from "@/assets/colors/colors";
import { TouchableOpacity, Alert } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { iconList } from "@/assets/icons/iconList";
import { saveTaskToFirebase, scheduleTaskNotification } from "@/utilities/hooks/taskAddUtility"; 
import { useUserPreferences } from "@/utilities/hooks/useUserPreferences";


const STT_API_KEY = process.env.EXPO_PUBLIC_STT_API_KEY;
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const TabBarStyle = {
  tabBarShowLabel: false,
  headerShown: false,
  tabBarStyle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    borderTopWidth: 1,
  },
};

export default () => {
  const { preferences } = useUserPreferences();
  const userDarkMode = preferences.darkMode;
  const [isRecording, setIsRecording] = useState(false);

  const tabBg = userDarkMode ? Colors.bgDark : Colors.primary;
  const tabBorderColor = userDarkMode ? Colors.bgDark : Colors.bgLight;
  const focusedColor = Colors.white;
  const unfocusedColor = userDarkMode ? Colors.primaryDark : Colors.secondary;

  const handleVoiceCommand = async () => {
    if (isRecording) return;

    if (!STT_API_KEY) {
      Alert.alert(" STT Configuration Error", "API keys for voice commands are not configured. Please set them in your .env file.");
      return;
    }
    if (!GEMINI_API_KEY) {
      Alert.alert(" GEMINI Configuration Error", "API keys for voice commands are not configured. Please set them in your .env file.");
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission denied", "Microphone access is required.");
        return;
      }

      Alert.alert("Recording…", "Speak your task now (5 seconds)");
      setIsRecording(true);
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
      });

      setTimeout(async () => {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (!uri) {
            setIsRecording(false);
            return;
        }

        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const sttRes = await fetch(
          `https://speech.googleapis.com/v1/speech:recognize?key=${STT_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              config: { encoding: "LINEAR16", sampleRateHertz: 16000, languageCode: "en-US" },
              audio: { content: base64 },
            }),
          }
        );

        const sttData = await sttRes.json();
        const transcript = sttData.results?.[0]?.alternatives?.[0]?.transcript;
        if (!transcript) {
          Alert.alert("No speech detected", "Please try again.");
          setIsRecording(false);
          return;
        }

        const prompt = `Parse this voice command for creating a task: "${transcript}".
         Current date is ${new Date().toISOString().split('T')[0]}.
          Output ONLY valid JSON:
           {
            "title": "string (required, short title)",
            "description": "string or null",
            "due_date": "YYYY-MM-DD or today",
            "due_time": "HH:MM or 9:00",
            "priority": "red | orange | green",
            "icon": "${iconList.join(" | ")} or null",
            "enableReminder": true
           }`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        );

        const geminiData = await geminiRes.json();
        const raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        let task;
        try {
          task = JSON.parse(raw.replace(/```json|```/g, '').trim());
        } catch (error) {
          console.error('JSON parse error:', error, "Raw text:", raw);
          Alert.alert("Error", "Failed to parse task from voice.");
          setIsRecording(false);
          return;
        }
        
        const savedTask = await saveTaskToFirebase(task);

        if (task.enableReminder) {
          const dueDateTime = new Date(`${task.due_date}T${task.due_time}`);
          

          await scheduleTaskNotification( dueDateTime, savedTask.id, task);
        }

        Alert.alert("Task Added", task.title);
        setIsRecording(false);
        router.replace('/(tabs)/tasks');
      }, 5000);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message);
      setIsRecording(false);
    }
  };


  return (
    <Tabs
      screenOptions={{
        ...TabBarStyle,
        tabBarStyle: {
          ...TabBarStyle.tabBarStyle,
          backgroundColor: tabBg,
          borderTopColor: tabBorderColor,
        },
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
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/add")}
              onLongPress={handleVoiceCommand}
              style={{
                position: "absolute",
                top: -12,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: userDarkMode ? Colors.primaryDark : Colors.white,
                width: 55,
                height: 55,
                borderRadius: 15,
                elevation: 5,
              }}
            >
              <Ionicons
                name={isRecording ? "mic" : (focused ? "add-circle-sharp" : "add-circle-outline")}
                size={30}
                color={userDarkMode ? Colors.bgDark : Colors.primary}
              />
            </TouchableOpacity>
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