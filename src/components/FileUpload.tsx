import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileCheck } from 'lucide-react';
import { csvDataLoader } from '@/services/csvDataLoader';

interface FileUploadProps {
  onDataLoaded: (trainCount: number, sectionCount: number) => void;
}

export const FileUpload = ({ onDataLoaded }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setIsLoading(true);
    try {
      const text = await file.text();
      
      // Process the CSV data
      await csvDataLoader.loadFromText(text);
      const trains = csvDataLoader.getTrainsData();
      const sections = csvDataLoader.getSectionsData();
      
      setUploadedFile(file.name);
      onDataLoaded(trains.length, sections.length);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing CSV file');
    } finally {
      setIsLoading(false);
    }
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  return (
    <Card className="control-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Data Source
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
              ${isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
              ${uploadedFile ? 'border-success bg-success/10' : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
          >
            {uploadedFile ? (
              <div className="flex items-center justify-center gap-2 text-success">
                <FileCheck className="h-6 w-6" />
                <span className="font-mono">{uploadedFile}</span>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop CSV file here or click to browse
                </p>
                <Label htmlFor="file-upload">
                  <Button variant="outline" size="sm" disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Browse Files'}
                  </Button>
                </Label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileInput}
                  disabled={isLoading}
                />
              </>
            )}
          </div>
          
          {uploadedFile && (
            <div className="text-xs text-muted-foreground font-mono">
              <p>✓ Railway traffic data loaded successfully</p>
              <p>• Supported format: CSV with train, section, and status data</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};