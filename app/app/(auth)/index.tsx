import Button from "@/components/button";
import { COLORS } from "@/constants/colors";
import { Text, View } from "react-native";
import { router } from "expo-router";
import Divider from "@/components/divider";

export default function Auth() {
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
      <View
        style={{
          width: "100%",
          display: "flex",
          maxWidth: 400,
          gap: 20,
        }}
      >
        <Button onPress={() => router.push("/(auth)/sign-in")}>Sign In</Button>
        <Divider />
        <Button
          variant="outline"
          onPress={() => router.push("/(auth)/register")}
        >
          Register
        </Button>
      </View>
    </View>
  );
}
