interface LoginCredentials {
  email: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

class AuthService {
  private apiUrl = `${process.env.NEXT_PUBLIC_CMS_SERVER}/auth/login`;
  
  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Authentication failed");
      }
      
      const data = await response.json();
      localStorage.setItem("auth_session", JSON.stringify(data));
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }
  
  async verifyOtp(otpCode: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_SERVER}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: otpCode }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "OTP verification failed");
      }
      
      const data = await response.json();
      const session = JSON.parse(localStorage.getItem("auth_session") || "{}");
      localStorage.setItem("auth_session", JSON.stringify({
        ...session,
        verified: true,
        ...data
      }));
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error("OTP verification error:", error);
      throw error;
    }
  }
  
  async resendOtp(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_SERVER}/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to resend OTP");
      }
      
      const data = await response.json();
      return {
        success: true,
        message: "OTP code resent successfully",
        data
      };
    } catch (error) {
      console.error("Resend OTP error:", error);
      throw error;
    }
  }
  
  logout(): void {
    localStorage.removeItem("auth_session");
  }
  
  isAuthenticated(): boolean {
    const session = localStorage.getItem("auth_session");
    return !!session;
  }
}

export const authService = new AuthService();