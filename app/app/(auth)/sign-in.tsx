import TextButton from "@/components/text-button";
import { Text, View } from "react-native";
import Input from "@/components/ui/input";
import BackButton from "@/components/back-button";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function SignIn() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(
      z.object({
        email: z
          .string()
          .email({ message: "Enter a valid email" })
          .includes("srmist.edu.in", {
            message: "Email must be an SRMIST email",
          }),
        password: z.string(),
      })
    ),
  });

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
          Welcome back to Lockout,{"\n"}Sign In to your account
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
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Email"
              inputMode="email"
              keyboardType="email-address"
              errorMessage={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Password"
              inputMode="text"
              secureTextEntry
              errorMessage={errors.password?.message}
            />
          )}
        />
        <TextButton onPress={handleSubmit((values) => console.log(values))}>
          Sign In
        </TextButton>
      </View>
    </View>
  );
}
