// File: src/api/documentApi.ts
import {  mainAxiosClient,getAxiosClient} from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

// Assuming response types based on the code snippets
interface VerifyResponse {
  detail?: string;
  message?: string;
  pan_status?: string;
  aadhar_status?: string;
  gst_status?: string;
  passport_status?: string;
}

export const documentApi = {
  verifyPan: (data: { pan_number: string; full_name: string }) =>
    mainAxiosClient.post<VerifyResponse>(ENDPOINTS.DOCUMENTS.VERIFY_PAN, data),

  verifyAadhar: (aadhar_number: string, aadhar_image: File) => {
    const formData = new FormData();
    formData.append('verification_id', aadhar_number);
    formData.append('image', aadhar_image);
    return mainAxiosClient.post<VerifyResponse>(ENDPOINTS.DOCUMENTS.VERIFY_AADHAAR, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  verifyGstin: (data: { gst_number: string }) =>
    mainAxiosClient.post<VerifyResponse>(ENDPOINTS.DOCUMENTS.VERIFY_GSTIN, data),

  verifyPassport: (data: { passport_number: string; full_name: string; dob: string }) =>
    mainAxiosClient.post<VerifyResponse>(ENDPOINTS.DOCUMENTS.VERIFY_PASSPORT, data),
};