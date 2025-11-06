// src/api/endpoints.ts
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
    SEND_OTP_NEW: "user/send_otp_new",
    REGISTER: "/user/register",
    LOGIN: "/user/login",
    UPDATE: "/user/update",
    PORTFOLIO: "/users/portfolio",
    INVESTMENT_SUMMARY: "/users/investments-summary",
  },

  PROJECTS: {
    CREATE: "/projects/create",
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
    LIST: "/projects/all",
    GET_BY_ID: (id: string) => `/projects/${id}`,
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
    CREATE_ORDER: "/payments/create-order-with-unit",
    MAKE_PAYMENT: "/payments/make-payment",
    CUSTOMER_INFO: "/payments/customer-info",
    LIST: "/payments/list",
    VERIFY_ORDER: (orderId: string) => `/payments/verify-order/${orderId}`,
  },

   USER_PROFILE: {
    CREATE: "/user_profile/create",
    UPDATE: (id: string) => `/user_profile/update/${id}`,
    DELETE: (id: string) => `/user_profile/delete/${id}`,
    GET: (id: string) => `/user_profile/${id}`,
    LIST: "/user_profile/list", // Add this
  },

  PURCHASED_UNITS: {
    CREATE: "/purchased-unit/create",
  },

  PURCHASE: {
    CREATE: "/purchase/create",
  },

  DOCUMENTS: {
    VERIFY_PAN: "/documents/verify-pan",
    VERIFY_AADHAAR: "/documents/verify-aadhaar",
    VERIFY_GSTIN: "/documents/verify-gstin",
    VERIFY_PASSPORT: "/documents/verify-passport",
  },

  CONTACT: {
    CREATE: "/contact-inquiry/create",
  },

  CONTACT_INFO: {
    ALL: "/contactInfo/all",
  },

  AGREEMENTS: {
    FETCH_ALL: "/legal-agreements",
    FETCH_BY_ID: "/legal-agreements",
    DOWNLOAD: "/legal-agreements/download",
  },

  INVESTMENT: {
    PORTFOLIO: "/users/portfolio",
  },
};