import { Pressable, SafeAreaView, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";
import { LogOut, MapPin, User } from "lucide-react-native";
import Button from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "@/constants/keys";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/input";
import TextButton from "@/components/text-button";
import { router } from "expo-router";
import BackButton from "@/components/back-button";

export default function Profile() {
  const {
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "Sami",
      email:
        (JSON.parse(SecureStore.getItem(STORAGE_KEYS.TOKEN) || "{}")
          ?.email as string) || "",
    },
    resolver: zodResolver(
      z.object({
        name: z.string({ message: "Name must be a string" }).min(3, {
          message: "Name must be at least 3 characters long",
        }),
        email: z
          .string()
          .email({ message: "Enter a valid email" })
          .includes("srmist.edu.in", {
            message: "Email must be an SRMIST email",
          }),
      })
    ),
  });

  const handleLogout = () => {
    SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
    router.push("/(auth)/sign-in");
  }

  return (
    <SafeAreaView>
      <View
        style={{
          display: "flex",
          padding: 24,
          gap: 20,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <BackButton />
            <Text
              style={{
                fontFamily: "MonaSans-Bold",
                fontSize: 24,
              }}
            >
              Profile
            </Text>
          </View>
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderColor: COLORS.primary,
              borderWidth: 2,
              borderRadius: 10,
              height: 36,
              width: 36,
            }}
          >
            <User color={COLORS.primary} />
          </View>
        </View>
        <View
          style={{
            display: "flex",
            gap: 10,
            flexGrow: 1,
            height: "80%",
          }}
        >
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Name"
                inputMode="email"
                keyboardType="email-address"
                errorMessage={errors.name?.message}
              />
            )}
          />
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
          <TextButton disabled>Update</TextButton>
        </View>
        <Pressable
          onPress={handleLogout}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            borderColor: COLORS.danger,
            borderWidth: 2,
            borderRadius: 10,
            padding: 10,
          }}
        >
          <LogOut color={COLORS.danger} />
          <Text
            style={{
              color: COLORS.danger,
              fontFamily: "MonaSans-Bold",
              fontSize: 20,
            }}
          >
            Logout
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
