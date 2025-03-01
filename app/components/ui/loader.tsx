import { COLORS } from "@/constants/colors";
import { Loader2 } from "lucide-react-native";
import { useEffect } from "react";
import { View, Animated, Easing } from "react-native";

export default function Loader() {
  const rotate = new Animated.Value(0);

  useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    );

    rotateAnimation.start();
  }, [rotate]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.View
        style={{
          transform: [
            {
              rotate: rotateInterpolate,
            },
          ],
        }}
      >
        <Loader2 size={32} color={COLORS.primary} />
      </Animated.View>
    </View>
  );
}
