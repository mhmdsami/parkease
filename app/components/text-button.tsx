import { COLORS } from "@/constants/colors";
import { Pressable, StyleProp, Text, TextStyle } from "react-native";
import Button from "./button";

interface TextButtonProps extends React.ComponentProps<typeof Button> {
  children: string;
  textStyle?: StyleProp<TextStyle>;
}

export default function TextButton({
  children,
  variant = "primary",
  textStyle,
  ...props
}: TextButtonProps) {
  return (
    <Button {...props} variant={variant}>
      <Text
        style={[
          {
            color: variant === "outline" ? COLORS.secondary : COLORS.text,
            fontFamily: "MonaSans-Bold",
            textAlign: "center",
            fontSize: 20,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </Button>
  );
}
