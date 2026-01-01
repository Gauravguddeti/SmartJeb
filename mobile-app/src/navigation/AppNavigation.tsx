/**
 * App navigation structure
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../constants/theme';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ExpenseFormScreen from '../screens/ExpenseFormScreen';
import ExpenseDetailScreen from '../screens/ExpenseDetailScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Stack navigators
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const DashboardStack = createNativeStackNavigator();
const AnalyticsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Tab navigator
const MainTab = createBottomTabNavigator();

// Auth stack navigator (login/register)
const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// Dashboard stack navigator
const DashboardStackNavigator = () => {
  return (
    <DashboardStack.Navigator>
      <DashboardStack.Screen 
        name="DashboardHome" 
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <DashboardStack.Screen 
        name="ExpenseDetail" 
        component={ExpenseDetailScreen}
        options={{ title: 'Expense Details' }}
      />
      <DashboardStack.Screen 
        name="ExpenseForm" 
        component={ExpenseFormScreen}
        options={({ route }) => ({ 
          title: route.params?.expense ? 'Edit Expense' : 'Add Expense'
        })}
      />
    </DashboardStack.Navigator>
  );
};

// Analytics stack navigator
const AnalyticsStackNavigator = () => {
  return (
    <AnalyticsStack.Navigator>
      <AnalyticsStack.Screen 
        name="AnalyticsHome" 
        component={AnalyticsScreen}
        options={{ headerShown: false }}
      />
    </AnalyticsStack.Navigator>
  );
};

// Profile stack navigator
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen 
        name="ProfileHome" 
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </ProfileStack.Navigator>
  );
};

// Main tab navigator
const MainTabNavigator = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'AddExpense') {
            iconName = 'add-circle';
            return (
              <Ionicons 
                name={iconName} 
                size={36} 
                color={COLORS.primary} 
                style={{ marginBottom: -10 }}
              />
            );
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: isDarkMode ? COLORS.textSecondaryDark : COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: isDarkMode ? COLORS.surfaceDark : COLORS.surface,
          borderTopColor: isDarkMode ? COLORS.borderDark : COLORS.border,
        },
        headerShown: false,
      })}
    >
      <MainTab.Screen name="Dashboard" component={DashboardStackNavigator} />
      <MainTab.Screen name="Analytics" component={AnalyticsStackNavigator} />
      <MainTab.Screen 
        name="AddExpense" 
        component={ExpenseFormScreen} 
        options={{ 
          tabBarLabel: '',
        }}
      />
      <MainTab.Screen name="Profile" component={ProfileStackNavigator} />
    </MainTab.Navigator>
  );
};

// Main app navigation
const AppNavigation = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDarkMode } = useTheme();
  
  // Show loading screen if authenticating
  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer
      theme={{
        dark: isDarkMode,
        colors: {
          primary: COLORS.primary,
          background: isDarkMode ? COLORS.backgroundDark : COLORS.background,
          card: isDarkMode ? COLORS.surfaceDark : COLORS.surface,
          text: isDarkMode ? COLORS.textDark : COLORS.text,
          border: isDarkMode ? COLORS.borderDark : COLORS.border,
          notification: COLORS.error,
        },
      }}
    >
      <MainStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <MainStack.Screen name="Auth" component={AuthStackNavigator} />
        ) : (
          <MainStack.Screen name="Main" component={MainTabNavigator} />
        )}
      </MainStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
