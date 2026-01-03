import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VoiceInputButton } from './VoiceInputButton';
import { ExtractedData } from './ExtractedDataPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButton } from './CopyButton';
import { validateAadhaarNumber, validatePanNumber, validateDrivingLicenseNumber, validatePincode, validateVoterIdNumber, sanitizeAadhaarInput, formatPanInput, formatDrivingLicenseInput, sanitizePincodeInput, formatVoterIdInput } from '@/lib/documentService';
import { AlertCircle, FileText, Eye } from 'lucide-react';
import { UploadedDocument } from './DocumentUpload';
import { PdfPreview } from './PdfPreview';

interface SmartFormProps {
  extractedData: ExtractedData | null;
  formData: ExtractedData;
  onFormChange: (data: ExtractedData) => void;
  onSubmit: () => void;
  documents?: UploadedDocument[];
}

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

export function SmartForm({ extractedData, formData, onFormChange, onSubmit, documents = [] }: SmartFormProps) {
  const { t } = useLanguage();
  const [aadhaarError, setAadhaarError] = useState<string | null>(null);
  const [panError, setPanError] = useState<string | null>(null);
  const [dlError, setDlError] = useState<string | null>(null);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [voterIdError, setVoterIdError] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const selectedDocument = documents.find(d => d.id === selectedDocId);

  const handleFieldChange = (field: keyof ExtractedData, value: string) => {
    let processedValue = value;
    
    // Sanitize Aadhaar input - remove alphabets
    if (field === 'aadhaarNumber') {
      processedValue = sanitizeAadhaarInput(value);
    }
    
    // Format PAN input - convert to uppercase
    if (field === 'panNumber') {
      processedValue = formatPanInput(value);
    }
    
    // Format DL input - convert to uppercase
    if (field === 'drivingLicenseNumber') {
      processedValue = formatDrivingLicenseInput(value);
    }
    
    // Sanitize Pincode input - keep only digits
    if (field === 'pincode') {
      processedValue = sanitizePincodeInput(value);
    }
    
    // Format Voter ID input - convert to uppercase
    if (field === 'voterIdNumber') {
      processedValue = formatVoterIdInput(value);
    }
    
    onFormChange({ ...formData, [field]: processedValue });
    
    // Validate Aadhaar number on change
    if (field === 'aadhaarNumber') {
      if (processedValue) {
        const validation = validateAadhaarNumber(processedValue);
        setAadhaarError(validation.isValid ? null : validation.error || null);
      } else {
        setAadhaarError(null);
      }
    }
    
    // Validate PAN number on change
    if (field === 'panNumber') {
      if (processedValue) {
        const validation = validatePanNumber(processedValue);
        setPanError(validation.isValid ? null : validation.error || null);
      } else {
        setPanError(null);
      }
    }
    
    // Validate DL number on change
    if (field === 'drivingLicenseNumber') {
      if (processedValue) {
        const validation = validateDrivingLicenseNumber(processedValue);
        setDlError(validation.isValid ? null : validation.error || null);
      } else {
        setDlError(null);
      }
    }
    
    // Validate Pincode on change
    if (field === 'pincode') {
      if (processedValue) {
        const validation = validatePincode(processedValue);
        setPincodeError(validation.isValid ? null : validation.error || null);
      } else {
        setPincodeError(null);
      }
    }
    
    // Validate Voter ID on change
    if (field === 'voterIdNumber') {
      if (processedValue) {
        const validation = validateVoterIdNumber(processedValue);
        setVoterIdError(validation.isValid ? null : validation.error || null);
      } else {
        setVoterIdError(null);
      }
    }
  };

  const handleVoiceInput = (field: keyof ExtractedData) => (text: string) => {
    handleFieldChange(field, text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let updatedFormData = { ...formData };
    
    // Validate Aadhaar before submit if present
    if (formData.aadhaarNumber) {
      const validation = validateAadhaarNumber(formData.aadhaarNumber);
      if (!validation.isValid) {
        setAadhaarError(validation.error || 'Invalid Aadhaar number');
        return;
      }
      // Update with formatted number
      if (validation.cleanedNumber) {
        updatedFormData.aadhaarNumber = validation.cleanedNumber;
      }
    }
    
    // Validate PAN before submit if present
    if (formData.panNumber) {
      const validation = validatePanNumber(formData.panNumber);
      if (!validation.isValid) {
        setPanError(validation.error || 'Invalid PAN number');
        return;
      }
      // Update with formatted number (uppercase)
      if (validation.cleanedNumber) {
        updatedFormData.panNumber = validation.cleanedNumber;
      }
    }
    
    // Validate DL before submit if present
    if (formData.drivingLicenseNumber) {
      const validation = validateDrivingLicenseNumber(formData.drivingLicenseNumber);
      if (!validation.isValid) {
        setDlError(validation.error || 'Invalid Driving License number');
        return;
      }
      // Update with formatted number (uppercase)
      if (validation.cleanedNumber) {
        updatedFormData.drivingLicenseNumber = validation.cleanedNumber;
      }
    }
    
    // Validate Pincode before submit if present
    if (formData.pincode) {
      const validation = validatePincode(formData.pincode);
      if (!validation.isValid) {
        setPincodeError(validation.error || 'Invalid Pincode');
        return;
      }
      if (validation.cleanedNumber) {
        updatedFormData.pincode = validation.cleanedNumber;
      }
    }
    
    // Validate Voter ID before submit if present
    if (formData.voterIdNumber) {
      const validation = validateVoterIdNumber(formData.voterIdNumber);
      if (!validation.isValid) {
        setVoterIdError(validation.error || 'Invalid Voter ID number');
        return;
      }
      if (validation.cleanedNumber) {
        updatedFormData.voterIdNumber = validation.cleanedNumber;
      }
    }
    
    onFormChange(updatedFormData);
    onSubmit();
  };

  const renderFormField = (
    field: keyof ExtractedData,
    label: string,
    type: 'text' | 'date' | 'textarea' = 'text',
    placeholder?: string,
    error?: string | null
  ) => {
    const value = formData[field] as string || '';
    const hasAutoFilled = extractedData && extractedData[field];

    return (
      <div className="space-y-2">
        <Label htmlFor={field} className="flex items-center gap-2">
          {label}
          {hasAutoFilled && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
              Auto-filled
            </span>
          )}
        </Label>
        <div className="relative">
          {type === 'textarea' ? (
            <Textarea
              id={field}
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              placeholder={placeholder}
              className={`pr-20 ${error ? 'border-destructive' : ''}`}
            />
          ) : (
            <Input
              id={field}
              type={type}
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              placeholder={placeholder}
              className={`pr-20 ${error ? 'border-destructive' : ''}`}
            />
          )}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {value && <CopyButton value={value} />}
            {type !== 'date' && (
              <VoiceInputButton onTranscript={handleVoiceInput(field)} />
            )}
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-1 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Details */}
          <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">{t('personalDetails')}</CardTitle>
          <CardDescription>{t('formDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderFormField('name', t('name'), 'text', 'Enter full name')}
          {renderFormField('fatherName', t('fatherName'), 'text', "Enter father's name")}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderFormField('dateOfBirth', t('dateOfBirth'), 'date')}
            
            <div className="space-y-2">
              <Label htmlFor="gender" className="flex items-center gap-2">
                {t('gender')}
                {extractedData?.gender && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
                    Auto-filled
                  </span>
                )}
              </Label>
              <Select
                value={formData.gender || ''}
                onValueChange={(value) => handleFieldChange('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t('male')}</SelectItem>
                  <SelectItem value="female">{t('female')}</SelectItem>
                  <SelectItem value="other">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Details */}
      <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="text-lg">{t('addressDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderFormField('address', t('address'), 'textarea', 'Enter full address')}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderFormField('district', t('district'), 'text', 'District')}
            
            <div className="space-y-2">
              <Label htmlFor="state" className="flex items-center gap-2">
                {t('state')}
                {extractedData?.state && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
                    Auto-filled
                  </span>
                )}
              </Label>
              <Select
                value={formData.state || ''}
                onValueChange={(value) => handleFieldChange('state', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {indianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {renderFormField('pincode', t('pincode'), 'text', '6-digit PIN', pincodeError)}
          </div>
        </CardContent>
      </Card>

      {/* Document Details */}
      <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="text-lg">{t('documentDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderFormField('aadhaarNumber', t('aadhaarNumber'), 'text', 'XXXX XXXX XXXX (12 digits only)', aadhaarError)}
            {renderFormField('panNumber', t('panNumber'), 'text', 'ABCDE1234F (auto-uppercase)', panError)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderFormField('voterIdNumber', t('voterIdNumber'), 'text', 'ABC1234567 (3 letters + 7 digits)', voterIdError)}
            {renderFormField('drivingLicenseNumber', t('drivingLicenseNumber'), 'text', 'MH1234567890123 (2 letters + 13 digits)', dlError)}
          </div>
        </CardContent>
      </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onFormChange({})}>
              {t('clear')}
            </Button>
            <Button type="submit" variant="hero" size="lg">
              {t('next')}
            </Button>
          </div>
        </form>
      </div>

      {/* Document Preview Panel - Below form */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Document Preview
          </CardTitle>
          <CardDescription>Select a document to cross-check</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {documents.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2">
                {documents.map((doc) => (
                  <Button
                    key={doc.id}
                    type="button"
                    variant={selectedDocId === doc.id ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2"
                    onClick={() => setSelectedDocId(selectedDocId === doc.id ? null : doc.id)}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="truncate max-w-[100px]">{doc.file.name.split('.')[0]}</span>
                  </Button>
                ))}
              </div>
              {selectedDocument && (
                <div className="mt-4 border rounded-lg overflow-hidden bg-muted/30">
                  {selectedDocument.file.type === 'application/pdf' ? (
                    <PdfPreview url={selectedDocument.preview} className="w-full" />
                  ) : (
                    <img
                      src={selectedDocument.preview}
                      alt="Document preview"
                      className="w-full h-auto object-contain"
                    />
                  )}
                </div>
              )}
              {!selectedDocument && (
                <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg text-muted-foreground">
                  <p className="text-sm text-center">Click a document above to preview</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg text-muted-foreground">
              <p className="text-sm text-center">No documents uploaded</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}