import { View, Alert, Text, StyleSheet, } from 'react-native';
import React, { useEffect } from 'react';
import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import { adduser } from './services/appwriteservices';

//Login page
const Login = () => {
  useEffect(() => {
    GoogleSignin.configure({
      profileImageSize: 150,
    });

    // Check if user is already signed in
    const checkIfLoggedIn = async () => {
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        const { name, email, photo } = currentUser.user;
        router.replace({
          pathname: '/(tabs)',
          params: {
            name: name ?? '',
            email,
            photo: photo ?? '',
          },
        });
      }
    };

    checkIfLoggedIn();
  }, []);

  const handleGooglesignin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { user } = response.data;
        const { name, email, photo } = user;
        await adduser(email, name)

        router.replace({
          pathname: '/(tabs)',
          params: {
            name: name ?? '',
            email,
            photo: photo ?? '',
          },
        });
      } else {
        Alert.alert('Signin cancelled');
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            Alert.alert('Google Signin is in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Play services not available');
            break;
          case statusCodes.SIGN_IN_CANCELLED:
            Alert.alert('Signin cancelled');
            break;
          default:
            Alert.alert('An error occurred');
        }
      } else {
        Alert.alert('Unexpected error. Try again.');
        console.error(error);
      }
    }
  };
 return (
    <View style={styles.container}>
      <Text style={styles.appName}>Cameo</Text>
      <Text style={styles.subtitle}>AI script rehearsal tool</Text>
      <Text style={styles.signInPrompt}>Sign in to continue</Text>

      <GoogleSigninButton
        style={styles.googleButton}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleGooglesignin}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 20,
  },
  signInPrompt: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 40,
  },
  googleButton: {
    width: 230,
    height: 60,
  },
});
export default Login;
