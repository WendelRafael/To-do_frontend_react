// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Layout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="index" /> {/* Home */}
        <Stack.Screen name="taskForm" /> {/* Criar/Editar tarefa */}
      </Stack>
    </>
  );
}
