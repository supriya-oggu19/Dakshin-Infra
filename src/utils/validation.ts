// File: src/utils/validation.ts
export const VALIDATION_PATTERNS = {
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  AADHAAR: /^\d{12}$/,
  GSTIN: /^[0-9A-Z]{15}$/,
  PASSPORT: /^[A-Z0-9]{6,12}$/,
  PHONE: /^\+?\d{1,3}[-.\s]?\d{6,10}$/,
  ACCOUNT_NUMBER: /^\d{9,18}$/,
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
};

export const validatePAN = (pan: string): boolean => {
  return VALIDATION_PATTERNS.PAN.test(pan);
};

export const validateAadhaar = (aadhaar: string): boolean => {
  return VALIDATION_PATTERNS.AADHAAR.test(aadhaar);
};

export const validateGSTIN = (gstin: string): boolean => {
  return VALIDATION_PATTERNS.GSTIN.test(gstin);
};

export const validatePassport = (passport: string): boolean => {
  return VALIDATION_PATTERNS.PASSPORT.test(passport);
};

export const validatePhone = (phone: string): boolean => {
  return VALIDATION_PATTERNS.PHONE.test(phone);
};

export const validateAccountNumber = (accountNumber: string): boolean => {
  return VALIDATION_PATTERNS.ACCOUNT_NUMBER.test(accountNumber);
};

export const validateIFSC = (ifsc: string): boolean => {
  return VALIDATION_PATTERNS.IFSC.test(ifsc);
};

export const validateUserTypeFields = (userType: string, fields: any): string[] => {
  const validationErrors: string[] = [];

  if (userType === 'individual') {
    if (!fields.pan_number || !validatePAN(fields.pan_number)) {
      validationErrors.push('Valid PAN number is required for individual user type');
    }
    if (!fields.aadhar_number || !validateAadhaar(fields.aadhar_number)) {
      validationErrors.push('Valid Aadhaar number is required for individual user type');
    }
    if (fields.gst_number) {
      validationErrors.push('GST number should not be provided for individual user type');
    }
    if (fields.passport_number) {
      validationErrors.push('Passport number should not be provided for individual user type');
    }
  } else if (userType === 'business') {
    if (!fields.gst_number || !validateGSTIN(fields.gst_number)) {
      validationErrors.push('Valid GST number is required for business user type');
    }
    if (fields.pan_number) {
      validationErrors.push('PAN number should not be provided for business user type');
    }
    if (fields.aadhar_number) {
      validationErrors.push('Aadhaar number should not be provided for business user type');
    }
    if (fields.passport_number) {
      validationErrors.push('Passport number should not be provided for business user type');
    }
  } else if (userType === 'NRI') {
    if (!fields.passport_number || !validatePassport(fields.passport_number)) {
      validationErrors.push('Valid passport number is required for NRI user type');
    }
    if (fields.pan_number) {
      validationErrors.push('PAN number should not be provided for NRI user type');
    }
    if (fields.aadhar_number) {
      validationErrors.push('Aadhaar number should not be provided for NRI user type');
    }
    if (fields.gst_number) {
      validationErrors.push('GST number should not be provided for NRI user type');
    }
  }

  return validationErrors;
};

export const getFieldError = (field: string, value: string): string => {
  switch (field) {
    case 'pan_number':
      return validatePAN(value) ? '' : 'Invalid PAN format (e.g., ABCDE1234F)';
    case 'aadhar_number':
      return validateAadhaar(value) ? '' : 'Aadhaar must be 12 digits';
    case 'gst_number':
      return validateGSTIN(value) ? '' : 'Invalid GSTIN format (15 alphanumeric characters)';
    case 'passport_number':
      return validatePassport(value) ? '' : 'Invalid Passport format (6-12 alphanumeric characters)';
    case 'phone_number':
      return validatePhone(value) ? '' : 'Invalid phone format (e.g., +91 9876543210)';
    case 'account_number':
      return validateAccountNumber(value) ? '' : 'Account number must be 9-18 digits';
    case 'ifsc_code':
      return validateIFSC(value) ? '' : 'Invalid IFSC format (e.g., SBIN0000123)';
    default:
      return '';
  }
};