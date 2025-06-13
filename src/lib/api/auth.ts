import { authCookies } from "../utils/cookies";
import apiClient from "./client";
import { components, operations, paths } from "./types";

export enum AuthType {
  Login = "login",
  Register = "register",
}

// Generic User type with conditional email requirement based on AuthType
export type User<T extends AuthType = AuthType.Login> = {
  username: string;
  password: string;
  email: T extends AuthType.Register ? string : undefined;
};

export type ApiUser = components["schemas"]["ApiUser"];
export type AuthResponse = components["schemas"]["UserResponse"];
/**
 * Authentication API module
 */
export const authApi = {
  /**
   * Check if the user is authenticated
   * @returns Promise with the user data
   */
  checkAuth: async (
    withCredentials: paths["/auth/check"]["get"]["parameters"]["query"]["with_user"] = false
  ): Promise<
    | paths["/auth/check"]["get"]["responses"]["200"]["content"]["application/json"]
    | null
  > => {
    // Only run on client side
    if (typeof window === "undefined") {
      console.warn("checkAuth called on server side");
      return null;
    }

    try {
      const response = await apiClient.get<
        operations["check_auth_check_get"]["responses"]["200"]["content"]["application/json"]
      >("/auth/check", { params: { with_user: withCredentials } });
      return response.data;
    } catch (error) {
      console.error("Authentication check failed:", error);
      return null;
    }
  },

  /**
   * Login a user
   * @param credentials - User's login credentials (username and password)
   * @returns Promise with the user data
   */
  login: async (credentials: User<AuthType.Login>) => {
    const { username, password } = credentials;
    const response = await apiClient.post<AuthResponse>("/auth/login", {
      username,
      password,
    } as components["schemas"]["UserLoginRequest"]);

    // Check if response includes token and save it
    const data = response.data;
    if (
      data &&
      typeof data === "object" &&
      "token" in data &&
      typeof data.token === "string"
    ) {
      authCookies.setToken(data.token);
    }

    return response.data;
  },

  /**
   * Register a new user
   * @param credentials - New user's registration data (username, email, and password)
   * @returns Promise with the user data
   */
  register: async (credentials: User<AuthType.Register>) => {
    const { username, email, password } = credentials;
    // TypeScript ensures email is defined here because we used AuthType.Register
    const response = await apiClient.post<AuthResponse>("/auth/register", {
      username,
      email,
      password,
    } as components["schemas"]["UserCreateRequest"]);

    // Check if response includes token and save it
    const data = response.data;
    if (
      data &&
      typeof data === "object" &&
      "token" in data &&
      typeof data.token === "string"
    ) {
      authCookies.setToken(data.token);
    }

    return response.data;
  },

  /**
   * Logout the current user
   */
  logout: (): void => {
    // Clear auth token from cookies using the cookie utility
    authCookies.clearToken();
  },
};

export default authApi;
