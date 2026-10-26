import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MEAL_SLOTS, type Meal } from '@mealplanner/core';
import { BrainDeadToggle } from '@/components/dashboard/BrainDeadToggle';
import { DayStrip } from '@/components/dashboard/DayStrip';
import { MealCard } from '@/components/dashboard/MealCard';
import { MealSheet } from '@/components/dashboard/MealSheet';
import { WeekGroceriesSheet } from '@/components/dashboard/WeekGroceriesSheet';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useActivePlan } from '@/hooks/useActivePlan';
import { useToday } from '@/hooks/useToday';
import { useAppStore } from '@/store/appStore';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardScreen() {
  const router = useRouter();
  const today = useToday();

  const profile = useAppStore((s) => s.profile);
  const planError = useAppStore((s) => s.planError);
  const ensureFreshPlan = useAppStore((s) => s.ensureFreshPlan);
  const shufflePlan = useAppStore((s) => s.shufflePlan);
  const setBrainDeadMode = useAppStore((s) => s.setBrainDeadMode);
  const { plan, brainDeadMode } = useActivePlan();

  const [selectedDate, setSelectedDate] = useState(today);
  const [openMeal, setOpenMeal] = useState<Meal | null>(null);
  const [groceriesOpen, setGroceriesOpen] = useState(false);

  useEffect(() => {
    ensureFreshPlan(today);
    setSelectedDate(today);
  }, [today, ensureFreshPlan]);

  const day = useMemo(
    () => plan?.days.find((d) => d.date === selectedDate) ?? plan?.days[0] ?? null,
    [plan, selectedDate],
  );

  const swappedCount = day ? MEAL_SLOTS.filter((s) => day.meals[s].swappedForLowEffort).length : 0;
  const totals = day
    ? MEAL_SLOTS.reduce(
        (sum, slot) => ({
          calories: sum.calories + day.meals[slot].meal.macros.calories,
          protein: sum.protein + day.meals[slot].meal.macros.proteinG,
        }),
        { calories: 0, protein: 0 },
      )
    : null;

  if (!profile) return null;

  return (
    <Screen>
      <ScrollView
        contentContainerClassName="gap-5 px-5 pb-12 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-sm text-muted">{greeting()}</Text>
            <Text className="text-2xl font-extrabold text-ink">
              {profile.displayName ? profile.displayName : 'What are we eating?'}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/onboarding')}
            accessibilityRole="button"
            accessibilityLabel="Edit your preferences"
            className="min-h-[44px] justify-center rounded-full border border-line bg-card px-4 active:bg-brand-50"
          >
            <Text className="text-sm font-semibold text-brand-700">Preferences</Text>
          </Pressable>
        </View>

        <BrainDeadToggle
          value={brainDeadMode}
          onChange={setBrainDeadMode}
          swappedCount={swappedCount}
        />

        {plan && day ? (
          <>
            <DayStrip
              days={plan.days}
              selectedDate={day.date}
              today={today}
              onSelect={setSelectedDate}
            />

            <View className="gap-3">
              {MEAL_SLOTS.map((slot) => (
                <MealCard
                  key={slot}
                  planned={day.meals[slot]}
                  onPress={() => setOpenMeal(day.meals[slot].meal)}
                />
              ))}
            </View>

            {totals ? (
              <Text className="text-center text-sm text-muted">
                Day total: ~{totals.calories.toLocaleString('en-NG')} kcal · {totals.protein}g protein
              </Text>
            ) : null}

            {profile.prepStyle === 'sunday-bulk-prep' ? (
              <Button
                label="Shop the week's groceries"
                icon="🛒"
                variant="secondary"
                onPress={() => setGroceriesOpen(true)}
              />
            ) : null}

            <Button
              label="Shuffle my week"
              icon="🔀"
              variant="ghost"
              onPress={() => shufflePlan(today)}
              accessibilityHint="Generates a different set of meals for the week"
            />
          </>
        ) : (
          <View className="gap-3 rounded-3xl border border-line bg-card p-5">
            <Text className="text-lg font-bold text-ink">No plan yet</Text>
            <Text className="text-base text-muted">
              {planError ?? 'Setting up your week…'}
            </Text>
            <Button label="Edit preferences" onPress={() => router.push('/onboarding')} />
          </View>
        )}
      </ScrollView>

      <MealSheet
        meal={openMeal}
        prepStyle={profile.prepStyle}
        householdSize={profile.householdSize}
        onClose={() => setOpenMeal(null)}
      />
      {plan ? (
        <WeekGroceriesSheet
          visible={groceriesOpen}
          plan={plan}
          householdSize={profile.householdSize}
          onClose={() => setGroceriesOpen(false)}
        />
      ) : null}
    </Screen>
  );
}
