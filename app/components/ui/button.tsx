import { COLORS } from "@/constants/colors";
import { Pressable, StyleProp, Text, ViewStyle } from "react-native";

interface ButtonProps extends React.ComponentProps<typeof Pressable> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "outline" | "icon";
}

export default function Button({
  style,
  children,
  variant = "primary",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      style={[
        {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.secondary,
          paddingHorizontal: 15,
          paddingVertical: 15,
          borderRadius: 12,
          width: "100%",
          opacity: disabled ? 0.5 : 1,
        },
        variant === "outline" && {
          backgroundColor: COLORS.text,
          borderColor: COLORS.primary,
          borderWidth: 4,
        },
        variant === "icon" && {
          borderColor: COLORS.primary,
          backgroundColor: "transparent",
          borderWidth: 2,
          height: 36,
          width: 36,
        },
        style,
      ]}
      disabled={disabled}
      {...props}
    >
      {children}
    </Pressable>
  );
}
