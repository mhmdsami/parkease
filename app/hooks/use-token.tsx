import { STORAGE_KEYS } from "@/constants/keys";
import * as SecureStore from "expo-secure-store";

export default function useToken() {
  const token = SecureStore.getItem(STORAGE_KEYS.TOKEN);

  if (!token) {
    return "";
  }

  return token;
}
