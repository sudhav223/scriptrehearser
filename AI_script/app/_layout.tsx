import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      profileImageSize: 150,
    });

    const checkAuth = async () => {
      try {
        const currentUser = await GoogleSignin.getCurrentUser();
        const isLoggedIn = !!currentUser;
        setIsAuthenticated(isLoggedIn);

        if (!isLoggedIn) {
          router.replace('/login'); // Redirect if not authenticated
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        router.replace('/login'); // Redirect on error
      }
    };

    checkAuth();
  }, []);

  return (
    <Stack>
      
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="screens" options={{ headerShown: false }} />
      
    </Stack>
  );
}
