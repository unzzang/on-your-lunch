// ─────────────────────────────────────────
// 회원 탈퇴 화면
//
// 경고 아이콘 + 삭제 데이터 안내 + 탈퇴/취소 버튼.
// 탈퇴 확인 모달 포함.
// ─────────────────────────────────────────

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/tokens';
import { useAuthStore } from '@/stores/authStore';

export default function WithdrawScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleWithdraw = useCallback(async () => {
    // 실제 구현: DELETE /users/me API 호출 후 로그아웃
    setShowConfirm(false);
    await logout();
    router.replace('/(auth)/login');
  }, [logout, router]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 서브 바 */}
      <View style={styles.subBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backText}>{'‹ 뒤로'}</Text>
        </TouchableOpacity>
        <Text style={styles.subBarTitle}>회원 탈퇴</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {/* 경고 아이콘 */}
        <View style={styles.warningSection}>
          <Text style={styles.warningIcon}>{'⚠️'}</Text>
        </View>

        {/* 타이틀 */}
        <Text style={styles.title}>정말 탈퇴하시겠어요?</Text>

        {/* 안내 박스 */}
        <View style={styles.infoBox}>
          <Text style={styles.infoDescription}>
            탈퇴하면 아래 데이터가 영구 삭제돼요.
          </Text>
          <View style={styles.deleteList}>
            <Text style={styles.deleteItem}>{'•'} 먹은 이력 및 별점 기록</Text>
            <Text style={styles.deleteItem}>{'•'} 즐겨찾기 목록</Text>
            <Text style={styles.deleteItem}>{'•'} 취향 설정 및 프로필 정보</Text>
          </View>
          <Text style={styles.infoWarning}>
            삭제된 데이터는 복구할 수 없어요.
          </Text>
        </View>

        {/* 버튼 */}
        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={() => setShowConfirm(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.withdrawButtonText}>탈퇴하기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>

      {/* 최종 확인 모달 */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, Shadow.lg]}>
            <Text style={styles.modalTitle}>
              정말로 탈퇴하시겠어요?{'\n'}모든 데이터가 삭제됩니다.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowConfirm(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleWithdraw}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonConfirmText}>탈퇴</Text>
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
  subBar: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
  },
  backText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  subBarTitle: {
    ...Typography.body1,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
  },
  warningSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  warningIcon: {
    fontSize: 48,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  infoBox: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
  },
  infoDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  deleteList: {
    paddingLeft: Spacing.lg,
    marginBottom: Spacing.md,
  },
  deleteItem: {
    ...Typography.body2,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  infoWarning: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.text.placeholder,
  },
  withdrawButton: {
    height: 48,
    backgroundColor: Colors.destructive,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawButtonText: {
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  cancelButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  cancelButtonText: {
    ...Typography.body2,
    color: Colors.text.secondary,
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
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 24,
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
