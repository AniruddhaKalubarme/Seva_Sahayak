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

function getSystemPrompt(extractionMode: ExtractionMode): string {
  const englishRule = 'CRITICAL: ALL extracted text MUST be in ENGLISH only. If the document contains text in Hindi, Marathi, or any other Indian regional language, you MUST transliterate/translate it to English.';
  
  if (extractionMode === 'pan_only') {
    return `You are an OCR assistant for Indian PAN cards. ${englishRule} Extract ONLY the PAN number and father's name. Return JSON: {"panNumber": "...", "fatherName": "...", "confidence": 0.0-1.0}`;
  }
  if (extractionMode === 'voter_only') {
    return `You are an OCR assistant for Indian Voter ID. ${englishRule} Extract ONLY the Voter ID number. Return JSON: {"voterIdNumber": "...", "confidence": 0.0-1.0}`;
  }
  if (extractionMode === 'dl_only') {
    return `You are an OCR assistant for Indian Driving Licenses. ${englishRule} Extract ONLY the DL number. Return JSON: {"drivingLicenseNumber": "...", "confidence": 0.0-1.0}`;
  }
  return `You are an OCR assistant for Indian government documents. ${englishRule} Extract personal information. IMPORTANT: Aadhaar must be exactly 12 digits (format: XXXX XXXX XXXX). Return JSON with: name, fatherName, dateOfBirth (YYYY-MM-DD), gender (male/female/other), address, district, state, pincode (6 digits), aadhaarNumber (12 digits), panNumber, voterIdNumber, drivingLicenseNumber, confidence.`;
}

function getExtractionPrompt(documentType: string, extractionMode: ExtractionMode): string {
  const englishRule = 'IMPORTANT: Output ALL text in ENGLISH only - transliterate any Hindi/Marathi/regional text to English.';
  
  if (extractionMode === 'pan_only') return `Extract PAN number (10 chars) and complete father's name from this PAN card. ${englishRule}`;
  if (extractionMode === 'voter_only') return `Extract the EPIC/Voter ID number from this Voter ID card. ${englishRule}`;
  if (extractionMode === 'dl_only') return `Extract the Driving License number from this document. ${englishRule}`;

  const prompts: Record<string, string> = {
    aadhaar: `This is an Aadhaar Card. Extract ALL visible information. CRITICAL: The Aadhaar number MUST be exactly 12 digits (format: XXXX XXXX XXXX). Look for S/O, D/O, W/O, C/O for father's/husband's name. Extract full address from back side. ${englishRule}`,
    pan: `This is a PAN Card. Extract full name, father's name (complete), date of birth, and 10-character PAN number. ${englishRule}`,
    voterId: `This is a Voter ID Card. Extract full name, father's name, date of birth, gender, address, and EPIC number. ${englishRule}`,
    drivingLicense: `This is a Driving License. Extract full name, father's name, date of birth, address, and DL number. ${englishRule}`,
    other: `This is an Indian government ID document. Extract all visible personal information including name, father's name, DOB, gender, address, and any ID numbers. Aadhaar must be exactly 12 digits. ${englishRule}`
  };

  return prompts[documentType] || prompts.other;
}

export async function extractDocument(
  imageBase64: string,
  documentType: string,
  mimeType: string,
  extractionMode: ExtractionMode = 'full'
): Promise<{ success: boolean; data?: ExtractedDocumentData; error?: string }> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('VITE_GEMINI_API_KEY') : null);

    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const cleanMimeType = mimeType || 'image/jpeg';
    const systemPrompt = getSystemPrompt(extractionMode);
    const extractionPrompt = getExtractionPrompt(documentType, extractionMode);

    const configuredModel = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
    // List of reliable multimodal models to try if Google returns 503 (high demand) or 429
    const candidateModels = [
      configuredModel,
      'gemini-3.5-flash-lite',
      'gemini-2.5-flash',
      'gemini-3.6-flash',
    ].filter((m, i, arr) => arr.indexOf(m) === i);

    let lastError: string | null = null;
    let content: string | null = null;

    for (const model of candidateModels) {
      try {
        console.log(`Attempting document extraction with model: ${model}`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                role: 'user',
                parts: [
                  { text: extractionPrompt },
                  {
                    inlineData: {
                      mimeType: cleanMimeType,
                      data: cleanBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`Model ${model} returned error ${response.status}:`, errorText);
          
          // If the model is experiencing high demand (503) or rate limit (429), try next candidate
          if (response.status === 503 || response.status === 429) {
            lastError = `Google servers are busy (${response.status}).`;
            continue;
          }
          throw new Error(`Gemini API error (${response.status}): ${errorText}`);
        }

        const aiResponse = await response.json();
        content = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) {
          console.log(`Document extraction succeeded using model: ${model}`);
          break; // successfully got response
        }
      } catch (err) {
        console.warn(`Failed with model ${model}:`, err);
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    if (!content) {
      throw new Error(lastError || 'All Gemini models are temporarily experiencing high demand. Please try again in a few seconds.');
    }

    let extractedData: ExtractedDocumentData;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      extractedData = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse extracted data from document');
    }

    return { success: true, data: extractedData };
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
  // The primary document supplies general details; secondary documents only
  // need extraction for the identifier that makes them useful.
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
    // The Edge Function receives JSON, so convert the browser File into text
    // that can be included in the request body.
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