import { SafeAreaView, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";
import { User } from "lucide-react-native";
import TextButton from "@/components/text-button";
import Card from "@/components/card";

export default function Key() {
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
            Keys
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
        <Card location="UB Central Library" locker="B05" time="11:50 - Now (2hrs 20 min)">
          <TextButton
            style={{
              backgroundColor: COLORS.text,
            }}
            textStyle={{
              color: COLORS.primary,
            }}
          >
            Locate
          </TextButton>
        </Card>
        <View
          style={{
            display: "flex",
            gap: 28,
          }}
        >
          <View
            style={{
              display: "flex",
              gap: 16,
            }}
          >
            <TextButton>Open</TextButton>
            <TextButton>Grant Access</TextButton>
          </View>
          <TextButton variant="outline">Release</TextButton>
        </View>
      </View>
    </SafeAreaView>
  );
}
