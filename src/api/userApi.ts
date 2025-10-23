import axiosClient from "./axiosClient";
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
    axiosClient.post<SendOtpResponse>(ENDPOINTS.USER.SEND_OTP, data),

  register: (data: RegisterUserRequest) =>
    axiosClient.post<RegisterUserResponse>(ENDPOINTS.USER.REGISTER, data),

  login: (data: LoginRequest) =>
    axiosClient.post<LoginResponse>(ENDPOINTS.USER.LOGIN, data),

  update: (data: { name?: string; email?: string }) =>
    axiosClient.put(ENDPOINTS.USER.UPDATE, data),
};