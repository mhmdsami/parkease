import Button from "@/components/button";
import { Text, View } from "react-native";
import Input from "@/components/input";
import BackButton from "@/components/back-button";

export default function SignIn() {
  return (
    <View
      style={{
        flex: 1,
        padding: 24,
      }}
    >
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          marginVertical: 40,
        }}
      >
        <BackButton />
        <Text
          style={{
            fontFamily: "MonaSans-Bold",
            fontSize: 24,
            marginVertical: 40,
          }}
        >
          Welcome to Lockout,{"\n"}Sign Up to Get Started
        </Text>
      </View>
      <View
        style={{
          display: "flex",
          width: "100%",
          maxWidth: 400,
          gap: 20,
        }}
      >
        <Input placeholder="Enter your registration number" inputMode="text" />
        <Input
          placeholder="Enter your email"
          inputMode="email"
          keyboardType="email-address"
        />
        <Input placeholder="Set a password" inputMode="text" secureTextEntry />
        <Button>Sign Up</Button>
      </View>
    </View>
  );
}
