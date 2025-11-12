import {mainAxiosClient,getAxiosClient} from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import {
  APIUserProfileResponse,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  UserProfileResponse,
} from "./models/userProfile.model";

export const userProfileApi = {
  // Create user profile
  createUserProfile: (formData: FormData) =>
    mainAxiosClient.post<UserProfileResponse>(ENDPOINTS.USER_PROFILE.CREATE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Update user profile
  updateUserProfile: (id: string, formData: FormData) =>
    mainAxiosClient.put<UserProfileResponse>(`${ENDPOINTS.USER_PROFILE.UPDATE}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Get user profile
  getUserProfile: (id: string) =>
    getAxiosClient.get<UserProfileResponse>(`${ENDPOINTS.USER_PROFILE.GET}/${id}`),

  // List user profiles - FIXED: API returns array directly
  listUserProfiles: (): Promise<APIUserProfileResponse[]> =>
    getAxiosClient.get(ENDPOINTS.USER_PROFILE.LIST).then(response => response.data),
};