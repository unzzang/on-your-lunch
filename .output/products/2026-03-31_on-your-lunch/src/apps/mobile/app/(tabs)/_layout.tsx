import React from 'react';
import { Tabs } from 'expo-router';
import {
  House,
  MagnifyingGlass,
  CalendarBlank,
  User,
} from 'phosphor-react-native';
import { colors, typography } from '@/constants/tokens';

/** 메인 탭 레이아웃 -- 홈 / 탐색 / 이력 / 마이 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.placeholder,
        tabBarLabelStyle: {
          fontSize: typography.overline.size,
          fontWeight: typography.overline.weight,
        },
        tabBarStyle: {
          borderTopColor: colors.border.default,
          borderTopWidth: 1,
          backgroundColor: colors.bg.primary,
          height: 72,
          paddingBottom: 28,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <House
              size={24}
              color={color}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '탐색',
          tabBarIcon: ({ color, focused }) => (
            <MagnifyingGlass
              size={24}
              color={color}
              weight={focused ? 'bold' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '이력',
          tabBarIcon: ({ color, focused }) => (
            <CalendarBlank
              size={24}
              color={color}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이',
          tabBarIcon: ({ color, focused }) => (
            <User
              size={24}
              color={color}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
