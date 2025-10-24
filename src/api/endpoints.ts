export const ENDPOINTS = {
  ADMIN: {
    LOGIN: "/admins/login",
    CREATE: "/admins/create",
    UPDATE: (id: string) => `/admins/${id}`,
    DELETE: (id: string) => `/admins/${id}`,
    LIST: "/admins",
  },
  USER: {
    SEND_OTP: "/user/send_otp",
    REGISTER: "/user/register",
    LOGIN: "/user/login",
    UPDATE: "/user/update",
  },
 
  PROJECTS: {
    CREATE: "/projects/create",
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
    LIST: "/projects/all",
    GET_BY_ID: (id: string) => `/projects/${id}`, // if you have a single project endpoint
  },
  SCHEMES: {
    CREATE: "/schemes/create",
    UPDATE: (id: string) => `/schemes/${id}`,
    LIST_BY_PROJECT: "/investment-schemes/project",
  },
  AGENTS: {
    CREATE: "/agents/create",
    UPDATE_STATUS: (id: string) => `/agents/update-status/${id}`,
    GET_BY_ID: (id: string) => `/agents/${id}`,
    LIST_ALL: "/agents/all",
  },
  CONTACT_INQUIRY: {
    CREATE: "/contact-inquiry/create",
    UPDATE_STATUS: (id: string) => `/contact-inquiry/update-status/${id}`,
  },
  PAYMENTS: {
    CREATE_ORDER: "/payments/create-order",
  },
  USER_PROFILE: {
    CREATE: "/user_profile/create",
    UPDATE: (id: string) => `/user_profile/update/${id}`,
    DELETE: (id: string) => `/user_profile/delete/${id}`,
    GET: (id: string) => `/user_profile/${id}`,
  },
  PURCHASED_UNITS: {
    CREATE: "/purchased-unit/create",
  },
  
 PURCHASE: {
    CREATE: "/purchase/create",
  },
  
  DOCUMENTS: {
    VERIFY_PAN: "/documents/verify-pan", // Removed /api prefix
    VERIFY_AADHAAR: "/documents/verify-aadhaar", // Removed /api prefix
    VERIFY_GSTIN: "/documents/verify-gstin", // Removed /api prefix
    VERIFY_PASSPORT: "/documents/verify-passport", // Removed /api prefix
  },
  CONTACT: {
    CREATE: "http://localhost:8000/api/contact-inquiry/create",
  },
  CONTACT_INFO: {
    ALL: "http://127.0.0.1:8001/api/contactInfo/all",
  },
};
