import { Redirect, Tabs } from "expo-router";
import { View } from "react-native";
import { COLORS } from "@/constants/colors";
import { Home, KeyRound, History } from "lucide-react-native";
import useToken from "@/hooks/use-token";
import { QUERY_KEYS } from "@/constants/keys";
import { getUserInfoApi } from "@/api/user";
import { useQuery } from "@tanstack/react-query";

export default function AppLayout() {
  const token = useToken();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ME],
    queryFn: () => getUserInfoApi(token!),
    enabled: !!token,
  });

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

  const hiddenTabs = ["profile", "locations/[id]"];

  if (!token) {
    return <Redirect href="/(auth)" />;
  }

  if (token && !isLoading && !data?.user.isVerified) {
    return <Redirect href="/verify" />;
  }

  return (
    <View
      style={{
        flex: 1,
        marginTop: 24,
        backgroundColor: "#fff",
      }}
    >
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
        {hiddenTabs.map((name) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              headerShown: false,
              tabBarStyle: {
                display: "none",
              },
              href: null,
            }}
          />
        ))}
      </Tabs>
    </View>
  );
}
