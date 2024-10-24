import { getLockersApi } from "@/api/location";
import { accquireLockerApi } from "@/api/locker";
import BackButton from "@/components/back-button";
import ProfileButton from "@/components/profile-button";
import TextButton from "@/components/text-button";
import { COLORS } from "@/constants/colors";
import { QUERY_KEYS } from "@/constants/keys";
import useToken from "@/hooks/use-token";
import { rowCode, showInfo } from "@/utils";
import { Locker } from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
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

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: [QUERY_KEYS.LOCATION, id],
    queryFn: () => (typeof id === "string" ? getLockersApi(id) : null),
    refetchInterval: 1000 * 30,
  });

  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);

  const { mutate: accquireLocker, isPending } = useMutation({
    mutationKey: [QUERY_KEYS.ACCQUIRE_LOCKER, selectedLocker?.id],
    mutationFn: async () => {
      if (!selectedLocker) return null;
      return accquireLockerApi(token, selectedLocker.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LOCATION, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HISTORY] });
      setSelectedLocker(null);
      router.push("/(app)/key");
    },
    onError: (error) => {
      showInfo(error.message);
    },
  });

  const queryClient = useQueryClient();

  const getLayout = (lockers: Array<Locker>) => {
    const rows = Math.max(...lockers.map((item) => item.row), 0);
    const columns = Math.max(...lockers.map((item) => item.column), 0);

    const grid = new Array(rows)
      .fill(null)
      .map(() => new Array(columns).fill(null));

    lockers.forEach((item) => {
      grid[item.row - 1][item.column - 1] = item;
    });

    return grid as Array<Array<Locker | null> | null>;
  };

  const layout = data?.lockers ? getLayout(data.lockers) : [];
  const numberOfAvailableLockers =
    data?.lockers?.filter((locker) => locker?.lockerState === "available")
      .length || 0;

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
            {data?.name}
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
        {numberOfAvailableLockers ? (
          <>
            <CircleCheck color={COLORS.locker.available} />
            <Text
              style={{
                fontFamily: "MonaSans-Medium",
                fontSize: 20,
                color: COLORS.primary,
              }}
            >
              {numberOfAvailableLockers}{" "}
              {numberOfAvailableLockers > 1 ? "lockers" : "locker"} available
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
              No lockers available
            </Text>
          </>
        )}
      </View>
      <ScrollView
        style={{
          height: "65%",
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() =>
              queryClient.refetchQueries({
                queryKey: [QUERY_KEYS.LOCATION, id],
              })
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
          {layout.map((row, idx) => (
            <View
              key={idx}
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 10,
              }}
            >
              {row?.map((locker, idx) =>
                locker ? (
                  <Pressable
                    key={idx}
                    style={{
                      display: "flex",
                      padding: 20,
                      backgroundColor:
                        locker?.lockerState === "available"
                          ? COLORS.locker.available
                          : COLORS.locker.unavailable,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor:
                        locker === selectedLocker
                          ? COLORS.primary
                          : "transparent",
                    }}
                    onPress={() => setSelectedLocker(locker)}
                  />
                ) : (
                  <View
                    key={idx}
                    style={{
                      display: "flex",
                      padding: 20,
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
          <Text
            style={{
              fontFamily: "MonaSans-Medium",
              fontSize: 16,
              color: COLORS.primary,
            }}
          >
            Available until {format(new Date(), "h:mm a")}
          </Text>
          {selectedLocker && (
            <Text
              style={{
                fontFamily: "MonaSans-Bold",
                fontSize: 20,
                color: COLORS.primary,
              }}
            >
              {rowCode(selectedLocker.row)}
              {selectedLocker.column}
            </Text>
          )}
        </View>
      </ScrollView>
      {selectedLocker && (
        <TextButton
          disabled={selectedLocker.lockerState !== "available" || isPending}
          onPress={() => accquireLocker()}
        >
          {selectedLocker.lockerState === "available"
            ? "Reserve Locker"
            : "Locker Unavailable"}
        </TextButton>
      )}
      <TextButton onPress={() => router.push("/(app)")}>
        View Other Locations
      </TextButton>
    </View>
  );
}
