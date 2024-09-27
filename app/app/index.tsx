import { Text, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Redirect } from "expo-router";
import { STORAGE_KEYS } from "@/constants/keys";

export default function Index() {
  if (!SecureStore.getItem(STORAGE_KEYS.TOKEN)) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <Text
        style={{
          fontFamily: "MonaSans-Bold",
          fontSize: 44,
          marginBottom: 20,
        }}
      >
        Lockout
      </Text>
    </View>
  );
}
