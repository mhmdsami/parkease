import TextButton from "@/components/text-button";
import { Text, View } from "react-native";
import Input from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/keys";
import { getUserInfoApi, resendOtpApi, verifyOtpApi } from "@/api/user";
import { Redirect, router } from "expo-router";
import { showInfo } from "@/utils";
import useToken from "@/hooks/use-token";
import { useState } from "react";
import { COLORS } from "@/constants/colors";

export default function Verify() {
  const token = useToken();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ME],
    queryFn: () => getUserInfoApi(token!),
    enabled: !!token,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      otp: "",
    },
    resolver: zodResolver(
      z.object({
        otp: z.string().length(6, { message: "OTP must be 6 characters long" }),
      })
    ),
  });

  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useMutation({
    mutationKey: [QUERY_KEYS.VERIFY_OTP],
    mutationFn: (otp: string) => verifyOtpApi(token, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ME] });
      router.push("/(app)");
    },
    onError: (error) => {
      showInfo(error.message);
    },
  });

  const { mutate: resendOtp, isPending: isResendingOtp } = useMutation({
    mutationKey: [QUERY_KEYS.RESEND_OTP],
    mutationFn: () => resendOtpApi(token),
    onSuccess: () => {
      setMessage("OTP sent successfully");
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    },
    onError: (error) => {
      showInfo(error.message);
    },
  });

  if (token && !isLoading && data?.user.isVerified) {
    return <Redirect href="/(app)" />;
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: "MonaSans-Bold",
          fontSize: 24,
          marginVertical: 40,
        }}
      >
        Verify your email to continue
      </Text>
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
          name="otp"
          render={({ field }) => (
            <Input
              value={field.value}
              onChangeText={field.onChange}
              placeholder="OTP"
              inputMode="numeric"
              keyboardType="number-pad"
              errorMessage={errors.otp?.message}
            />
          )}
        />
        {message && (
          <Text
            style={{
              color: COLORS.locker.available,
              fontFamily: "MonaSans-Bold",
            }}
          >
            {message}
          </Text>
        )}
        <TextButton
          disabled={isVerifyingOtp || isResendingOtp}
          onPress={handleSubmit((values) => verifyOtp(values.otp))}
        >
          Verify
        </TextButton>
        <TextButton
          disabled={isVerifyingOtp || isResendingOtp}
          variant="outline"
          onPress={() => resendOtp()}
        >
          Resend
        </TextButton>
      </View>
    </View>
  );
}
