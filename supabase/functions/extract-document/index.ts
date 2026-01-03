import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

// Extraction modes determine which fields to extract based on document type
type ExtractionMode = 'full' | 'pan_only' | 'voter_only' | 'dl_only';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, documentType, mimeType, extractionMode = 'full' } = await req.json();

    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing document extraction for type:', documentType);
    console.log('Extraction mode:', extractionMode);

    const extractionPrompt = getExtractionPrompt(documentType, extractionMode);
    const systemPrompt = getSystemPrompt(extractionMode);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: extractionPrompt },
              { type: 'image_url', image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Usage limit reached.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) throw new Error('No content in AI response');

    let extractedData;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      extractedData = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse extracted data');
    }

    console.log('Extraction successful:', Object.keys(extractedData));

    return new Response(JSON.stringify({ success: true, data: extractedData }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

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