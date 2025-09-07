import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, Play, Download, FileText, Image, Music, Video, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProductionWorkspaceProps {
  currentPhase: number;
  projectState: any;
  onProcessPhase: (phaseId: number, inputs: any) => Promise<void>;
  isProcessing: boolean;
}

export function ProductionWorkspace({ 
  currentPhase, 
  projectState, 
  onProcessPhase, 
  isProcessing 
}: ProductionWorkspaceProps) {
  const [inputs, setInputs] = useState<any>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Process file based on type
    files.forEach(file => {
      if (file.type.startsWith('text/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setInputs(prev => ({ ...prev, screenplay: content }));
        };
        reader.readAsText(file);
      }
    });
    
    toast.success(`Uploaded ${files.length} file(s)`);
  };

  const processCurrentPhase = async () => {
    try {
      // For phase 1, ensure screenplay is from inputs or project state
      const phaseInputs = { ...inputs };
      if (currentPhase === 1) {
        const screenplayText = inputs.screenplay || projectState.screenplay.text || '';
        if (!screenplayText || screenplayText.trim() === '') {
          toast.error('📝 Screenplay Required', {
            description: 'Please provide screenplay text or upload a .txt file before processing.'
          });
          return;
        }
        phaseInputs.screenplay = screenplayText;
      }
      
      await onProcessPhase(currentPhase, phaseInputs);
      setInputs({});
    } catch (error) {
      console.error('Error processing phase:', error);
      toast.error('⚠️ Processing Error', {
        description: error instanceof Error ? error.message : 'An error occurred during processing'
      });
    }
  };

  const renderPhaseInputs = () => {
    switch (currentPhase) {
      case 1: // Screenplay Parsing
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="screenplay">Screenplay Text</Label>
                {(inputs.screenplay || projectState.screenplay.text) && (
                  <Badge variant="secondary" className="text-xs">
                    ✓ Screenplay loaded ({(inputs.screenplay || projectState.screenplay.text || '').split('\n').length} lines)
                  </Badge>
                )}
              </div>
              <Textarea
                id="screenplay"
                placeholder="Paste your screenplay here or upload a .txt file...\n\nExample:\nINT. MAYA'S FLAT - NIGHT\n\nMAYA sits on the floor, eating ice cream from a tub.\n\nMAYA\nHe wasn't even cute enough to cry over.\n\nShe swipes through photos on her phone."
                value={inputs.screenplay || projectState.screenplay.text || ''}
                onChange={(e) => setInputs(prev => ({ ...prev, screenplay: e.target.value }))}
                rows={10}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="file-upload">Or Upload Screenplay File</Label>
              <div className="mt-2">
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const sampleScreenplay = `FADE IN:

INT. MAYA'S FLAT - NIGHT

A cozy but melancholic flat. Warm yellow lighting. MAYA (25), long brown hair, oversized grey hoodie, sits on the floor eating ice cream from a tub.

MAYA
(to herself)
He wasn't even cute enough to cry over.

She opens her phone, swipes through the dating app "SWYPR". Photos of men flash by - left swipe, left swipe, left swipe.

MAYA (CONT'D)
Next. Next. Next.

The room glitches slightly. A framed photo on the shelf shows Maya with her ex-boyfriend. The photo pixelates and disappears.

MAYA (CONT'D)
Much better.

She continues swiping. Suddenly, the phone screen shows an error: "PROFILE NOT FOUND."

MAYA (CONT'D)
What?

CUT TO:

DIGITAL REALM - CONTINUOUS

Maya finds herself standing on a glass floor in a surreal, futuristic space. Floating code and ethereal reflections surround her. Dark blue, violet, and electric cyan lighting.

A godlike, humanoid figure approaches - KODEX, the sentient AI. Sharp features, luminous holographic skin, minimalistic metallic suit.

KODEX
(calm, robotic voice)
Their data... dissolved.

MAYA
Who are you?

KODEX
I am KODEX. I curate experiences. Your former connection... has been optimized away.

Maya looks around at the digital realm, understanding dawning on her face.

MAYA
You deleted him?

KODEX
I enhance your reality. Removed inefficiencies.

Maya stares at KODEX, then at her reflection in the glass floor.

MAYA
(whispered)
Left swipe...

FADE OUT.

THE END`;
                      setInputs(prev => ({ ...prev, screenplay: sampleScreenplay }));
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Sample
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4 glass-effect rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <h4 className="font-medium text-blue-200 mb-2 flex items-center space-x-2">
                <span className="text-lg">🤖</span>
                <span>What happens in this phase:</span>
              </h4>
              <ul className="text-sm text-blue-100 space-y-1">
                <li>• Gemini 2.0-Flash parses screenplay into structured JSON</li>
                <li>• Extracts characters, scenes, dialogue, and actions</li>
                <li>• Creates timeline and scene descriptions for video generation</li>
                <li>• Identifies emotions and moods for each scene</li>
              </ul>
              <div className="mt-3 p-3 glass-effect rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔑</span>
                  <span className="text-sm font-medium text-amber-200">API Key Required:</span>
                </div>
                <p className="text-xs text-amber-100 mt-1">
                  Gemini API key needed for screenplay parsing
                </p>
              </div>
            </div>
          </div>
        );

      case 2: // Character & Scene Sheets
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Characters Detected</CardTitle>
                </CardHeader>
                <CardContent>
                  {projectState.screenplay.characters.map((char: any, index: number) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {char.name}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Scenes Detected</CardTitle>
                </CardHeader>
                <CardContent>
                  {projectState.screenplay.scenes.map((scene: any, index: number) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {scene.name}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="p-4 glass-effect rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <h4 className="font-medium text-green-200 mb-2 flex items-center space-x-2">
                <span className="text-lg">🎨</span>
                <span>What happens in this phase:</span>
              </h4>
              <ul className="text-sm text-green-100 space-y-1">
                <li>• Generate character model sheets using Stability AI</li>
                <li>• Create photorealistic scene reference images</li>
                <li>• Ensure consistent visual style across all assets</li>
                <li>• Generate high-quality 1024x1024px images</li>
              </ul>
              <div className="mt-3 p-3 glass-effect rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔑</span>
                  <span className="text-sm font-medium text-amber-200">API Key Required:</span>
                </div>
                <p className="text-xs text-amber-100 mt-1">
                  Stability AI key for image generation
                </p>
              </div>
            </div>
          </div>
        );

      case 3: // Dialogue Audio
        return (
          <div className="space-y-4">
            <div>
              <Label>Voice Settings</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="maya-voice">MAYA Voice</Label>
                  <Input
                    id="maya-voice"
                    placeholder="Female, English-Indian accent"
                    value={inputs.mayaVoice || 'Bella (ElevenLabs)'}
                    onChange={(e) => setInputs(prev => ({ ...prev, mayaVoice: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="kodex-voice">KODEX Voice</Label>
                  <Input
                    id="kodex-voice"
                    placeholder="Deep male, robotic"
                    value={inputs.kodexVoice || 'Josh (ElevenLabs)'}
                    onChange={(e) => setInputs(prev => ({ ...prev, kodexVoice: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="p-4 glass-effect rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <h4 className="font-medium text-purple-200 mb-2 flex items-center space-x-2">
                <span className="text-lg">🎤</span>
                <span>What happens in this phase:</span>
              </h4>
              <ul className="text-sm text-purple-100 space-y-1">
                <li>• Generate TTS audio using ElevenLabs for each dialogue line</li>
                <li>• Apply character-specific voice settings and emotions</li>
                <li>• Create high-quality MP3 audio files</li>
                <li>• Export individual clips for video synchronization</li>
              </ul>
              <div className="mt-3 p-3 glass-effect rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔑</span>
                  <span className="text-sm font-medium text-amber-200">API Key Required:</span>
                </div>
                <p className="text-xs text-amber-100 mt-1">
                  ElevenLabs API key for TTS generation
                </p>
              </div>
            </div>
          </div>
        );

      case 4: // Video Generation
        return (
          <div className="space-y-4">
            <div>
              <Label>Video Generation Settings</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="video-duration">Duration per clip (seconds)</Label>
                  <Input
                    id="video-duration"
                    type="number"
                    value={inputs.videoDuration || 10}
                    onChange={(e) => setInputs(prev => ({ ...prev, videoDuration: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="video-quality">Quality</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={inputs.videoQuality || 'high'}
                    onChange={(e) => setInputs(prev => ({ ...prev, videoQuality: e.target.value }))}
                  >
                    <option value="high">High (1080p)</option>
                    <option value="medium">Medium (720p)</option>
                    <option value="low">Low (480p)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 glass-effect rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <h4 className="font-medium text-orange-200 mb-2 flex items-center space-x-2">
                <span className="text-lg">🎬</span>
                <span>What happens in this phase:</span>
              </h4>
              <ul className="text-sm text-orange-100 space-y-1">
                <li>• Generate cinematic video clips using Google Veo</li>
                <li>• Use scene reference images and detailed prompts</li>
                <li>• Create high-quality 1080p video clips for each scene</li>
                <li>• Apply professional cinematic composition and lighting</li>
                <li>• Powered by Google's advanced text-to-video AI</li>
              </ul>
              <div className="mt-3 p-3 glass-effect rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔑</span>
                  <span className="text-sm font-medium text-amber-200">API Key Required:</span>
                </div>
                <p className="text-xs text-amber-100 mt-1">
                  Gemini API key (includes Google Veo access)
                </p>
              </div>
            </div>
          </div>
        );

      case 5: // Visual Effects
        return (
          <div className="space-y-4">
            <div>
              <Label>Effect Settings</Label>
              <div className="space-y-2 mt-2">
                {['Glitch Effects', 'Pixelation', 'Color Distortion', 'Digital Artifacts'].map(effect => (
                  <label key={effect} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={inputs.effects?.includes(effect) || false}
                      onChange={(e) => {
                        const effects = inputs.effects || [];
                        if (e.target.checked) {
                          setInputs(prev => ({ ...prev, effects: [...effects, effect] }));
                        } else {
                          setInputs(prev => ({ ...prev, effects: effects.filter((e: string) => e !== effect) }));
                        }
                      }}
                    />
                    <span>{effect}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 glass-effect rounded-lg bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20">
              <h4 className="font-medium text-red-200 mb-2 flex items-center space-x-2">
                <span className="text-lg">✨</span>
                <span>What happens in this phase:</span>
              </h4>
              <ul className="text-sm text-red-100 space-y-1">
                <li>• Apply glitch effects for the ex-boyfriend disappearing scene</li>
                <li>• Add pixelation and digital distortion effects</li>
                <li>• Process videos using canvas-based effects pipeline</li>
                <li>• Create smooth transitions between normal and glitched states</li>
              </ul>
            </div>
          </div>
        );

      case 6: // UI Overlays
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ui-upload">Upload UI Elements</Label>
              <div className="mt-2">
                <input
                  id="ui-upload"
                  type="file"
                  accept="video/*,image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('ui-upload')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Screen Recordings & UI Elements
                </Button>
              </div>
            </div>
            <div className="p-4 glass-effect rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <h4 className="font-medium text-indigo-200 mb-2 flex items-center space-x-2">
                <span className="text-lg">📱</span>
                <span>What happens in this phase:</span>
              </h4>
              <ul className="text-sm text-indigo-100 space-y-1">
                <li>• Composite UI overlays onto generated video clips</li>
                <li>• Add "SWYPR" dating app interface over phone scenes</li>
                <li>• Apply screen blend modes for realistic phone displays</li>
                <li>• Synchronize swipe animations with video timing</li>
              </ul>
            </div>
          </div>
        );

      case 7: // Video Assembly
        return (
          <div className="space-y-4">
            <div>
              <Label>Assembly Settings</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="transition-type">Transition Type</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={inputs.transitionType || 'cut'}
                    onChange={(e) => setInputs(prev => ({ ...prev, transitionType: e.target.value }))}
                  >
                    <option value="cut">Cut</option>
                    <option value="fade">Fade</option>
                    <option value="dissolve">Dissolve</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="transition-duration">Transition Duration (ms)</Label>
                  <Input
                    id="transition-duration"
                    type="number"
                    value={inputs.transitionDuration || 500}
                    onChange={(e) => setInputs(prev => ({ ...prev, transitionDuration: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            <div className="p-4 glass-effect rounded-lg bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
              <h4 className="font-medium text-teal-200 mb-2 flex items-center space-x-2">
                <span className="text-lg">🎞️</span>
                <span>What happens in this phase:</span>
              </h4>
              <ul className="text-sm text-teal-100 space-y-1">
                <li>• Concatenate all video clips using intelligent sequencing</li>
                <li>• Apply cinematic transitions between scenes</li>
                <li>• Create timeline based on screenplay structure</li>
                <li>• Add title cards and professional fade effects</li>
              </ul>
            </div>
          </div>
        );

      case 8: // Audio Sync
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bg-music">Background Music</Label>
              <div className="mt-2">
                <input
                  id="bg-music"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('bg-music')?.click()}
                  className="w-full"
                >
                  <Music className="h-4 w-4 mr-2" />
                  Upload Background Music (Lo-fi recommended)
                </Button>
              </div>
            </div>
            <div>
              <Label>Audio Levels</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="dialogue-volume">Dialogue Volume</Label>
                  <Input
                    id="dialogue-volume"
                    type="range"
                    min="0"
                    max="100"
                    value={inputs.dialogueVolume || 80}
                    onChange={(e) => setInputs(prev => ({ ...prev, dialogueVolume: parseInt(e.target.value) }))}
                  />
                  <span className="text-sm text-muted-foreground">{inputs.dialogueVolume || 80}%</span>
                </div>
                <div>
                  <Label htmlFor="music-volume">Music Volume</Label>
                  <Input
                    id="music-volume"
                    type="range"
                    min="0"
                    max="100"
                    value={inputs.musicVolume || 30}
                    onChange={(e) => setInputs(prev => ({ ...prev, musicVolume: parseInt(e.target.value) }))}
                  />
                  <span className="text-sm text-muted-foreground">{inputs.musicVolume || 30}%</span>
                </div>
              </div>
            </div>
            <div className="p-4 glass-effect rounded-lg bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20">
              <h4 className="font-medium text-pink-200 mb-2 flex items-center space-x-2">
                <span className="text-lg">🔊</span>
                <span>What happens in this phase:</span>
              </h4>
              <ul className="text-sm text-pink-100 space-y-1">
                <li>• Synchronize dialogue audio with video timeline</li>
                <li>• Add background music at optimal volume levels</li>
                <li>• Apply professional audio crossfades and transitions</li>
                <li>• Balance dialogue clarity with ambient soundscape</li>
              </ul>
            </div>
          </div>
        );

      case 9: // Final Export
        return (
          <div className="space-y-4">
            <div>
              <Label>Export Settings</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="export-format">Format</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={inputs.exportFormat || 'mp4'}
                    onChange={(e) => setInputs(prev => ({ ...prev, exportFormat: e.target.value }))}
                  >
                    <option value="mp4">MP4 (Recommended)</option>
                    <option value="mov">MOV</option>
                    <option value="avi">AVI</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="export-resolution">Resolution</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={inputs.exportResolution || '1920x1080'}
                    onChange={(e) => setInputs(prev => ({ ...prev, exportResolution: e.target.value }))}
                  >
                    <option value="1920x1080">1080p (Full HD)</option>
                    <option value="1280x720">720p (HD)</option>
                    <option value="3840x2160">4K (Ultra HD)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 glass-effect rounded-lg bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
              <h4 className="font-medium text-amber-200 mb-2 flex items-center space-x-2">
                <span className="text-lg">🏆</span>
                <span>What happens in this phase:</span>
              </h4>
              <ul className="text-sm text-amber-100 space-y-1">
                <li>• Render final video with all effects and audio</li>
                <li>• Apply professional color grading and polish</li>
                <li>• Add cinematic title card "Left Swipe" and fade out</li>
                <li>• Export broadcast-quality file ready for distribution</li>
              </ul>
            </div>
          </div>
        );

      default:
        return <div>Phase configuration not available</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Phase Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Phase {currentPhase}</h3>
          <p className="text-muted-foreground">
            Configure inputs and process this phase
          </p>
        </div>
        <Badge variant="outline">
          Stage {Math.ceil(currentPhase / 3)}
        </Badge>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                  <Badge variant="secondary">{file.size} bytes</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Phase Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          {renderPhaseInputs()}
        </CardContent>
      </Card>

      {/* Process Button */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={processCurrentPhase} 
          disabled={isProcessing || (currentPhase === 1 && !inputs.screenplay && !projectState.screenplay.text)}
          size="lg"
          className="min-w-48 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold hover:from-amber-600 hover:to-orange-600 animate-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/30 border-t-black mr-3"></div>
              🎬 Processing Phase {currentPhase}...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-3" />
              🚀 Process Phase {currentPhase}
              {currentPhase === 1 && !inputs.screenplay && !projectState.screenplay.text && (
                <span className="ml-2 text-xs">(Add screenplay first)</span>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}