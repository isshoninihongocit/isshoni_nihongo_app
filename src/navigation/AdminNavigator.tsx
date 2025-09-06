import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AssignmentsManagementScreen from '../screens/admin/AssignmentsManagementScreen';
import ResourcesManagementScreen from '../screens/admin/ResourcesManagementScreen';
import EventsManagementScreen from '../screens/admin/EventsManagementScreen';
import LeaderboardManagementScreen from '../screens/admin/LeaderboardManagementScreen';
import ClubManagementScreen from '../screens/admin/ClubManagementScreen';

export type AdminDrawerParamList = {
  Dashboard: undefined;
  Assignments: undefined;
  Resources: undefined;
  Events: undefined;
  Leaderboard: undefined;
  Club: undefined;
};

const Drawer = createDrawerNavigator<AdminDrawerParamList>();

const AdminNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      screenOptions={({ route }) => ({
        drawerIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Assignments') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Resources') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Leaderboard') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Club') {
            iconName = focused ? 'people' : 'people-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        drawerActiveTintColor: '#3B82F6',
        drawerInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen}
        options={{ 
          drawerLabel: 'Dashboard',
          title: 'Admin Dashboard'
        }}
      />
      <Drawer.Screen 
        name="Assignments" 
        component={AssignmentsManagementScreen}
        options={{ 
          drawerLabel: 'Assignments',
          title: 'Manage Assignments'
        }}
      />
      <Drawer.Screen 
        name="Resources" 
        component={ResourcesManagementScreen}
        options={{ 
          drawerLabel: 'Resources',
          title: 'Manage Resources'
        }}
      />
      <Drawer.Screen 
        name="Events" 
        component={EventsManagementScreen}
        options={{ 
          drawerLabel: 'Events',
          title: 'Manage Events'
        }}
      />
      <Drawer.Screen 
        name="Leaderboard" 
        component={LeaderboardManagementScreen}
        options={{ 
          drawerLabel: 'Leaderboard',
          title: 'Manage Leaderboard'
        }}
      />
      <Drawer.Screen 
        name="Club" 
        component={ClubManagementScreen}
        options={{ 
          drawerLabel: 'Club Info',
          title: 'Manage Club Info'
        }}
      />
    </Drawer.Navigator>
  );
};

export default AdminNavigator;
