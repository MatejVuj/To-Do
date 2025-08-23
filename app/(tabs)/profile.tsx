import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Switch, Alert, ActivityIndicator, TextInput, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore, storage, auth } from '@/FirebaseConfig';
import { doc, updateDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { styles, darkStyles } from '../../utilities/styles/profileStyle';
import { useAuth } from '@/utilities/hooks/useAuth';
import { useUserPreferences } from '@/utilities/hooks/useUserPreferences';

const Profile = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { preferences, isLoading: prefsLoading } = useUserPreferences();
  const selectedStyle = preferences.darkMode ? darkStyles : styles;

  const [userData, setUserData] = useState({
    displayName: '',
    email: '',
    photoURL: null,
    createdAt: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isUploading, setIsUploading] = useState(false);
  
  // geting user preferences dinamically in real-time
  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        const defaultData = {
            displayName: user.displayName || user.email?.split('@')[0],
            email: user.email,
            photoURL: user.photoURL,
            createdAt: user.metadata.creationTime,
        };
        if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({ ...defaultData, ...data });
            setEditedName(data.displayName || user.displayName || '');
        } else {
            setUserData(defaultData);
            setEditedName(user.displayName || '');
        }
    });
    return () => unsubscribe();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/'); //going back to index.tsx (login)
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };
  
  const saveProfile = async () => {
    if (!user || !editedName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    try {
      await updateProfile(user, { displayName: editedName });
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, { displayName: editedName }, { merge: true });
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      await uploadProfileImage(result.assets[0].uri);
    }
  };
  
  const uploadProfileImage = async (uri) => {
    if (!user) return;

    setIsUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `profile_images/${user.uid}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: downloadURL });
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, { photoURL: downloadURL }, { merge: true });

      // visual update (adding photo to the userData)
      setUserData((prev) => ({ ...prev, photoURL: downloadURL }));
      
      Alert.alert('Success', 'Profile picture updated');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const togglePreference = async (preference) => {
    if (!user) return;
    try {
        const newPreferences = { ...preferences, [preference]: !preferences[preference] };
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, { preferences: newPreferences }, { merge: true });
    } catch (error) {
      console.error('Error updating preference:', error);
      Alert.alert('Error', 'Failed to update preference');
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new) {
        Alert.alert('Error', 'Please fill in both current and new password.');
        return;
    }
    if (passwords.new !== passwords.confirm) {
        Alert.alert('Error', 'New passwords do not match.');
        return;
    }

    if (user && user.email) {
        const credential = EmailAuthProvider.credential(user.email, passwords.current);
        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, passwords.new);
            setShowPasswordModal(false);
            setPasswords({ current: '', new: '', confirm: '' });
            Alert.alert('Success', 'Password updated successfully.');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    }
  };

  if (authLoading || prefsLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#6200EE" /></View>;
  }

  return (
    <SafeAreaView style={selectedStyle.safeAreaViewContainer}>
      <LinearGradient colors={selectedStyle.headerGradientColors} style={selectedStyle.header}>
        <View style={selectedStyle.profileImageContainer}>
          <TouchableOpacity onPress={pickImage} disabled={isUploading}>
            {isUploading ? <ActivityIndicator size="large" color="#fff" /> : 
             (userData.photoURL ? 
              <Image source={{ uri: userData.photoURL }} style={selectedStyle.profileImage} /> : 
              <View style={selectedStyle.profileImagePlaceholder}><Text style={selectedStyle.profileImagePlaceholderText}>{userData.displayName?.[0]?.toUpperCase() || '?'}</Text></View>)
            }
            <View style={selectedStyle.editImageButton}><Ionicons name="camera" size={16} color="#fff" /></View>
          </TouchableOpacity>
        </View>

        {editMode ? (
          <View style={selectedStyle.editNameContainer}>
            <TextInput style={selectedStyle.nameInput} value={editedName} onChangeText={setEditedName} placeholder="Enter your name" />
            <View style={selectedStyle.editButtonsRow}>
              <TouchableOpacity style={[selectedStyle.editButton, selectedStyle.saveButton]} onPress={saveProfile}><Text style={selectedStyle.editButtonText}>Save</Text></TouchableOpacity>
              <TouchableOpacity style={[selectedStyle.editButton, selectedStyle.cancelButton]} onPress={() => setEditMode(false)}><Text style={selectedStyle.editButtonText}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={selectedStyle.profileInfo}>
            <Text style={selectedStyle.profileName}>{userData.displayName}</Text>
            <Text style={selectedStyle.profileEmail}>{userData.email}</Text>
            <TouchableOpacity style={selectedStyle.editProfileButton} onPress={() => setEditMode(true)}><Text style={selectedStyle.editProfileButtonText}>Edit Profile</Text></TouchableOpacity>
          </View>
        )}
      </LinearGradient>
      
      <ScrollView style={selectedStyle.container}>
        <View style={selectedStyle.section}>
          <Text style={selectedStyle.sectionTitle}>Account</Text>
          <View style={selectedStyle.sectionContent}>
            <TouchableOpacity style={selectedStyle.menuItem} onPress={() => setShowPasswordModal(true)}>
              <View style={selectedStyle.menuItemLeft}><Ionicons name="lock-closed-outline" size={24} color={selectedStyle.menuIcon.color} /><Text style={selectedStyle.menuText}>Change Password</Text></View>
              <Ionicons name="chevron-forward" size={20} color={selectedStyle.chevronIcon.color} />
            </TouchableOpacity>
            <View style={selectedStyle.menuItem}>
              <View style={selectedStyle.menuItemLeft}><Ionicons name="calendar-outline" size={24} color={selectedStyle.menuIcon.color} /><Text style={selectedStyle.menuText}>Member Since</Text></View>
              <Text style={selectedStyle.menuValueText}>{userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : ''}</Text>
            </View>
          </View>
        </View>

        <View style={selectedStyle.section}>
          <Text style={selectedStyle.sectionTitle}>Preferences</Text>
          <View style={selectedStyle.sectionContent}>
            <View style={selectedStyle.menuItem}>
              <View style={selectedStyle.menuItemLeft}><Ionicons name="moon-outline" size={24} color={selectedStyle.menuIcon.color} /><Text style={selectedStyle.menuText}>Dark Mode</Text></View>
              <Switch value={preferences.darkMode} onValueChange={() => togglePreference('darkMode')} trackColor={{ false: '#767577', true: '#6200EE' }} thumbColor={preferences.darkMode ? '#fff' : '#f4f3f4'}/>
            </View>
            <View style={selectedStyle.menuItem}>
              <View style={selectedStyle.menuItemLeft}><Ionicons name="notifications-outline" size={24} color={selectedStyle.menuIcon.color} /><Text style={selectedStyle.menuText}>Notifications</Text></View>
              <Switch value={preferences.notifications} onValueChange={() => togglePreference('notifications')} trackColor={{ false: '#767577', true: '#6200EE' }} thumbColor={preferences.notifications ? '#fff' : '#f4f3f4'}/>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={selectedStyle.signOutButton} onPress={handleSignOut}>
          <Text style={selectedStyle.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={showPasswordModal} onRequestClose={() => setShowPasswordModal(false)}>
        <View style={selectedStyle.modalOverlay}>
          <View style={selectedStyle.modalContent}>
            <Text style={selectedStyle.modalTitle}>Change Password</Text>
            <TextInput style={selectedStyle.modalInput} placeholder="Current Password" secureTextEntry value={passwords.current} onChangeText={(text) => setPasswords(p => ({ ...p, current: text }))} />
            <TextInput style={selectedStyle.modalInput} placeholder="New Password" secureTextEntry value={passwords.new} onChangeText={(text) => setPasswords(p => ({ ...p, new: text }))} />
            <TextInput style={selectedStyle.modalInput} placeholder="Confirm New Password" secureTextEntry value={passwords.confirm} onChangeText={(text) => setPasswords(p => ({ ...p, confirm: text }))} />
            <View style={selectedStyle.modalButtons}>
              <TouchableOpacity style={[selectedStyle.modalButton, selectedStyle.modalCancelButton]} onPress={() => setShowPasswordModal(false)}><Text style={selectedStyle.modalButtonText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[selectedStyle.modalButton, selectedStyle.modalSaveButton]} onPress={handleChangePassword}><Text style={selectedStyle.modalButtonText}>Change</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;