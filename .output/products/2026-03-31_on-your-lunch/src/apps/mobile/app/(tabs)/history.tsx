import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  CaretLeft,
  CaretRight,
  Plus,
  ForkKnife,
  CalendarBlank,
  Star,
} from 'phosphor-react-native';
import {
  colors,
  typography,
  spacing,
  radius,
} from '@/constants/tokens';
import { useEatingHistoryCalendar } from '@/services/hooks';
import type {
  CalendarDay,
  CalendarDayRecord,
} from '@on-your-lunch/shared-types';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** 먹은 이력 화면 -- 월간 캘린더 + 기록 리스트 */
export default function HistoryScreen() {
  const router = useRouter();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const {
    data: calendarData,
    isLoading,
    isError,
    refetch,
  } = useEatingHistoryCalendar(year, month);

  const dayMap = useMemo(() => {
    const map = new Map<string, CalendarDay>();
    calendarData?.days?.forEach((d) => {
      map.set(d.date, d);
    });
    return map;
  }, [calendarData]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const isToday = (day: number) =>
    year === today.getFullYear() &&
    month === today.getMonth() + 1 &&
    day === today.getDate();

  const selectedDateStr = formatDate(year, month, selectedDay);
  const selectedDayData = dayMap.get(selectedDateStr);
  const selectedRecords = selectedDayData?.records ?? [];

  const goToPrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDay(1);
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDay(1);
  };

  const renderCalendarDays = () => {
    const cells: React.ReactNode[] = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(year, month, day);
      const dayData = dayMap.get(dateStr);
      const records = dayData?.records ?? [];
      const isSunday = (firstDay + day - 1) % 7 === 0;
      const isSelected = day === selectedDay;
      const isTodayDate = isToday(day);

      cells.push(
        <Pressable
          key={day}
          style={[styles.dayCell, isSelected && styles.dayCellSelected]}
          onPress={() => setSelectedDay(day)}
        >
          <View
            style={[
              styles.dayNumber,
              isTodayDate && styles.dayNumberToday,
            ]}
          >
            <Text
              style={[
                styles.dayText,
                isSunday && styles.daySunday,
                isTodayDate && styles.dayTextToday,
              ]}
            >
              {day}
            </Text>
          </View>

          {/* Category dots */}
          <View style={styles.dotsContainer}>
            {records.slice(0, 3).map((record, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  { backgroundColor: record.category.colorCode || colors.primary },
                ]}
              />
            ))}
            {records.length > 3 && (
              <Text style={styles.dotMore}>+{records.length - 3}</Text>
            )}
          </View>
        </Pressable>,
      );
    }

    return cells;
  };

  const renderSelectedDateLabel = () => {
    const isSelectedToday = isToday(selectedDay);
    return `${month}월 ${selectedDay}일${isSelectedToday ? ' (오늘)' : ''}`;
  };

  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.appBar}>
          <Text style={styles.appBarTitle}>먹은 이력</Text>
        </View>
        <ErrorState onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* App Bar */}
        <View style={styles.appBar}>
          <Text style={styles.appBarTitle}>먹은 이력</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push('/record/new')}
          >
            <Plus size={16} color={colors.text.inverse} weight="bold" />
            <Text style={styles.addButtonText}>기록</Text>
          </Pressable>
        </View>

        {/* Calendar Navigation */}
        <View style={styles.calendarNav}>
          <Pressable style={styles.navArrow} onPress={goToPrevMonth}>
            <CaretLeft size={20} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.monthLabel}>
            {year}년 {month}월
          </Text>
          <Pressable style={styles.navArrow} onPress={goToNextMonth}>
            <CaretRight size={20} color={colors.text.primary} />
          </Pressable>
        </View>

        {/* Weekday labels */}
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((w, i) => (
            <Text
              key={w}
              style={[
                styles.weekdayText,
                i === 0 && { color: colors.primary },
              ]}
            >
              {w}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        {isLoading ? (
          <View style={styles.calendarSkeleton} />
        ) : (
          <View style={styles.calendarGrid}>{renderCalendarDays()}</View>
        )}

        {/* Section Divider */}
        <View style={styles.sectionDivider} />

        {/* Records */}
        <View style={styles.recordsHeader}>
          <Text style={styles.recordsHeaderText}>
            {renderSelectedDateLabel()}
          </Text>
        </View>

        {selectedRecords.length === 0 ? (
          <EmptyState
            icon={
              <CalendarBlank
                size={48}
                color={colors.text.placeholder}
                weight="light"
              />
            }
            title="아직 기록이 없어요"
            subtitle="점심 먹은 후 기록해보세요!"
            actionLabel="기록하러 가기"
            onAction={() => router.push('/record/new')}
          />
        ) : (
          selectedRecords.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onPress={() =>
                router.push(`/restaurant/${record.restaurant.id}`)
              }
            />
          ))
        )}

        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function RecordCard({
  record,
  onPress,
}: {
  record: CalendarDayRecord;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.recordCard} onPress={onPress}>
      <View style={styles.recordIcon}>
        <ForkKnife size={24} color={colors.primary} weight="regular" />
      </View>
      <View style={styles.recordContent}>
        <Text style={styles.recordName} numberOfLines={1}>
          {record.restaurant.name}
        </Text>
        <View style={styles.recordMetaRow}>
          <Text style={styles.recordMeta}>
            {record.category.name} \u00B7{' '}
          </Text>
          <Star size={12} color={colors.rating} weight="fill" />
          <Text style={styles.recordMeta}>
            {' '}
            {record.rating.toFixed(1)}
          </Text>
        </View>
        {record.memo && (
          <Text style={styles.recordMemo} numberOfLines={1}>
            &ldquo;{record.memo}&rdquo;
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
  appBarTitle: {
    fontSize: typography.h2.size,
    fontWeight: '700',
    color: colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: 14,
    gap: 4,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthLabel: {
    fontSize: typography.h3.size,
    fontWeight: typography.h3.weight,
    color: colors.text.primary,
    minWidth: 140,
    textAlign: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.caption.size,
    fontWeight: '500',
    color: colors.text.placeholder,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarSkeleton: {
    height: 280,
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.lg,
    marginHorizontal: spacing.base,
  },
  dayCell: {
    width: `${100 / 7}%`,
    minHeight: 48,
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 2,
    borderRadius: radius.md,
  },
  dayCellSelected: {
    backgroundColor: colors.bg.secondary,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberToday: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: typography.body2.size,
    color: colors.text.primary,
  },
  daySunday: {
    color: colors.primary,
  },
  dayTextToday: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 3,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotMore: {
    fontSize: 9,
    color: colors.text.placeholder,
  },
  sectionDivider: {
    height: 8,
    backgroundColor: colors.bg.secondary,
    marginTop: spacing.sm,
  },
  recordsHeader: {
    padding: spacing.base,
  },
  recordsHeaderText: {
    fontSize: typography.body1.size,
    fontWeight: '600',
    color: colors.text.primary,
  },
  recordCard: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    gap: spacing.md,
  },
  recordIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordContent: {
    flex: 1,
    justifyContent: 'center',
  },
  recordName: {
    fontSize: typography.body1.size,
    fontWeight: '600',
    color: colors.text.primary,
  },
  recordMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  recordMeta: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  recordMemo: {
    fontSize: 13,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
