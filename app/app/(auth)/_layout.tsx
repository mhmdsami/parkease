import { Tabs } from "expo-router";

export default function AuthLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          display: "none",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="sign-in"
        options={{
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
