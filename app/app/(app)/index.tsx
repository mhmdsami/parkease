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
import { locateNearestParkingLot } from "@/utils/haversine-distance";
import * as Location from "expo-location";
import { showInfo } from "@/utils";
import { useEffect, useState } from "react";

export default function Index() {
  const [location, setLocation] = useState<Location.LocationObject>();
  const { data: locations, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PARKING_LOTS],
    queryFn: getAllParkingLots,
    refetchInterval: 1000 * 60 * 10,
  });

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showInfo("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  const nearestParkingLot =
    locations &&
    locateNearestParkingLot(
      { x: location?.coords.longitude ?? 0, y: location?.coords.latitude ?? 0 },
      locations
    );

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
          {locations?.map(({ id, name, address }) => (
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
                  {address}
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
      {nearestParkingLot && (
        <Button
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
          onPress={() =>
            router.push(`/(app)/parkingLot/${nearestParkingLot.id}`)
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
      )}
    </View>
  );
}
