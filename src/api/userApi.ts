import { mainAxiosClient } from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import {
  SendOtpRequest,
  SendOtpResponse,
  RegisterUserRequest,
  RegisterUserResponse,
  LoginRequest,
  LoginResponse,
} from "./models/user.model";

export const userApi = {
  sendOtp: (data: SendOtpRequest) =>
    mainAxiosClient.post<SendOtpResponse>(ENDPOINTS.USER.SEND_OTP, data),

  register: (data: RegisterUserRequest) =>
    mainAxiosClient.post<RegisterUserResponse>(ENDPOINTS.USER.REGISTER, data),

  login: (data: LoginRequest) =>
    mainAxiosClient.post<LoginResponse>(ENDPOINTS.USER.LOGIN, data),

  update: (data: { name?: string; email?: string }) =>
    mainAxiosClient.put(ENDPOINTS.USER.UPDATE, data),
};