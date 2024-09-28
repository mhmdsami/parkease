import { STORAGE_KEYS } from "@/constants/keys";
import { Redirect, router } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function useToken() {
  const token = SecureStore.getItem(STORAGE_KEYS.TOKEN);

  if (!token) {
    throw router.push("/(auth)");
  }

  return token;
}
