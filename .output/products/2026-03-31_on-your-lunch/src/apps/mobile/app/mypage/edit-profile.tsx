import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CaretLeft, User } from 'phosphor-react-native';
import {
  colors,
  typography,
  spacing,
  radius,
} from '@/constants/tokens';
import { useMe, useUpdateProfile } from '@/services/hooks';
import {
  NICKNAME_MIN_LENGTH,
  NICKNAME_MAX_LENGTH,
} from '@on-your-lunch/shared-types';

/** 프로필 편집 화면 */
export default function EditProfileScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const updateProfile = useUpdateProfile();

  const [nickname, setNickname] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (me) {
      setNickname(me.nickname);
    }
  }, [me]);

  const hasChanged = nickname !== (me?.nickname ?? '');
  const isValid =
    nickname.length >= NICKNAME_MIN_LENGTH &&
    nickname.length <= NICKNAME_MAX_LENGTH;

  const handleSave = () => {
    if (!hasChanged || !isValid) return;
    updateProfile.mutate(
      { nickname },
      {
        onSuccess: () => {
          Alert.alert('', '프로필이 저장되었어요.');
          router.back();
        },
      },
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
        <Text style={styles.subBarTitle}>프로필 편집</Text>
        <Pressable onPress={handleSave} disabled={!hasChanged || !isValid}>
          <Text
            style={[
              styles.saveText,
              (!hasChanged || !isValid) && styles.saveTextDisabled,
            ]}
          >
            저장
          </Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <User size={36} color={colors.text.placeholder} />
          </View>
          <Pressable>
            <Text style={styles.changePhotoText}>사진 변경</Text>
          </Pressable>
        </View>

        {/* Nickname */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>닉네임</Text>
          <TextInput
            style={[
              styles.formInput,
              isFocused && styles.formInputFocused,
            ]}
            value={nickname}
            onChangeText={setNickname}
            maxLength={NICKNAME_MAX_LENGTH}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <Text style={styles.formHint}>
            {NICKNAME_MIN_LENGTH}~{NICKNAME_MAX_LENGTH}자, 한글/영문/숫자
          </Text>
        </View>

        {/* Email (disabled) */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>이메일</Text>
          <TextInput
            style={[styles.formInput, styles.formInputDisabled]}
            value={me?.email ?? ''}
            editable={false}
          />
          <Text style={styles.formHint}>
            Google 계정 이메일 (변경 불가)
          </Text>
        </View>
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
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  saveTextDisabled: {
    color: colors.primaryDisabled,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: typography.body2.size,
    fontWeight: '500',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  formGroup: {
    marginBottom: spacing.xl,
  },
  formLabel: {
    fontSize: typography.body2.size,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 6,
  },
  formInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    fontSize: 15,
    color: colors.text.primary,
  },
  formInputFocused: {
    borderColor: colors.primary,
  },
  formInputDisabled: {
    backgroundColor: colors.bg.tertiary,
    color: colors.text.placeholder,
  },
  formHint: {
    fontSize: typography.caption.size,
    color: colors.text.placeholder,
    marginTop: spacing.xs,
  },
});
