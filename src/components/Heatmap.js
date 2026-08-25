import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { subDays, format } from 'date-fns';

const Heatmap = ({ habits, theme }) => {
  // Generate last 28 days
  const days = [];
  for (let i = 27; i >= 0; i--) {
    days.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
  }

  // Calculate completions per day
  const completionCounts = {};
  days.forEach(day => {
    completionCounts[day] = 0;
    habits.forEach(habit => {
      if (habit.completedDates && habit.completedDates.includes(day)) {
        completionCounts[day]++;
      }
    });
  });

  // Group into weeks (columns)
  const weeks = [];
  for (let i = 0; i < 4; i++) {
    weeks.push(days.slice(i * 7, (i + 1) * 7));
  }

  const getDayColor = (count) => {
    if (count === 0) return theme.iconBackground;
    if (count === 1) return theme.secondary;
    return theme.primary;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card, shadowColor: theme.secondary }]}>
      <Text style={[styles.title, { color: theme.text }]}>Consistency 💖</Text>
      <View style={styles.grid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.row}>
            {week.map(day => (
              <View 
                key={day} 
                style={[
                  styles.square, 
                  { backgroundColor: getDayColor(completionCounts[day]) }
                ]} 
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  square: {
    width: 25,
    height: 25,
    borderRadius: 6,
  }
});

export default Heatmap;
