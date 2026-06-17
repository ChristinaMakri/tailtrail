import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { View, Text, StyleSheet } from 'react-native'
import { AppTabParams, HomeStackParams, ReportStackParams, MatchesStackParams, ProfileStackParams } from './types'
import { Colors, FontSize } from '../lib/constants'

import { HomeScreen } from '../screens/home/HomeScreen'
import { PetDetailScreen } from '../screens/home/PetDetailScreen'
import { ReportChoiceScreen } from '../screens/report/ReportChoiceScreen'
import { ReportLostScreen } from '../screens/report/ReportLostScreen'
import { ReportFoundScreen } from '../screens/report/ReportFoundScreen'
import { MatchesScreen } from '../screens/matches/MatchesScreen'
import { ProfileScreen } from '../screens/profile/ProfileScreen'

const Tab = createBottomTabNavigator<AppTabParams>()
const HomeStack = createNativeStackNavigator<HomeStackParams>()
const ReportStack = createNativeStackNavigator<ReportStackParams>()
const MatchesStack = createNativeStackNavigator<MatchesStackParams>()
const ProfileStack = createNativeStackNavigator<ProfileStackParams>()

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Feed" component={HomeScreen} />
      <HomeStack.Screen name="PetDetail" component={PetDetailScreen} />
    </HomeStack.Navigator>
  )
}

function ReportNavigator() {
  return (
    <ReportStack.Navigator screenOptions={{ headerShown: false }}>
      <ReportStack.Screen name="ReportChoice" component={ReportChoiceScreen} />
      <ReportStack.Screen name="ReportLost" component={ReportLostScreen} />
      <ReportStack.Screen name="ReportFound" component={ReportFoundScreen} />
    </ReportStack.Navigator>
  )
}

function MatchesNavigator() {
  return (
    <MatchesStack.Navigator screenOptions={{ headerShown: false }}>
      <MatchesStack.Screen name="MatchesList" component={MatchesScreen} />
    </MatchesStack.Navigator>
  )
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    </ProfileStack.Navigator>
  )
}

function ReportTabIcon() {
  return (
    <View style={styles.addButton}>
      <Ionicons name="add" size={28} color={Colors.textInverse} />
    </View>
  )
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Αρχική',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ReportTab"
        component={ReportNavigator}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => <ReportTabIcon />,
        }}
      />
      <Tab.Screen
        name="MatchesTab"
        component={MatchesNavigator}
        options={{
          tabBarLabel: 'Ταιριάσματα',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Προφίλ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: FontSize.xs,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
})
