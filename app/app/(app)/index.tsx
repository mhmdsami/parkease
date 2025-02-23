import { ScrollView, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";
import { MapPin } from "lucide-react-native";
import Button from "@/components/ui/button";
import ProfileButton from "@/components/profile-button";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/keys";
import { getAllParkingLots } from "@/api/parkingLot";
import TextButton from "@/components/text-button";
import { router } from "expo-router";

export default function Index() {
  const { data: locations, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PARKING_LOTS],
    queryFn: getAllParkingLots,
    refetchInterval: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "MonaSans-Bold",
            fontSize: 24,
          }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  return (
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
          Parkease
        </Text>
        <ProfileButton />
      </View>
      <ScrollView
        style={{
          height: "85%",
        }}
      >
        <View
          style={{
            display: "flex",
            gap: 20,
          }}
        >
          {locations?.map(({ id, name, location }) => (
            <View
              key={id}
              style={{
                display: "flex",
                padding: 24,
                gap: 20,
                backgroundColor: COLORS.primary,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: "MonaSans-Bold",
                  fontSize: 20,
                  color: COLORS.text,
                }}
              >
                {name}
              </Text>
              <View
                style={{
                  display: "flex",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "MonaSans-Bold",
                    fontSize: 16,
                    color: COLORS.text,
                  }}
                >
                  {location}
                </Text>
              </View>
              <TextButton
                style={{
                  backgroundColor: COLORS.text,
                }}
                textStyle={{
                  color: COLORS.primary,
                }}
              >
                View Parking Lots
              </TextButton>
            </View>
          ))}
        </View>
      </ScrollView>
      <Button
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
        }}
        disabled
      >
        <MapPin color={COLORS.text} />
        <Text
          style={{
            color: COLORS.text,
            fontFamily: "MonaSans-Bold",
            fontSize: 20,
          }}
        >
          Locate Nearest Parking Space
        </Text>
      </Button>
    </View>
  );
}
