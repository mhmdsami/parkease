import { COLORS } from "@/constants/colors";
import { Pressable, StyleProp, Text, ViewStyle } from "react-native";

interface ButtonProps extends React.ComponentProps<typeof Pressable> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "outline";
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
          backgroundColor:
            variant === "outline" ? COLORS.text : COLORS.secondary,
          paddingHorizontal: 15,
          paddingVertical: 15,
          borderRadius: 12,
          borderWidth: variant === "outline" ? 4 : 0,
          borderColor: COLORS.highlight,
          width: "100%",
          opacity: disabled ? 0.5 : 1,
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
