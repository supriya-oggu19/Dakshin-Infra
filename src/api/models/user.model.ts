
/** --- Request Models --- */
export interface SendOtpRequest {
  phone_no: string;
}

export interface RegisterUserRequest {
  name: string;
  phone_no: string;
  otp: string;
  email: string;
}

export interface LoginRequest {
  phone_no: string;
  otp: string;
}

/** --- Response Models --- */
export interface SendOtpResponse {
  status: "success" | "error";
  message: string;
}

export interface RegisterUserResponse {
  token?: string;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone_no: string;
  };
}

export interface LoginResponse {
  token?: string;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone_no: string;
  };
}
