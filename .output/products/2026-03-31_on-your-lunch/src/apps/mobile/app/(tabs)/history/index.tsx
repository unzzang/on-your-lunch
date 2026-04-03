import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typo, spacing, radius } from '../../../constants/tokens';
import ErrorState from '../../../components/ErrorState';
import EmptyState from '../../../components/EmptyState';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const YEAR = 2026;
const MONTH = 4;

// 하드코딩된 더미 데이터 (API 연동 시 useEatingHistoryCalendar 훅으로 교체)
const MOCK_RECORDS: Record<number, { name: string; category: string; rating: number; memo: string; categoryColor: string }[]> = {
  1: [{ name: '을지로 골목식당', category: '한식', rating: 4, memo: '된장찌개 맛있었어요', categoryColor: '#FF8C00' }],
  2: [{ name: '파스타공방', category: '양식', rating: 5, memo: '', categoryColor: '#00AA00' }],
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

// 시뮬레이션용 상태 (실제 API 연동 시 useQuery로 대체)
type LoadState = 'loading' | 'error' | 'empty' | 'success';

export default function HistoryTab() {
  const insets = useSafeAreaInsets();
  const daysInMonth = getDaysInMonth(YEAR, MONTH);
  const firstDay = getFirstDayOfMonth(YEAR, MONTH);
  const today = 2;

  // 현재는 하드코딩 데이터 사용. API 연동 시 useEatingHistoryCalendar 훅으로 교체.
  const loadState: LoadState = 'success';
  const records = MOCK_RECORDS;

  const handleRetry = () => {
    // API 연동 시 refetch() 호출
  };

  // 캘린더 셀 구성
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedDayRecords = records[today] || [];

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
      {loadState === 'loading' && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>이력을 불러오는 중...</Text>
        </View>
      )}

      {/* 에러 상태 */}
      {loadState === 'error' && (
        <ErrorState
          message="이력을 불러올 수 없어요"
          onRetry={handleRetry}
        />
      )}

      {/* 빈 상태 */}
      {loadState === 'empty' && (
        <EmptyState
          icon="calendar-outline"
          title="아직 기록이 없어요"
          subtitle="식당에서 '먹었어요'를 눌러 기록을 시작해보세요"
        />
      )}

      {/* 정상 상태 */}
      {loadState === 'success' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity>
              <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{YEAR}년 {MONTH}월</Text>
            <TouchableOpacity>
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
              const hasRecord = day !== null && records[day];
              const isToday = day === today;
              return (
                <TouchableOpacity key={index} style={styles.calendarCell}>
                  {day !== null ? (
                    <>
                      <Text style={[styles.dayText, isToday && styles.dayTextToday]}>
                        {day}
                      </Text>
                      {hasRecord && (
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: records[day][0].categoryColor },
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
              {MONTH}월 {today}일 (오늘)
            </Text>
            {selectedDayRecords.length > 0 ? (
              selectedDayRecords.map((record, i) => (
                <View key={i} style={styles.recordCard}>
                  <Text style={styles.recordName}>{record.name}</Text>
                  <Text style={styles.recordMeta}>
                    {record.category} · {'★'.repeat(record.rating)}{'☆'.repeat(5 - record.rating)} {record.rating}.0
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
