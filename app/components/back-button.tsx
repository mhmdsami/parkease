import { View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { router } from "expo-router";
import Button from "./ui/button";

interface BackButtonProps extends React.ComponentProps<typeof View> {}

export default function BackButton({ style, ...props }: BackButtonProps) {
  return (
    <Button variant="icon" onPress={() => router.back()}>
      <ChevronLeft color={COLORS.primary} />
    </Button>
  );
}
