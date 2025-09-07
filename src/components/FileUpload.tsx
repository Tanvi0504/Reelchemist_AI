import { useState, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (content: string, filename: string) => void;
  onTextInput: (content: string) => void;
  isProcessing?: boolean;
  acceptedFormats?: string[];
}

export function FileUpload({ 
  onFileUpload, 
  onTextInput, 
  isProcessing = false,
  acceptedFormats = ['.txt', '.docx', '.pdf']
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setUploadedFile(file);
    setUploadStatus('idle');

    try {
      const text = await readFileContent(file);
      setUploadStatus('success');
      onFileUpload(text, file.name);
    } catch (error) {
      console.error('Error reading file:', error);
      setUploadStatus('error');
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        // Validate file content
        if (!result || result.trim().length === 0) {
          reject(new Error('File appears to be empty'));
          return;
        }

        // Basic screenplay format validation
        const hasDialogue = /^[A-Z\s]+$/m.test(result.split('\n').slice(0, 10).join('\n'));
        const hasSceneHeading = /^(INT\.|EXT\.|FADE)/m.test(result);
        
        if (!hasDialogue && !hasSceneHeading && result.length > 100) {
          console.warn('File may not be in standard screenplay format');
        }

        resolve(result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      // Handle different file types
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        reader.readAsText(file, 'UTF-8');
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // For PDF files, you'd need a PDF parser library like pdf-parse
        resolve(`PDF parsing not implemented in this demo. Please:
1. Convert your PDF to .txt format
2. Or copy and paste the text content directly
3. Ensure the screenplay follows standard format

Example format:
FADE IN:

INT. LOCATION - TIME

CHARACTER
Dialogue text here.

Action description.

FADE OUT.`);
      } else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // For DOCX files, you'd need a library like mammoth
        resolve(`DOCX parsing not implemented in this demo. Please:
1. Save your document as .txt format  
2. Or copy and paste the text content directly
3. Ensure the screenplay follows standard format`);
      } else {
        // Try to read as text anyway
        reader.readAsText(file, 'UTF-8');
      }
    });
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTextSubmit = () => {
    if (textContent.trim()) {
      onTextInput(textContent);
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="text">Paste Text</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple={false}
                accept={acceptedFormats.join(',')}
                onChange={handleFileInput}
                className="hidden"
              />

              {uploadedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-primary" />
                    {getStatusIcon()}
                  </div>
                  <div>
                    <h3 className="font-medium">{uploadedFile.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeFile}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      size="sm"
                      variant="secondary"
                    >
                      Choose Different File
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {isProcessing ? (
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    ) : (
                      <Upload className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">Drop your screenplay here</h3>
                    <p className="text-sm text-muted-foreground">
                      or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary hover:underline"
                        disabled={isProcessing}
                      >
                        browse files
                      </button>
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {acceptedFormats.map((format) => (
                      <Badge key={format} variant="outline" className="text-xs">
                        {format.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {uploadStatus === 'error' && (
              <div className="text-sm text-red-600 text-center p-3 bg-red-50 dark:bg-red-950/20 rounded">
                Failed to read file. Please try again or use a different format.
                <br />
                <span className="text-xs">Supported: .txt files with UTF-8 encoding</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Paste your screenplay text</label>
              <Textarea
                placeholder={`FADE IN:

INT. MAYA'S FLAT - NIGHT

Maya sits on the floor, eating ice cream directly from the container. Her phone buzzes with a notification from SWYPR.

MAYA
Yaar, mujhe samajh nahi aata...

She opens the app and sees a profile picture of someone who looks exactly like her.`}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Use standard screenplay formatting for best results
              </p>
            </div>
            <Button 
              onClick={handleTextSubmit} 
              disabled={!textContent.trim() || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Process Screenplay
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}