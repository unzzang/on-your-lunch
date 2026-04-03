// ─────────────────────────────────────────
// 마이페이지 화면
//
// 프로필 + 설정 메뉴 + 로그아웃/탈퇴.
// 로그아웃 확인 모달 포함.
// ─────────────────────────────────────────

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/tokens';
import { useMe } from '@/services/hooks';
import { useAuthStore } from '@/stores/authStore';
import ErrorState from '@/components/ErrorState';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

const SETTINGS_MENU: MenuItem[] = [
  { icon: '📍', label: '회사 위치 변경', route: '/mypage/edit-location' },
  { icon: '🍽', label: '취향 설정', route: '/mypage/edit-preference' },
  { icon: '🔔', label: '알림 설정', route: '/mypage/notification' },
];

const INFO_MENU: MenuItem[] = [
  { icon: '📄', label: '서비스 이용약관', route: '/terms' },
  { icon: '🔒', label: '개인정보 처리방침', route: '/privacy' },
];

export default function MypageScreen() {
  const router = useRouter();
  const { data: me, isLoading, isError, refetch } = useMe();
  const logout = useAuthStore((s) => s.logout);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = useCallback(async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/(auth)/login');
  }, [logout, router]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.appBar}>
          <Text style={styles.appBarTitle}>마이페이지</Text>
        </View>
        <View style={styles.skeletonProfile}>
          <View style={styles.skeletonAvatar} />
          <View>
            <View style={styles.skeletonLine1} />
            <View style={styles.skeletonLine2} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>마이페이지</Text>
      </View>

      <ScrollView>
        {/* 프로필 섹션 */}
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() => router.push('/mypage/edit-profile')}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            {me?.profileImageUrl ? (
              <Image
                source={{ uri: me.profileImageUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarIcon}>{'👤'}</Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.nickname}>{me?.nickname ?? '사용자'}</Text>
            <Text style={styles.email}>{me?.email ?? ''}</Text>
          </View>
          <Text style={styles.chevron}>{'›'}</Text>
        </TouchableOpacity>

        {/* 설정 섹션 */}
        <View style={styles.sectionGap} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>설정</Text>
          {SETTINGS_MENU.map((item, i) => (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.menuItem,
                i < SETTINGS_MENU.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>{'›'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 정보 섹션 */}
        <View style={styles.sectionGap} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보</Text>
          {INFO_MENU.map((item, i) => (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.menuItem,
                i < INFO_MENU.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => {/* 웹뷰 연결 */}}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>{'›'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 하단 링크 */}
        <View style={styles.sectionGap} />
        <View style={styles.bottomLinks}>
          <TouchableOpacity
            style={styles.bottomLink}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomLink}
            onPress={() => router.push('/mypage/withdraw')}
            activeOpacity={0.7}
          >
            <Text style={styles.withdrawText}>회원 탈퇴</Text>
          </TouchableOpacity>
        </View>

        {/* 버전 */}
        <Text style={styles.version}>앱 버전 1.0.0</Text>
      </ScrollView>

      {/* 로그아웃 확인 모달 */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, Shadow.lg]}>
            <Text style={styles.modalTitle}>로그아웃 하시겠어요?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonConfirmText}>로그아웃</Text>
              </TouchableOpacity>
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
    backgroundColor: Colors.bg.primary,
  },
  appBar: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
  },
  appBarTitle: {
    ...Typography.h2,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  // 스켈레톤
  skeletonProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.base,
  },
  skeletonAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.bg.tertiary,
  },
  skeletonLine1: {
    width: 100,
    height: 18,
    backgroundColor: Colors.bg.tertiary,
    borderRadius: Radius.sm,
    marginBottom: 6,
  },
  skeletonLine2: {
    width: 160,
    height: 13,
    backgroundColor: Colors.bg.tertiary,
    borderRadius: Radius.sm,
  },
  // 프로필
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.base,
    gap: Spacing.base,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
  },
  avatarIcon: {
    fontSize: 28,
  },
  profileInfo: {
    flex: 1,
  },
  nickname: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  email: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: Colors.text.placeholder,
  },
  // 섹션
  sectionGap: {
    height: 8,
    backgroundColor: Colors.bg.secondary,
  },
  section: {
    backgroundColor: Colors.bg.primary,
  },
  sectionTitle: {
    ...Typography.overline,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  // 메뉴
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    ...Typography.body2,
    fontSize: 15,
    color: Colors.text.primary,
    flex: 1,
  },
  menuChevron: {
    fontSize: 18,
    color: Colors.text.placeholder,
  },
  // 하단
  bottomLinks: {
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.base,
  },
  bottomLink: {
    paddingVertical: Spacing.md,
  },
  logoutText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  withdrawText: {
    ...Typography.body2,
    color: Colors.destructive,
  },
  version: {
    ...Typography.caption,
    color: Colors.text.placeholder,
    textAlign: 'center',
    paddingVertical: Spacing.base,
  },
  // 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: Colors.bg.primary,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: 320,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalButtonCancel: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.bg.tertiary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    ...Typography.body2,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  modalButtonConfirm: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.destructive,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    ...Typography.body2,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});
