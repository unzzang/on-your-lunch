import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CaretLeft, CaretDown, Lightbulb } from 'phosphor-react-native';
import {
  colors,
  typography,
  spacing,
  radius,
} from '@/constants/tokens';
import { useMe, useUpdateNotification } from '@/services/hooks';
import {
  NOTIFICATION_TIMES,
  type NotificationTime,
} from '@on-your-lunch/shared-types';

/** 알림 설정 화면 */
export default function NotificationScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const updateNotification = useUpdateNotification();

  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState<NotificationTime>('11:30');
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (me) {
      setEnabled(me.notification.enabled);
      setTime(me.notification.time);
    }
  }, [me]);

  const handleToggle = (value: boolean) => {
    setEnabled(value);
    updateNotification.mutate({ enabled: value, time });
  };

  const handleTimeChange = (newTime: NotificationTime) => {
    setTime(newTime);
    setShowTimePicker(false);
    updateNotification.mutate({ enabled, time: newTime });
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
        <Text style={styles.subBarTitle}>알림 설정</Text>
        <View style={{ minWidth: 60 }} />
      </View>

      <View style={styles.content}>
        {/* Toggle Row */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>점심 추천 알림</Text>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            trackColor={{
              false: colors.border.default,
              true: colors.primary,
            }}
            thumbColor={colors.bg.primary}
          />
        </View>

        {/* Time Selection */}
        {enabled && (
          <View style={styles.timeSection}>
            <Text style={styles.timeLabel}>알림 시간</Text>
            <Pressable
              style={styles.timeSelect}
              onPress={() => setShowTimePicker(!showTimePicker)}
            >
              <Text style={styles.timeValue}>{time}</Text>
              <CaretDown size={16} color={colors.text.placeholder} />
            </Pressable>
            <Text style={styles.timeHint}>
              10:00~13:00, 30분 단위
            </Text>

            {showTimePicker && (
              <View style={styles.timeDropdown}>
                {NOTIFICATION_TIMES.map((t) => (
                  <Pressable
                    key={t}
                    style={[
                      styles.timeOption,
                      t === time && styles.timeOptionActive,
                    ]}
                    onPress={() => handleTimeChange(t)}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        t === time && styles.timeOptionTextActive,
                      ]}
                    >
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Lightbulb size={18} color={colors.primary} weight="regular" />
          <Text style={styles.infoText}>
            매일 설정한 시간에 오늘의 점심 추천을 알려드려요.
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
  content: {
    padding: spacing.base,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.base,
  },
  toggleLabel: {
    fontSize: typography.body1.size,
    fontWeight: '500',
    color: colors.text.primary,
  },
  timeSection: {
    marginTop: spacing.sm,
  },
  timeLabel: {
    fontSize: typography.body2.size,
    fontWeight: '500',
    color: colors.text.primary,
  },
  timeSelect: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    marginTop: spacing.sm,
  },
  timeValue: {
    fontSize: 15,
    color: colors.text.primary,
  },
  timeHint: {
    fontSize: typography.caption.size,
    color: colors.text.placeholder,
    marginTop: spacing.xs,
  },
  timeDropdown: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  timeOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  timeOptionActive: {
    backgroundColor: colors.bg.secondary,
  },
  timeOptionText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  timeOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text.secondary,
  },
});
