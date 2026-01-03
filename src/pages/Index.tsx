import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { StepIndicator } from '@/components/StepIndicator';
import { DocumentUpload, UploadedDocument } from '@/components/DocumentUpload';
import { ExtractedDataPanel, ExtractedData } from '@/components/ExtractedDataPanel';
import { SmartForm } from '@/components/SmartForm';
import { ReviewPanel } from '@/components/ReviewPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, ArrowLeft, CheckCircle2, Shield, Zap, Clock } from 'lucide-react';
import { extractDocument, fileToBase64, getExtractionModeForDocument, ExtractedDocumentData, validateAadhaarNumber } from '@/lib/documentService';

export default function Index() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [formData, setFormData] = useState<ExtractedData>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle document upload
  const handleDocumentUpload = useCallback((files: File[]) => {
    const newDocs: UploadedDocument[] = files.map((file) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      type: detectDocumentType(file.name),
      status: 'uploading' as const,
    }));

    setDocuments((prev) => [...prev, ...newDocs]);

    // Simulate upload progress
    newDocs.forEach((doc) => {
      setTimeout(() => {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, status: 'completed' as const } : d
          )
        );
        toast({
          title: t('uploadSuccess'),
          description: `${doc.file.name} has been uploaded`,
        });
      }, 1000);
    });
  }, [t, toast]);

  const handleDocumentRemove = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // AI-powered extraction with smart multi-document merging
  const handleExtract = useCallback(async () => {
    if (documents.length === 0) {
      toast({
        title: 'No documents',
        description: 'Please upload at least one document first',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep(2);

    try {
      // Find all Aadhaar cards (could be front and back)
      const aadhaarDocs = documents.filter(d => d.type === 'aadhaar');
      const otherDocs = documents.filter(d => d.type !== 'aadhaar');
      
      // Determine processing order: All Aadhaar docs first (if exists), then others
      const processingOrder = aadhaarDocs.length > 0 
        ? [...aadhaarDocs, ...otherDocs] 
        : documents;

      let mergedData: ExtractedData = {};

      // Process each document
      for (let i = 0; i < processingOrder.length; i++) {
        const doc = processingOrder[i];
        const isAadhaar = doc.type === 'aadhaar';
        const isPrimary = i === 0 && (isAadhaar || aadhaarDocs.length === 0);
        // All Aadhaar docs get full extraction to capture data from both sides
        const extractionMode = isAadhaar ? 'full' : getExtractionModeForDocument(doc.type, isPrimary);

        console.log(`Processing document ${i + 1}/${processingOrder.length}:`, {
          type: doc.type,
          fileName: doc.file.name,
          isPrimary,
          isAadhaar,
          extractionMode
        });

        // Convert file to base64
        const base64 = await fileToBase64(doc.file);

        // Call AI extraction with the appropriate mode
        const result = await extractDocument(base64, doc.type, doc.file.type, extractionMode);

        console.log(`Extraction result for ${doc.type}:`, result);

        if (!result.success || !result.data) {
          console.error(`Extraction failed for ${doc.type}:`, result.error);
          continue;
        }

        // Smart merge logic
        if (isAadhaar) {
          // For Aadhaar documents (front or back), merge all extracted data
          // Only set values if they exist and are not already set (to avoid overwriting with empty values)
          mergedData = {
            name: mergedData.name || result.data.name,
            fatherName: mergedData.fatherName || result.data.fatherName,
            dateOfBirth: mergedData.dateOfBirth || result.data.dateOfBirth,
            gender: mergedData.gender || result.data.gender,
            address: mergedData.address || result.data.address,
            district: mergedData.district || result.data.district,
            state: mergedData.state || result.data.state,
            pincode: mergedData.pincode || result.data.pincode,
            aadhaarNumber: mergedData.aadhaarNumber || result.data.aadhaarNumber,
            confidence: result.data.confidence || mergedData.confidence,
            // Keep existing document numbers
            panNumber: mergedData.panNumber,
            voterIdNumber: mergedData.voterIdNumber,
            drivingLicenseNumber: mergedData.drivingLicenseNumber,
          };
          console.log('Merged Aadhaar data so far:', mergedData);
        } else if (isPrimary && !aadhaarDocs.length) {
          // Non-Aadhaar primary document
          mergedData = {
            name: result.data.name,
            fatherName: result.data.fatherName,
            dateOfBirth: result.data.dateOfBirth,
            gender: result.data.gender,
            address: result.data.address,
            district: result.data.district,
            state: result.data.state,
            pincode: result.data.pincode,
            aadhaarNumber: result.data.aadhaarNumber,
            confidence: result.data.confidence,
          };
        } else {
          // For non-primary documents, only merge specific fields
          switch (doc.type) {
            case 'pan':
              if (result.data.panNumber) {
                mergedData.panNumber = result.data.panNumber;
              }
              // Smart father's name logic: use PAN if more complete
              if (result.data.fatherName) {
                const currentFatherWords = (mergedData.fatherName || '').trim().split(/\s+/).filter(Boolean).length;
                const panFatherWords = result.data.fatherName.trim().split(/\s+/).filter(Boolean).length;
                
                // Use PAN father's name if it has 3+ words and more than current
                if (panFatherWords >= 3 && panFatherWords > currentFatherWords) {
                  mergedData.fatherName = result.data.fatherName;
                  console.log('Using PAN father name (more complete):', result.data.fatherName);
                }
              }
              break;
            case 'voterId':
              if (result.data.voterIdNumber) {
                mergedData.voterIdNumber = result.data.voterIdNumber;
              }
              break;
            case 'drivingLicense':
              if (result.data.drivingLicenseNumber) {
                mergedData.drivingLicenseNumber = result.data.drivingLicenseNumber;
              }
              break;
            default:
              // For 'other' type without Aadhaar, use as base if mergedData is empty
              if (!mergedData.name) {
                mergedData = { ...mergedData, ...result.data };
              }
          }
        }
      }

      // If no Aadhaar but we have other documents, use the first one as base
      if (aadhaarDocs.length === 0 && documents.length > 0 && !mergedData.name) {
        const firstDoc = documents[0];
        const base64 = await fileToBase64(firstDoc.file);
        const result = await extractDocument(base64, firstDoc.type, firstDoc.file.type, 'full');
        
        if (result.success && result.data) {
          mergedData = {
            name: result.data.name,
            fatherName: result.data.fatherName,
            dateOfBirth: result.data.dateOfBirth,
            gender: result.data.gender,
            address: result.data.address,
            district: result.data.district,
            state: result.data.state,
            pincode: result.data.pincode,
            aadhaarNumber: result.data.aadhaarNumber,
            panNumber: result.data.panNumber,
            voterIdNumber: result.data.voterIdNumber,
            confidence: result.data.confidence,
          };
        }
      }

      // Validate Aadhaar number if present
      if (mergedData.aadhaarNumber) {
        const validation = validateAadhaarNumber(mergedData.aadhaarNumber);
        if (validation.isValid && validation.cleanedNumber) {
          mergedData.aadhaarNumber = validation.cleanedNumber;
        }
      }

      setExtractedData(mergedData);
      setFormData(mergedData);

      const docCount = documents.length;
      toast({
        title: t('extractionComplete'),
        description: `Data extracted from ${docCount} document${docCount > 1 ? 's' : ''} with smart merging`,
      });
    } catch (error) {
      console.error('Extraction error:', error);
      toast({
        title: 'Extraction Failed',
        description: error instanceof Error ? error.message : 'Failed to extract data',
        variant: 'destructive',
      });
      setCurrentStep(1);
    } finally {
      setIsProcessing(false);
    }
  }, [documents, t, toast]);

  const handleFormSubmit = useCallback(() => {
    setCurrentStep(4);
  }, []);

  const handleDownload = useCallback(() => {
    // Create a printable document
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Extracted Document Data</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
          .field { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
          .label { color: #666; font-weight: 500; }
          .value { color: #333; font-weight: 600; text-align: right; max-width: 60%; }
          .header { text-align: center; margin-bottom: 30px; }
          .date { color: #888; font-size: 12px; margin-top: 5px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Extracted Document Information</h1>
          <p class="date">Generated on: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
        </div>
        ${formData.name ? `<div class="field"><span class="label">${t('name')}</span><span class="value">${formData.name}</span></div>` : ''}
        ${formData.fatherName ? `<div class="field"><span class="label">${t('fatherName')}</span><span class="value">${formData.fatherName}</span></div>` : ''}
        ${formData.dateOfBirth ? `<div class="field"><span class="label">${t('dateOfBirth')}</span><span class="value">${formData.dateOfBirth}</span></div>` : ''}
        ${formData.gender ? `<div class="field"><span class="label">${t('gender')}</span><span class="value">${t(formData.gender)}</span></div>` : ''}
        ${formData.address ? `<div class="field"><span class="label">${t('address')}</span><span class="value">${formData.address}</span></div>` : ''}
        ${formData.district ? `<div class="field"><span class="label">${t('district')}</span><span class="value">${formData.district}</span></div>` : ''}
        ${formData.state ? `<div class="field"><span class="label">${t('state')}</span><span class="value">${formData.state}</span></div>` : ''}
        ${formData.pincode ? `<div class="field"><span class="label">${t('pincode')}</span><span class="value">${formData.pincode}</span></div>` : ''}
        ${formData.aadhaarNumber ? `<div class="field"><span class="label">${t('aadhaarNumber')}</span><span class="value">${formData.aadhaarNumber}</span></div>` : ''}
        ${formData.panNumber ? `<div class="field"><span class="label">${t('panNumber')}</span><span class="value">${formData.panNumber}</span></div>` : ''}
        ${formData.voterIdNumber ? `<div class="field"><span class="label">${t('voterIdNumber')}</span><span class="value">${formData.voterIdNumber}</span></div>` : ''}
        <div class="footer">
          <p>This document was generated by AI-Powered Form Filling Assistant</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      toast({
        title: t('downloadReady'),
        description: 'Use "Save as PDF" in the print dialog to download',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Please allow popups to download the PDF',
        variant: 'destructive',
      });
    }
  }, [t, toast, formData]);

  const handleEditFromReview = useCallback(() => {
    setCurrentStep(3);
  }, []);

  const goToNextStep = () => {
    if (currentStep === 1 && documents.length > 0) {
      handleExtract();
    } else if (currentStep === 2 && extractedData) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleFormSubmit();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      <main className="container py-8">
        {/* Hero Section - Only on Step 1 */}
        {currentStep === 1 && (
          <section className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('appTagline')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('appDescription')}
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-card border shadow-sm">
                <Shield className="h-5 w-5 text-success" />
                <span className="text-sm font-medium">{t('secureProcessing')}</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-card border shadow-sm">
                <Zap className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">{t('poweredBy')}</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-card border shadow-sm">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">3-5 sec processing</span>
              </div>
            </div>
          </section>
        )}

        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <DocumentUpload
                      documents={documents}
                      onUpload={handleDocumentUpload}
                      onRemove={handleDocumentRemove}
                    />
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="sticky top-24">
                  <CardContent className="p-6">
                    <ExtractedDataPanel data={null} />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Extraction - Only show extracted data, no document preview */}
          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <Card>
                <CardContent className="p-6">
                  <ExtractedDataPanel data={extractedData} isLoading={isProcessing} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Form Filling */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <SmartForm
                extractedData={extractedData}
                formData={formData}
                onFormChange={setFormData}
                onSubmit={handleFormSubmit}
                documents={documents}
              />
            </div>
          )}

          {/* Step 4: Review & Export */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <ReviewPanel
                extractedData={extractedData}
                formData={formData}
                onEdit={handleEditFromReview}
                onDownload={handleDownload}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center max-w-6xl mx-auto mt-8">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('previous')}
          </Button>

          {currentStep < 4 && (
            <Button
              variant="hero"
              onClick={goToNextStep}
              disabled={
                (currentStep === 1 && documents.length === 0) ||
                (currentStep === 2 && isProcessing)
              }
              className="gap-2"
            >
              {currentStep === 1 ? 'Extract Data' : t('next')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span>{t('secureProcessing')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper function to detect document type from filename
function detectDocumentType(filename: string): UploadedDocument['type'] {
  const lower = filename.toLowerCase();
  // Include common spelling variations for Aadhaar
  if (lower.includes('aadhaar') || lower.includes('aadhar') || lower.includes('addhar') || lower.includes('adhar') || lower.includes('aadhr') || lower.includes('uidai')) return 'aadhaar';
  if (lower.includes('pan')) return 'pan';
  if (lower.includes('voter') || lower.includes('epic')) return 'voterId';
  if (lower.includes('license') || lower.includes('dl')) return 'drivingLicense';
  return 'other';
}
