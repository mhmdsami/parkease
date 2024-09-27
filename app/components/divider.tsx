import { View, Text } from "react-native";
import { COLORS } from "@/constants/colors";

export default function Divider() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        marginHorizontal: 10,
      }}
    >
      <View style={{ height: 3, backgroundColor: COLORS.secondary, flex: 1 }} />
      <Text
        style={{
          color: COLORS.secondary,
          marginHorizontal: 10,
          fontFamily: "MonaSans-Bold",
          fontSize: 24,
        }}
      >
        or
      </Text>
      <View style={{ height: 3, backgroundColor: COLORS.secondary, flex: 1 }} />
    </View>
  );
}
