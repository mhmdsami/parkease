import { COLORS } from "@/constants/colors";
import { View, Text } from "react-native";
import TextButton from "./text-button";

interface CardProps {
  children?: React.ReactNode;
  address: string;
  space: string;
  date?: string;
  time?: string;
}

export default function Card({
  children,
  address,
  space,
  date,
  time,
}: CardProps) {
  return (
    <View
      style={{
        display: "flex",
        padding: 24,
        gap: 16,
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
        {address}
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
          {space}
        </Text>
        {date && (
          <Text
            style={{
              fontFamily: "MonaSans-Bold",
              fontSize: 16,
              color: COLORS.text,
            }}
          >
            {date}
          </Text>
        )}
        <Text
          style={{
            fontFamily: "MonaSans-Bold",
            fontSize: 16,
            color: COLORS.text,
          }}
        >
          {time}
        </Text>
      </View>
      {children}
    </View>
  );
}
