import { COLORS } from "@/constants/colors";
import { View, Text } from "react-native";
import TextButton from "./text-button";

interface CardProps {
  children?: React.ReactNode;
  location: string;
  locker: string;
  date?: string;
  time?: string;
}

export default function Card({ children, location, locker, date, time }: CardProps) {
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
        {location}
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
          {locker}
        </Text>
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
