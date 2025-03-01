import { Platform, ToastAndroid } from "react-native";

export const rowCode = (row: number) => String.fromCharCode(64 + row);

export function showInfo(message: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    alert(message);
  }
}
