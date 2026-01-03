import { FileText, Download, Edit2, Copy, User, MapPin, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExtractedData } from './ExtractedDataPanel';
import { CopyButton } from './CopyButton';

interface ReviewPanelProps {
  extractedData: ExtractedData | null;
  formData: ExtractedData;
  onEdit: () => void;
  onDownload: () => void;
}

export function ReviewPanel({
  extractedData,
  formData,
  onEdit,
  onDownload,
}: ReviewPanelProps) {
  const { t } = useLanguage();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const dataFields = [
    { key: 'name', label: t('name'), value: formData.name },
    { key: 'fatherName', label: t('fatherName'), value: formData.fatherName },
    { key: 'dateOfBirth', label: t('dateOfBirth'), value: formData.dateOfBirth },
    { key: 'gender', label: t('gender'), value: formData.gender ? t(formData.gender) : undefined },
    { key: 'address', label: t('address'), value: formData.address },
    { key: 'district', label: t('district'), value: formData.district },
    { key: 'state', label: t('state'), value: formData.state },
    { key: 'pincode', label: t('pincode'), value: formData.pincode },
    { key: 'aadhaarNumber', label: t('aadhaarNumber'), value: formData.aadhaarNumber },
    { key: 'panNumber', label: t('panNumber'), value: formData.panNumber },
    { key: 'voterIdNumber', label: t('voterIdNumber'), value: formData.voterIdNumber },
    { key: 'drivingLicenseNumber', label: t('drivingLicenseNumber'), value: formData.drivingLicenseNumber },
  ].filter((f) => f.value);

  const copySection = async (section: 'personal' | 'address' | 'ids' | 'all') => {
    let text = '';
    
    switch (section) {
      case 'personal':
        text = [
          formData.name && `${t('name')}: ${formData.name}`,
          formData.fatherName && `${t('fatherName')}: ${formData.fatherName}`,
          formData.dateOfBirth && `${t('dateOfBirth')}: ${formData.dateOfBirth}`,
          formData.gender && `${t('gender')}: ${t(formData.gender)}`,
        ].filter(Boolean).join('\n');
        break;
      case 'address':
        text = [
          formData.address && `${t('address')}: ${formData.address}`,
          formData.district && `${t('district')}: ${formData.district}`,
          formData.state && `${t('state')}: ${formData.state}`,
          formData.pincode && `${t('pincode')}: ${formData.pincode}`,
        ].filter(Boolean).join('\n');
        break;
      case 'ids':
        text = [
          formData.aadhaarNumber && `${t('aadhaarNumber')}: ${formData.aadhaarNumber}`,
          formData.panNumber && `${t('panNumber')}: ${formData.panNumber}`,
          formData.voterIdNumber && `${t('voterIdNumber')}: ${formData.voterIdNumber}`,
          formData.drivingLicenseNumber && `${t('drivingLicenseNumber')}: ${formData.drivingLicenseNumber}`,
        ].filter(Boolean).join('\n');
        break;
      case 'all':
        text = dataFields.map(f => `${f.label}: ${f.value}`).join('\n');
        break;
    }

    if (text) {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">{t('reviewTitle')}</h2>
        <p className="text-muted-foreground mt-1">{t('reviewDescription')}</p>
      </div>

      {/* Copy for Other Forms Section */}
      <Card className="border-primary/20 bg-primary/5 animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Copy className="h-5 w-5 text-primary" />
            {t('copyForForms')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Copy extracted data to paste into forms on other websites
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant={copiedSection === 'personal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => copySection('personal')}
              className="gap-2 h-auto py-3 flex-col"
            >
              <User className="h-4 w-4" />
              <span className="text-xs">
                {copiedSection === 'personal' ? t('copied') : t('copyPersonal')}
              </span>
            </Button>
            <Button
              variant={copiedSection === 'address' ? 'default' : 'outline'}
              size="sm"
              onClick={() => copySection('address')}
              className="gap-2 h-auto py-3 flex-col"
            >
              <MapPin className="h-4 w-4" />
              <span className="text-xs">
                {copiedSection === 'address' ? t('copied') : t('copyAddress')}
              </span>
            </Button>
            <Button
              variant={copiedSection === 'ids' ? 'default' : 'outline'}
              size="sm"
              onClick={() => copySection('ids')}
              className="gap-2 h-auto py-3 flex-col"
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-xs">
                {copiedSection === 'ids' ? t('copied') : t('copyIds')}
              </span>
            </Button>
            <Button
              variant={copiedSection === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => copySection('all')}
              className="gap-2 h-auto py-3 flex-col"
            >
              <Copy className="h-4 w-4" />
              <span className="text-xs">
                {copiedSection === 'all' ? t('copied') : t('copyEverything')}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Extracted Information */}
      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t('extractedInfo')}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
            <Edit2 className="h-4 w-4" />
            {t('edit')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dataFields.map((field, index) => (
              <div
                key={field.key}
                className="flex items-center p-3 rounded-lg bg-secondary/50 border border-border/50 animate-fade-in"
                style={{ animationDelay: `${(index + 2) * 50}ms` }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{field.label}:</span>
                  <span className="text-sm font-medium text-foreground truncate" title={field.value}>
                    {field.value}
                  </span>
                </div>
                <CopyButton value={field.value || ''} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Download Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
        <Button
          variant="hero"
          size="xl"
          onClick={onDownload}
          className="gap-3"
        >
          <Download className="h-5 w-5" />
          {t('downloadForm')}
        </Button>
        <Button variant="outline" size="lg" onClick={onEdit}>
          {t('edit')}
        </Button>
      </div>
    </div>
  );
}