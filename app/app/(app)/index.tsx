import { ScrollView, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";
import { MapPin } from "lucide-react-native";
import Button from "@/components/ui/button";
import ProfileButton from "@/components/profile-button";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/keys";
import { getAllParkingLots } from "@/api/parkingLot";
import TextButton from "@/components/text-button";
import Loader from "@/components/ui/loader";
import { router } from "expo-router";

export default function Index() {
  const { data: locations, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PARKING_LOTS],
    queryFn: getAllParkingLots,
    refetchInterval: 1000 * 60 * 10,
  });

  if (isLoading) {
    return <Loader />;
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
          height: "80%",
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
                  marginBottom: 10,
                  backgroundColor: COLORS.text,
                }}
                textStyle={{
                  color: COLORS.primary,
                }}
                onPress={() => router.push(`/(app)/parkingLot/${id}`)}
              >
                View Parking
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
        onPress={() =>
          router.push(`/(app)/parkingLot/87f9263b-7b48-4e5f-8637-d700d40b87a4`)
        }
      >
        <MapPin color={COLORS.text} />
        <Text
          style={{
            color: COLORS.text,
            fontFamily: "MonaSans-Bold",
            fontSize: 20,
          }}
        >
          Locate Nearest Parking
        </Text>
      </Button>
    </View>
  );
}
