import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  CaretLeft,
  MagnifyingGlass,
  MapPin,
} from 'phosphor-react-native';
import {
  colors,
  typography,
  spacing,
  radius,
} from '@/constants/tokens';
import { useOnboardingStore } from '@/stores/onboardingStore';

/** 온보딩 Step 1: 회사 위치 설정 */
export default function LocationScreen() {
  const router = useRouter();
  const { location, setLocation } = useOnboardingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const hasLocation = !!location.address;

  const handleNext = () => {
    if (hasLocation) {
      router.push('/(onboarding)/preference');
    }
  };

  const handleSearch = () => {
    // Kakao address search -- placeholder
    if (searchQuery.trim()) {
      setLocation({
        latitude: 37.4979,
        longitude: 127.0276,
        address: '서울 강남구 역삼로 152',
        buildingName: '강남파이낸스센터',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <CaretLeft size={20} color={colors.text.secondary} />
          <Text style={styles.backText}>뒤로</Text>
        </Pressable>

        {/* Progress Bar */}
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

        {/* Step Label */}
        <Text style={styles.stepLabel}>Step 1/3</Text>

        {/* Title */}
        <Text style={styles.title}>회사가 어디인가요?</Text>
        <Text style={styles.subtitle}>
          추천할 때 이 위치 기준으로{'\n'}가까운 식당을 찾아드려요.
        </Text>

        {/* Search Input */}
        <View
          style={[
            styles.searchInput,
            isFocused && styles.searchInputFocused,
          ]}
        >
          <MagnifyingGlass
            size={20}
            color={colors.text.placeholder}
          />
          <TextInput
            style={styles.searchText}
            placeholder="건물명 또는 주소 검색"
            placeholderTextColor={colors.text.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* Map placeholder */}
        <View style={styles.mapArea}>
          <MapPin size={32} color={colors.text.placeholder} weight="regular" />
        </View>

        {/* Address display */}
        {hasLocation && (
          <View style={styles.addressBox}>
            <MapPin size={20} color={colors.primary} weight="fill" />
            <View style={styles.addressInfo}>
              <Text style={styles.addressText}>{location.address}</Text>
              {location.buildingName && (
                <Text style={styles.buildingName}>
                  {location.buildingName}
                </Text>
              )}
            </View>
          </View>
        )}
      </View>

      {/* CTA */}
      <View style={styles.bottom}>
        <Pressable
          style={[
            styles.ctaButton,
            !hasLocation && styles.ctaButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!hasLocation}
        >
          <Text style={styles.ctaButtonText}>다음</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.base,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  backText: {
    fontSize: typography.body2.size,
    color: colors.text.secondary,
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.bg.tertiary,
  },
  progressSegmentActive: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    fontSize: typography.caption.size,
    color: colors.text.secondary,
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.h2.size,
    fontWeight: '700',
    lineHeight: typography.h2.lineHeight,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.body2.size,
    lineHeight: typography.body2.lineHeight,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchInputFocused: {
    borderColor: colors.primary,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    padding: 0,
  },
  mapArea: {
    height: 200,
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.lg,
    marginTop: spacing.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressBox: {
    flexDirection: 'row',
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.base,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  addressInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: typography.body2.size,
    color: colors.text.primary,
  },
  buildingName: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  bottom: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  ctaButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  ctaButtonText: {
    fontSize: typography.body1.size,
    fontWeight: '700',
    color: colors.text.inverse,
  },
});
