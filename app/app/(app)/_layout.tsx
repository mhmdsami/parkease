import { Tabs } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Redirect } from "expo-router";
import { View } from "react-native";
import { COLORS } from "@/constants/colors";
import { STORAGE_KEYS } from "@/constants/keys";
import { Home, KeyRound, History } from "lucide-react-native";

export default function AppLayout() {
  if (!SecureStore.getItem(STORAGE_KEYS.TOKEN)) {
    return <Redirect href="/(auth)" />;
  }

  const tabs = [
    {
      name: "index",
      Icon: Home,
    },
    {
      name: "key",
      Icon: KeyRound,
    },
    {
      name: "history",
      Icon: History,
    },
  ];

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.text,
          borderTopColor: COLORS.tertiary,
          paddingTop: 10,
          paddingBottom: 20,
          height: 70,
        },
      }}
    >
      {tabs.map(({ name, Icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: focused ? COLORS.primary : COLORS.text,
                  borderRadius: 20,
                  paddingHorizontal: 24,
                  paddingVertical: 8,
                }}
              >
                <Icon color={focused ? COLORS.text : COLORS.secondary} />
              </View>
            ),
          }}
        />
      ))}
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
          href: null,
        }}
      />
    </Tabs>
  );
}
