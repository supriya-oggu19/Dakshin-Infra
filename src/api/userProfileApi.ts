import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import {
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  UserProfileResponse,
} from "./models/userProfile.model";

export const userProfileApi = {
  // Create user profile
  createUserProfile: (formData: FormData) =>
    axiosClient.post<UserProfileResponse>(ENDPOINTS.USER_PROFILE.CREATE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Update user profile
  updateUserProfile: (id: string, formData: FormData) =>
    axiosClient.put<UserProfileResponse>(`${ENDPOINTS.USER_PROFILE.UPDATE}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Get user profile
  getUserProfile: (id: string) =>
    axiosClient.get<UserProfileResponse>(`${ENDPOINTS.USER_PROFILE.GET}/${id}`),
};