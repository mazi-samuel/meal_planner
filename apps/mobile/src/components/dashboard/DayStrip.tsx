import { Pressable, ScrollView, Text } from 'react-native';
import { dayOfMonth, weekdayShort, type DayPlan } from '@mealplanner/core';

interface DayStripProps {
  days: DayPlan[];
  selectedDate: string;
  today: string;
  onSelect: (date: string) => void;
}

export function DayStrip({ days, selectedDate, today, onSelect }: DayStripProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-5"
      className="-mx-5"
    >
      {days.map((day) => {
        const selected = day.date === selectedDate;
        const isToday = day.date === today;
        return (
          <Pressable
            key={day.date}
            onPress={() => onSelect(day.date)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${isToday ? 'Today, ' : ''}${weekdayShort(day.date)} ${dayOfMonth(day.date)}`}
            className={`h-[68px] w-[56px] items-center justify-center rounded-2xl ${
              selected ? 'bg-brand-700' : 'border border-line bg-card active:bg-brand-50'
            }`}
          >
            <Text className={`text-xs font-medium ${selected ? 'text-brand-100' : 'text-muted'}`}>
              {isToday ? 'Today' : weekdayShort(day.date)}
            </Text>
            <Text className={`mt-0.5 text-xl font-bold ${selected ? 'text-white' : 'text-ink'}`}>
              {dayOfMonth(day.date)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
