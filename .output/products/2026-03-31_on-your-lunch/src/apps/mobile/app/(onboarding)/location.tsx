// ─────────────────────────────────────────
// 온보딩 Step 1: 회사 위치 설정
//
// 주소 검색 인풋 + 지도 플레이스홀더 + 주소 표시.
// ─────────────────────────────────────────

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/tokens';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function LocationScreen() {
  const router = useRouter();
  const { location, setLocation, setStep } = useOnboardingStore();
  const [searchText, setSearchText] = useState('');

  const hasLocation = !!location;

  const handleSearch = useCallback(() => {
    // 카카오 로컬 API 연동 (실제 구현 시)
    // 임시: 더미 위치 설정
    if (searchText.length > 0) {
      setLocation({
        latitude: 37.4979,
        longitude: 127.0276,
        address: searchText,
        buildingName: searchText,
      });
    }
  }, [searchText, setLocation]);

  const handleNext = useCallback(() => {
    if (!hasLocation) return;
    setStep(2);
    router.push('/(onboarding)/preference');
  }, [hasLocation, setStep, router]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.flex} keyboardShouldPersistTaps="handled">
          {/* 뒤로 */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>{'‹ 뒤로'}</Text>
          </TouchableOpacity>

          {/* 프로그레스 바 */}
          <View style={styles.progressContainer}>
            <View style={styles.progressRow}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.progressSegment,
                    i <= 2 && styles.progressSegmentActive,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.stepLabel}>Step 1/3</Text>
          </View>

          {/* 타이틀 */}
          <View style={styles.titleArea}>
            <Text style={styles.title}>회사가 어디인가요?</Text>
            <Text style={styles.description}>
              추천할 때 이 위치 기준으로{'\n'}가까운 식당을 찾아드려요.
            </Text>
          </View>

          {/* 검색 인풋 */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>{'🔍'}</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="건물명 또는 주소 검색"
                placeholderTextColor={Colors.text.placeholder}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>
          </View>

          {/* 지도 영역 */}
          <View style={styles.mapArea}>
            <Text style={styles.mapIcon}>{'📍'}</Text>
            <Text style={styles.mapText}>카카오맵 지도 영역</Text>
          </View>

          {/* 주소 표시 */}
          {hasLocation && location && (
            <View style={styles.addressCard}>
              <Text style={styles.addressIcon}>{'📍'}</Text>
              <View style={styles.addressInfo}>
                <Text style={styles.addressText}>{location.address}</Text>
                {location.buildingName && (
                  <Text style={styles.buildingName}>{location.buildingName}</Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* 다음 버튼 */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.nextButton, !hasLocation && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!hasLocation}
            activeOpacity={0.7}
          >
            <Text style={styles.nextButtonText}>다음</Text>
          </TouchableOpacity>
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
  backButton: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  backText: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  // 프로그레스
  progressContainer: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
  },
  progressRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.bg.tertiary,
  },
  progressSegmentActive: {
    backgroundColor: Colors.primary,
  },
  stepLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  // 타이틀
  titleArea: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  description: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  // 검색
  searchContainer: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.tertiary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  searchIcon: {
    fontSize: 20,
  },
  searchInput: {
    flex: 1,
    ...Typography.body2,
    fontSize: 15,
    color: Colors.text.primary,
    padding: 0,
  },
  // 지도
  mapArea: {
    marginHorizontal: Spacing.base,
    height: 200,
    backgroundColor: Colors.bg.tertiary,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  mapIcon: {
    fontSize: 32,
  },
  mapText: {
    ...Typography.body2,
    color: Colors.text.placeholder,
  },
  // 주소 카드
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    padding: Spacing.md,
    backgroundColor: Colors.bg.secondary,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  addressIcon: {
    fontSize: 20,
    color: Colors.primary,
  },
  addressInfo: {
    flex: 1,
  },
  addressText: {
    ...Typography.body2,
    color: Colors.text.primary,
  },
  buildingName: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  // 하단
  bottom: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
    paddingTop: Spacing.md,
  },
  nextButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: Colors.primaryDisabled,
  },
  nextButtonText: {
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});
