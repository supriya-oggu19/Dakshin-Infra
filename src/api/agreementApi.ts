import { mainAxiosClient } from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import {
  FetchAgreementsRequest,
  FetchAgreementsResponse,
  DownloadDocumentRequest,
  DownloadDocumentResponse,
  ApiAgreement,
  Agreement,
} from "../api/models/agreement.model";

// Map API status to frontend status
export const mapApiStatus = (apiStatus: string): string => {
  switch (apiStatus) {
    case "signed":
      return "Signed";
    case "active":
      return "Active";
    case "draft":
      return "Draft";
    case "pending":
      return "Pending";
    default:
      return "Draft";
  }
};

// Map API agreement type to display name
export const mapAgreementType = (apiType: string): string => {
  switch (apiType) {
    case "mou":
      return "MOU";
    case "agreement_of_sale":
      return "Sale Agreement";
    case "sale_deed":
      return "Sale Deed";
    case "rental_agreement":
      return "Rental Agreement";
    case "installment_agreement":
      return "Installment Agreement";
    default:
      return apiType;
  }
};

// Transform API data to frontend structure
export const transformAgreement = (apiAgreement: ApiAgreement): Agreement => {
  return {
    id: apiAgreement.id,
    projectName: "Ramya Constructions",
    unitNumber: apiAgreement.unit_id,
    agreementType: mapAgreementType(apiAgreement.agreement_type),
    date: apiAgreement.agreement_date,
    status: mapApiStatus(apiAgreement.status),
    fileSize: "1.5 MB",
    lastModified: apiAgreement.uploaded_at,
    description: `${mapAgreementType(
      apiAgreement.agreement_type
    )} for unit ${apiAgreement.unit_id}`,
    signatories: apiAgreement.signatories,
    validUntil: apiAgreement.valid_until,
    documents: {
      mou: {
        available: apiAgreement.agreement_type === "mou",
        fileName: apiAgreement.document_name,
        filePath: apiAgreement.file_path,
      },
      agreementOfSale: {
        available: apiAgreement.agreement_type === "agreement_of_sale",
        fileName: apiAgreement.document_name,
        filePath: apiAgreement.file_path,
      },
      saleDeed: {
        available: apiAgreement.agreement_type === "sale_deed",
        fileName: apiAgreement.document_name,
        filePath: apiAgreement.file_path,
      },
      rentalAgreement: {
        available: apiAgreement.agreement_type === "rental_agreement",
        fileName: apiAgreement.document_name,
        filePath: apiAgreement.file_path,
      },
    },
  };
};

export const agreementApi = {
  // Use the working endpoint directly
  fetchAgreements: (params: FetchAgreementsRequest = { page: 1, limit: 100 }) =>
    mainAxiosClient.get<FetchAgreementsResponse>(
      "/legal-agreements",
      { 
        params,
        baseURL: "http://127.0.0.1:8001/api" // Use the working base URL from your original code
      }
    ),

  downloadDocument: (data: DownloadDocumentRequest) =>
    mainAxiosClient.post<DownloadDocumentResponse>(
      ENDPOINTS.AGREEMENTS.DOWNLOAD,
      data
    ),

  getAgreementById: (id: string) =>
    mainAxiosClient.get<FetchAgreementsResponse>(
      `${ENDPOINTS.AGREEMENTS.FETCH_BY_ID}/${id}`
    ),
};

// Service functions for component usage
export const agreementService = {
  fetchAgreements: async (): Promise<Agreement[]> => {
    try {
      // Try with axios client first
      const response = await agreementApi.fetchAgreements();
      
      if (response.data.success) {
        return response.data.data.map(transformAgreement);
      } else {
        throw new Error(response.data.message || "Failed to fetch agreements");
      }
    } catch (error: any) {
      console.error("Error fetching agreements with axios:", error);
      
      // Fallback: Try direct fetch with the working endpoint from your original code
      try {
        console.log("Trying direct fetch with endpoint: http://127.0.0.1:8001/api/legal-agreements/");
        const response = await fetch(
          "http://127.0.0.1:8001/api/legal-agreements/?page=1&limit=100"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          return result.data.map(transformAgreement);
        } else {
          throw new Error(result.message || "API returned unsuccessful response");
        }
      } catch (fetchError) {
        console.error("Direct fetch also failed:", fetchError);
        throw new Error(
          `Unable to fetch agreements. Please check if the API server is running at http://127.0.0.1:8001. Error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`
        );
      }
    }
  },

  downloadDocument: async (filePath: string, fileName: string): Promise<void> => {
    try {
      const response = await fetch(filePath);
      
      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      throw new Error(
        `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};