import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { 
  X, 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  FileText, 
  Sparkles, 
  Eye,
  Share,
  Film,
  Settings,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';

interface EnhancedVideoPlayerProps {
  output: any;
  screenplay: any;
  onClose: () => void;
  onDownload?: () => void;
}

export function EnhancedVideoPlayer({ output, screenplay, onClose, onDownload }: EnhancedVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([50]);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume[0] / 100;
      video.playbackRate = playbackRate;
      
      const updateTime = () => setCurrentTime(video.currentTime);
      const updateDuration = () => setDuration(video.duration);
      
      video.addEventListener('timeupdate', updateTime);
      video.addEventListener('loadedmetadata', updateDuration);
      video.addEventListener('ended', () => setIsPlaying(false));
      
      return () => {
        video.removeEventListener('timeupdate', updateTime);
        video.removeEventListener('loadedmetadata', updateDuration);
        video.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, [volume, playbackRate]);

  const handlePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (video && duration) {
      video.currentTime = (value[0] / 100) * duration;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value[0] / 100;
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (container) {
      if (!document.fullscreenElement) {
        container.requestFullscreen?.().then(() => {
          setIsFullscreen(true);
        }).catch(() => {
          toast.error('Fullscreen not supported');
        });
      } else {
        document.exitFullscreen?.().then(() => {
          setIsFullscreen(false);
        }).catch(() => {
          toast.error('Could not exit fullscreen');
        });
      }
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (event.key.toLowerCase()) {
        case ' ':
        case 'k':
          event.preventDefault();
          handlePlay();
          break;
        case 'm':
          event.preventDefault();
          handleMute();
          break;
        case 'f':
          event.preventDefault();
          handleFullscreen();
          break;
        case 'arrowleft':
          event.preventDefault();
          if (videoRef.current && duration > 0) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          }
          break;
        case 'arrowright':
          event.preventDefault();
          if (videoRef.current && duration > 0) {
            videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [duration]);

  const handleDownload = () => {
    const url = output.url || output.audioUrl || output.videoUrl || output.image;
    if (url) {
      try {
        const link = document.createElement('a');
        link.href = url;
        
        // Create relevant filename based on screenplay content
        const sceneSlug = output.scene?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'scene';
        const characterSlug = output.character?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || '';
        const timestamp = new Date().toISOString().split('T')[0];
        
        // Handle screenplay title from different data structures
        const screenplayTitle = screenplay?.parsed?.title || screenplay?.title || 'film';
        let filename = `reelchemist_${screenplayTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${sceneSlug}`;
        if (characterSlug) filename += `_${characterSlug}`;
        filename += `_${timestamp}`;
        
        // Add appropriate extension
        if (output.type.includes('video')) {
          filename += '.mp4';
        } else if (output.type.includes('audio')) {
          filename += '.mp3';
        } else if (output.type.includes('image')) {
          filename += '.png';
        } else {
          filename += '.json';
        }
        
        link.download = filename;
        link.click();
        
        toast.success('🚀 Download Started', {
          description: `Downloading "${filename}" from your ${screenplay?.parsed?.title || screenplay?.title || 'film'} production!`
        });
        
        if (onDownload) onDownload();
      } catch (error) {
        toast.error('💾 Download Failed', {
          description: 'Could not download the file'
        });
      }
    } else {
      toast.error('📁 No File Available', {
        description: 'This output doesn\'t have a downloadable file'
      });
    }
  };

  const handleShare = () => {
    if (navigator.share && output.url) {
      navigator.share({
        title: `${screenplay?.parsed?.title || screenplay?.title || 'ReelChemist'} - ${output.character || output.scene || 'Asset'}`,
        text: `Check out this cinematic asset from my ${screenplay?.parsed?.title || screenplay?.title || 'film'} production!`,
        url: output.url
      }).catch(() => {
        // Fallback to copying to clipboard
        navigator.clipboard?.writeText(output.url);
        toast.success('🔗 Link Copied', {
          description: 'Asset link copied to clipboard!'
        });
      });
    } else if (output.url) {
      navigator.clipboard?.writeText(output.url);
      toast.success('🔗 Link Copied', {
        description: 'Asset link copied to clipboard!'
      });
    }
  };

  const getRelevantSceneInfo = () => {
    if (!screenplay || !output.scene) return null;
    
    // Handle both parsed screenplay structure and direct screenplay data
    const screenplayData = screenplay.parsed || screenplay;
    
    const scene = screenplay.scenes?.find((s: any) => s.name === output.scene) ||
                 screenplayData?.scenes?.find((s: any) => s.name === output.scene);
    const dialogue = screenplay.parsed?.dialogue?.filter((d: any) => d.scene === output.scene) ||
                    screenplayData?.dialogue?.filter((d: any) => d.scene === output.scene);
    const characters = screenplay.characters || screenplayData?.characters || [];
    
    return { scene, dialogue, characters };
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
      case 'final_video': return '🏆';
      case 'video_clip':
      case 'processed_video':
      case 'assembled_video': return '🎬';
      case 'character': return '👤';
      case 'scene': return '🎭';
      case 'dialogue_audio': return '🎵';
      case 'parsed_screenplay': return '📝';
      default: return '✨';
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const relevantInfo = getRelevantSceneInfo();

  const renderVideoPlayer = () => {
    if (!output.videoUrl && !output.url?.includes('video')) return null;

    const videoUrl = output.videoUrl || output.url;

    return (
      <div ref={containerRef} className="relative group">
        <div className="relative rounded-xl overflow-hidden glass-effect glow-border">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full aspect-video object-cover bg-black"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            muted={isMuted}
            poster={output.thumbnail || output.thumbnailUrl}
            playsInline
          />
          
          {/* Custom Controls Overlay */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {/* Play/Pause Overlay */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                onClick={handlePlay}
              >
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center animate-glow">
                  <Play className="h-10 w-10 text-white ml-1" />
                </div>
              </div>
            )}
            
            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-3">
                <Slider
                  value={[duration ? (currentTime / duration) * 100 : 0]}
                  onValueChange={handleSeek}
                  className="w-full"
                  step={0.1}
                />
                <div className="flex justify-between text-xs text-white/80 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              
              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (videoRef.current && duration > 0) {
                        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                      }
                    }}
                    className="text-white hover:bg-white/10"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlay}
                    className="text-white hover:bg-white/10"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (videoRef.current && duration > 0) {
                        videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
                      }
                    }}
                    className="text-white hover:bg-white/10"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMute}
                    className="text-white hover:bg-white/10"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  
                  <div className="w-20">
                    <Slider
                      value={volume}
                      onValueChange={handleVolumeChange}
                      className="w-full"
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
                      const currentIndex = rates.indexOf(playbackRate);
                      const nextRate = rates[(currentIndex + 1) % rates.length];
                      setPlaybackRate(nextRate);
                    }}
                    className="text-white hover:bg-white/10 text-xs px-2"
                  >
                    {playbackRate}x
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFullscreen}
                    className="text-white hover:bg-white/10"
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSceneContext = () => {
    if (!relevantInfo?.scene) return null;

    return (
      <div className="space-y-4">
        <h4 className="font-semibold flex items-center space-x-2">
          <span className="text-lg">🎬</span>
          <span>Scene Context from "{screenplay?.parsed?.title || screenplay?.title}"</span>
        </h4>
        
        <div className="grid gap-4">
          <div className="p-4 glass-effect rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <span className="text-lg">🎭</span>
              </div>
              <div>
                <h5 className="font-semibold">{relevantInfo.scene.name}</h5>
                <p className="text-sm text-muted-foreground">Scene Setting</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Setting:</strong> {relevantInfo.scene.setting}</p>
              <p><strong>Mood:</strong> {relevantInfo.scene.mood}</p>
              {relevantInfo.scene.description && (
                <p><strong>Action:</strong> {relevantInfo.scene.description}</p>
              )}
            </div>
          </div>
          
          {relevantInfo.characters && relevantInfo.characters.length > 0 && (
            <div className="p-4 glass-effect rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <h5 className="font-semibold mb-3 flex items-center space-x-2">
                <span className="text-lg">👥</span>
                <span>Characters in Scene</span>
              </h5>
              <div className="space-y-2">
                {relevantInfo.characters.map((character: any, index: number) => (
                  <div key={index} className="text-sm">
                    <strong className="text-purple-400">{character.name}:</strong> {character.description}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {relevantInfo.dialogue && relevantInfo.dialogue.length > 0 && (
            <div className="p-4 glass-effect rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <h5 className="font-semibold mb-3 flex items-center space-x-2">
                <span className="text-lg">💬</span>
                <span>Scene Dialogue</span>
              </h5>
              <div className="space-y-3">
                {relevantInfo.dialogue.slice(0, 3).map((line: any, index: number) => (
                  <div key={index} className="text-sm p-3 bg-black/20 rounded-lg">
                    <div className="font-semibold text-green-400 mb-1">{line.character}</div>
                    <div className="italic">"{line.text}"</div>
                    {line.emotion && (
                      <div className="text-xs text-muted-foreground mt-1">Emotion: {line.emotion}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto glass-effect glow-border">
        <CardHeader className={`bg-gradient-to-r ${getTypeGradient(output.type)} border-b border-border/50`}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl flex items-center space-x-3">
                <span className="text-2xl">{getTypeIcon(output.type)}</span>
                <span>{output.character || output.scene || 'Asset Preview'}</span>
                {(screenplay?.parsed?.title || screenplay?.title) && (
                  <Badge variant="outline" className="ml-2 glass-effect">
                    from "{screenplay?.parsed?.title || screenplay?.title}"
                  </Badge>
                )}
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
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleShare}
                    className="glass-effect border-border/50 hover:border-blue-500/50"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownload}
                    className="glass-effect border-border/50 hover:border-amber-500/50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </>
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
        
        <CardContent className="p-6 space-y-8">
          {/* Video Player */}
          {renderVideoPlayer()}
          
          {/* Audio Player */}
          {(output.audioUrl || (output.url && output.type.includes('audio'))) && (
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
                  src={output.audioUrl || output.url}
                  controls
                  className="w-full"
                />
              </div>
            </div>
          )}
          
          {/* Image Preview */}
          {(output.image || (output.url && (output.type.includes('character') || output.type.includes('scene')))) && (
            <div className="space-y-6">
              <div className="relative group">
                <img
                  src={output.image || output.url}
                  alt={output.character || output.scene}
                  className="w-full rounded-xl glass-effect glow-border max-h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Scene Context */}
          {renderSceneContext()}
          
          {/* Enhanced Metadata */}
          <div className="p-6 glass-effect rounded-xl border border-border/30 space-y-4">
            <h5 className="font-semibold flex items-center space-x-2">
              <span className="text-lg">📋</span>
              <span>Production Details</span>
            </h5>
            
            <div className="grid gap-4">
              {output.prompt && (
                <div className="space-y-1">
                  <span className="text-sm font-medium text-amber-400">Generation Prompt:</span>
                  <p className="text-sm text-muted-foreground bg-black/20 p-3 rounded-lg">{output.prompt}</p>
                </div>
              )}
              
              {output.videoDescription && (
                <div className="space-y-1">
                  <span className="text-sm font-medium text-blue-400">Video Description:</span>
                  <p className="text-sm text-muted-foreground bg-black/20 p-3 rounded-lg">{output.videoDescription}</p>
                </div>
              )}
              
              {output.cameraInstructions && (
                <div className="space-y-1">
                  <span className="text-sm font-medium text-purple-400">Camera Instructions:</span>
                  <p className="text-sm text-muted-foreground bg-black/20 p-3 rounded-lg">{output.cameraInstructions}</p>
                </div>
              )}
              
              {output.lighting && (
                <div className="space-y-1">
                  <span className="text-sm font-medium text-cyan-400">Lighting Setup:</span>
                  <p className="text-sm text-muted-foreground bg-black/20 p-3 rounded-lg">{output.lighting}</p>
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
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {output.duration && (
                  <div className="text-center p-3 glass-effect rounded-lg">
                    <div className="text-lg font-bold text-amber-400">⏱️</div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="text-xs text-foreground">{output.duration}s</div>
                  </div>
                )}
                {output.fileSize && (
                  <div className="text-center p-3 glass-effect rounded-lg">
                    <div className="text-lg font-bold text-green-400">📁</div>
                    <div className="text-sm text-muted-foreground">Size</div>
                    <div className="text-xs text-foreground">{output.fileSize}</div>
                  </div>
                )}
                {output.generatedBy && (
                  <div className="text-center p-3 glass-effect rounded-lg">
                    <div className="text-lg font-bold text-blue-400">🤖</div>
                    <div className="text-sm text-muted-foreground">AI Model</div>
                    <div className="text-xs text-foreground">{output.generatedBy}</div>
                  </div>
                )}
                {(screenplay?.parsed?.title || screenplay?.title) && (
                  <div className="text-center p-3 glass-effect rounded-lg">
                    <div className="text-lg font-bold text-purple-400">🎬</div>
                    <div className="text-sm text-muted-foreground">Film</div>
                    <div className="text-xs text-foreground truncate">{screenplay?.parsed?.title || screenplay?.title}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}