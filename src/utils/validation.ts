// Validation functions
export const validatePAN = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

export const validateAadhaar = (aadhaar: string): boolean => {
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaar);
};

export const validateGSTIN = (gstin: string): boolean => {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
};

export const validatePassport = (passport: string): boolean => {
  const passportRegex = /^[A-PR-WY][1-9]\d\s?\d{4}[1-9]$/;
  return passportRegex.test(passport);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateAccountNumber = (account: string): boolean => {
  const accountRegex = /^\d{9,18}$/;
  return accountRegex.test(account);
};

export const validateIFSC = (ifsc: string): boolean => {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc);
};

// Field-specific validation
export const getFieldError = (field: string, value: string): string => {
  switch (field) {
    case 'pan_number':
      if (!value) return 'PAN number is required';
      if (!validatePAN(value)) return 'Invalid PAN format (e.g., ABCDE1234F)';
      return '';

    case 'aadhar_number':
      if (!value) return 'Aadhaar number is required';
      if (!validateAadhaar(value)) return 'Aadhaar must be 12 digits';
      return '';

    case 'gst_number':
      if (!value) return 'GST number is required';
      if (!validateGSTIN(value)) return 'Invalid GST format';
      return '';

    case 'passport_number':
      if (!value) return 'Passport number is required';
      if (!validatePassport(value)) return 'Invalid Passport format';
      return '';

    case 'phone_number':
      if (!value) return 'Phone number is required';
      if (!validatePhone(value)) return 'Invalid Indian phone number';
      return '';

    case 'account_number':
      if (!value) return 'Account number is required';
      if (!validateAccountNumber(value)) return 'Account number must be 9-18 digits';
      return '';

    case 'ifsc_code':
      if (!value) return 'IFSC code is required';
      if (!validateIFSC(value)) return 'Invalid IFSC code format';
      return '';

    default:
      return '';
  }
};

// User type specific field validation
export const validateUserTypeFields = (userType: string, fields: any): string[] => {
  const errors: string[] = [];

  if (userType === 'individual') {
    if (!fields.pan_number) errors.push('PAN number is required for individuals');
    if (!fields.aadhar_number) errors.push('Aadhaar number is required for individuals');
  } else if (userType === 'business') {
    if (!fields.gst_number) errors.push('GST number is required for businesses');
  } else if (userType === 'NRI') {
    if (!fields.passport_number) errors.push('Passport number is required for NRIs');
  }

  return errors;
};

// Required field validation
export const validateRequiredFields = (data: any, requiredFields: string[]): string[] => {
  const errors: string[] = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`${field.replace('_', ' ')} is required`);
    }
  });

  return errors;
};