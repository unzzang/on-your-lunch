// ─────────────────────────────────────────
// 회사 위치 변경 화면
//
// 온보딩 Step 1과 동일한 UI (주소 검색 + 지도 + 저장).
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
import { useMe, useUpdateLocation } from '@/services/hooks';

export default function EditLocationScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const updateLocation = useUpdateLocation();

  const [searchText, setSearchText] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(
    me?.location?.address ?? '',
  );
  const [selectedBuilding, setSelectedBuilding] = useState(
    me?.location?.buildingName ?? '',
  );

  const hasChanged = selectedAddress !== (me?.location?.address ?? '');

  const handleSearch = useCallback(() => {
    if (searchText.length > 0) {
      setSelectedAddress(searchText);
      setSelectedBuilding(searchText);
    }
  }, [searchText]);

  const handleSave = useCallback(() => {
    if (!selectedAddress) return;
    updateLocation.mutate(
      {
        latitude: me?.location?.latitude ?? 37.4979,
        longitude: me?.location?.longitude ?? 127.0276,
        address: selectedAddress,
        buildingName: selectedBuilding || undefined,
      },
      { onSuccess: () => router.back() },
    );
  }, [selectedAddress, selectedBuilding, me, updateLocation, router]);

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
          <Text style={styles.subBarTitle}>회사 위치 변경</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.flex} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text style={styles.description}>
              변경할 회사 위치를 검색해주세요.
            </Text>

            {/* 검색 */}
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

            {/* 지도 영역 */}
            <View style={styles.mapArea}>
              <Text style={styles.mapIcon}>{'📍'}</Text>
              <Text style={styles.mapText}>카카오맵 지도 영역</Text>
            </View>

            {/* 현재 주소 */}
            {selectedAddress ? (
              <View style={styles.addressCard}>
                <Text style={styles.addressIcon}>{'📍'}</Text>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressText}>{selectedAddress}</Text>
                  {selectedBuilding && (
                    <Text style={styles.buildingName}>{selectedBuilding}</Text>
                  )}
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* 저장 버튼 */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !hasChanged && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasChanged || updateLocation.isPending}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>
              {updateLocation.isPending ? '저장 중...' : '저장'}
            </Text>
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
  description: {
    ...Typography.body2,
    color: Colors.text.secondary,
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
    marginBottom: Spacing.base,
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
  mapArea: {
    height: 200,
    backgroundColor: Colors.bg.tertiary,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  mapIcon: {
    fontSize: 32,
  },
  mapText: {
    ...Typography.body2,
    color: Colors.text.placeholder,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  bottom: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
    paddingTop: Spacing.md,
  },
  saveButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: Colors.primaryDisabled,
  },
  saveButtonText: {
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
});
