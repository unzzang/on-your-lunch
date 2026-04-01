import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ForkKnife, UsersThree } from 'phosphor-react-native';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '@/constants/tokens';
import { useAuthStore } from '@/stores/authStore';

/** 로그인 화면 -- 스플래시 + Google 로그인 */
export default function LoginScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const [showSplash, setShowSplash] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const contentFade = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Splash -> Intro transition
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [fadeAnim, contentFade]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.isOnboardingCompleted) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/terms');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    // Google OAuth -- actual implementation pending
    // On success: setTokens + setUser + navigate
    setTimeout(() => {
      setLoginLoading(false);
      router.push('/(auth)/terms');
    }, 1500);
  };

  if (showSplash) {
    return (
      <Animated.View style={[styles.splash, { opacity: fadeAnim }]}>
        <Text style={styles.splashLogo}>온유어런치</Text>
        <Text style={styles.splashTagline}>매일 점심, 고민 끝.</Text>
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: contentFade }]}>
        {/* Illustration area */}
        <View style={styles.illustration}>
          <ForkKnife
            size={80}
            color={colors.primary}
            weight="light"
            style={{ opacity: 0.7 }}
          />
          <UsersThree
            size={60}
            color={colors.primary}
            weight="light"
            style={{ opacity: 0.5, marginTop: spacing.base }}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {'매일 점심 뭐 먹지?\n온유어런치가 골라줄게요!'}
        </Text>
        <Text style={styles.subtitle}>
          회사 근처 맛집, 3초만에 추천
        </Text>
      </Animated.View>

      <View style={styles.bottom}>
        {/* Google Login Button */}
        <Pressable
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={loginLoading}
        >
          {loginLoading ? (
            <ActivityIndicator color={colors.text.primary} size="small" />
          ) : (
            <>
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.googleButtonText}>Google로 시작하기</Text>
            </>
          )}
        </Pressable>

        {/* Terms notice */}
        <Text style={styles.termsNotice}>
          계속하면{' '}
          <Text style={styles.termsLink}>이용약관</Text>에 동의하게 됩니다
        </Text>
      </View>

      {/* Loading overlay */}
      {loginLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size={32} color={colors.primary} />
          <Text style={styles.loadingText}>로그인 중이에요...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  splashTagline: {
    fontSize: typography.body1.size,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  illustration: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    lineHeight: 34,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  subtitle: {
    fontSize: typography.body1.size,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  bottom: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  googleButton: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: colors.bg.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.sm,
  },
  googleG: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  googleButtonText: {
    fontSize: typography.body1.size,
    fontWeight: '500',
    color: colors.text.primary,
  },
  termsNotice: {
    fontSize: typography.caption.size,
    color: colors.text.placeholder,
    textAlign: 'center',
    marginTop: spacing.base,
  },
  termsLink: {
    color: colors.text.secondary,
    textDecorationLine: 'underline',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    fontSize: typography.body2.size,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});
