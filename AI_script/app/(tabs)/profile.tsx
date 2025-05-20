import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import { resetDatabase } from '../services/dbservice';

//const STORAGE_KEY = 'profileImage';

const Profile = () => {
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
   const [STORAGE_KEY, setSTORAGE_KEY] = useState('profileImage');
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    loadUserInfoAndImage();
  }, []);

  const loadUserInfoAndImage = async () => {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      if (userInfo) {
        setName(userInfo.user.name || '');
        setEmail(userInfo.user.email || '');
        setSTORAGE_KEY(userInfo.user.email || '')
        const savedImage = await AsyncStorage.getItem(STORAGE_KEY);
        setProfileImage(savedImage || userInfo.user.photo); // fallback to Google image
      }
    } catch (err) {
      console.error('Failed to get current user or image:', err);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Media library access is needed!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      await AsyncStorage.setItem(STORAGE_KEY, uri);
    }
  };

  const resetdatabase = async () => {
  Alert.alert("Reset", "Database reset triggered ");
  await resetDatabase();
};

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
       router.replace({
                  pathname: '../login',
                  });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]} />
          )}
          <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
            <Text style={styles.editText}>✎</Text>
          </TouchableOpacity>
        </View>

      <View style={styles.inputContainer}>
        {editingName ? (
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            onBlur={() => setEditingName(false)}
          />
        ) : (
          <View style={styles.readonlyField}>
            <Text style={styles.text}>{name}</Text>
            <TouchableOpacity onPress={() => setEditingName(true)}>
              <Text style={styles.smallIcon}>✎</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
  <View style={styles.readonlyField}>
    <Text style={styles.text}>{email}</Text>
  </View>
</View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={resetdatabase}>
      <Text style={styles.resetText}>Reset Database</Text>
    </TouchableOpacity>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 100,
    backgroundColor: '#F8F8F8',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  avatarPlaceholder: {
    backgroundColor: '#4682B4',
  },
  editIcon: {
    position: 'absolute',
    right: -10,
    bottom: 10,
    backgroundColor: '#9bb5ff',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  editText: {
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    width: '80%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  readonlyField: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 16,
  },
  smallIcon: {
    fontSize: 18,
  },
  logoutButton: {
    marginTop: 60,
    backgroundColor: '#f44',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
  },
  resetButton: {
  marginTop: 20,
  backgroundColor: '#555',
  paddingVertical: 12,
  paddingHorizontal: 40,
  borderRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 5,
},
resetText: {
  color: '#fff',
  fontSize: 18,
},
});

