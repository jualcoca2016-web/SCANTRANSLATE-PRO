import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../theme/constants';

// Screens
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import TextTranslateScreen from '../screens/TextTranslateScreen';
import GameHubScreen from '../screens/GameHubScreen';
import ProfileScreen from '../screens/ProfileScreen';
import VoiceTranslateScreen from '../screens/premium/VoiceTranslateScreen';
import ConversationScreen from '../screens/premium/ConversationScreen';

export type RootTabParamList = {
  Home: undefined;
  Camera: undefined;
  Text: undefined;
  Game: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  VoiceTranslate: undefined;
  Conversation: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" label="Inicio" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📷" label="Cámara" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Text"
        component={TextTranslateScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="✍️" label="Texto" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Game"
        component={GameHubScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🎮" label="Juego" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Perfil" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="VoiceTranslate" component={VoiceTranslateScreen} />
        <Stack.Screen name="Conversation" component={ConversationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: THEME.colors.background.darkPurple,
    borderTopWidth: THEME.borders.width.glow,
    borderTopColor: THEME.colors.primary.cyanElectric,
    height: 70,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabEmojiActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: THEME.colors.text.subtle,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: THEME.colors.primary.cyanElectric,
    fontWeight: '700',
  },
});
