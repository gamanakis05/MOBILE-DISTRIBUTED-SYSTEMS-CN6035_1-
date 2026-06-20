import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator }  from '@react-navigation/native-stack';
import { createBottomTabNavigator }    from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';

import { useAuth } from '../context/AuthContext';

import LoginScreen      from '../screens/LoginScreen';
import RegisterScreen   from '../screens/RegisterScreen';
import HomeScreen       from '../screens/HomeScreen';
import ShowDetailScreen from '../screens/ShowDetailScreen';
import BookingScreen    from '../screens/BookingScreen';
import ProfileScreen    from '../screens/ProfileScreen';

import { Colors } from '../utils/theme';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── Auth stack ──────────────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"    component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ─── Main tabs ───────────────────────────────────────────────────────────────
function HomeTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor:   Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor:  Colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textLight,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Παραστάσεις"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎭</Text> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        listeners={({ navigation }) => ({
          focus: () => {
            if (!user) {
              navigation.navigate('AuthStack', { screen: 'Login' });
            }
          },
        })}
        options={{
          title: 'Προφίλ',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// ─── App stack (public access) ─────────────────────────────────────────────────
function AppStack() {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:      { backgroundColor: Colors.primary },
        headerTintColor:  Colors.textLight,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="Main"       component={HomeTabs}       options={{ headerShown: false }} />
      <Stack.Screen name="ShowDetail" component={ShowDetailScreen} options={{ title: 'Παράσταση' }} />
      <Stack.Screen 
        name="Booking" 
        component={BookingScreen}    
        options={{ title: 'Κράτηση Θέσης' }}
        listeners={({ navigation }) => ({
          focus: () => {
            if (!user) {
              navigation.navigate('AuthStack', { screen: 'Login' });
            }
          },
        })}
      />
    </Stack.Navigator>
  );
}

// ─── Root navigator ──────────────────────────────────────────────────────────
export default function RootNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary }}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AppStack" component={AppStack} />
        <Stack.Screen name="AuthStack" component={AuthStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
