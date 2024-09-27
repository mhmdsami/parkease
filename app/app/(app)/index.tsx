import { SafeAreaView, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";
import { MapPin, User } from "lucide-react-native";
import Button from "@/components/button";

export default function Index() {
  return (
    <SafeAreaView>
      <View
        style={{
          display: "flex",
          padding: 24,
          gap: 20,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "MonaSans-Bold",
              fontSize: 24,
            }}
          >
            Lockout
          </Text>
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderColor: COLORS.primary,
              borderWidth: 2,
              borderRadius: 10,
              height: 36,
              width: 36,
            }}
          >
            <User color={COLORS.primary} />
          </View>
        </View>
        <Button
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
        >
          <MapPin color={COLORS.text} />
          <Text
            style={{
              color: COLORS.text,
              fontFamily: "MonaSans-Bold",
              fontSize: 20,
            }}
          >
            Locate Nearest Locker
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
