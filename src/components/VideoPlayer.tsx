import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Download, Play, Pause, Volume2, VolumeX, FileText, Sparkles, Eye } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';

interface VideoPlayerProps {
  output: any;
  onClose: () => void;
}

export function VideoPlayer({ output, onClose }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleDownload = () => {
    const url = output.url || output.audioUrl || output.videoUrl || output.image;
    if (url) {
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${output.type}_${output.character || output.scene || 'output'}`;
        link.click();
        toast.success('🚀 Download Started', {
          description: 'Your cinematic asset is downloading!'
        });
      } catch (error) {
        toast.error('📁 Download Failed', {
          description: 'Could not download the file'
        });
      }
    } else {
      toast.error('📁 No File Available', {
        description: 'This output doesn\'t have a downloadable file'
      });
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'parsed_screenplay':
      case 'extracted_data':
        return 'from-blue-500/10 to-cyan-500/10';
      case 'character':
      case 'scene':
        return 'from-purple-500/10 to-pink-500/10';
      case 'dialogue_audio':
        return 'from-green-500/10 to-emerald-500/10';
      case 'video_clip':
      case 'processed_video':
      case 'overlay_video':
        return 'from-orange-500/10 to-red-500/10';
      case 'assembled_video':
      case 'synced_video':
      case 'final_video':
        return 'from-amber-500/10 to-yellow-500/10';
      default:
        return 'from-gray-500/10 to-gray-600/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'final_video':
        return '🏆';
      case 'video_clip':
      case 'processed_video':
      case 'assembled_video':
        return '🎬';
      case 'character':
        return '👤';
      case 'scene':
        return '🎭';
      case 'dialogue_audio':
        return '🎵';
      case 'parsed_screenplay':
        return '📝';
      default:
        return '✨';
    }
  };

  const renderContent = () => {
    // Video content
    if (output.videoUrl || (output.url && output.type.includes('video'))) {
      const videoUrl = output.videoUrl || output.url;
      return (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden glass-effect glow-border">
            <video
              src={videoUrl}
              controls
              className="w-full aspect-video object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              muted={isMuted}
              poster={output.thumbnail}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
                className="glass-effect opacity-80 hover:opacity-100"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Play className="h-8 w-8 text-white ml-1" />
                </div>
              </div>
            )}
          </div>
          
          {/* Video Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {output.duration && (
              <div className="p-3 glass-effect rounded-lg">
                <div className="text-lg font-bold text-amber-400">⏱️</div>
                <div className="text-sm text-muted-foreground">Duration</div>
                <div className="text-xs text-foreground">{output.duration}s</div>
              </div>
            )}
            {output.scene && (
              <div className="p-3 glass-effect rounded-lg">
                <div className="text-lg font-bold text-purple-400">🎬</div>
                <div className="text-sm text-muted-foreground">Scene</div>
                <div className="text-xs text-foreground truncate">{output.scene}</div>
              </div>
            )}
            {output.effects && (
              <div className="p-3 glass-effect rounded-lg">
                <div className="text-lg font-bold text-cyan-400">✨</div>
                <div className="text-sm text-muted-foreground">Effects</div>
                <div className="text-xs text-foreground">{output.effects.length} applied</div>
              </div>
            )}
            {output.fileSize && (
              <div className="p-3 glass-effect rounded-lg">
                <div className="text-lg font-bold text-green-400">📁</div>
                <div className="text-sm text-muted-foreground">Size</div>
                <div className="text-xs text-foreground">{output.fileSize}</div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Audio content
    if (output.audioUrl || (output.url && output.type.includes('audio'))) {
      const audioUrl = output.audioUrl || output.url;
      return (
        <div className="space-y-6">
          <div className="text-center p-8 glass-effect rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-glow">
              <div className="text-3xl">🎵</div>
            </div>
            <h3 className="text-xl font-bold mb-2">{output.character}</h3>
            <div className="max-w-md mx-auto p-4 glass-effect rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Dialogue</p>
              <p className="font-medium italic">"{output.text}"</p>
            </div>
          </div>
          
          <div className="glass-effect glow-border rounded-xl p-4">
            <audio
              src={audioUrl}
              controls
              className="w-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        </div>
      );
    }

    // Image content
    if (output.image || (output.url && (output.type.includes('character') || output.type.includes('scene')))) {
      const imageUrl = output.image || output.url;
      return (
        <div className="space-y-6">
          <div className="relative group">
            <img
              src={imageUrl}
              alt={output.character || output.scene}
              className="w-full rounded-xl glass-effect glow-border"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-4 left-4">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="grid gap-4">
            {output.character && (
              <div className="p-6 glass-effect rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{output.character}</h4>
                    <p className="text-sm text-muted-foreground">Character Sheet</p>
                  </div>
                </div>
                <p className="text-sm text-foreground">{output.description}</p>
              </div>
            )}
            
            {output.scene && (
              <div className="p-6 glass-effect rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-lg">🎭</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{output.scene}</h4>
                    <p className="text-sm text-muted-foreground">Scene Reference</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Setting:</strong> {output.setting}</p>
                  <p className="text-sm"><strong>Mood:</strong> {output.mood}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // JSON/Text content
    if (output.data || output.type === 'parsed_screenplay') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-6 glass-effect rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {output.data?.characters?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Characters</div>
            </div>
            <div className="text-center p-6 glass-effect rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {output.data?.scenes?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Scenes</div>
            </div>
            <div className="text-center p-6 glass-effect rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {output.data?.dialogue?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Dialogue Lines</div>
            </div>
          </div>
          
          {output.data?.characters && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center space-x-2">
                <span className="text-lg">👥</span>
                <span>Characters</span>
              </h4>
              <div className="grid gap-3">
                {output.data.characters.slice(0, 5).map((char: any, index: number) => (
                  <div key={index} className="p-4 glass-effect rounded-lg">
                    <div className="font-semibold text-purple-400 mb-1">{char.name}</div>
                    <div className="text-sm text-muted-foreground">{char.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center space-x-2">
              <span className="text-lg">🔧</span>
              <span>Raw JSON Data</span>
            </h4>
            <div className="glass-effect rounded-xl overflow-hidden">
              <Textarea
                value={JSON.stringify(output.data, null, 2)}
                readOnly
                rows={12}
                className="font-mono text-xs bg-transparent border-0 resize-none"
              />
            </div>
          </div>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center">
          <FileText className="h-10 w-10 text-muted-foreground opacity-50" />
        </div>
        <h4 className="font-semibold text-muted-foreground mb-2">Preview Not Available</h4>
        <p className="text-sm text-muted-foreground">
          This asset type cannot be previewed in the browser
        </p>
        <Badge variant="outline" className="mt-2">{output.type}</Badge>
      </div>
    );
  };

  return (
    <Card className="w-full glass-effect glow-border">
      <CardHeader className={`bg-gradient-to-r ${getTypeGradient(output.type)} border-b border-border/50`}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl flex items-center space-x-3">
              <span className="text-2xl">{getTypeIcon(output.type)}</span>
              <span>{output.character || output.scene || 'Asset Preview'}</span>
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="glass-effect">
                {output.type.replace(/_/g, ' ').toUpperCase()}
              </Badge>
              {output.timestamp && (
                <span className="text-xs text-muted-foreground">
                  Generated {new Date(output.timestamp).toLocaleString()}
                </span>
              )}
              {output.type === 'final_video' && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium animate-glow">
                  <Sparkles className="h-3 w-3 mr-1" />
                  FINAL CUT
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {(output.url || output.audioUrl || output.videoUrl || output.image) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                className="glass-effect border-border/50 hover:border-amber-500/50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="glass-effect hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {renderContent()}
        
        {/* Enhanced Metadata */}
        {(output.prompt || output.effects || output.duration || output.exportSettings) && (
          <div className="mt-8 p-6 glass-effect rounded-xl border border-border/30 space-y-4">
            <h5 className="font-semibold flex items-center space-x-2">
              <span className="text-lg">📋</span>
              <span>Asset Details</span>
            </h5>
            
            <div className="grid gap-3">
              {output.prompt && (
                <div className="space-y-1">
                  <span className="text-sm font-medium text-amber-400">Generation Prompt:</span>
                  <p className="text-sm text-muted-foreground bg-black/20 p-3 rounded-lg">{output.prompt}</p>
                </div>
              )}
              
              {output.effects && output.effects.length > 0 && (
                <div className="space-y-1">
                  <span className="text-sm font-medium text-purple-400">Applied Effects:</span>
                  <div className="flex flex-wrap gap-2">
                    {output.effects.map((effect: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs glass-effect">
                        ✨ {effect}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {output.exportSettings && (
                <div className="space-y-1">
                  <span className="text-sm font-medium text-green-400">Export Settings:</span>
                  <div className="text-sm text-muted-foreground bg-black/20 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Resolution: {output.exportSettings.resolution}</div>
                      <div>Format: {output.exportSettings.format?.toUpperCase()}</div>
                      <div>Quality: {output.exportSettings.quality}</div>
                      <div>FPS: {output.exportSettings.fps}</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
                <span>Asset ID: {output.type}_{Date.now()}</span>
                {output.fileSize && <span>File Size: {output.fileSize}</span>}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}