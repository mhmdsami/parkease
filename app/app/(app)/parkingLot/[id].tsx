import { getParkingLotLayout } from "@/api/parkingLot";
import { reserveParkingSpace } from "@/api/parkingSpace";
import { getCurrentReservationApi } from "@/api/user";
import BackButton from "@/components/back-button";
import ProfileButton from "@/components/profile-button";
import TextButton from "@/components/text-button";
import Loader from "@/components/ui/loader";
import { COLORS } from "@/constants/colors";
import { QUERY_KEYS } from "@/constants/keys";
import useToken from "@/hooks/use-token";
import { rowCode, showInfo } from "@/utils";
import { ParkingSpace } from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { CircleCheck, CircleX } from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function Location() {
  const token = useToken();
  const { id } = useLocalSearchParams();

  const {
    data,
    isLoading: isParkingLotLayoutLoading,
    isRefetching,
  } = useQuery({
    queryKey: [QUERY_KEYS.PARKING_LOT, id],
    queryFn: () => (typeof id === "string" ? getParkingLotLayout(id) : null),
    refetchInterval: 1000 * 30,
  });

  const { data: currentReservation, isLoading: isCurrentReservationLoading } =
    useQuery({
      queryKey: [QUERY_KEYS.CURRENT_RESERVATION],
      queryFn: async () => {
        const currentReservation = await getCurrentReservationApi(token);
        return currentReservation ? currentReservation : null;
      },
    });

  const isLoading = isParkingLotLayoutLoading || isCurrentReservationLoading;

  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);

  const { mutate: reserveSpace, isPending } = useMutation({
    mutationKey: [QUERY_KEYS.RESERVE_SPACE],
    mutationFn: async () => {
      if (!selectedSpace) return null;
      return reserveParkingSpace(token, selectedSpace.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PARKING_LOT, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HISTORY] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CURRENT_RESERVATION],
      });
      setSelectedSpace(null);
      router.push("/(app)/reservation");
    },
    onError: (error) => {
      showInfo(error.message);
    },
  });

  const queryClient = useQueryClient();

  const getLayout = (spaces: Array<ParkingSpace>) => {
    if (spaces.length === 0) return [];

    const rows = Math.max(...spaces.map((item) => item.row), 0);
    const columns = Math.max(...spaces.map((item) => item.column), 0);

    const grid = new Array(rows)
      .fill(null)
      .map(() => new Array(columns).fill(null));

    spaces.forEach((item) => {
      grid[item.row - 1][item.column - 1] = item;
    });

    return grid as Array<Array<ParkingSpace | null> | null>;
  };

  const layout = data ? getLayout(data.spaces) : [];
  const numberOfAvailableSpaces =
    data?.spaces.filter((space) => space.isAvailable).length || 0;

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
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <BackButton />
          <Text
            style={{
              fontFamily: "MonaSans-Bold",
              fontSize: 24,
            }}
          >
            {data?.parkingLot.name}
          </Text>
        </View>
        <ProfileButton />
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
        }}
      >
        {numberOfAvailableSpaces ? (
          <>
            <CircleCheck color={COLORS.locker.available} />
            <Text
              style={{
                fontFamily: "MonaSans-Medium",
                fontSize: 20,
                color: COLORS.primary,
              }}
            >
              {numberOfAvailableSpaces}{" "}
              {numberOfAvailableSpaces > 1 ? "spaces" : "space"} available
            </Text>
          </>
        ) : (
          <>
            <CircleX color={COLORS.danger} />
            <Text
              style={{
                fontFamily: "MonaSans-Medium",
                fontSize: 20,
                color: COLORS.primary,
              }}
            >
              No space available
            </Text>
          </>
        )}
      </View>
      <ScrollView
        style={{
          height: "60%",
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() =>
              queryClient.refetchQueries({
                queryKey: [QUERY_KEYS.PARKING_LOT, id],
              })
            }
          />
        }
      >
        <View
          style={{
            display: "flex",
            gap: 10,
            width: "100%",
          }}
        >
          {layout.map((row, idx) => (
            <View
              key={idx}
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 10,
                width: "100%",
              }}
            >
              {row?.map((space, idx) =>
                space ? (
                  <Pressable
                    key={idx}
                    style={{
                      display: "flex",
                      flexGrow: 1,
                      minWidth: 16,
                      height: 72,
                      backgroundColor: space.isAvailable
                        ? COLORS.locker.available
                        : COLORS.locker.unavailable,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor:
                        space === selectedSpace
                          ? COLORS.primary
                          : "transparent",
                    }}
                    onPress={() => setSelectedSpace(space)}
                  />
                ) : (
                  <View
                    key={idx}
                    style={{
                      display: "flex",
                      height: 24,
                      backgroundColor: "#F2F2F2",
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: "transparent",
                    }}
                  />
                )
              )}
            </View>
          ))}
        </View>
        <View
          style={{
            display: "flex",
            gap: 10,
            marginTop: 20,
          }}
        >
          {selectedSpace && (
            <Text
              style={{
                fontFamily: "MonaSans-Bold",
                fontSize: 20,
                color: COLORS.primary,
              }}
            >
              {rowCode(selectedSpace.row)}
              {selectedSpace.column}
            </Text>
          )}
        </View>
      </ScrollView>
      {currentReservation && (
        <Text>
          You have an active reservation. Please end it before reserving a new
          space.
        </Text>
      )}
      {selectedSpace && (
        <TextButton
          disabled={
            !selectedSpace.isAvailable || isPending || !!currentReservation
          }
          onPress={() => reserveSpace()}
        >
          {selectedSpace.isAvailable ? "Reserve Space" : "Locker Unavailable"}
        </TextButton>
      )}
      <TextButton onPress={() => router.push("/(app)")}>
        View Other Locations
      </TextButton>
    </View>
  );
}
