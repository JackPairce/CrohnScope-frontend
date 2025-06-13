import { ApiUser, authApi, AuthResponse, AuthType, User } from "@/lib/api";
import axios from "axios";

export type AuthMode = "login" | "register";

export async function authenticateUser<T extends AuthType>(
  mode: T,
  userData: User<T>
): Promise<AuthResponse> {
  try {
    if (mode === AuthType.Login) {
      const user = await authApi.login(userData as User<AuthType.Login>);
      return user;
    } else if (mode === AuthType.Register) {
      return await authApi.register(userData as User<AuthType.Register>);
    } else {
      return {
        success: false,
        message: "Invalid authentication mode",
      };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message || `An error occurred during ${mode}`,
      };
    } else {
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  }
}
