import { Text, View } from "react-native";
import { COLORS } from "@/constants/colors";
import TextButton from "@/components/text-button";
import Card from "@/components/card";
import { router } from "expo-router";
import ProfileButton from "@/components/profile-button";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/keys";
import { getKeyApi } from "@/api/user";
import useToken from "@/hooks/use-token";
import { rowCode } from "@/utils";
import { format } from "date-fns";

export default function Key() {
  const token = useToken();

  const { data: key, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.KEY],
    queryFn: () => getKeyApi(token),
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
        <>
          <Card
            location={key.location}
            locker={`${rowCode(key.row)}${key.column}`}
            time={`${format(key.startTime, "hh:mm:ss")} - Now`}
          >
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
              <TextButton disabled>Grant Access</TextButton>
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
