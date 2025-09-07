import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { 
  Download, 
  Eye, 
  Play, 
  Pause, 
  Image, 
  FileText, 
  Video, 
  Volume2,
  FileIcon,
  ExternalLink
} from 'lucide-react';

interface OutputPreviewProps {
  outputs: Array<{
    type: string;
    filename: string;
    url?: string;
    metadata?: any;
    createdAt: string;
    size?: string;
    preview?: string;
  }>;
  phaseTitle: string;
}

export function OutputPreview({ outputs, phaseTitle }: OutputPreviewProps) {
  const [selectedOutput, setSelectedOutput] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!outputs || outputs.length === 0) {
    return null;
  }

  const getFileIcon = (type: string, filename: string) => {
    if (type === 'image' || filename.includes('.jpg') || filename.includes('.png')) {
      return <Image className="h-4 w-4" />;
    } else if (type === 'video' || filename.includes('.mp4')) {
      return <Video className="h-4 w-4" />;
    } else if (type === 'audio' || filename.includes('.mp3')) {
      return <Volume2 className="h-4 w-4" />;
    } else if (filename.includes('.json') || filename.includes('.txt')) {
      return <FileText className="h-4 w-4" />;
    }
    return <FileIcon className="h-4 w-4" />;
  };

  const getFileTypeColor = (type: string, filename: string) => {
    if (type === 'image' || filename.includes('.jpg') || filename.includes('.png')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    } else if (type === 'video' || filename.includes('.mp4')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    } else if (type === 'audio' || filename.includes('.mp3')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    } else if (filename.includes('.json') || filename.includes('.txt')) {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const formatFileSize = (size: any) => {
    if (typeof size === 'number') {
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
      if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
      return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    return size || 'Unknown';
  };

  const renderPreview = (output: any) => {
    if (!output.url && !output.preview) {
      return (
        <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
          <p className="text-muted-foreground">No preview available</p>
        </div>
      );
    }

    const url = output.preview || output.url;
    
    if (output.type === 'image' || output.filename.includes('.jpg') || output.filename.includes('.png')) {
      return (
        <div className="relative">
          <img 
            src={url} 
            alt={output.filename}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(output.filename)}`;
            }}
          />
        </div>
      );
    } else if (output.type === 'video' || output.filename.includes('.mp4')) {
      return (
        <div className="relative">
          <video 
            src={url} 
            className="w-full h-48 rounded-lg"
            controls
            preload="metadata"
            onError={(e) => {
              console.error('Video load error:', e);
            }}
          />
        </div>
      );
    } else if (output.type === 'audio' || output.filename.includes('.mp3')) {
      return (
        <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
          <div className="text-center space-y-4">
            <Volume2 className="h-12 w-12 mx-auto text-muted-foreground" />
            <audio 
              src={url} 
              controls 
              className="w-full max-w-md"
              onError={(e) => {
                console.error('Audio load error:', e);
              }}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
          <div className="text-center space-y-2">
            {getFileIcon(output.type, output.filename)}
            <p className="text-sm text-muted-foreground">{output.filename}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Generated Outputs ({outputs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 w-full pr-4">
          <div className="space-y-3">
            {outputs.map((output, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(output.type, output.filename)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{output.filename}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getFileTypeColor(output.type, output.filename)}`}
                      >
                        {output.type || 'file'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(output.size)}
                      </span>
                      {output.metadata && (
                        <span className="text-xs text-muted-foreground">
                          • {new Date(output.createdAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(output.url || output.preview) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOutput(output)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  {output.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (output.url.startsWith('data:')) {
                          // Download data URL
                          const link = document.createElement('a');
                          link.href = output.url;
                          link.download = output.filename;
                          link.click();
                        } else {
                          // Open external URL
                          window.open(output.url, '_blank');
                        }
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Preview Dialog */}
        <Dialog open={!!selectedOutput} onOpenChange={() => setSelectedOutput(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            {selectedOutput && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {getFileIcon(selectedOutput.type, selectedOutput.filename)}
                    {selectedOutput.filename}
                  </DialogTitle>
                  <DialogDescription>
                    Preview of generated {selectedOutput.type} file from the AI film production pipeline.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  {renderPreview(selectedOutput)}
                  
                  {selectedOutput.metadata && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Metadata</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Created: {new Date(selectedOutput.createdAt).toLocaleString()}</div>
                        <div>Size: {formatFileSize(selectedOutput.size)}</div>
                        {selectedOutput.metadata.prompt && (
                          <div className="col-span-2">
                            <span className="font-medium">Prompt: </span>
                            {selectedOutput.metadata.prompt}
                          </div>
                        )}
                        {selectedOutput.metadata.duration && (
                          <div>Duration: {selectedOutput.metadata.duration}s</div>
                        )}
                        {selectedOutput.metadata.dimensions && (
                          <div>Dimensions: {selectedOutput.metadata.dimensions}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}