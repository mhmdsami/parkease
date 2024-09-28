import { SafeAreaView, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";
import { MapPin } from "lucide-react-native";
import Button from "@/components/ui/button";
import ProfileButton from "@/components/profile-button";

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
          <ProfileButton />
        </View>
        <View
          style={{
            display: "flex",
            gap: 10,
            flexGrow: 1,
            height: "80%",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.tertiary,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              fontFamily: "MonaSans-Medium",
              fontSize: 16,
            }}
          >
            Map
          </Text>
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
