/** --- Request Models --- */
export interface FetchAgreementsRequest {
  page?: number;
  limit?: number;
}

export interface DownloadDocumentRequest {
  filePath: string;
  fileName: string;
}

/** --- Response Models --- */
export interface ApiAgreement {
  id: string;
  unit_id: string;
  agreement_type: string;
  agreement_date: string;
  status: string;
  uploaded_at: string;
  document_name: string;
  file_path: string;
  signatories: string[];
  valid_until: string;
}

export interface FetchAgreementsResponse {
  success: boolean;
  data: ApiAgreement[];
  message?: string;
}

export interface DownloadDocumentResponse {
  success: boolean;
  message?: string;
}

/** --- Frontend Models --- */
export interface AgreementDocument {
  available: boolean;
  fileName: string;
  filePath: string;
}

export interface AgreementDocuments {
  mou: AgreementDocument;
  agreementOfSale: AgreementDocument;
  saleDeed: AgreementDocument;
  rentalAgreement: AgreementDocument;
}

export interface Agreement {
  id: string;
  projectName: string;
  unitNumber: string;
  agreementType: string;
  date: string;
  status: string;
  fileSize: string;
  lastModified: string;
  description: string;
  signatories: string[];
  validUntil: string;
  documents: AgreementDocuments;
}