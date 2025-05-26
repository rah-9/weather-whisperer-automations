
/**
 * Validates email address using JavaScript regex
 * Based on RFC 5322 standard with practical considerations
 */
export const validateEmail = (email: string): boolean => {
  // Remove whitespace
  email = email.trim();
  
  // Basic length check
  if (email.length === 0 || email.length > 254) {
    return false;
  }
  
  // Comprehensive email regex pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Additional checks
  const [localPart, domain] = email.split('@');
  
  // Local part checks
  if (localPart.length === 0 || localPart.length > 64) {
    return false;
  }
  
  // Domain checks
  if (domain.length === 0 || domain.length > 253) {
    return false;
  }
  
  // Check for consecutive dots
  if (email.includes('..')) {
    return false;
  }
  
  // Check if starts or ends with dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }
  
  console.log(`Email validation for ${email}: PASSED`);
  return true;
};

/**
 * Additional email validation helpers
 */
export const getEmailValidationMessage = (email: string): string => {
  if (!email) return 'Email is required';
  if (!validateEmail(email)) return 'Please enter a valid email address';
  return '';
};
