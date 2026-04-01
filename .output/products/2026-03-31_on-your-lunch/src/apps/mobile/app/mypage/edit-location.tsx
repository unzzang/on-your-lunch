import React, { useState } from 'react';
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
import { CaretLeft, MagnifyingGlass, MapPin } from 'phosphor-react-native';
import {
  colors,
  typography,
  spacing,
  radius,
} from '@/constants/tokens';
import { useMe, useUpdateLocation } from '@/services/hooks';

/** 회사 위치 변경 화면 */
export default function EditLocationScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const updateLocation = useUpdateLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(
    me?.location?.address ?? '',
  );
  const [selectedBuilding, setSelectedBuilding] = useState(
    me?.location?.buildingName ?? '',
  );
  const [coords, setCoords] = useState({
    lat: me?.location?.latitude ?? 0,
    lng: me?.location?.longitude ?? 0,
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Kakao address search placeholder
      setSelectedAddress('서울 강남구 역삼로 152');
      setSelectedBuilding('강남파이낸스센터');
      setCoords({ lat: 37.4979, lng: 127.0276 });
    }
  };

  const handleSave = async () => {
    if (!selectedAddress) return;
    await updateLocation.mutateAsync({
      latitude: coords.lat,
      longitude: coords.lng,
      address: selectedAddress,
      buildingName: selectedBuilding || undefined,
    });
    Alert.alert('', '회사 위치가 변경되었어요.');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sub Bar */}
      <View style={styles.subBar}>
        <Pressable style={styles.backArea} onPress={() => router.back()}>
          <CaretLeft size={20} color={colors.text.secondary} />
          <Text style={styles.backText}>뒤로</Text>
        </Pressable>
        <Text style={styles.subBarTitle}>회사 위치 변경</Text>
        <Pressable onPress={handleSave} disabled={!selectedAddress}>
          <Text
            style={[
              styles.saveText,
              !selectedAddress && styles.saveTextDisabled,
            ]}
          >
            저장
          </Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Search Input */}
        <View
          style={[
            styles.searchInput,
            isFocused && styles.searchInputFocused,
          ]}
        >
          <MagnifyingGlass size={20} color={colors.text.placeholder} />
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
          <MapPin size={32} color={colors.text.placeholder} />
        </View>

        {/* Current address */}
        {selectedAddress ? (
          <View style={styles.addressBox}>
            <MapPin size={20} color={colors.primary} weight="fill" />
            <View style={styles.addressInfo}>
              <Text style={styles.addressText}>{selectedAddress}</Text>
              {selectedBuilding ? (
                <Text style={styles.buildingName}>{selectedBuilding}</Text>
              ) : null}
            </View>
          </View>
        ) : null}
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
    padding: spacing.base,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
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
});
