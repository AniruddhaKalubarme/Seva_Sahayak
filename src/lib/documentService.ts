import { supabase } from '@/integrations/supabase/client';

export interface ExtractedDocumentData {
  name?: string;
  fatherName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  district?: string;
  state?: string;
  pincode?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  voterIdNumber?: string;
  drivingLicenseNumber?: string;
  confidence?: number;
}

export type ExtractionMode = 'full' | 'pan_only' | 'voter_only' | 'dl_only';

export async function extractDocument(
  imageBase64: string,
  documentType: string,
  mimeType: string,
  extractionMode: ExtractionMode = 'full'
): Promise<{ success: boolean; data?: ExtractedDocumentData; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('extract-document', {
      body: {
        imageBase64,
        documentType,
        mimeType,
        extractionMode,
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    console.error('Extraction error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to extract document' 
    };
  }
}

// Helper to determine extraction mode based on document type
export function getExtractionModeForDocument(documentType: string, isPrimary: boolean): ExtractionMode {
  if (isPrimary) return 'full';
  
  switch (documentType) {
    case 'pan':
      return 'pan_only';
    case 'voterId':
      return 'voter_only';
    case 'drivingLicense':
      return 'dl_only';
    default:
      return 'full';
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

// Validate Aadhaar number - must be exactly 12 digits, no alphabets
export function validateAadhaarNumber(aadhaarNumber: string | undefined): { isValid: boolean; cleanedNumber?: string; error?: string } {
  if (!aadhaarNumber) {
    return { isValid: false, error: 'Aadhaar number is required' };
  }
  
  // Check if contains any alphabets
  if (/[a-zA-Z]/.test(aadhaarNumber)) {
    return { isValid: false, error: 'Aadhaar number should only contain digits' };
  }
  
  // Remove spaces and any non-digit characters
  const cleaned = aadhaarNumber.replace(/\D/g, '');
  
  if (cleaned.length !== 12) {
    return { isValid: false, error: `Aadhaar number must be exactly 12 digits (found ${cleaned.length} digits)` };
  }
  
  // Format as XXXX XXXX XXXX
  const formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)}`;
  
  return { isValid: true, cleanedNumber: formatted };
}

// Sanitize Aadhaar input - remove any alphabets and keep only digits
export function sanitizeAadhaarInput(value: string): string {
  return value.replace(/[a-zA-Z]/g, '');
}

// Validate PAN number - AAAAA9999A format (5 letters, 4 digits, 1 letter) - all uppercase
export function validatePanNumber(panNumber: string | undefined): { isValid: boolean; cleanedNumber?: string; error?: string } {
  if (!panNumber) {
    return { isValid: false, error: 'PAN number is required' };
  }
  
  // Convert to uppercase and remove spaces
  const cleaned = panNumber.toUpperCase().replace(/\s/g, '');
  
  // PAN format: 5 letters + 4 digits + 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  
  if (!panRegex.test(cleaned)) {
    return { isValid: false, error: 'PAN must be 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)' };
  }
  
  return { isValid: true, cleanedNumber: cleaned };
}

// Format PAN input - convert to uppercase as user types
export function formatPanInput(value: string): string {
  return value.toUpperCase().replace(/\s/g, '');
}

// Validate Driving License number - 2 capital letters + 13 digits (e.g., MH1234567890123)
export function validateDrivingLicenseNumber(dlNumber: string | undefined): { isValid: boolean; cleanedNumber?: string; error?: string } {
  if (!dlNumber) {
    return { isValid: false, error: 'Driving License number is required' };
  }
  
  // Convert to uppercase and remove spaces
  const cleaned = dlNumber.toUpperCase().replace(/\s/g, '');
  
  // DL format: 2 capital letters + 13 digits = 15 characters total
  const dlRegex = /^[A-Z]{2}[0-9]{13}$/;
  
  if (!dlRegex.test(cleaned)) {
    return { isValid: false, error: 'DL must be 2 letters + 13 digits (e.g., MH1234567890123)' };
  }
  
  return { isValid: true, cleanedNumber: cleaned };
}

// Format DL input - convert to uppercase as user types
export function formatDrivingLicenseInput(value: string): string {
  return value.toUpperCase().replace(/\s/g, '');
}

// Validate Pincode - must be exactly 6 digits
export function validatePincode(pincode: string | undefined): { isValid: boolean; cleanedNumber?: string; error?: string } {
  if (!pincode) {
    return { isValid: false, error: 'Pincode is required' };
  }
  
  // Remove spaces and non-digit characters
  const cleaned = pincode.replace(/\D/g, '');
  
  if (cleaned.length !== 6) {
    return { isValid: false, error: `Pincode must be exactly 6 digits (found ${cleaned.length} digits)` };
  }
  
  // First digit cannot be 0
  if (cleaned.startsWith('0')) {
    return { isValid: false, error: 'Pincode cannot start with 0' };
  }
  
  return { isValid: true, cleanedNumber: cleaned };
}

// Sanitize Pincode input - keep only digits
export function sanitizePincodeInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6);
}

// Validate Voter ID - 3 capital letters + 7 digits (e.g., ABC1234567)
export function validateVoterIdNumber(voterIdNumber: string | undefined): { isValid: boolean; cleanedNumber?: string; error?: string } {
  if (!voterIdNumber) {
    return { isValid: false, error: 'Voter ID number is required' };
  }
  
  // Convert to uppercase and remove spaces
  const cleaned = voterIdNumber.toUpperCase().replace(/\s/g, '');
  
  // Voter ID format: 3 capital letters + 7 digits = 10 characters total
  const voterIdRegex = /^[A-Z]{3}[0-9]{7}$/;
  
  if (!voterIdRegex.test(cleaned)) {
    return { isValid: false, error: 'Voter ID must be 3 letters + 7 digits (e.g., ABC1234567)' };
  }
  
  return { isValid: true, cleanedNumber: cleaned };
}

// Format Voter ID input - convert to uppercase as user types
export function formatVoterIdInput(value: string): string {
  return value.toUpperCase().replace(/\s/g, '');
}