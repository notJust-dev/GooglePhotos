import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View, AppState, Button, TextInput } from 'react-native';

import { useAuth } from '~/providers/AuthProvider';
import { supabase } from '~/utils/supabase';

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    if (!session) Alert.alert('Please check your inbox for email verification!');
    setLoading(false);
  }

  return (
    <View className="mt-10 gap-3 p-5">
      <TextInput
        onChangeText={(text) => setEmail(text)}
        value={email}
        placeholder="email@address.com"
        autoCapitalize="none"
        className="rounded-md border border-gray-300 p-3"
      />

      <TextInput
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry
        placeholder="Password"
        autoCapitalize="none"
        className="rounded-md border border-gray-300 p-3"
      />

      <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
      <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
    </View>
  );
}
