import { Text, View, ScrollView, RefreshControl } from "react-native";
import { format } from "date-fns";
import { COLORS } from "@/constants/colors";
import TextButton from "@/components/text-button";
import Card from "@/components/card";
import ProfileButton from "@/components/profile-button";
import useToken from "@/hooks/use-token";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/keys";
import { getUserHistoryApi } from "@/api/user";
import { rowCode, showInfo } from "@/utils";
import { accquireLockerApi } from "@/api/locker";
import { router } from "expo-router";

export default function History() {
  const token = useToken();

  const {
    data: history,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: [QUERY_KEYS.HISTORY],
    queryFn: () => getUserHistoryApi(token),
  });

  const queryClient = useQueryClient();

  const { mutate: accquireLocker, isPending } = useMutation({
    mutationKey: [QUERY_KEYS.ACCQUIRE_LOCKER],
    mutationFn: async (id: string) => accquireLockerApi(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LOCATION] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HISTORY] });
      router.push("/(app)/key");
    },
    onError: (error) => {
      showInfo(error.message);
    },
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
          Locker History
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
          {history ? (
            history.map(
              ({
                id,
                location,
                startTime,
                endTime,
                lockerItem,
                lockerState,
              }) => (
                <Card
                  key={id}
                  location={location}
                  locker={`${rowCode(lockerItem.row)}${lockerItem.column}`}
                  date={format(startTime, "do MMMM yyyy")}
                  time={`${format(startTime, "hh:mm:ss")} - ${
                    endTime ? format(endTime, "hh:mm:ss") : "Now"
                  }`}
                >
                  <TextButton
                    style={{
                      backgroundColor: COLORS.text,
                    }}
                    textStyle={{
                      color: COLORS.primary,
                    }}
                    disabled={lockerState !== "available" || isPending}
                    onPress={() => accquireLocker(lockerItem.id)}
                  >
                    Regain Access
                  </TextButton>
                </Card>
              )
            )
          ) : (
            <Text>Get started by accru</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
