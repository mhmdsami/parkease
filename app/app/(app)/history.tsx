import { Text, View, ScrollView, RefreshControl } from "react-native";
import { format } from "date-fns";
import { COLORS } from "@/constants/colors";
import TextButton from "@/components/text-button";
import Card from "@/components/card";
import ProfileButton from "@/components/profile-button";
import useToken from "@/hooks/use-token";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/keys";
import { getCurrentReservationApi, getUserHistoryApi } from "@/api/user";
import { rowCode, showInfo } from "@/utils";
import Loader from "@/components/ui/loader";
import {
  endParkingSpaceReservation,
  reserveParkingSpace,
} from "@/api/parkingSpace";
import { router } from "expo-router";

export default function History() {
  const token = useToken();
  const queryClient = useQueryClient();

  const {
    data: history,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: [QUERY_KEYS.HISTORY],
    queryFn: () => getUserHistoryApi(token),
  });

  const hasActiveReservation = history?.some(({ endTime }) => !endTime);

  const { mutate: reserveSpace, isPending: isReservingSpace } = useMutation({
    mutationKey: [QUERY_KEYS.RESERVE_SPACE],
    mutationFn: async (id: string) => {
      return reserveParkingSpace(token, id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PARKING_LOT, data.parkingLotId],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HISTORY] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CURRENT_RESERVATION],
      });
      router.push("/(app)/reservation");
    },
    onError: (error) => {
      showInfo(error.message);
    },
  });

  const { mutate: endReservation, isPending: isEndingReservation } =
    useMutation({
      mutationKey: [QUERY_KEYS.END_RESERVATION],
      mutationFn: async (id: string) => {
        return endParkingSpaceReservation(token, id);
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HISTORY] });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.CURRENT_RESERVATION],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.PARKING_LOT, data.id],
        });
      },
      onError: (error) => {
        showInfo(error.message);
      },
    });

  const isPending = isReservingSpace || isEndingReservation;

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
          Parking History
        </Text>
        <ProfileButton />
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() =>
              queryClient.refetchQueries({ queryKey: [QUERY_KEYS.HISTORY] })
            }
          />
        }
      >
        <View
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          {history &&
            history.map(
              ({ id, parkingLot, parkingSpace, startTime, endTime }) => (
                <Card
                  key={id}
                  address={parkingLot.address}
                  space={`${rowCode(parkingSpace.row)}${parkingSpace.column}`}
                  date={format(startTime, "do MMMM yyyy")}
                  time={`${format(startTime, "hh:mm aaa")} - ${
                    endTime ? format(endTime, "hh:mm aaa") : "Now"
                  }`}
                >
                  {!endTime ? (
                    <TextButton
                      style={{
                        backgroundColor: COLORS.text,
                      }}
                      textStyle={{
                        color: COLORS.primary,
                      }}
                      disabled={isPending}
                      onPress={() => endReservation(parkingSpace.id)}
                    >
                      End Reservation
                    </TextButton>
                  ) : (
                    <TextButton
                      style={{
                        backgroundColor: COLORS.text,
                      }}
                      textStyle={{
                        color: COLORS.primary,
                      }}
                      disabled={
                        !parkingSpace.isAvailable ||
                        isPending ||
                        hasActiveReservation
                      }
                      onPress={() => reserveSpace(parkingSpace.id)}
                    >
                      Regain Access
                    </TextButton>
                  )}
                </Card>
              )
            )}
        </View>
      </ScrollView>
    </View>
  );
}
