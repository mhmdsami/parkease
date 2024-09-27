import { Pressable, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { router } from "expo-router";

interface BackButtonProps extends React.ComponentProps<typeof View> {}

export default function BackButton({ style, ...props }: BackButtonProps) {
  return (
    <View
      style={[
        {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderColor: COLORS.primary,
          borderWidth: 2,
          borderRadius: 10,
          height: 36,
          width: 36,
        },
        style,
      ]}
    >
      <Pressable onPress={() => router.back()}>
        <ChevronLeft color={COLORS.primary} />
      </Pressable>
    </View>
  );
}
