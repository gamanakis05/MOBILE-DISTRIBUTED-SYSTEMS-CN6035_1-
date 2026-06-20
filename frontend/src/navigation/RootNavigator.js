import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator }   from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';

// Auth
import LoginScreen    from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// User screens
import HomeScreen          from '../screens/HomeScreen';
import TheatresScreen      from '../screens/TheatresScreen';
import TheatreDetailScreen from '../screens/TheatreDetailScreen';
import ShowDetailScreen    from '../screens/ShowDetailScreen';
import BookingScreen       from '../screens/BookingScreen';
import ProfileScreen       from '../screens/ProfileScreen';
import SettingsScreen      from '../screens/SettingsScreen';

// Admin screens
import AdminDashboardScreen    from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen        from '../screens/admin/AdminUsersScreen';
import AdminReservationsScreen from '../screens/admin/AdminReservationsScreen';
import AdminTheatresScreen     from '../screens/admin/AdminTheatresScreen';
import AdminShowsScreen        from '../screens/admin/AdminShowsScreen';
import AdminShowtimesScreen    from '../screens/admin/AdminShowtimesScreen';

import { Colors, Spacing } from '../utils/theme';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const HEADER_OPTS = {
  headerStyle:      { backgroundColor: Colors.primary },
  headerTintColor:  Colors.textLight,
  headerTitleStyle: { fontWeight: '700' },
};

// ─── Auth stack ───────────────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"    component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ─── Shows stack ──────────────────────────────────────────────────────────────
function ShowsStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_OPTS}>
      <Stack.Screen name="ShowsList"  component={HomeScreen}       options={{ title: 'Παραστάσεις' }} />
      <Stack.Screen name="ShowDetail" component={ShowDetailScreen} options={{ title: 'Παράσταση' }} />
      <Stack.Screen name="Booking"    component={BookingScreen}    options={{ title: 'Κράτηση Θέσης' }} />
    </Stack.Navigator>
  );
}

// ─── Theatres stack ───────────────────────────────────────────────────────────
function TheatresStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_OPTS}>
      <Stack.Screen name="TheatresList"  component={TheatresScreen}      options={{ title: 'Θέατρα' }} />
      <Stack.Screen name="TheatreDetail" component={TheatreDetailScreen} options={{ title: 'Θέατρο' }} />
      <Stack.Screen name="ShowDetail"    component={ShowDetailScreen}    options={{ title: 'Παράσταση' }} />
      <Stack.Screen name="Booking"       component={BookingScreen}       options={{ title: 'Κράτηση Θέσης' }} />
    </Stack.Navigator>
  );
}

// ─── Profile stack ────────────────────────────────────────────────────────────
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_OPTS}>
      {/*
        ✅ Gear button defined HERE — not inside ProfileScreen via useLayoutEffect.
           This prevents it from "leaking" into other tab headers.
      */}
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: 'Προφίλ',
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: Spacing.sm }}
              onPress={() => navigation.navigate('Settings')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="settings-outline" size={22} color={Colors.textLight} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="Settings"      component={SettingsScreen}          options={{ title: 'Ρυθμίσεις' }} />
      <Stack.Screen name="AdminDashboard"    component={AdminDashboardScreen}    options={{ title: 'Admin Panel' }} />
      <Stack.Screen name="AdminUsers"        component={AdminUsersScreen}        options={{ title: 'Χρήστες' }} />
      <Stack.Screen name="AdminReservations" component={AdminReservationsScreen} options={{ title: 'Κρατήσεις' }} />
      <Stack.Screen name="AdminTheatres"     component={AdminTheatresScreen}     options={{ title: 'Θέατρα' }} />
      <Stack.Screen name="AdminShows"        component={AdminShowsScreen}        options={{ title: 'Παραστάσεις' }} />
      <Stack.Screen name="AdminShowtimes"    component={AdminShowtimesScreen}    options={{ title: 'Προβολές' }} />
    </Stack.Navigator>
  );
}

// ─── Bottom tabs ──────────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor:  Colors.border,
          height: 62,
          paddingBottom: 10,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            ShowsTab:    focused ? 'film'     : 'film-outline',
            TheatresTab: focused ? 'business' : 'business-outline',
            ProfileTab:  focused ? 'person'   : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="ShowsTab"    component={ShowsStack}    options={{ title: 'Παραστάσεις' }} />
      <Tab.Screen name="TheatresTab" component={TheatresStack} options={{ title: 'Θέατρα' }} />
      <Tab.Screen name="ProfileTab"  component={ProfileStack}  options={{ title: 'Προφίλ' }} />
    </Tab.Navigator>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
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
        <Stack.Screen name="AppStack"  component={MainTabs} />
        <Stack.Screen name="AuthStack" component={AuthStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
