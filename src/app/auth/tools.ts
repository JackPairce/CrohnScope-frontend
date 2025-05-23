import type { Response, User } from "@/lib/auth";
import axios from "axios";

export async function authenticateUser(
  Data: User,
  pathname: string
): Promise<Response> {
  try {
    const response = await axios.post<Response>("/api/auth", Data, {
      headers: {
        "Content-Type": "application/json",
        "x-by-path": "sffdsfd" + pathname,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message || "An error occurred during login",
      };
    } else {
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  }
}
