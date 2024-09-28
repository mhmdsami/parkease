import Button from "./ui/button";
import { User } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { router } from "expo-router";

export default function ProfileButton() {
  return (
    <Button variant="icon" onPress={() => router.push("/(app)/profile")}>
      <User color={COLORS.primary} />
    </Button>
  );
}
