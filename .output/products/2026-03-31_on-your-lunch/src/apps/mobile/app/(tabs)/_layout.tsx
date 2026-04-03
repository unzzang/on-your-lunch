// ─────────────────────────────────────────
// 탭 레이아웃
//
// 하단 탭 바 구성: 홈 / 탐색 / 이력 / 마이
// 배달의민족 스타일의 깔끔한 탭 바.
// ─────────────────────────────────────────

import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { Colors, Typography, IconSize } from '@/constants/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>{'🏠'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '탐색',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>{'🔍'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '이력',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>{'📅'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>{'👤'}</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bg.primary,
    borderTopColor: Colors.border.default,
    borderTopWidth: 1,
    height: 84,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tabLabel: {
    ...Typography.caption,
  },
  tabIcon: {
    fontSize: IconSize.navigation,
  },
});
