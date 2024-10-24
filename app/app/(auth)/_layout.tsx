import useToken from "@/hooks/use-token";
import { Redirect, Tabs } from "expo-router";

export default function AuthLayout() {
  const token = useToken();

  if (token) {
    return <Redirect href="/(app)" />;
  }

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
