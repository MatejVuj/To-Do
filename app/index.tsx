import { Redirect, router } from "expo-router";
import {View, Text, SafeAreaView, TextInput, TouchableOpacity,KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert} from "react-native";
import React from "react";
import {auth} from "../FirebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import {styles} from './styles/indexStyle';
import { LogBox } from 'react-native';

const LoginPage = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isRegistering, setIsRegistering] = React.useState(false);

  const signIn = async () => {
    try{
      const user = await signInWithEmailAndPassword(auth, email, password);
      if(user) router.replace('/(tabs)/home');
    }catch(error) {
      console.error('Error sign in failed:', error);
    }
  }

  const signUp = async () => {
    try{
      const user = await createUserWithEmailAndPassword(auth, email, password);
      if(user) router.replace('/(tabs)/home');
    }catch(error){
      console.error('Error sign up failed:', error);
    }
  }

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
  }


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
          <Text style={styles.appTagline}>Once you set it you got to Do it</Text>
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
              secureTextEntry = {true} // prominit ovo da se moze kada se stisne show password da pokaze sta si napisa
            />
          </View>

          <View>
            <TouchableOpacity onPress={isRegistering ? signUp : signIn} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>
              {isRegistering ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
            <Text style={styles.toggleButtonText}>
              {isRegistering
                ? 'Already have an account? Login'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};


export default LoginPage;


