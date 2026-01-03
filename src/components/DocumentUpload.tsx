import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface UploadedDocument {
  id: string;
  file: File;
  preview: string;
  type: 'aadhaar' | 'pan' | 'voterId' | 'drivingLicense' | 'other';
  status: 'uploading' | 'processing' | 'completed' | 'error';
}

interface DocumentUploadProps {
  documents: UploadedDocument[];
  onUpload: (files: File[]) => void;
  onRemove: (id: string) => void;
}

const documentTypeIcons: Record<string, React.ReactNode> = {
  aadhaar: <span className="text-lg">🪪</span>,
  pan: <span className="text-lg">💳</span>,
  voterId: <span className="text-lg">🗳️</span>,
  drivingLicense: <span className="text-lg">🚗</span>,
  other: <FileText className="h-5 w-5" />,
};

export function DocumentUpload({ documents, onUpload, onRemove }: DocumentUploadProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      onUpload(files);
    },
    [onUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        onUpload(files);
      }
    },
    [onUpload]
  );

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        className={cn(
          'upload-zone cursor-pointer',
          isDragging && 'upload-zone-active'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onChange={handleFileSelect}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center transition-all',
            isDragging 
              ? 'bg-primary text-primary-foreground scale-110' 
              : 'bg-primary/10 text-primary'
          )}>
            <Upload className="h-8 w-8" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-foreground">{t('dragDrop')}</p>
            <p className="text-muted-foreground">{t('or')}</p>
          </div>
          
          <Button variant="outline" size="lg" className="pointer-events-none">
            {t('browseFiles')}
          </Button>
          
          <p className="text-sm text-muted-foreground">{t('supportedFormats')}</p>
        </div>
      </div>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">Uploaded Documents</h3>
          <div className="grid gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  'floating-card p-4 flex items-center gap-4',
                  doc.status === 'error' && 'border-destructive'
                )}
              >
                {/* Thumbnail */}
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {doc.file.type.startsWith('image/') ? (
                    <img
                      src={doc.preview}
                      alt={doc.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {documentTypeIcons[doc.type]}
                    <p className="font-medium text-foreground truncate">{doc.file.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  {doc.status === 'uploading' && (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  {doc.status === 'processing' && (
                    <div className="flex items-center gap-2 text-primary">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">{t('processing')}</span>
                    </div>
                  )}
                  {doc.status === 'completed' && (
                    <div className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm">{t('completed')}</span>
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(doc.id);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Type Hints */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { key: 'aadhaar', icon: '🪪' },
          { key: 'panCard', icon: '💳' },
          { key: 'voterId', icon: '🗳️' },
          { key: 'drivingLicense', icon: '🚗' },
        ].map((docType) => (
          <div
            key={docType.key}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm"
          >
            <span>{docType.icon}</span>
            <span>{t(docType.key as any)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}