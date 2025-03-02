import { Text, View, ScrollView, RefreshControl } from "react-native";
import { COLORS } from "@/constants/colors";
import TextButton from "@/components/text-button";
import Card from "@/components/card";
import { router } from "expo-router";
import ProfileButton from "@/components/profile-button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/keys";
import { getCurrentReservationApi } from "@/api/user";
import useToken from "@/hooks/use-token";
import { rowCode, showInfo } from "@/utils";
import { format } from "date-fns";
import { endParkingSpaceReservation } from "@/api/parkingSpace";
import Loader from "@/components/ui/loader";

export default function Key() {
  const token = useToken();

  const {
    data: currentReservation,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: [QUERY_KEYS.CURRENT_RESERVATION],
    queryFn: async () => {
      const currentReservation = await getCurrentReservationApi(token);
      return currentReservation ? currentReservation : null;
    },
  });

  const queryClient = useQueryClient();

  const { mutate: endReservation, isPending } = useMutation({
    mutationKey: [QUERY_KEYS.END_RESERVATION],
    mutationFn: async (id: string) => {
      return endParkingSpaceReservation(token, id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HISTORY] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PARKING_LOT, data.id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CURRENT_RESERVATION],
      });
      router.push("/(app)/");
    },
    onError: (error) => {
      showInfo(error.message);
    },
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
          Current Reservation
        </Text>
        <ProfileButton />
      </View>
      {currentReservation ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() =>
                queryClient.refetchQueries({
                  queryKey: [QUERY_KEYS.CURRENT_RESERVATION],
                })
              }
            />
          }
        >
          <View
            style={{
              display: "flex",
              gap: 20,
            }}
          >
            <Card
              address={currentReservation.parkingLot.address}
              space={`${rowCode(currentReservation.parkingSpace.row)}${
                currentReservation.parkingSpace.column
              }`}
              time={`${format(currentReservation.startTime, "hh:mm aa")} - Now`}
            >
              <TextButton
                style={{
                  backgroundColor: COLORS.text,
                }}
                textStyle={{
                  color: COLORS.primary,
                }}
                disabled
              >
                Locate
              </TextButton>
            </Card>
            <TextButton
              disabled={isPending}
              onPress={() => endReservation(currentReservation.parkingSpace.id)}
            >
              End Reservation
            </TextButton>
          </View>
        </ScrollView>
      ) : (
        <View
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            alignItems: "center",
            height: "85%",
          }}
        >
          <Text
            style={{
              fontFamily: "MonaSans-Bold",
              fontSize: 16,
              color: COLORS.secondary,
            }}
          >
            You don't have any active reservation.
          </Text>
          <TextButton onPress={() => router.push("/(app)")}>
            Get a Space
          </TextButton>
        </View>
      )}
    </View>
  );
}
