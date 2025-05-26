
/**
 * Utilities for preparing data for database storage and email automation
 */

export interface DatabaseRecord {
  id?: string;
  fullName: string;
  email: string;
  city: string;
  emailValid: boolean;
  temperature: number;
  condition: string;
  aqi: number | string;
  timestamp: string;
  processed: boolean;
  emailSent: boolean;
}

/**
 * Prepare data for Supabase database insertion
 */
export const prepareForDatabase = (formData: any): DatabaseRecord => {
  return {
    fullName: formData.fullName,
    email: formData.email.toLowerCase().trim(),
    city: formData.city,
    emailValid: formData.emailValid,
    temperature: formData.temperature,
    condition: formData.condition,
    aqi: formData.aqi,
    timestamp: formData.timestamp,
    processed: false,
    emailSent: false
  };
};

/**
 * Generate webhook payload for automation tools (Make.com/n8n)
 */
export const generateWebhookPayload = (data: DatabaseRecord) => {
  return {
    trigger: 'weather_form_submission',
    data: data,
    actions: [
      'validate_email',
      'fetch_weather',
      'store_database',
      'send_email'
    ],
    timestamp: new Date().toISOString()
  };
};

/**
 * Export data as CSV for external processing
 */
export const exportToCSV = (records: DatabaseRecord[]): string => {
  const headers = [
    'Full Name',
    'Email',
    'City', 
    'Email Valid',
    'Temperature (°C)',
    'Condition',
    'AQI',
    'Timestamp',
    'Processed',
    'Email Sent'
  ];
  
  const csvRows = [headers.join(',')];
  
  records.forEach(record => {
    const row = [
      `"${record.fullName}"`,
      `"${record.email}"`,
      `"${record.city}"`,
      record.emailValid,
      record.temperature,
      `"${record.condition}"`,
      record.aqi,
      `"${record.timestamp}"`,
      record.processed,
      record.emailSent
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};

/**
 * Log data for debugging and monitoring
 */
export const logDataFlow = (step: string, data: any) => {
  console.log(`[DATA FLOW - ${step.toUpperCase()}]`, {
    timestamp: new Date().toISOString(),
    step,
    data
  });
};
