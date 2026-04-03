// ─────────────────────────────────────────
// 먹은 이력 화면 (캘린더)
//
// 월간 캘린더(카테고리 dot) + 선택 날짜 기록 리스트.
// 4가지 상태: 정상 / 로딩 / 빈 / 에러.
// ─────────────────────────────────────────

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/tokens';
import { useEatingHistoryCalendar } from '@/services/hooks';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import SkeletonCard from '@/components/SkeletonCard';
import type { CalendarDay, CalendarDayRecord } from '@on-your-lunch/shared-types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isToday(year: number, month: number, day: number) {
  const now = new Date();
  return (
    now.getFullYear() === year &&
    now.getMonth() + 1 === month &&
    now.getDate() === day
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(
    formatDate(now.getFullYear(), now.getMonth() + 1, now.getDate()),
  );

  const { data: calendarData, isLoading, isError, refetch } = useEatingHistoryCalendar(year, month);

  // 날짜별 기록 매핑
  const recordsByDate = useMemo(() => {
    const map: Record<string, CalendarDayRecord[]> = {};
    calendarData?.days?.forEach((day: CalendarDay) => {
      map[day.date] = day.records;
    });
    return map;
  }, [calendarData]);

  const selectedRecords = recordsByDate[selectedDate] ?? [];

  const handlePrevMonth = useCallback(() => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  }, [year, month]);

  const handleNextMonth = useCallback(() => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  }, [year, month]);

  const handleDateSelect = useCallback(
    (day: number) => {
      setSelectedDate(formatDate(year, month, day));
    },
    [year, month],
  );

  const handleRecordPress = useCallback(
    (restaurantId: string) => {
      router.push(`/restaurant/${restaurantId}`);
    },
    [router],
  );

  // 캘린더 렌더
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);
    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = Array(firstDay).fill(null);

    for (let d = 1; d <= daysInMonth; d++) {
      currentWeek.push(d);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    return (
      <View style={styles.calendarGrid}>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.calendarRow}>
            {week.map((day, di) => {
              if (day === null) {
                return <View key={di} style={styles.dayCell} />;
              }

              const dateStr = formatDate(year, month, day);
              const dayRecords = recordsByDate[dateStr] ?? [];
              const isTodayDate = isToday(year, month, day);
              const isSelected = dateStr === selectedDate;
              const isSunday = di === 0;

              return (
                <TouchableOpacity
                  key={di}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                  ]}
                  onPress={() => handleDateSelect(day)}
                  activeOpacity={0.7}
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
                        isSunday && styles.dayTextSunday,
                        isTodayDate && styles.dayTextToday,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                  {/* 카테고리 dot */}
                  {dayRecords.length > 0 && (
                    <View style={styles.dotContainer}>
                      {dayRecords.slice(0, 3).map((rec, i) => (
                        <View
                          key={i}
                          style={[
                            styles.dot,
                            { backgroundColor: rec.category.colorCode },
                          ]}
                        />
                      ))}
                      {dayRecords.length > 3 && (
                        <Text style={styles.dotMore}>+{dayRecords.length - 3}</Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  // 선택 날짜 라벨
  const selectedDay = parseInt(selectedDate.split('-')[2], 10);
  const selectedDateLabel = isToday(year, month, selectedDay)
    ? `${month}월 ${selectedDay}일 (오늘)`
    : `${month}월 ${selectedDay}일`;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.appBar}>
          <Text style={styles.appBarTitle}>먹은 이력</Text>
        </View>
        <View style={styles.skeletonCalendar} />
        <View style={{ paddingHorizontal: Spacing.base, paddingTop: Spacing.base }}>
          <SkeletonCard hasImage={false} />
          <SkeletonCard hasImage={false} />
        </View>
      </SafeAreaView>
    );
  }

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
      {/* App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>먹은 이력</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/record/new')}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+ 기록</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        {/* 캘린더 네비게이션 */}
        <View style={styles.calendarNav}>
          <TouchableOpacity
            style={styles.navArrow}
            onPress={handlePrevMonth}
            activeOpacity={0.7}
          >
            <Text style={styles.navArrowText}>{'◀'}</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>
            {year}년 {month}월
          </Text>
          <TouchableOpacity
            style={styles.navArrow}
            onPress={handleNextMonth}
            activeOpacity={0.7}
          >
            <Text style={styles.navArrowText}>{'▶'}</Text>
          </TouchableOpacity>
        </View>

        {/* 요일 헤더 */}
        <View style={styles.weekdayHeader}>
          {WEEKDAYS.map((wd, i) => (
            <Text
              key={wd}
              style={[styles.weekdayText, i === 0 && styles.weekdaySunday]}
            >
              {wd}
            </Text>
          ))}
        </View>

        {/* 캘린더 */}
        {renderCalendar()}

        {/* 구분선 */}
        <View style={styles.sectionDivider} />

        {/* 기록 헤더 */}
        <View style={styles.recordsHeader}>
          <Text style={styles.recordsHeaderText}>{selectedDateLabel}</Text>
        </View>

        {/* 기록 리스트 */}
        {selectedRecords.length === 0 ? (
          <EmptyState
            icon="📅"
            title="아직 기록이 없어요"
            description="점심 먹은 후 기록해보세요!"
            actionLabel="기록하러 가기"
            onAction={() => router.push('/record/new')}
          />
        ) : (
          selectedRecords.map((rec) => (
            <TouchableOpacity
              key={rec.id}
              style={styles.recordCard}
              onPress={() => handleRecordPress(rec.restaurant.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.recordIcon,
                  { backgroundColor: rec.category.colorCode + '20' },
                ]}
              >
                <Text style={styles.recordIconText}>{'🍽'}</Text>
              </View>
              <View style={styles.recordContent}>
                <Text style={styles.recordName}>{rec.restaurant.name}</Text>
                <Text style={styles.recordMeta}>
                  {rec.category.name} ·{' '}
                  <Text style={styles.star}>{'★'.repeat(rec.rating)}</Text>
                  {'☆'.repeat(5 - rec.rating)} {rec.rating.toFixed(1)}
                </Text>
                {rec.memo && (
                  <Text style={styles.recordMemo} numberOfLines={1}>
                    "{rec.memo}"
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: Spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  appBar: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  appBarTitle: {
    ...Typography.h2,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  addButtonText: {
    ...Typography.overline,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  scroll: {
    flex: 1,
  },
  skeletonCalendar: {
    height: 280,
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.bg.tertiary,
    borderRadius: Radius.lg,
  },
  // 캘린더 네비
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.base,
    gap: Spacing.lg,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrowText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  navTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    minWidth: 140,
    textAlign: 'center',
  },
  // 요일 헤더
  weekdayHeader: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    ...Typography.caption,
    fontWeight: '500',
    color: Colors.text.placeholder,
  },
  weekdaySunday: {
    color: Colors.primary,
  },
  // 캘린더 그리드
  calendarGrid: {
    paddingHorizontal: Spacing.base,
  },
  calendarRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  dayCell: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    borderRadius: Radius.md,
  },
  dayCellSelected: {
    backgroundColor: Colors.bg.secondary,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dayNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberToday: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    ...Typography.body2,
    color: Colors.text.primary,
  },
  dayTextSunday: {
    color: Colors.primary,
  },
  dayTextToday: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  dotContainer: {
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
    fontSize: 8,
    color: Colors.text.placeholder,
  },
  // 구분선
  sectionDivider: {
    height: 8,
    backgroundColor: Colors.bg.secondary,
    marginTop: Spacing.sm,
  },
  // 기록
  recordsHeader: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  recordsHeaderText: {
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  recordCard: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
    gap: Spacing.md,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordIconText: {
    fontSize: 24,
  },
  recordContent: {
    flex: 1,
  },
  recordName: {
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  recordMeta: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  star: {
    color: Colors.rating,
  },
  recordMemo: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
});
