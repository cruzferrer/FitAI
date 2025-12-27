import { Stack } from 'expo-router';

export default function WorkoutLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "",
        }}
      />
      <Stack.Screen
        name="exercise-metrics"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}