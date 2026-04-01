import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CaretLeft, Warning } from 'phosphor-react-native';
import {
  colors,
  typography,
  spacing,
  radius,
} from '@/constants/tokens';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';

const DELETE_ITEMS = [
  '먹은 이력 및 별점 기록',
  '즐겨찾기 목록',
  '취향 설정 및 프로필 정보',
];

/** 회원 탈퇴 화면 */
export default function WithdrawScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleWithdraw = () => {
    Alert.alert(
      '정말 탈퇴하시겠어요?',
      '삭제된 데이터는 복구할 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('users/me');
              await logout();
              router.replace('/(auth)/login');
            } catch {
              Alert.alert('', '탈퇴 처리 중 오류가 발생했어요.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sub Bar */}
      <View style={styles.subBar}>
        <Pressable
          style={styles.backArea}
          onPress={() => router.back()}
        >
          <CaretLeft size={20} color={colors.text.secondary} />
          <Text style={styles.backText}>뒤로</Text>
        </Pressable>
        <Text style={styles.subBarTitle}>회원 탈퇴</Text>
        <View style={{ minWidth: 60 }} />
      </View>

      <View style={styles.content}>
        {/* Warning Icon */}
        <View style={styles.iconArea}>
          <Warning size={48} color={colors.destructive} weight="regular" />
        </View>

        {/* Title */}
        <Text style={styles.title}>정말 탈퇴하시겠어요?</Text>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoDesc}>
            탈퇴하면 아래 데이터가 영구 삭제돼요.
          </Text>
          <View style={styles.deleteList}>
            {DELETE_ITEMS.map((item, idx) => (
              <Text key={idx} style={styles.deleteItem}>
                {'\u2022'} {item}
              </Text>
            ))}
          </View>
          <Text style={styles.infoWarning}>
            삭제된 데이터는 복구할 수 없어요.
          </Text>
        </View>

        {/* Withdraw Button */}
        <Pressable style={styles.withdrawButton} onPress={handleWithdraw}>
          <Text style={styles.withdrawButtonText}>탈퇴하기</Text>
        </Pressable>

        {/* Cancel */}
        <Pressable
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>돌아가기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  subBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  backArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 60,
  },
  backText: {
    fontSize: typography.body2.size,
    color: colors.text.secondary,
  },
  subBarTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
  },
  iconArea: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: typography.h3.size,
    fontWeight: typography.h3.weight,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  infoBox: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.xl,
  },
  infoDesc: {
    fontSize: typography.body2.size,
    lineHeight: 22,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  deleteList: {
    paddingLeft: spacing.lg,
    marginBottom: spacing.md,
  },
  deleteItem: {
    fontSize: typography.body2.size,
    lineHeight: 24,
    color: colors.text.primary,
  },
  infoWarning: {
    fontSize: 13,
    color: colors.text.placeholder,
  },
  withdrawButton: {
    height: 48,
    backgroundColor: colors.destructive,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawButtonText: {
    fontSize: typography.body1.size,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  cancelButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelButtonText: {
    fontSize: typography.body2.size,
    color: colors.text.secondary,
  },
});
