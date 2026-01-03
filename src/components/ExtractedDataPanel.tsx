import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CopyButton, CopyAllButton } from './CopyButton';

export interface ExtractedData {
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

interface ExtractedDataPanelProps {
  data: ExtractedData | null;
  isLoading?: boolean;
}

export function ExtractedDataPanel({ data, isLoading }: ExtractedDataPanelProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{t('extractedData')}</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 shimmer rounded" />
              <div className="h-8 shimmer rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-3xl">📄</span>
        </div>
        <p className="text-muted-foreground">
          Upload a document to extract information
        </p>
      </div>
    );
  }

  const fields = [
    { key: 'name', label: t('name'), value: data.name },
    { key: 'fatherName', label: t('fatherName'), value: data.fatherName },
    { key: 'dateOfBirth', label: t('dateOfBirth'), value: data.dateOfBirth },
    { key: 'gender', label: t('gender'), value: data.gender ? t(data.gender) : undefined },
    { key: 'address', label: t('address'), value: data.address },
    { key: 'district', label: t('district'), value: data.district },
    { key: 'state', label: t('state'), value: data.state },
    { key: 'pincode', label: t('pincode'), value: data.pincode },
    { key: 'aadhaarNumber', label: t('aadhaarNumber'), value: data.aadhaarNumber },
    { key: 'panNumber', label: t('panNumber'), value: data.panNumber },
    { key: 'voterIdNumber', label: t('voterIdNumber'), value: data.voterIdNumber },
    { key: 'drivingLicenseNumber', label: t('drivingLicenseNumber'), value: data.drivingLicenseNumber },
  ].filter((f) => f.value);

  const copyLabels: Record<string, string> = {
    name: t('name'),
    fatherName: t('fatherName'),
    dateOfBirth: t('dateOfBirth'),
    gender: t('gender'),
    address: t('address'),
    district: t('district'),
    state: t('state'),
    pincode: t('pincode'),
    aadhaarNumber: t('aadhaarNumber'),
    panNumber: t('panNumber'),
    voterIdNumber: t('voterIdNumber'),
    drivingLicenseNumber: t('drivingLicenseNumber'),
  };

  const copyData: Record<string, string | undefined> = {
    name: data.name,
    fatherName: data.fatherName,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender ? t(data.gender) : undefined,
    address: data.address,
    district: data.district,
    state: data.state,
    pincode: data.pincode,
    aadhaarNumber: data.aadhaarNumber,
    panNumber: data.panNumber,
    voterIdNumber: data.voterIdNumber,
    drivingLicenseNumber: data.drivingLicenseNumber,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-foreground">{t('extractedData')}</h3>
        <div className="flex items-center gap-2">
          <CopyAllButton data={copyData} labels={copyLabels} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyJson}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-success" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                JSON
              </>
            )}
          </Button>
        </div>
      </div>

      {data.confidence && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-success font-medium">
            {Math.round(data.confidence * 100)}% Confidence
          </span>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.key}
            className={cn(
              'p-3 rounded-lg bg-secondary/50 border border-border/50 animate-fade-in',
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{field.label}:</span>
                <span className="font-medium text-foreground truncate" title={field.value}>{field.value}</span>
              </div>
              <CopyButton value={field.value || ''} />
            </div>
          </div>
        ))}
      </div>

      {/* JSON Preview */}
      <details className="group">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
          View raw JSON
        </summary>
        <pre className="mt-2 p-3 rounded-lg bg-muted text-xs overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}