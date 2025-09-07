import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Volume2, 
  VolumeX,
  Maximize,
  Download,
  FileVideo,
  FileAudio,
  FileImage
} from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectData: any;
  projectName: string;
}

export function PreviewModal({ isOpen, onClose, projectData, projectName }: PreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const mockVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  const getAssetsByType = (type: 'video' | 'audio' | 'image') => {
    const assets: any[] = [];
    
    Object.values(projectData).forEach((phaseData: any) => {
      if (phaseData.outputs) {
        phaseData.outputs.forEach((output: string) => {
          if (
            (type === 'video' && output.includes('.mp4')) ||
            (type === 'audio' && output.includes('.mp3')) ||
            (type === 'image' && (output.includes('.jpg') || output.includes('.png')))
          ) {
            assets.push({
              name: output,
              url: type === 'video' ? mockVideoUrl : `https://example.com/${output}`,
              phase: Object.keys(projectData).find(key => projectData[key].outputs?.includes(output))
            });
          }
        });
      }
    });

    return assets;
  };

  const videoAssets = getAssetsByType('video');
  const audioAssets = getAssetsByType('audio');
  const imageAssets = getAssetsByType('image');

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileVideo className="h-5 w-5" />
            {projectName} - Film Preview
          </DialogTitle>
          <DialogDescription>
            Preview your AI-generated film with video clips, audio files, and images from all production phases.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Preview */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative bg-black aspect-video">
                  {videoAssets.length > 0 ? (
                    <video
                      src={videoAssets[0].url}
                      className="w-full h-full object-cover"
                      controls={false}
                      onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <FileVideo className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm opacity-75">No video content available yet</p>
                        <p className="text-xs opacity-50">Complete the video generation phases to see preview</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Custom Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsPlaying(!isPlaying)}
                        disabled={videoAssets.length === 0}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      
                      <Button size="sm" variant="secondary" disabled={videoAssets.length === 0}>
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      
                      <Button size="sm" variant="secondary" disabled={videoAssets.length === 0}>
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex-1 mx-4">
                        <div className="bg-white/20 h-1 rounded-full">
                          <div 
                            className="bg-white h-full rounded-full transition-all duration-300"
                            style={{ width: videoAssets.length > 0 ? '30%' : '0%' }}
                          />
                        </div>
                      </div>
                      
                      <span className="text-white text-sm tabular-nums">
                        {formatTime(currentTime)} / {formatTime(300)}
                      </span>
                      
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsMuted(!isMuted)}
                        disabled={videoAssets.length === 0}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      
                      <Button size="sm" variant="secondary" disabled={videoAssets.length === 0}>
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Film Information */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <h4 className="font-medium">Duration</h4>
                    <p className="text-sm text-muted-foreground">~5 minutes</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Scenes</h4>
                    <p className="text-sm text-muted-foreground">{videoAssets.length} generated</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Status</h4>
                    <Badge variant={videoAssets.length > 0 ? 'default' : 'secondary'}>
                      {videoAssets.length > 0 ? 'In Production' : 'Pre-Production'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assets Panel */}
          <div className="space-y-4">
            <Tabs defaultValue="video" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="video" className="text-xs">Video</TabsTrigger>
                <TabsTrigger value="audio" className="text-xs">Audio</TabsTrigger>
                <TabsTrigger value="images" className="text-xs">Images</TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Video Clips ({videoAssets.length})</h4>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {videoAssets.length > 0 ? (
                          videoAssets.map((asset, index) => (
                            <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                              <div className="flex items-center gap-2">
                                <FileVideo className="h-4 w-4 text-blue-500" />
                                <div>
                                  <p className="text-sm font-medium">{asset.name}</p>
                                  <p className="text-xs text-muted-foreground">Phase {asset.phase}</p>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost">
                                <Play className="h-3 w-3" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No video clips generated yet
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audio" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Audio Files ({audioAssets.length})</h4>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {audioAssets.length > 0 ? (
                          audioAssets.map((asset, index) => (
                            <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                              <div className="flex items-center gap-2">
                                <FileAudio className="h-4 w-4 text-green-500" />
                                <div>
                                  <p className="text-sm font-medium">{asset.name}</p>
                                  <p className="text-xs text-muted-foreground">Phase {asset.phase}</p>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost">
                                <Play className="h-3 w-3" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No audio files generated yet
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Images ({imageAssets.length})</h4>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {imageAssets.length > 0 ? (
                          imageAssets.map((asset, index) => (
                            <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                              <div className="flex items-center gap-2">
                                <FileImage className="h-4 w-4 text-purple-500" />
                                <div>
                                  <p className="text-sm font-medium">{asset.name}</p>
                                  <p className="text-xs text-muted-foreground">Phase {asset.phase}</p>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost">
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No images generated yet
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Export Options */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Export Options</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2" disabled={videoAssets.length === 0}>
                    <Download className="h-4 w-4" />
                    Export Final Film
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                    <Download className="h-4 w-4" />
                    Export Project Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}