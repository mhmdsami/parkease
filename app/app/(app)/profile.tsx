import { Pressable, SafeAreaView, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";
import { LogOut, User } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import * as SecureStore from "expo-secure-store";
import { QUERY_KEYS, STORAGE_KEYS } from "@/constants/keys";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/input";
import TextButton from "@/components/text-button";
import { router } from "expo-router";
import BackButton from "@/components/back-button";
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "@/api/user";
import useToken from "@/hooks/use-token";
import { useEffect } from "react";

export default function Profile() {
  const token = useToken();

  const { data } = useQuery({
    queryKey: [QUERY_KEYS.ME],
    queryFn: () => getUserInfo(token),
    enabled: !!token,
  });

  useEffect(() => {
    if (data) {
      setValue("name", data.user.name);
      setValue("email", data.user.email);
      setValue("registrationNumber", data.user.registrationNumber);
    }
  }, [data]);

  const {
    control,
    formState: { errors, isDirty },
    setValue,
  } = useForm({
    defaultValues: data?.user,
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
        registrationNumber: z
          .string()
          .length(15, {
            message: "Registration number must be 15 characters long",
          })
          .includes("RA", {
            message: "Registration number must start with RA",
          }),
      })
    ),
  });

  const {
    control: passwordChangeControl,
    formState: { errors: passwordChangeControlErrors, isValid },
  } = useForm({
    defaultValues: {
      password: "",
      newPassword: "",
    },
    resolver: zodResolver(
      z
        .object({
          password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long" }),
          newPassword: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long" }),
        })
        .refine((data) => data.password !== data.newPassword, {
          message: "New password must be different from the old password",
        })
    ),
  });

  const handleLogout = () => {
    SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
    router.push("/(auth)/sign-in");
  };

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
          <Controller
            control={control}
            name="registrationNumber"
            render={({ field }) => (
              <Input
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Registration Number"
                errorMessage={errors.registrationNumber?.message}
              />
            )}
          />
          <TextButton disabled={!isDirty}>Update</TextButton>
          <View style={{
            display: "flex",
            gap: 10,
            marginTop: 20,
          }}>
            <Controller
              control={passwordChangeControl}
              name="password"
              render={({ field }) => (
                <Input
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Current Password"
                  errorMessage={passwordChangeControlErrors.password?.message}
                />
              )}
            />
            <Controller
              control={passwordChangeControl}
              name="newPassword"
              render={({ field }) => (
                <Input
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="New Password"
                  errorMessage={passwordChangeControlErrors.newPassword?.message}
                />
              )}
            />
            <TextButton disabled={!isValid}>Update Password</TextButton>
          </View>
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
