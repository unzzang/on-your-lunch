// ─────────────────────────────────────────
// 프로필 편집 화면
//
// 프로필 사진 변경 + 닉네임 수정.
// 이메일은 읽기 전용(Google 계정).
// ─────────────────────────────────────────

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/tokens';
import { useMe, useUpdateProfile } from '@/services/hooks';
import { NICKNAME_MIN_LENGTH, NICKNAME_MAX_LENGTH } from '@on-your-lunch/shared-types';

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const updateProfile = useUpdateProfile();

  const [nickname, setNickname] = useState(me?.nickname ?? '');
  const hasChanged = nickname !== (me?.nickname ?? '');
  const isValid =
    nickname.length >= NICKNAME_MIN_LENGTH &&
    nickname.length <= NICKNAME_MAX_LENGTH;
  const canSave = hasChanged && isValid;

  const handleSave = useCallback(() => {
    if (!canSave) return;
    updateProfile.mutate(
      { nickname },
      { onSuccess: () => router.back() },
    );
  }, [canSave, nickname, updateProfile, router]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 서브 바 */}
        <View style={styles.subBar}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.backText}>{'‹ 뒤로'}</Text>
          </TouchableOpacity>
          <Text style={styles.subBarTitle}>프로필 편집</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave}
            activeOpacity={0.7}
          >
            <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
              저장
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* 아바타 */}
          <View style={styles.avatarSection}>
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
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.changePhoto}>사진 변경</Text>
            </TouchableOpacity>
          </View>

          {/* 닉네임 */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>닉네임</Text>
            <TextInput
              style={styles.formInput}
              value={nickname}
              onChangeText={setNickname}
              maxLength={NICKNAME_MAX_LENGTH}
              placeholder="닉네임 입력"
              placeholderTextColor={Colors.text.placeholder}
            />
            <Text style={styles.formHint}>
              {NICKNAME_MIN_LENGTH}~{NICKNAME_MAX_LENGTH}자, 한글/영문/숫자
            </Text>
          </View>

          {/* 이메일 (읽기 전용) */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>이메일</Text>
            <TextInput
              style={[styles.formInput, styles.formInputDisabled]}
              value={me?.email ?? ''}
              editable={false}
            />
            <Text style={styles.formHint}>Google 계정 이메일 (변경 불가)</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  flex: {
    flex: 1,
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
  saveText: {
    ...Typography.body2,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  saveTextDisabled: {
    color: Colors.primaryDisabled,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  avatarImage: {
    width: 80,
    height: 80,
  },
  avatarIcon: {
    fontSize: 36,
  },
  changePhoto: {
    ...Typography.body2,
    fontWeight: '500',
    color: Colors.primary,
  },
  formGroup: {
    marginBottom: Spacing.xl,
  },
  formLabel: {
    ...Typography.body2,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  formInput: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    ...Typography.body2,
    fontSize: 15,
    color: Colors.text.primary,
  },
  formInputDisabled: {
    backgroundColor: Colors.bg.tertiary,
    color: Colors.text.placeholder,
  },
  formHint: {
    ...Typography.caption,
    color: Colors.text.placeholder,
    marginTop: Spacing.xs,
  },
});
