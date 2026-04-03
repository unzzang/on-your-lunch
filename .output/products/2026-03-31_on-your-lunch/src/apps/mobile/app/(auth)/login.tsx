// ─────────────────────────────────────────
// 로그인 화면
//
// 스플래시(1.5초) + 인트로 + Google 로그인 버튼.
// ─────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/tokens';

export default function LoginScreen() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    }, 1500);
    return () => clearTimeout(timer);
  }, [fadeAnim]);

  const handleGoogleLogin = useCallback(() => {
    // Google OAuth 연동 (실제 구현은 expo-auth-session 사용)
    router.push('/(auth)/terms');
  }, [router]);

  // 스플래시
  if (showSplash) {
    return (
      <Animated.View style={[styles.splash, { opacity: fadeAnim }]}>
        <Text style={styles.splashLogo}>온유어런치</Text>
        <Text style={styles.splashTagline}>매일 점심, 고민 끝.</Text>
      </Animated.View>
    );
  }

  // 인트로
  return (
    <SafeAreaView style={styles.container}>
      {/* 일러스트 영역 */}
      <View style={styles.illustrationArea}>
        <Text style={styles.illustrationMain}>{'🍽'}</Text>
        <Text style={styles.illustrationSub}>{'👥'}</Text>
      </View>

      {/* 타이틀 */}
      <View style={styles.titleArea}>
        <Text style={styles.title}>{'매일 점심 뭐 먹지?\n온유어런치가 골라줄게요!'}</Text>
        <Text style={styles.subtitle}>회사 근처 맛집, 3초만에 추천</Text>
      </View>

      {/* 하단 */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.googleButton, Shadow.sm]}
          onPress={handleGoogleLogin}
          activeOpacity={0.7}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleText}>Google로 시작하기</Text>
        </TouchableOpacity>

        <Text style={styles.termsHint}>
          계속하면{' '}
          <Text style={styles.termsLink}>이용약관</Text>
          에 동의하게 됩니다
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 스플래시
  splash: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  splashTagline: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
  // 인트로
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  illustrationArea: {
    height: 300,
    marginTop: Spacing['3xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationMain: {
    fontSize: 80,
    opacity: 0.7,
  },
  illustrationSub: {
    fontSize: 60,
    opacity: 0.5,
    marginTop: -Spacing.lg,
  },
  titleArea: {
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  googleButton: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg.primary,
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: Radius.md,
    gap: Spacing.md,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  googleText: {
    ...Typography.body1,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  termsHint: {
    ...Typography.caption,
    color: Colors.text.placeholder,
    textAlign: 'center',
    marginTop: Spacing.base,
  },
  termsLink: {
    color: Colors.text.secondary,
    textDecorationLine: 'underline',
  },
});
