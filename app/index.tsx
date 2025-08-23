import { router } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { auth } from '../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../utilities/styles/indexStyle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter both email and password.');
      return;
    }

    try {
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password.trim());

      if (user.emailVerified) {
        router.replace('/(tabs)/home');
        return;
      }

      await sendEmailVerification(user);
      Alert.alert(
        'Email verification required',
        'We have sent a fresh verification link. Please check your inbox before signing in.'
      );
      await signOut(auth);
    } catch (err) {
      Alert.alert('Sign-in failed', err.message);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter both email and password.');
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
      await sendEmailVerification(user);

      Alert.alert(
        'Account created',
        'A verification email has been sent. Confirm it before signing in.'
      );
      setIsRegistering(false);
    } catch (err) {
      Alert.alert('Registration failed', err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="checkmark-circle" size={60} color="#fff" />
          </View>
          <Text style={styles.appName}>To-Do</Text>
          <Text style={styles.appTagline}>Once you set it you got to do it</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity onPress={isRegistering ? handleSignUp : handleSignIn} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>
              {isRegistering ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toggleButton} onPress={() => setIsRegistering(prev => !prev)}>
            <Text style={styles.toggleButtonText}>
              {isRegistering
                ? 'Already have an account? Log in'
                : "Don't have an account? Sign up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}