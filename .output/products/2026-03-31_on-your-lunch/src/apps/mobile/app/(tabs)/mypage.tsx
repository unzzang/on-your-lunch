import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  CaretRight,
  MapPin,
  ForkKnife,
  Bell,
  FileText,
  Lock,
} from 'phosphor-react-native';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '@/constants/tokens';
import { useAuthStore } from '@/stores/authStore';
import { useMe } from '@/services/hooks';
import ErrorState from '@/components/ErrorState';

const SETTINGS_MENU = [
  { key: 'location', label: '회사 위치 변경', icon: MapPin, route: '/mypage/edit-location' },
  { key: 'preference', label: '취향 설정', icon: ForkKnife, route: '/mypage/edit-preference' },
  { key: 'notification', label: '알림 설정', icon: Bell, route: '/mypage/notification' },
];

const INFO_MENU = [
  { key: 'terms', label: '서비스 이용약관', icon: FileText },
  { key: 'privacy', label: '개인정보 처리방침', icon: Lock },
];

/** 마이페이지 화면 */
export default function MypageScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { data: me, isLoading, isError, refetch } = useMe();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
    router.replace('/(auth)/login');
  };

  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.appBar}>
          <Text style={styles.appBarTitle}>마이페이지</Text>
        </View>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.appBar}>
          <Text style={styles.appBarTitle}>마이페이지</Text>
        </View>
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonLines}>
            <View style={styles.skeletonLine1} />
            <View style={styles.skeletonLine2} />
          </View>
        </View>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.skeletonMenuItem} />
        ))}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* App Bar */}
        <View style={styles.appBar}>
          <Text style={styles.appBarTitle}>마이페이지</Text>
        </View>

        {/* Profile Section */}
        <Pressable
          style={styles.profileSection}
          onPress={() => router.push('/mypage/edit-profile')}
        >
          <View style={styles.avatar}>
            {me?.profileImageUrl ? (
              <Image
                source={{ uri: me.profileImageUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <User size={28} color={colors.text.placeholder} weight="regular" />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.nickname}>{me?.nickname ?? '사용자'}</Text>
            <Text style={styles.email}>{me?.email ?? ''}</Text>
          </View>
          <CaretRight size={20} color={colors.text.placeholder} />
        </Pressable>

        {/* Section Gap */}
        <View style={styles.sectionGap} />

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>설정</Text>
          {SETTINGS_MENU.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <Pressable
                key={item.key}
                style={[
                  styles.menuItem,
                  idx < SETTINGS_MENU.length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => router.push(item.route as any)}
              >
                <IconComponent
                  size={20}
                  color={colors.text.secondary}
                  weight="regular"
                />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <CaretRight size={18} color={colors.text.placeholder} />
              </Pressable>
            );
          })}
        </View>

        {/* Section Gap */}
        <View style={styles.sectionGap} />

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보</Text>
          {INFO_MENU.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <Pressable
                key={item.key}
                style={[
                  styles.menuItem,
                  idx < INFO_MENU.length - 1 && styles.menuItemBorder,
                ]}
              >
                <IconComponent
                  size={20}
                  color={colors.text.secondary}
                  weight="regular"
                />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <CaretRight size={18} color={colors.text.placeholder} />
              </Pressable>
            );
          })}
        </View>

        {/* Section Gap */}
        <View style={styles.sectionGap} />

        {/* Bottom Links */}
        <View style={styles.bottomLinks}>
          <Pressable
            style={styles.linkItem}
            onPress={() => setLogoutModalVisible(true)}
          >
            <Text style={styles.linkText}>로그아웃</Text>
          </Pressable>
          <Pressable
            style={styles.linkItem}
            onPress={() => router.push('/mypage/withdraw')}
          >
            <Text style={styles.linkTextDestructive}>회원 탈퇴</Text>
          </Pressable>
        </View>

        {/* Version */}
        <Text style={styles.version}>앱 버전 1.0.0</Text>

        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>로그아웃 하시겠어요?</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalButtonCancel}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalButtonCancelText}>취소</Text>
              </Pressable>
              <Pressable
                style={styles.modalButtonConfirm}
                onPress={handleLogout}
              >
                <Text style={styles.modalButtonConfirmText}>로그아웃</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  appBar: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  appBarTitle: {
    fontSize: typography.h2.size,
    fontWeight: '700',
    color: colors.text.primary,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.base,
    gap: spacing.base,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  profileInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: typography.h3.size,
    fontWeight: typography.h3.weight,
    color: colors.text.primary,
  },
  email: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  sectionGap: {
    height: 8,
    backgroundColor: colors.bg.secondary,
  },
  section: {
    backgroundColor: colors.bg.primary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    letterSpacing: 0.5,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
  },
  bottomLinks: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.base,
  },
  linkItem: {
    paddingVertical: spacing.md,
  },
  linkText: {
    fontSize: typography.body2.size,
    color: colors.text.secondary,
  },
  linkTextDestructive: {
    fontSize: typography.body2.size,
    color: colors.destructive,
  },
  version: {
    fontSize: typography.caption.size,
    color: colors.text.placeholder,
    textAlign: 'center',
    paddingVertical: spacing.base,
  },
  // Skeleton
  skeletonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.base,
  },
  skeletonAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bg.tertiary,
  },
  skeletonLines: {
    flex: 1,
    gap: spacing.sm,
  },
  skeletonLine1: {
    height: 18,
    width: '40%',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.sm,
  },
  skeletonLine2: {
    height: 13,
    width: '60%',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.sm,
  },
  skeletonMenuItem: {
    height: 48,
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.sm,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.bg.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    maxWidth: 320,
    width: '85%',
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: typography.h3.size,
    fontWeight: typography.h3.weight,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButtonCancel: {
    flex: 1,
    height: 44,
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalButtonConfirm: {
    flex: 1,
    height: 44,
    backgroundColor: colors.destructive,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});
