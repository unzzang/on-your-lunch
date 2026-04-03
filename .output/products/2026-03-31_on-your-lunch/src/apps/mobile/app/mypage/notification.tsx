// ─────────────────────────────────────────
// 알림 설정 화면
//
// 점심 추천 알림 ON/OFF 토글 + 알림 시간 선택.
// ─────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/tokens';
import { useMe, useUpdateNotification } from '@/services/hooks';
import { NOTIFICATION_TIMES } from '@on-your-lunch/shared-types';
import type { NotificationTime } from '@on-your-lunch/shared-types';

export default function NotificationScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const updateNotification = useUpdateNotification();

  const [enabled, setEnabled] = useState(me?.notification?.enabled ?? false);
  const [time, setTime] = useState<NotificationTime>(
    (me?.notification?.time as NotificationTime) ?? '11:30',
  );
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (me?.notification) {
      setEnabled(me.notification.enabled);
      setTime(me.notification.time as NotificationTime);
    }
  }, [me]);

  const handleToggle = useCallback(
    (value: boolean) => {
      setEnabled(value);
      updateNotification.mutate({ enabled: value, time });
    },
    [time, updateNotification],
  );

  const handleTimeSelect = useCallback(
    (t: NotificationTime) => {
      setTime(t);
      setShowTimePicker(false);
      updateNotification.mutate({ enabled, time: t });
    },
    [enabled, updateNotification],
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 서브 바 */}
      <View style={styles.subBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backText}>{'‹ 뒤로'}</Text>
        </TouchableOpacity>
        <Text style={styles.subBarTitle}>알림 설정</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {/* 토글 */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>점심 추천 알림</Text>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            trackColor={{
              false: Colors.border.default,
              true: Colors.primary,
            }}
            thumbColor={Colors.bg.primary}
          />
        </View>

        {/* 시간 선택 */}
        {enabled && (
          <>
            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>알림 시간</Text>
              <TouchableOpacity
                style={styles.timeSelect}
                onPress={() => setShowTimePicker(!showTimePicker)}
                activeOpacity={0.7}
              >
                <Text style={styles.timeValue}>{time}</Text>
                <Text style={styles.timeArrow}>{'▼'}</Text>
              </TouchableOpacity>
              <Text style={styles.timeHint}>10:00~13:00, 30분 단위</Text>
            </View>

            {/* 시간 옵션 */}
            {showTimePicker && (
              <View style={[styles.timePicker, Shadow.md]}>
                {NOTIFICATION_TIMES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.timeOption,
                      t === time && styles.timeOptionActive,
                    ]}
                    onPress={() => handleTimeSelect(t)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        t === time && styles.timeOptionTextActive,
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 안내 */}
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>{'💡'}</Text>
              <Text style={styles.infoText}>
                매일 설정한 시간에 오늘의 점심 추천을 알려드려요.
              </Text>
            </View>
          </>
        )}
      </View>
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
  },
  // 토글
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.base,
  },
  toggleLabel: {
    ...Typography.body1,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  // 시간
  timeSection: {
    marginTop: Spacing.sm,
  },
  timeLabel: {
    ...Typography.body2,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  timeSelect: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
  },
  timeValue: {
    ...Typography.body2,
    fontSize: 15,
    color: Colors.text.primary,
  },
  timeArrow: {
    fontSize: 12,
    color: Colors.text.placeholder,
  },
  timeHint: {
    ...Typography.caption,
    color: Colors.text.placeholder,
    marginTop: Spacing.xs,
  },
  // 시간 피커
  timePicker: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.bg.primary,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.default,
    overflow: 'hidden',
  },
  timeOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
  },
  timeOptionActive: {
    backgroundColor: Colors.bg.secondary,
  },
  timeOptionText: {
    ...Typography.body2,
    color: Colors.text.primary,
  },
  timeOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  // 안내
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.bg.secondary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoText: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
    flex: 1,
  },
});
