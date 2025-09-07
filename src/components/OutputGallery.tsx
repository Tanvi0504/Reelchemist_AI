import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Image as ImageIcon, Video, Music, FileText, Download, Eye, Play, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface OutputGalleryProps {
  phaseOutputs: Record<number, any[]>;
  onSelectOutput: (output: any) => void;
}

export function OutputGallery({ phaseOutputs, onSelectOutput }: OutputGalleryProps) {
  const getOutputIcon = (type: string) => {
    switch (type) {
      case 'parsed_screenplay':
      case 'extracted_data':
        return <FileText className="h-4 w-4" />;
      case 'character':
      case 'scene':
        return <ImageIcon className="h-4 w-4" />;
      case 'dialogue_audio':
        return <Music className="h-4 w-4" />;
      case 'video_clip':
      case 'processed_video':
      case 'overlay_video':
      case 'assembled_video':
      case 'synced_video':
      case 'final_video':
        return <Video className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getOutputTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'parsed_screenplay': '📝 Screenplay JSON',
      'extracted_data': '🎭 Scene Data',
      'character': '👤 Character Sheet',
      'scene': '🎬 Scene Reference',
      'dialogue_audio': '🎵 Dialogue Audio',
      'video_clip': '🎥 Video Clip',
      'processed_video': '✨ Processed Video',
      'overlay_video': '📱 Video with UI',
      'assembled_video': '🎞️ Assembled Video',
      'synced_video': '🔊 Synced Video',
      'final_video': '🏆 Final Cut'
    };
    return labels[type] || type;
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'parsed_screenplay':
      case 'extracted_data':
        return 'from-blue-500/10 to-cyan-500/10 border-blue-500/20';
      case 'character':
      case 'scene':
        return 'from-purple-500/10 to-pink-500/10 border-purple-500/20';
      case 'dialogue_audio':
        return 'from-green-500/10 to-emerald-500/10 border-green-500/20';
      case 'video_clip':
      case 'processed_video':
      case 'overlay_video':
        return 'from-orange-500/10 to-red-500/10 border-orange-500/20';
      case 'assembled_video':
      case 'synced_video':
      case 'final_video':
        return 'from-amber-500/10 to-yellow-500/10 border-amber-500/20';
      default:
        return 'from-gray-500/10 to-gray-600/10 border-gray-500/20';
    }
  };

  const downloadOutput = (output: any) => {
    const url = output.url || output.audioUrl || output.videoUrl || output.image;
    if (url) {
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${output.type}_${output.character || output.scene || 'output'}.${getFileExtension(output.type)}`;
        link.click();
        toast.success('🚀 Download Started', {
          description: `Downloading ${output.character || output.scene || 'output'}...`
        });
      } catch (error) {
        toast.error('❌ Download Failed', {
          description: 'Could not download the file'
        });
      }
    } else {
      toast.error('📁 No File Available', {
        description: 'This output doesn\'t have a downloadable file'
      });
    }
  };

  const getFileExtension = (type: string) => {
    if (type.includes('audio')) return 'mp3';
    if (type.includes('video')) return 'mp4';
    if (type.includes('character') || type.includes('scene')) return 'png';
    return 'json';
  };

  const allOutputs = Object.entries(phaseOutputs).flatMap(([phaseId, outputs]) =>
    outputs.map(output => ({ ...output, phaseId: parseInt(phaseId) }))
  );

  if (allOutputs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-muted-foreground opacity-50" />
        </div>
        <h4 className="font-semibold text-muted-foreground mb-2">No Assets Yet</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Complete phases to see your generated cinematic assets here
        </p>
        <div className="text-xs text-muted-foreground">
          🎬 Videos • 🎵 Audio • 📸 Images • 📄 Data
        </div>
      </div>
    );
  }

  // Group outputs by phase
  const outputsByPhase = allOutputs.reduce((acc, output) => {
    const phase = output.phaseId;
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(output);
    return acc;
  }, {} as Record<number, any[]>);

  const phaseNames = [
    'Screenplay Parsing',
    'Character & Scene Design', 
    'Dialogue Audio',
    'Video Generation',
    'Visual Effects',
    'UI Overlays',
    'Video Assembly',
    'Audio Sync',
    'Final Export'
  ];

  return (
    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 -mr-2">
      {Object.entries(outputsByPhase)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([phaseId, outputs]) => (
          <div key={phaseId} className="space-y-3">
            <div className="sticky top-0 bg-background/80 backdrop-blur-sm py-2 -mx-2 px-2 z-10">
              <h4 className="text-sm font-semibold flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-xs font-bold text-black">
                  {phaseId}
                </div>
                <span>{phaseNames[parseInt(phaseId) - 1]}</span>
                <Badge variant="outline" className="text-xs">
                  {outputs.length} assets
                </Badge>
              </h4>
            </div>
            
            <div className="space-y-3">
              {outputs.map((output, index) => (
                <Card key={index} className={`glass-effect transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r ${getTypeGradient(output.type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between space-x-4">
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                          {getOutputIcon(output.type)}
                        </div>
                        
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-sm truncate">
                              {output.character || output.scene || output.text?.substring(0, 30) + '...' || 'Generated Asset'}
                            </span>
                          </div>
                          
                          <Badge variant="outline" className="text-xs glass-effect">
                            {getOutputTypeLabel(output.type)}
                          </Badge>
                          
                          {output.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {output.description}
                            </p>
                          )}
                          
                          {output.timestamp && (
                            <p className="text-xs text-muted-foreground">
                              ⏰ {new Date(output.timestamp).toLocaleTimeString()}
                            </p>
                          )}

                          {/* Special info for different types */}
                          {output.duration && (
                            <p className="text-xs text-amber-400">
                              ⏱️ {output.duration}s duration
                            </p>
                          )}
                          
                          {output.effects && output.effects.length > 0 && (
                            <p className="text-xs text-purple-400">
                              ✨ Effects: {output.effects.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectOutput(output)}
                          className="h-8 w-8 p-0 glass-effect hover:bg-white/20"
                          title="Preview"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        
                        {(output.url || output.audioUrl || output.videoUrl || output.image) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadOutput(output)}
                            className="h-8 w-8 p-0 glass-effect hover:bg-white/20"
                            title="Download"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Enhanced Previews */}
                    {output.image && (
                      <div className="mt-3 cursor-pointer" onClick={() => onSelectOutput(output)}>
                        <div className="relative group">
                          <img 
                            src={output.image} 
                            alt={output.character || output.scene}
                            className="w-full h-24 object-cover rounded-lg border border-white/10"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                            <Eye className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {(output.videoUrl || output.url?.includes('video')) && (
                      <div className="mt-3 cursor-pointer" onClick={() => onSelectOutput(output)}>
                        <div className="relative group bg-black/20 rounded-lg h-24 flex items-center justify-center border border-white/10">
                          <Play className="h-8 w-8 text-white/70 group-hover:text-white group-hover:scale-110 transition-all" />
                          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                            {output.duration ? `${output.duration}s` : 'Video'}
                          </div>
                        </div>
                      </div>
                    )}

                    {output.type === 'parsed_screenplay' && output.data && (
                      <div className="mt-3 p-3 glass-effect rounded-lg">
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div>
                            <div className="text-lg font-bold text-blue-400">{output.data.characters?.length || 0}</div>
                            <div className="text-xs text-muted-foreground">Characters</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-400">{output.data.scenes?.length || 0}</div>
                            <div className="text-xs text-muted-foreground">Scenes</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-purple-400">{output.data.dialogue?.length || 0}</div>
                            <div className="text-xs text-muted-foreground">Lines</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {output.type === 'final_video' && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
                        <div className="flex items-center justify-center space-x-2">
                          <Sparkles className="h-4 w-4 text-amber-400" />
                          <span className="text-sm font-medium gradient-text">🏆 READY FOR EXPORT</span>
                          <Sparkles className="h-4 w-4 text-amber-400" />
                        </div>
                        {output.fileSize && (
                          <div className="text-center text-xs text-muted-foreground mt-1">
                            {output.fileSize} • Cinema Quality
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

      {/* Summary Stats */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm py-3 -mx-2 px-2">
        <div className="glass-effect glow-border rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Total Generated Assets</span>
            <div className="flex items-center space-x-2">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium">
                {allOutputs.length} files
              </Badge>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}