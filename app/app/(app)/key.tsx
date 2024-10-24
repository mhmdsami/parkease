import { Text, View, ScrollView, RefreshControl } from "react-native";
import { COLORS } from "@/constants/colors";
import TextButton from "@/components/text-button";
import Card from "@/components/card";
import { router } from "expo-router";
import ProfileButton from "@/components/profile-button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/keys";
import { getKeyApi } from "@/api/user";
import useToken from "@/hooks/use-token";
import { rowCode } from "@/utils";
import { format } from "date-fns";
import { releaseLockerApi } from "@/api/locker";

export default function Key() {
  const token = useToken();

  const {
    data: key,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: [QUERY_KEYS.KEY],
    queryFn: () => getKeyApi(token),
  });

  const queryClient = useQueryClient();

  const { mutate: releaseLocker, isPending } = useMutation({
    mutationKey: [QUERY_KEYS.RELEASE_LOCKER],
    mutationFn: async () => releaseLockerApi(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HISTORY] });
      router.push("/(app)");
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
          Key
        </Text>
        <ProfileButton />
      </View>
      {key ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() =>
                queryClient.refetchQueries({ queryKey: [QUERY_KEYS.KEY] })
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
              location={key.location}
              locker={`${rowCode(key.row)}${key.column}`}
              time={`${format(key.startTime, "hh:mm:ss")} - Now`}
            >
              <TextButton
                disabled={isPending}
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
                <TextButton disabled={isPending}>Open</TextButton>
                <TextButton disabled>Grant Access</TextButton>
              </View>
              <TextButton
                variant="outline"
                disabled={isPending}
                onPress={() => releaseLocker()}
              >
                Release
              </TextButton>
            </View>
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
  );
}
