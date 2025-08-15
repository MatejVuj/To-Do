import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Switch, Alert, ActivityIndicator, TextInput, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore, auth, storage } from '@/FirebaseConfig';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut, updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, onAuthStateChanged } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { styles, darkStyles } from '../styles/profileStyle';
import { addListener, removeListener, clearAllListeners } from '../listeners';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    displayName: '',
    email: '',
    photoURL: null,
    createdAt: '',
    preferences: {
      darkMode: false,
      notifications: true,
      emailUpdates: false
    }
  });

  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, completionRate: 0 });
  const [userDarkMode, setUserDarkMode] = React.useState(false);

  // Keep references to unsubscribers
  let unsubscribeUserSnapshot = null;
  let unsubscribeAuth = null;

  useEffect(() => {
  let unsub = () => {};
  unsub = onAuthStateChanged(auth, (user) => {
    if (!user) return;
    const ref = doc(firestore, 'users', user.uid);
    const inner = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) setUserDarkMode(snapshot.data().preferences.darkMode);
    });
    addListener(inner);
    return () => removeListener(inner);
  });
  addListener(unsub);
  return () => {
    removeListener(unsub);
    unsub();
  };
}, []);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const userDocRef = doc(firestore, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let profileData = {
        displayName: currentUser.displayName || currentUser.email.split('@')[0],
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        createdAt: currentUser.metadata.creationTime,
        preferences: {
          darkMode: false,
          notifications: true,
          emailUpdates: false
        }
      };

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        profileData = {
          ...profileData,
          ...userData,
          preferences: { ...profileData.preferences, ...(userData.preferences || {}) }
        };
      }

      setUserData(profileData);
      setEditedName(profileData.displayName);

      const tasksCollectionRef = collection(firestore, `users/${currentUser.uid}/tasks`);
      const tasksSnapshot = await getDocs(tasksCollectionRef);
      const tasks = tasksSnapshot.docs.map(doc => doc.data());

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      setStats({ totalTasks, completedTasks, completionRate });
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    clearAllListeners();
    try {
      // Cleanup snapshot before sign out
      if (unsubscribeUserSnapshot) unsubscribeUserSnapshot();
      if (unsubscribeAuth) unsubscribeAuth();
      
      
      await signOut(auth);
      router.replace('/'); // Navigate to index.tsx
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const toggleEditMode = () => {
    if (editMode) setEditedName(userData.displayName);
    setEditMode(!editMode);
  };

  const saveProfile = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { displayName: editedName });
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        await setDoc(userDocRef, { displayName: editedName, preferences: userData.preferences }, { merge: true });

        setUserData(prev => ({ ...prev, displayName: editedName }));
        setEditMode(false);
        Alert.alert('Success', 'Profile updated successfully');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
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
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const uploadProfileImage = async (uri) => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `profile_images/${currentUser.uid}`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      await updateProfile(currentUser, { photoURL: downloadURL });

      const userDocRef = doc(firestore, 'users', currentUser.uid);
      await setDoc(userDocRef, { photoURL: downloadURL }, { merge: true });

      setUserData(prev => ({ ...prev, photoURL: downloadURL }));
      setLoading(false);
      Alert.alert('Success', 'Profile picture updated');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
      setLoading(false);
    }
  };

  const togglePreference = async (preference) => {
    try {
      const newPreferences = { ...userData.preferences, [preference]: !userData.preferences[preference] };
      setUserData(prev => ({ ...prev, preferences: newPreferences }));

      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        await setDoc(userDocRef, { preferences: newPreferences }, { merge: true });
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      Alert.alert('Error', 'Failed to update preference');
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      Alert.alert('Error', 'All password fields are required');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (passwords.new.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (currentUser) {
        const credential = EmailAuthProvider.credential(currentUser.email, passwords.current);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, passwords.new);

        setShowPasswordModal(false);
        setPasswords({ current: '', new: '', confirm: '' });
        Alert.alert('Success', 'Password updated successfully');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', error.message || 'Failed to update password');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  const selectedStyle = userDarkMode ? darkStyles : styles;

  return (
    <SafeAreaView style={selectedStyle.safeAreaViewContainer}>
      <LinearGradient colors={selectedStyle.headerGradientColors} style={selectedStyle.header}>
        <View style={selectedStyle.profileImageContainer}>
          <TouchableOpacity onPress={pickImage}>
            {userData.photoURL ? (
              <Image source={{ uri: userData.photoURL }} style={selectedStyle.profileImage} />
            ) : (
              <View style={selectedStyle.profileImagePlaceholder}>
                <Text style={selectedStyle.profileImagePlaceholderText}>
                  {userData.displayName ? userData.displayName[0].toUpperCase() : '?'}
                </Text>
              </View>
            )}
            <View style={selectedStyle.editImageButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {editMode ? (
          <View style={selectedStyle.editNameContainer}>
            <TextInput
              style={selectedStyle.nameInput}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Enter your name"
              placeholderTextColor={selectedStyle.nameInputPlaceholder.color}
            />
            <View style={selectedStyle.editButtonsRow}>
              <TouchableOpacity style={[selectedStyle.editButton, selectedStyle.saveButton]} onPress={saveProfile}>
                <Text style={selectedStyle.editButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[selectedStyle.editButton, selectedStyle.cancelButton]} onPress={toggleEditMode}>
                <Text style={selectedStyle.editButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={selectedStyle.profileInfo}>
            <Text style={selectedStyle.profileName}>{userData.displayName}</Text>
            <Text style={selectedStyle.profileEmail}>{userData.email}</Text>
            <TouchableOpacity style={selectedStyle.editProfileButton} onPress={toggleEditMode}>
              <Text style={selectedStyle.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      <ScrollView style={selectedStyle.container}>
        {/* Account Section */}
        <View style={selectedStyle.section}>
          <Text style={selectedStyle.sectionTitle}>Account</Text>
          <View style={selectedStyle.sectionContent}>
            <TouchableOpacity style={selectedStyle.menuItem} onPress={() => setShowPasswordModal(true)}>
              <View style={selectedStyle.menuItemLeft}>
                <Ionicons name="lock-closed-outline" size={24} color={selectedStyle.menuIcon.color} />
                <Text style={selectedStyle.menuText}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={selectedStyle.chevronIcon.color} />
            </TouchableOpacity>

            <View style={selectedStyle.menuItem}>
              <View style={selectedStyle.menuItemLeft}>
                <Ionicons name="calendar-outline" size={24} color={selectedStyle.menuIcon.color} />
                <Text style={selectedStyle.menuText}>Member Since</Text>
              </View>
              <Text style={selectedStyle.menuValueText}>{formatDate(userData.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={selectedStyle.section}>
          <Text style={selectedStyle.sectionTitle}>Preferences</Text>
          <View style={selectedStyle.sectionContent}>
            <View style={selectedStyle.menuItem}>
              <View style={selectedStyle.menuItemLeft}>
                <Ionicons name="moon-outline" size={24} color={selectedStyle.menuIcon.color} />
                <Text style={selectedStyle.menuText}>Dark Mode</Text>
              </View>
              <Switch
                value={userData.preferences.darkMode}
                onValueChange={() => togglePreference('darkMode')}
                trackColor={{ false: selectedStyle.switchTrackFalse.color, true: selectedStyle.switchTrackTrue.color }}
                thumbColor={userData.preferences.darkMode ? selectedStyle.switchThumbTrue.color : selectedStyle.switchThumbFalse.color}
              />
            </View>

            <View style={selectedStyle.menuItem}>
              <View style={selectedStyle.menuItemLeft}>
                <Ionicons name="notifications-outline" size={24} color={selectedStyle.menuIcon.color} />
                <Text style={selectedStyle.menuText}>Push Notifications</Text>
              </View>
              <Switch
                value={userData.preferences.notifications}
                onValueChange={() => togglePreference('notifications')}
                trackColor={{ false: selectedStyle.switchTrackFalse.color, true: selectedStyle.switchTrackTrue.color }}
                thumbColor={userData.preferences.notifications ? selectedStyle.switchThumbTrue.color : selectedStyle.switchThumbFalse.color}
              />
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={selectedStyle.signOutButton} onPress={handleSignOut}>
          <Text style={selectedStyle.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal animationType="slide" transparent={true} visible={showPasswordModal} onRequestClose={() => setShowPasswordModal(false)}>
        <View style={selectedStyle.modalOverlay}>
          <View style={selectedStyle.modalContent}>
            <Text style={selectedStyle.modalTitle}>Change Password</Text>
            <TextInput
              style={selectedStyle.modalInput}
              placeholder="Current Password"
              placeholderTextColor={selectedStyle.modalInputPlaceholder.color}
              secureTextEntry
              value={passwords.current}
              onChangeText={(text) => setPasswords({ ...passwords, current: text })}
            />
            <TextInput
              style={selectedStyle.modalInput}
              placeholder="New Password"
              placeholderTextColor={selectedStyle.modalInputPlaceholder.color}
              secureTextEntry
              value={passwords.new}
              onChangeText={(text) => setPasswords({ ...passwords, new: text })}
            />
            <TextInput
              style={selectedStyle.modalInput}
              placeholder="Confirm New Password"
              placeholderTextColor={selectedStyle.modalInputPlaceholder.color}
              secureTextEntry
              value={passwords.confirm}
              onChangeText={(text) => setPasswords({ ...passwords, confirm: text })}
            />
            <View style={selectedStyle.modalButtons}>
              <TouchableOpacity style={[selectedStyle.modalButton, selectedStyle.modalCancelButton]} onPress={() => setShowPasswordModal(false)}>
                <Text style={selectedStyle.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[selectedStyle.modalButton, selectedStyle.modalSaveButton]} onPress={handleChangePassword}>
                <Text style={selectedStyle.modalButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;