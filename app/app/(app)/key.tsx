import { SafeAreaView, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";
import TextButton from "@/components/text-button";
import Card from "@/components/card";
import { router } from "expo-router";
import ProfileButton from "@/components/profile-button";

export default function Key() {
  const key = {
    location: "UB Central Library",
    locker: "T115",
    time: "11:50 - Now",
  };

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
            Key
          </Text>
          <ProfileButton />
        </View>
        {key ? (
          <>
            <Card location={key.location} locker={key.locker} time={key.time}>
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
          </>
        ) : (
          <View
            style={{
              display: "flex",
              gap: 20,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "MonaSans-Bold",
                fontSize: 24,
                color: COLORS.secondary,
              }}
            >
              You don't have any active keys.
            </Text>
            <TextButton onPress={() => router.push("/(app)")}>
              Get a locker
            </TextButton>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
