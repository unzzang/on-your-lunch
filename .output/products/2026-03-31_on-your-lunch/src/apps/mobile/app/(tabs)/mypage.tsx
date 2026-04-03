import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typo, spacing, radius } from '../../constants/tokens';

interface MenuItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
}

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon as any} size={20} color={colors.text.secondary} />
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.text.placeholder} />
    </TouchableOpacity>
  );
}

export default function MyPageTab() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이페이지</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.7}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={colors.text.placeholder} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>사용자</Text>
            <Text style={styles.profileEmail}>example@gmail.com</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.text.placeholder} />
        </TouchableOpacity>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>설정</Text>
          <View style={styles.sectionContent}>
            <MenuItem icon="location-outline" label="회사 위치 변경" />
            <View style={styles.divider} />
            <MenuItem icon="restaurant-outline" label="취향 설정" />
            <View style={styles.divider} />
            <MenuItem icon="notifications-outline" label="알림 설정" />
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보</Text>
          <View style={styles.sectionContent}>
            <MenuItem icon="document-text-outline" label="서비스 이용약관" />
            <View style={styles.divider} />
            <MenuItem icon="lock-closed-outline" label="개인정보 처리방침" />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.accountSection}>
          <TouchableOpacity style={styles.accountButton}>
            <Text style={styles.accountText}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accountButton}>
            <Text style={[styles.accountText, { color: colors.text.placeholder }]}>회원 탈퇴</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.versionText}>앱 버전 0.1.0</Text>

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },

  header: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    ...typo.h2,
    color: colors.text.primary,
  },

  // Profile
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomWidth: 8,
    borderBottomColor: colors.bg.secondary,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bg.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typo.body1,
    fontWeight: '700',
    color: colors.text.primary,
  },
  profileEmail: {
    ...typo.body2,
    color: colors.text.secondary,
    marginTop: 2,
  },

  // Section
  section: {
    paddingTop: spacing.xl,
    borderBottomWidth: 8,
    borderBottomColor: colors.bg.secondary,
  },
  sectionTitle: {
    ...typo.caption,
    fontWeight: '500',
    color: colors.text.secondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  sectionContent: {
    paddingHorizontal: spacing.lg,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuLabel: {
    ...typo.body1,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
  },

  // Account
  accountSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    gap: spacing.lg,
  },
  accountButton: {
    paddingVertical: spacing.xs,
  },
  accountText: {
    ...typo.body2,
    color: colors.text.secondary,
  },

  versionText: {
    ...typo.caption,
    color: colors.text.placeholder,
    textAlign: 'center',
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
});
