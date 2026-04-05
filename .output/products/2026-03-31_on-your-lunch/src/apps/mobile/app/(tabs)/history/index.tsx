import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typo, spacing, radius } from '../../../constants/tokens';
import ErrorState from '../../../components/ErrorState';
import EmptyState from '../../../components/EmptyState';
import { useEatingHistoryCalendar } from '../../../services/hooks';
import { useAuthStore } from '../../../stores/authStore';
import type { CalendarDay } from '@on-your-lunch/shared-types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export default function HistoryTab() {
  const insets = useSafeAreaInsets();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number>(now.getDate());

  const { isAuthenticated, setTokens, setUser } = useAuthStore();
  const { data: calendarData, isLoading, isError, refetch } = useEatingHistoryCalendar(year, month);

  // CalendarDay[] -> Record<number, CalendarDay> (날짜 기준 lookup)
  const dayMap = useMemo(() => {
    const map: Record<number, CalendarDay> = {};
    if (calendarData?.days) {
      for (const day of calendarData.days) {
        const dateNum = parseInt(day.date.split('-')[2], 10);
        map[dateNum] = day;
      }
    }
    return map;
  }, [calendarData]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedDayData = selectedDay ? dayMap[selectedDay] : undefined;
  const selectedRecords = selectedDayData?.records ?? [];

  const isToday =
    year === now.getFullYear() &&
    month === now.getMonth() + 1 &&
    selectedDay === now.getDate();

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDay(1);
  };

  const handleRetry = async () => {
    if (!isAuthenticated && __DEV__) {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/auth/dev-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const json = await response.json();
          const result = json.data;
          setTokens(result.accessToken, result.refreshToken);
          if (result.user) {
            setUser(result.user.id, result.user.nickname ?? null, result.user.isOnboardingCompleted ?? false);
          }
        }
      } catch (e) {
        // dev-login 실패 시 그냥 refetch
      }
    }
    refetch();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>먹은 이력</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-outline" size={20} color={colors.primary} />
          <Text style={styles.addText}>기록</Text>
        </TouchableOpacity>
      </View>

      {/* 로딩 상태 */}
      {isLoading && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>이력을 불러오는 중...</Text>
        </View>
      )}

      {/* 에러 상태 */}
      {isError && (
        <ErrorState
          message="이력을 불러올 수 없어요"
          onRetry={handleRetry}
        />
      )}

      {/* 정상 상태 */}
      {!isLoading && !isError && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={handlePrevMonth}>
              <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{year}년 {month}월</Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <Ionicons name="chevron-forward" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Weekday Headers */}
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((day, i) => (
              <Text key={day} style={[styles.weekdayText, i === 0 && { color: colors.destructive }]}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {cells.map((day, index) => {
              const hasRecord = day !== null && !!dayMap[day];
              const isDayToday =
                day === now.getDate() &&
                year === now.getFullYear() &&
                month === now.getMonth() + 1;
              const isSelected = day === selectedDay;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.calendarCell}
                  onPress={() => day !== null && setSelectedDay(day)}
                >
                  {day !== null ? (
                    <>
                      <Text
                        style={[
                          styles.dayText,
                          isDayToday && styles.dayTextToday,
                          isSelected && styles.dayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                      {hasRecord && (
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: dayMap[day].records[0]?.category?.colorCode || colors.primary },
                          ]}
                        />
                      )}
                    </>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Day Records */}
          <View style={styles.recordSection}>
            <Text style={styles.recordDate}>
              {month}월 {selectedDay}일{isToday ? ' (오늘)' : ''}
            </Text>
            {selectedRecords.length > 0 ? (
              selectedRecords.map((record) => (
                <View key={record.id} style={styles.recordCard}>
                  <Text style={styles.recordName}>{record.restaurant.name}</Text>
                  <Text style={styles.recordMeta}>
                    {record.category.name} · {'★'.repeat(record.rating)}{'☆'.repeat(5 - record.rating)} {record.rating}.0
                  </Text>
                  {record.memo ? (
                    <Text style={styles.recordMemo}>"{record.memo}"</Text>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.noRecord}>기록이 없어요</Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },

  // State
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
    gap: spacing.md,
  },
  stateText: {
    ...typo.body2,
    color: colors.text.secondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    height: 56,
  },
  headerTitle: {
    ...typo.h2,
    color: colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addText: {
    ...typo.body2,
    fontWeight: '500',
    color: colors.primary,
  },

  // Month Nav
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xl,
  },
  monthTitle: {
    ...typo.body1,
    fontWeight: '600',
    color: colors.text.primary,
  },

  // Weekday
  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    ...typo.caption,
    fontWeight: '500',
    color: colors.text.secondary,
  },

  // Calendar
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
  },
  calendarCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  dayText: {
    ...typo.body2,
    color: colors.text.primary,
  },
  dayTextToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  dayTextSelected: {
    fontWeight: '700',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },

  // Records
  recordSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    marginTop: spacing.md,
  },
  recordDate: {
    ...typo.body1,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  recordCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  recordName: {
    ...typo.body1,
    fontWeight: '600',
    color: colors.text.primary,
  },
  recordMeta: {
    ...typo.body2,
    color: colors.text.secondary,
    marginTop: 4,
  },
  recordMemo: {
    ...typo.body2,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  noRecord: {
    ...typo.body2,
    color: colors.text.placeholder,
    textAlign: 'center',
    paddingVertical: spacing['3xl'],
  },
});
