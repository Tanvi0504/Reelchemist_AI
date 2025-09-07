import { useState, useEffect } from 'react';
import { VideoProductionPipeline } from './components/VideoProductionPipeline';
import { ProductionWorkspace } from './components/ProductionWorkspace';
import { OutputGallery } from './components/OutputGallery';
import { ProjectSettings } from './components/ProjectSettings';
import { EnhancedVideoPlayer } from './components/EnhancedVideoPlayer';
import { ProgressTracker } from './components/ProgressTracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { 
  Play, 
  Save, 
  Download, 
  Settings, 
  Sparkles, 
  Film, 
  Zap,
  Trophy,
  Star,
  Clapperboard
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';
import { VideoProductionService } from './services/video-production';

interface ProjectState {
  screenplay: {
    text: string;
    parsed: any;
    characters: any[];
    scenes: any[];
  };
  assets: {
    characterSheets: any[];
    sceneReferences: any[];
    audioDialogue: any[];
  };
  videos: {
    generatedClips: any[];
    processedClips: any[];
    finalVideo: string | null;
  };
  currentPhase: number;
  phaseOutputs: Record<number, any[]>;
}

export default function App() {
  const [projectState, setProjectState] = useState<ProjectState>({
    screenplay: { text: '', parsed: null, characters: [], scenes: [] },
    assets: { characterSheets: [], sceneReferences: [], audioDialogue: [] },
    videos: { generatedClips: [], processedClips: [], finalVideo: null },
    currentPhase: 1,
    phaseOutputs: {}
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOutput, setSelectedOutput] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);

  const phases = [
    { 
      id: 1, 
      name: 'Screenplay Parsing', 
      description: 'AI-powered screenplay analysis using Gemini',
      icon: <Film className="h-5 w-5" />,
      color: 'from-amber-500 to-orange-500'
    },
    { 
      id: 2, 
      name: 'Character & Scene Design', 
      description: 'Generate visual references with Stability AI',
      icon: <Sparkles className="h-5 w-5" />,
      color: 'from-purple-500 to-pink-500'
    },
    { 
      id: 3, 
      name: 'Dialogue Audio', 
      description: 'High-quality TTS with ElevenLabs',
      icon: <Zap className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 4, 
      name: 'Video Generation', 
      description: 'Cinematic clips via Google Veo',
      icon: <Clapperboard className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500'
    },
    { 
      id: 5, 
      name: 'Visual Effects', 
      description: 'Professional post-processing',
      icon: <Star className="h-5 w-5" />,
      color: 'from-indigo-500 to-purple-500'
    },
    { 
      id: 6, 
      name: 'UI Overlays', 
      description: 'Interactive element compositing',
      icon: <Trophy className="h-5 w-5" />,
      color: 'from-pink-500 to-red-500'
    },
    { 
      id: 7, 
      name: 'Video Assembly', 
      description: 'Intelligent scene concatenation',
      icon: <Film className="h-5 w-5" />,
      color: 'from-yellow-500 to-amber-500'
    },
    { 
      id: 8, 
      name: 'Audio Sync', 
      description: 'Perfect dialogue synchronization',
      icon: <Zap className="h-5 w-5" />,
      color: 'from-teal-500 to-blue-500'
    },
    { 
      id: 9, 
      name: 'Final Export', 
      description: 'Cinema-quality rendering',
      icon: <Trophy className="h-5 w-5" />,
      color: 'from-gold to-gold-dark'
    }
  ];

  useEffect(() => {
    loadProjectState();
    setProvidedAPIKeys();
  }, []);

  const setProvidedAPIKeys = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Auto-configure the provided API keys
      const providedKeys = {
        ELEVENLABS_API_KEY: 'sk_37acad11c2259d2ee21a27f554c351d89553ff98a3c0da2c',
        STABILITY_API_KEY: 'sk-nOYbyoWNxFdcFmO0rRb2LEslQ8bLryjVnBdcXGFtzPWz5dTG',
        GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE' // Placeholder - user needs to replace
      };

      let keysSet = 0;
      Object.entries(providedKeys).forEach(([key, value]) => {
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, value);
          keysSet++;
        }
      });

      if (keysSet > 0) {
        toast.success('🔑 API Keys Configured!', { 
          description: `${keysSet} API key(s) have been automatically configured. Configure Gemini API key for full functionality.` 
        });
      }
    }
  };

  const loadProjectState = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('reelchemist_project');
        if (saved) {
          const parsedState = JSON.parse(saved);
          setProjectState(parsedState);
          toast.success('🎬 Project Restored', { 
            description: 'Welcome back to ReelChemist! Continuing from where you left off.' 
          });
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const saveProjectState = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('reelchemist_project', JSON.stringify(projectState));
        toast.success('✨ Project Saved', { 
          description: 'Your cinematic masterpiece progress is secured!' 
        });
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('💾 Save Failed', { description: 'Could not save project state' });
    }
  };

  const checkAPIKeysRequired = (phaseId: number): string[] => {
    const requiredKeys: Record<number, string[]> = {
      1: ['gemini'],
      2: ['stability'],
      3: ['elevenlabs'],
      4: ['gemini'], // Google Veo uses Gemini API
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
    };
    return requiredKeys[phaseId] || [];
  };

  const validateAPIKeys = (phaseId: number): boolean => {
    const required = checkAPIKeysRequired(phaseId);
    const missing = [];
    
    if (typeof window !== 'undefined' && window.localStorage) {
      for (const key of required) {
        const apiKey = localStorage.getItem(`${key.toUpperCase()}_API_KEY`);
        
        // Enhanced validation for Gemini keys
        if (key === 'gemini') {
          const isValidGeminiKey = apiKey && 
                                 apiKey.trim() !== '' && 
                                 !apiKey.includes('YOUR_') && 
                                 !apiKey.includes('API_KEY_HERE') &&
                                 apiKey.length > 10 &&
                                 apiKey.startsWith('AIza');
          if (!isValidGeminiKey) {
            missing.push(key);
          }
        } else {
          // Standard validation for other keys
          if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_') || apiKey.includes('API_KEY_HERE')) {
            missing.push(key);
          }
        }
      }
    }
    
    if (missing.length > 0) {
      // For phases that require Gemini, allow fallback to demo mode
      if (missing.includes('gemini') && (phaseId === 1 || phaseId === 4)) {
        toast.warning('🎭 Demo Mode Active', {
          description: `Using sample data - add valid ${missing.join(', ')} API key(s) for real AI generation`,
          action: {
            label: 'Configure',
            onClick: () => setShowSettings(true)
          }
        });
        return true; // Allow to proceed with mock data
      }
      
      toast.error('🔑 API Keys Required', {
        description: `Configure ${missing.join(', ')} API key(s) to proceed`,
        action: {
          label: 'Configure',
          onClick: () => setShowSettings(true)
        }
      });
      return false;
    }
    return true;
  };

  const processPhase = async (phaseId: number, inputs: any) => {
    if (!validateAPIKeys(phaseId)) {
      return;
    }

    setIsProcessing(true);
    
    // Show progress toast
    const progressToast = toast.loading(`🎬 Processing Phase ${phaseId}...`, {
      description: `${phases[phaseId - 1]?.name} in progress`
    });

    try {
      let outputs = [];
      
      switch (phaseId) {
        case 1:
          if (!inputs.screenplay || inputs.screenplay.trim() === '') {
            throw new Error('Please provide screenplay text or upload a .txt file');
          }
          
          // Check if using demo mode with enhanced validation
          const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') : null;
          const isValidGeminiKey = geminiKey && 
                                 geminiKey.trim() !== '' && 
                                 !geminiKey.includes('YOUR_') && 
                                 !geminiKey.includes('API_KEY_HERE') &&
                                 geminiKey.length > 10 &&
                                 geminiKey.startsWith('AIza');
          
          if (!isValidGeminiKey) {
            toast.loading('🎭 Demo Mode Active: Loading sample "Left Swipe" screenplay...', { id: progressToast });
          } else {
            toast.loading('🤖 Live Mode: Gemini AI parsing screenplay...', { id: progressToast });
          }
          
          outputs = await VideoProductionService.parseScreenplay(inputs.screenplay);
          
          setProjectState(prev => ({
            ...prev,
            screenplay: {
              text: inputs.screenplay,
              parsed: outputs[0].data,
              characters: outputs[1]?.characters || [],
              scenes: outputs[1]?.scenes || []
            }
          }));
          break;

        case 2:
          if (projectState.screenplay.characters.length === 0) {
            throw new Error('No characters found. Please complete Phase 1 first.');
          }
          
          toast.loading('🎨 Stability AI generating visual assets...', { id: progressToast });
          outputs = await VideoProductionService.generateCharacterSheets(
            projectState.screenplay.characters,
            projectState.screenplay.scenes
          );
          
          setProjectState(prev => ({
            ...prev,
            assets: {
              ...prev.assets,
              characterSheets: outputs.filter(o => o.type === 'character'),
              sceneReferences: outputs.filter(o => o.type === 'scene')
            }
          }));
          break;

        case 3:
          if (!projectState.screenplay.parsed?.dialogue) {
            throw new Error('No dialogue found. Please complete Phase 1 first.');
          }
          
          toast.loading('🎤 ElevenLabs generating voice audio...', { id: progressToast });
          outputs = await VideoProductionService.generateDialogueAudio(
            projectState.screenplay.parsed.dialogue
          );
          
          setProjectState(prev => ({
            ...prev,
            assets: {
              ...prev.assets,
              audioDialogue: outputs
            }
          }));
          break;

        case 4:
          if (projectState.screenplay.scenes.length === 0) {
            throw new Error('No scenes found. Please complete Phases 1-2 first.');
          }
          
          // Check if using demo mode for video generation with enhanced validation
          const geminiKeyForVideo = typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') : null;
          const isValidGeminiKeyForVideo = geminiKeyForVideo && 
                                         geminiKeyForVideo.trim() !== '' && 
                                         !geminiKeyForVideo.includes('YOUR_') && 
                                         !geminiKeyForVideo.includes('API_KEY_HERE') &&
                                         geminiKeyForVideo.length > 10 &&
                                         geminiKeyForVideo.startsWith('AIza');
          
          if (!isValidGeminiKeyForVideo) {
            toast.loading('🎭 Demo Mode Active: Loading sample cinematic clips...', { id: progressToast });
          } else {
            toast.loading('🎬 Live Mode: Google Veo generating cinematic video clips...', { id: progressToast });
          }
          
          outputs = await VideoProductionService.generateVideoClips(
            projectState.screenplay.scenes,
            projectState.assets.characterSheets,
            projectState.assets.sceneReferences
          );
          
          setProjectState(prev => ({
            ...prev,
            videos: {
              ...prev.videos,
              generatedClips: outputs
            }
          }));
          break;

        case 5:
          if (projectState.videos.generatedClips.length === 0) {
            throw new Error('No video clips found. Please complete Phase 4 first.');
          }
          
          toast.loading('✨ Applying visual effects and processing...', { id: progressToast });
          outputs = await VideoProductionService.applyVisualEffects(
            projectState.videos.generatedClips
          );
          
          setProjectState(prev => ({
            ...prev,
            videos: {
              ...prev.videos,
              processedClips: outputs
            }
          }));
          break;

        case 6:
          toast.loading('📱 Compositing UI overlays...', { id: progressToast });
          outputs = await VideoProductionService.addUIOverlays(
            projectState.videos.processedClips || projectState.videos.generatedClips,
            inputs.uiElements
          );
          break;

        case 7:
          toast.loading('🎞️ Assembling video timeline...', { id: progressToast });
          outputs = await VideoProductionService.assembleVideo(
            projectState.videos.processedClips || projectState.videos.generatedClips,
            projectState.screenplay.parsed?.timeline
          );
          break;

        case 8:
          toast.loading('🔊 Synchronizing audio tracks...', { id: progressToast });
          outputs = await VideoProductionService.synchronizeAudio(
            outputs[0] || projectState.videos.processedClips || projectState.videos.generatedClips,
            projectState.assets.audioDialogue,
            inputs.backgroundMusic
          );
          break;

        case 9:
          toast.loading('🏆 Exporting final cinematic masterpiece...', { id: progressToast });
          outputs = await VideoProductionService.exportFinalVideo(
            outputs[0] || projectState.videos.processedClips || projectState.videos.generatedClips,
            inputs.exportSettings
          );
          
          setProjectState(prev => ({
            ...prev,
            videos: {
              ...prev.videos,
              finalVideo: outputs[0]?.url
            }
          }));
          break;
      }

      setProjectState(prev => ({
        ...prev,
        phaseOutputs: {
          ...prev.phaseOutputs,
          [phaseId]: outputs
        },
        currentPhase: Math.min(phaseId + 1, 9)
      }));

      toast.success(`🎯 Phase ${phaseId} Complete!`, {
        id: progressToast,
        description: `✨ Generated ${outputs.length} cinematic asset${outputs.length !== 1 ? 's' : ''}`
      });

      // Auto-save project state
      setTimeout(() => {
        saveProjectState();
      }, 1000);

    } catch (error) {
      console.error(`Error processing phase ${phaseId}:`, error);
      toast.error(`⚠️ Phase ${phaseId} Failed`, {
        id: progressToast,
        description: error instanceof Error ? error.message : 'Processing error occurred'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const previewVideo = () => {
    if (projectState.videos.finalVideo) {
      setSelectedOutput({ type: 'final_video', url: projectState.videos.finalVideo, character: 'Final Cut', timestamp: new Date().toISOString() });
    } else {
      // Show the most recent video output if available
      const allOutputs = Object.values(projectState.phaseOutputs).flat();
      const videoOutput = allOutputs.find(output => 
        output.type.includes('video') || output.videoUrl
      );
      
      if (videoOutput) {
        setSelectedOutput(videoOutput);
        toast.success('🎬 Previewing Latest Video', {
          description: 'Showing most recent video asset'
        });
      } else {
        toast.info('🎬 No Video Available', {
          description: 'Complete video generation phases first'
        });
      }
    }
  };

  const downloadVideo = () => {
    if (projectState.videos.finalVideo) {
      try {
        const link = document.createElement('a');
        link.href = projectState.videos.finalVideo;
        link.download = 'reelchemist-masterpiece.mp4';
        link.click();
        toast.success('🚀 Download Started', {
          description: 'Your cinematic creation is downloading!'
        });
      } catch (error) {
        toast.error('💾 Download Failed', {
          description: 'Could not download the video file'
        });
      }
    } else {
      // Try to find any video to download
      const allOutputs = Object.values(projectState.phaseOutputs).flat();
      const videoOutput = allOutputs.find(output => 
        output.type.includes('video') && (output.url || output.videoUrl)
      );
      
      if (videoOutput) {
        try {
          const link = document.createElement('a');
          link.href = videoOutput.url || videoOutput.videoUrl;
          link.download = `reelchemist-${videoOutput.scene || 'video'}.mp4`;
          link.click();
          toast.success('🚀 Download Started', {
            description: 'Downloading available video asset'
          });
        } catch (error) {
          toast.error('💾 Download Failed', {
            description: 'Could not download the video file'
          });
        }
      } else {
        toast.error('🎭 No Video Ready', {
          description: 'Complete video generation phases first'
        });
      }
    }
  };

  const getCompletionPercentage = () => {
    const completedPhases = Object.keys(projectState.phaseOutputs).length;
    return Math.round((completedPhases / 9) * 100);
  };

  const isDemoModeActive = () => {
    if (typeof window === 'undefined') return true;
    const geminiKey = localStorage.getItem('GEMINI_API_KEY');
    return !geminiKey || 
           geminiKey.trim() === '' || 
           geminiKey.includes('YOUR_') || 
           geminiKey.includes('API_KEY_HERE') ||
           geminiKey.length <= 10 ||
           !geminiKey.startsWith('AIza');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Cinematic Header */}
      <div className="relative border-b border-border/50 glass-effect">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-purple-500/5 to-cyan-500/5" />
        <div className="relative container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center animate-glow">
                  <Film className="h-7 w-7 text-black" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold gradient-text">ReelChemist</h1>
                  {isDemoModeActive() && (
                    <Badge className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-200 border-purple-500/30">
                      🎭 Demo Mode
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  AI-Powered Cinema • "Left Swipe" Production
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg glass-effect glow-border">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">{getCompletionPercentage()}% Complete</span>
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${getCompletionPercentage()}%` }}
                  />
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSettings(true)}
                className="glass-effect border-border/50 hover:border-amber-500/50"
              >
                <Settings className="h-4 w-4 mr-2" />
                API Keys
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={saveProjectState}
                className="glass-effect border-border/50 hover:border-blue-500/50"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={previewVideo}
                className="glass-effect border-border/50 hover:border-purple-500/50"
              >
                <Play className="h-4 w-4 mr-2" />
                Preview
              </Button>
              
              <Button 
                size="sm" 
                onClick={downloadVideo}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium hover:from-amber-600 hover:to-orange-600 animate-glow"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Film
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Progress Overview */}
        <Card className="mb-8 glass-effect glow-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span>Production Pipeline Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressTracker
              phases={phases}
              currentPhase={projectState.currentPhase}
              completedPhases={Object.keys(projectState.phaseOutputs).map(Number)}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Pipeline */}
          <div className="xl:col-span-2 space-y-8">
            <Card className="glass-effect glow-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Clapperboard className="h-5 w-5 text-purple-500" />
                  <span>AI Production Pipeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VideoProductionPipeline
                  phases={phases}
                  currentPhase={projectState.currentPhase}
                  phaseOutputs={projectState.phaseOutputs}
                  onPhaseSelect={(phaseId) => {
                    // Allow selection of completed phases or current phase
                    if (phaseId <= projectState.currentPhase || projectState.phaseOutputs[phaseId]) {
                      toast.info(`🎬 Viewing Phase ${phaseId}`, {
                        description: `${phases[phaseId - 1]?.name} configuration`
                      });
                      // You can add navigation to specific phase workspace here
                    } else {
                      toast.warning('🔒 Phase Locked', {
                        description: `Complete previous phases to unlock Phase ${phaseId}`
                      });
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Production Workspace */}
            <Card className="glass-effect glow-border" data-phase-workspace>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  {phases[projectState.currentPhase - 1]?.icon}
                  <span>
                    Phase {projectState.currentPhase}: {phases[projectState.currentPhase - 1]?.name}
                  </span>
                  {isProcessing && (
                    <div className="ml-2">
                      <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductionWorkspace
                  currentPhase={projectState.currentPhase}
                  projectState={projectState}
                  onProcessPhase={processPhase}
                  isProcessing={isProcessing}
                />
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-8">
            {/* Output Gallery */}
            <Card className="glass-effect glow-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-cyan-500" />
                  <span>Generated Assets</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OutputGallery
                  phaseOutputs={projectState.phaseOutputs}
                  onSelectOutput={setSelectedOutput}
                />
              </CardContent>
            </Card>

            {/* Enhanced Video Player */}
            {selectedOutput && (
              <EnhancedVideoPlayer
                output={selectedOutput}
                screenplay={projectState.screenplay}
                onClose={() => setSelectedOutput(null)}
                onDownload={downloadVideo}
              />
            )}

            {/* Quick Stats */}
            <Card className="glass-effect glow-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-gold" />
                  <span>Project Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-xl font-bold text-amber-500">
                      {Object.keys(projectState.phaseOutputs).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Phases Done</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-xl font-bold text-purple-500">
                      {Object.values(projectState.phaseOutputs).flat().length}
                    </div>
                    <div className="text-xs text-muted-foreground">Assets Created</div>
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20">
                  <div className="text-lg font-bold gradient-text">
                    {projectState.videos.finalVideo ? 'READY FOR EXPORT' : 'IN PRODUCTION'}
                  </div>
                  <div className="text-xs text-muted-foreground">Film Status</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Project Settings Modal */}
      {showSettings && (
        <ProjectSettings
          onClose={() => setShowSettings(false)}
          onSettingsChange={() => {
            toast.success('⚙️ Settings Updated', {
              description: 'Configuration applied successfully!'
            });
          }}
        />
      )}

      {/* Enhanced Setup Prompt */}
      {!showSettings && projectState.currentPhase === 1 && Object.keys(projectState.phaseOutputs).length === 0 && (
        <div className="fixed bottom-6 right-6 max-w-sm animate-float">
          <Card className="glass-effect glow-border border-amber-500/30">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 animate-glow">
                  <Settings className="h-6 w-6 text-black" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-amber-200">Ready to Create Magic?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure your AI tools to start crafting your cinematic masterpiece.
                  </p>
                  <div className="mt-3 space-y-2">
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium hover:from-amber-600 hover:to-orange-600"
                      onClick={() => setShowSettings(true)}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Setup API Keys
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full glass-effect border-border/50 hover:border-purple-500/50"
                      onClick={async () => {
                        // Load sample data to demonstrate the app
                        const samplePhaseOutputs = {
                          1: [
                            {
                              type: 'parsed_screenplay',
                              data: {
                                title: 'Left Swipe',
                                characters: [
                                  { name: 'MAYA', description: 'Young woman with long brown hair, oversized grey hoodie' },
                                  { name: 'KODEX', description: 'Sentient AI with sharp features, luminous holographic skin' }
                                ],
                                scenes: [
                                  { name: 'INT. MAYA\'S FLAT - NIGHT', setting: 'Cozy flat interior', mood: 'intimate' },
                                  { name: 'DIGITAL REALM', setting: 'Surreal futuristic space', mood: 'ethereal' }
                                ],
                                dialogue: [
                                  { character: 'MAYA', text: 'He wasn\'t even cute enough to cry over.' },
                                  { character: 'KODEX', text: 'Their data... dissolved.' }
                                ]
                              },
                              timestamp: new Date().toISOString()
                            }
                          ],
                          2: [
                            {
                              type: 'character',
                              character: 'MAYA',
                              image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=800&q=80',
                              description: 'Young woman with long brown hair, oversized grey hoodie',
                              timestamp: new Date(Date.now() - 120000).toISOString()
                            },
                            {
                              type: 'scene',
                              scene: 'INT. MAYA\'S FLAT - NIGHT',
                              image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
                              setting: 'Cozy flat interior',
                              mood: 'intimate',
                              timestamp: new Date(Date.now() - 60000).toISOString()
                            }
                          ]
                        };
                        
                        setProjectState(prev => ({
                          ...prev,
                          screenplay: {
                            text: 'FADE IN:\n\nINT. MAYA\'S FLAT - NIGHT\n\nMAYA sits on the floor, eating ice cream.\n\nMAYA\nHe wasn\'t even cute enough to cry over.',
                            parsed: samplePhaseOutputs[1][0].data,
                            characters: samplePhaseOutputs[1][0].data.characters,
                            scenes: samplePhaseOutputs[1][0].data.scenes
                          },
                          assets: {
                            characterSheets: [samplePhaseOutputs[2][0]],
                            sceneReferences: [samplePhaseOutputs[2][1]],
                            audioDialogue: []
                          },
                          phaseOutputs: samplePhaseOutputs,
                          currentPhase: 3
                        }));
                        
                        toast.success('🎬 Demo Mode Activated!', {
                          description: 'Explore ReelChemist with sample "Left Swipe" content. All features work with demo data!'
                        });
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Try Demo
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Toaster 
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(26, 26, 36, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(248, 249, 251, 0.1)',
            color: '#f8f9fb'
          }
        }}
      />
    </div>
  );
}