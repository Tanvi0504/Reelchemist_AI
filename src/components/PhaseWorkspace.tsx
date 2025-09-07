import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { 
  Play, 
  Pause,
  Download,
  Upload,
  Settings,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { FileUpload } from './FileUpload';
import { OutputPreview } from './OutputPreview';
import { APIService, type ScreenplayData } from '../services/api';
import { toast } from 'sonner@2.0.3';

interface PhaseWorkspaceProps {
  selectedPhase: string | null;
  onPhaseComplete: (phaseId: string, outputs: string[]) => void;
  phaseData?: Record<string, any>;
}

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  outputs: string[];
  error?: string;
}

interface GeneratedOutput {
  type: string;
  filename: string;
  url?: string;
  metadata?: any;
  createdAt: string;
  size?: string;
  preview?: string;
}

export function PhaseWorkspace({ selectedPhase, onPhaseComplete, phaseData: parentPhaseData }: PhaseWorkspaceProps) {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    currentStep: '',
    outputs: []
  });
  
  const [phaseData, setPhaseData] = useState<Record<string, any>>(parentPhaseData || {});
  const [generatedOutputs, setGeneratedOutputs] = useState<GeneratedOutput[]>([]);
  const [componentError, setComponentError] = useState<string | null>(null);

  // Load stored outputs when phase changes
  useEffect(() => {
    try {
      if (selectedPhase) {
        const storedOutputs = APIService.getStoredOutputs(selectedPhase);
        setGeneratedOutputs(storedOutputs);
      }
    } catch (error) {
      console.error('Error loading stored outputs:', error);
      setComponentError('Failed to load stored outputs');
    }
  }, [selectedPhase]);

  // Update phase data from parent
  useEffect(() => {
    try {
      if (parentPhaseData) {
        setPhaseData(parentPhaseData);
      }
    } catch (error) {
      console.error('Error updating phase data:', error);
      setComponentError('Failed to update phase data');
    }
  }, [parentPhaseData]);

  // Show error state if component has crashed
  if (componentError) {
    return (
      <Card className="h-fit border-red-200">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-700 dark:text-red-300 mb-4">{componentError}</p>
          <Button onClick={() => {
            setComponentError(null);
            window.location.reload();
          }}>
            Reload Component
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!selectedPhase) {
    return (
      <Card className="h-fit">
        <CardContent className="p-8 text-center text-muted-foreground">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a phase to start working on your film production pipeline.</p>
        </CardContent>
      </Card>
    );
  }

  const handleFileUpload = async (content: string, filename: string) => {
    try {
      if (selectedPhase === 'node-1') {
        await processScreenplayInput(content, filename);
      }
    } catch (error) {
      console.error('Error handling file upload:', error);
      setComponentError('Failed to process file upload');
    }
  };

  const handleTextInput = async (content: string) => {
    try {
      if (selectedPhase === 'node-1') {
        await processScreenplayInput(content, 'screenplay.txt');
      }
    } catch (error) {
      console.error('Error handling text input:', error);
      setComponentError('Failed to process text input');
    }
  };

  const processScreenplayInput = async (content: string, filename: string) => {
    setProcessingState({
      isProcessing: true,
      progress: 10,
      currentStep: 'Saving screenplay file...',
      outputs: []
    });

    try {
      // Simulate file saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProcessingState(prev => ({
        ...prev,
        progress: 50,
        currentStep: 'Parsing screenplay with AI...',
        outputs: [filename]
      }));

      // Parse screenplay using Gemini API
      try {
        const parsedData = await APIService.parseScreenplay(content);
        
        setProcessingState(prev => ({
          ...prev,
          progress: 100,
          currentStep: 'Screenplay parsing complete!',
          outputs: [filename, 'parsed_screenplay.json']
        }));

        // Show success notification
        toast.success('Screenplay Parsed Successfully!', {
          description: `Found ${parsedData.characters?.length || 0} characters and ${parsedData.scenes?.length || 0} scenes using AI parsing.`,
          duration: 4000
        });

        // Save parsed data
        setPhaseData(prev => ({
          ...prev,
          [selectedPhase]: {
            screenplayContent: content,
            parsedData,
            outputs: [filename, 'parsed_screenplay.json']
          }
        }));

        // Create output previews
        let outputs;
        try {
          const safeBase64Encode = (str: string) => {
            try {
              if (typeof btoa !== 'undefined') {
                // Handle special characters that might break btoa
                const cleanStr = str.replace(/[\u0100-\uffff]/g, function(match) {
                  return '\\u' + ('0000' + match.charCodeAt(0).toString(16)).slice(-4);
                });
                return btoa(cleanStr);
              } else {
                // Fallback for environments without btoa
                return encodeURIComponent(str);
              }
            } catch (e) {
              console.warn('Base64 encoding failed, using URL encoding:', e);
              return encodeURIComponent(str);
            }
          };

          outputs = [
            APIService.createOutputPreview('text', filename, `data:text/plain;base64,${safeBase64Encode(content)}`, {
              prompt: 'Original screenplay file',
              size: content.length
            }),
            APIService.createOutputPreview('json', 'parsed_screenplay.json', 
              `data:application/json;base64,${safeBase64Encode(JSON.stringify(parsedData, null, 2))}`, {
              prompt: 'AI-parsed screenplay data',
              characters: parsedData.characters?.length || 0,
              scenes: parsedData.scenes?.length || 0
            })
          ];
        } catch (error) {
          console.error('Error creating output previews:', error);
          outputs = [
            APIService.createOutputPreview('text', filename, 'data:text/plain,Original screenplay', {
              prompt: 'Original screenplay file',
              size: content.length
            }),
            APIService.createOutputPreview('json', 'parsed_screenplay.json', 'data:application/json,{}', {
              prompt: 'AI-parsed screenplay data',
              characters: parsedData.characters?.length || 0,
              scenes: parsedData.scenes?.length || 0
            })
          ];
        }

        // Store outputs safely
        try {
          outputs.forEach(output => APIService.storeOutput(selectedPhase, output));
          setGeneratedOutputs(outputs);
        } catch (error) {
          console.warn('Failed to store outputs:', error);
        }

        // Auto-advance to next phase
        setTimeout(() => {
          setProcessingState(prev => ({ ...prev, isProcessing: false }));
          onPhaseComplete(selectedPhase, [filename, 'parsed_screenplay.json']);
        }, 1000);

      } catch (apiError) {
        console.warn('Gemini API parsing failed, using fallback:', apiError);
        
        // Show toast notification
        toast.info('Using Demo Screenplay Data', {
          description: 'Add your Gemini API key in Settings to enable AI-powered screenplay parsing.',
          duration: 6000
        });
        
        setProcessingState(prev => ({
          ...prev,
          progress: 80,
          currentStep: 'API parsing failed, generating fallback data...'
        }));

        // Get mock data from API service
        const fallbackData = APIService.getMockScreenplayData();
        
        setProcessingState(prev => ({
          ...prev,
          progress: 100,
          currentStep: 'Using fallback screenplay data',
          outputs: [filename, 'fallback_screenplay.json']
        }));

        // Save fallback data
        setPhaseData(prev => ({
          ...prev,
          [selectedPhase]: {
            screenplayContent: content,
            parsedData: fallbackData,
            outputs: [filename, 'fallback_screenplay.json'],
            note: 'Used fallback data due to API error'
          }
        }));

        // Create fallback output previews
        let fallbackOutputs;
        try {
          const safeBase64Encode = (str: string) => {
            try {
              if (typeof btoa !== 'undefined') {
                // Handle special characters that might break btoa
                const cleanStr = str.replace(/[\u0100-\uffff]/g, function(match) {
                  return '\\u' + ('0000' + match.charCodeAt(0).toString(16)).slice(-4);
                });
                return btoa(cleanStr);
              } else {
                // Fallback for environments without btoa
                return encodeURIComponent(str);
              }
            } catch (e) {
              console.warn('Base64 encoding failed, using URL encoding:', e);
              return encodeURIComponent(str);
            }
          };

          fallbackOutputs = [
            APIService.createOutputPreview('text', filename, `data:text/plain;base64,${safeBase64Encode(content)}`, {
              prompt: 'Original screenplay file',
              size: content.length
            }),
            APIService.createOutputPreview('json', 'fallback_screenplay.json', 
              `data:application/json;base64,${safeBase64Encode(JSON.stringify(fallbackData, null, 2))}`, {
              prompt: 'Fallback screenplay data (API unavailable)',
              characters: fallbackData.characters?.length || 0,
              scenes: fallbackData.scenes?.length || 0,
              note: 'Generated using fallback data'
            })
          ];
        } catch (error) {
          console.error('Error creating fallback output previews:', error);
          fallbackOutputs = [
            APIService.createOutputPreview('text', filename, 'data:text/plain,Original screenplay', {
              prompt: 'Original screenplay file',
              size: content.length
            }),
            APIService.createOutputPreview('json', 'fallback_screenplay.json', 'data:application/json,{}', {
              prompt: 'Fallback screenplay data (API unavailable)',
              characters: fallbackData.characters?.length || 0,
              scenes: fallbackData.scenes?.length || 0,
              note: 'Generated using fallback data'
            })
          ];
        }

        // Store fallback outputs safely
        try {
          fallbackOutputs.forEach(output => APIService.storeOutput(selectedPhase, output));
          setGeneratedOutputs(fallbackOutputs);
        } catch (error) {
          console.warn('Failed to store fallback outputs:', error);
        }

        // Complete phase with fallback data
        setTimeout(() => {
          setProcessingState(prev => ({ 
            ...prev, 
            isProcessing: false,
            error: null 
          }));
          onPhaseComplete(selectedPhase, [filename, 'fallback_screenplay.json']);
        }, 1000);
      }

    } catch (error) {
      console.error('Critical error in file processing:', error);
      setProcessingState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'File processing failed'
      }));
    }
  };

  const processPhase = async (phaseId: string) => {
    setProcessingState({
      isProcessing: true,
      progress: 0,
      currentStep: 'Initializing...',
      outputs: []
    });

    try {
      switch (phaseId) {
        case 'node-3': // Visual Asset Generation
          await processVisualAssets();
          break;
        case 'node-4': // Audio Generation
          await processAudioGeneration();
          break;
        case 'node-5': // Video Generation
          await processVideoGeneration();
          break;
        default:
          // Generic processing simulation
          await simulateProcessing();
      }
    } catch (error) {
      setProcessingState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      }));
    }
  };

  const processVisualAssets = async () => {
    // Get character and scene data from parsed screenplay
    const screenplayData = phaseData['node-1']?.parsedData;
    let characters = [];
    let locations = [];

    if (screenplayData) {
      characters = screenplayData.characters || [];
      locations = [...new Set(screenplayData.scenes?.map((scene: any) => scene.location) || [])];
    } else {
      // Fallback data
      characters = [
        { name: 'MAYA', description: 'Young woman with long brown hair, wearing oversized grey hoodie' },
        { name: 'KODEX', description: 'Sentient AI with sharp features, luminous holographic skin, metallic suit' }
      ];
      locations = ['Maya\'s flat', 'Digital realm'];
    }

    const totalSteps = characters.length + locations.length + 1;
    let currentStep = 0;
    let outputs: string[] = [];

    // Analyze characters and scenes
    setProcessingState(prev => ({
      ...prev,
      progress: (++currentStep / totalSteps) * 100,
      currentStep: 'Analyzing screenplay data and character descriptions...'
    }));
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate character model sheets
    for (const character of characters) {
      setProcessingState(prev => ({
        ...prev,
        progress: (++currentStep / totalSteps) * 100,
        currentStep: `Generating ${character.name} character model sheet...`
      }));

      try {
        const prompt = `Full-body character model sheet: ${character.description}, multiple poses and expressions, professional character design, clean white background, high quality illustration`;
        const imageUrl = await APIService.generateImage(prompt);
        const filename = `${character.name.toLowerCase()}_model_sheet.jpg`;
        outputs.push(filename);

        // Create output preview with actual image
        try {
          const outputPreview = APIService.createOutputPreview('image', filename, imageUrl, {
            prompt,
            character: character.name,
            dimensions: '1024x1024',
            description: character.description
          });

          APIService.storeOutput(selectedPhase, outputPreview);
          setGeneratedOutputs(prev => [...prev, outputPreview]);
        } catch (error) {
          console.warn('Failed to create output preview:', error);
        }

        setProcessingState(prev => ({
          ...prev,
          outputs: [...prev.outputs, filename]
        }));
      } catch (error) {
        console.error(`Failed to generate model sheet for ${character.name}:`, error);
        const filename = `${character.name.toLowerCase()}_model_sheet_placeholder.jpg`;
        outputs.push(filename);
        
        // Create placeholder output preview
        try {
          const placeholderPreview = APIService.createOutputPreview('image', filename, 
            `https://via.placeholder.com/800x600?text=${encodeURIComponent(character.name + ' Model Sheet')}`, {
            prompt: `Failed to generate: ${prompt}`,
            character: character.name,
            error: 'Generation failed',
            note: 'Placeholder image due to API error'
          });
          
          APIService.storeOutput(selectedPhase, placeholderPreview);
          setGeneratedOutputs(prev => [...prev, placeholderPreview]);
        } catch (error) {
          console.warn('Failed to create placeholder preview:', error);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Generate location/background images
    for (const location of locations) {
      setProcessingState(prev => ({
        ...prev,
        progress: (++currentStep / totalSteps) * 100,
        currentStep: `Generating ${location} environment image...`
      }));

      try {
        const prompt = `${location} interior scene, cinematic lighting, film production background, detailed environment, professional cinematography`;
        const imageUrl = await APIService.generateImage(prompt);
        const filename = `${location.toLowerCase().replace(/[^a-z0-9]/g, '_')}_background.jpg`;
        outputs.push(filename);

        // Create output preview with actual background image
        const outputPreview = APIService.createOutputPreview('image', filename, imageUrl, {
          prompt,
          location,
          dimensions: '1024x1024',
          type: 'background'
        });

        APIService.storeOutput(selectedPhase, outputPreview);
        setGeneratedOutputs(prev => [...prev, outputPreview]);

        setProcessingState(prev => ({
          ...prev,
          outputs: [...prev.outputs, filename]
        }));
      } catch (error) {
        console.error(`Failed to generate location image for ${location}:`, error);
        const filename = `${location.toLowerCase().replace(/[^a-z0-9]/g, '_')}_background_placeholder.jpg`;
        outputs.push(filename);

        // Create placeholder output preview
        const placeholderPreview = APIService.createOutputPreview('image', filename, 
          `https://via.placeholder.com/800x600?text=${encodeURIComponent(location + ' Background')}`, {
          prompt: `Failed to generate: ${prompt}`,
          location,
          error: 'Generation failed',
          note: 'Placeholder image due to API error'
        });
        
        APIService.storeOutput(selectedPhase, placeholderPreview);
        setGeneratedOutputs(prev => [...prev, placeholderPreview]);
      }

      await new Promise(resolve => setTimeout(resolve, 2500));
    }

    setProcessingState(prev => ({
      ...prev,
      progress: 100,
      currentStep: 'Visual assets generation complete!',
      isProcessing: false
    }));

    onPhaseComplete(selectedPhase, outputs);
  };

  const processAudioGeneration = async () => {
    // Get dialogue from parsed screenplay data if available
    const screenplayData = phaseData['node-1']?.parsedData;
    let dialogueLines = [];

    if (screenplayData?.scenes && screenplayData.scenes.length > 0) {
      // Extract dialogue from parsed screenplay
      screenplayData.scenes.forEach((scene: any, sceneIndex: number) => {
        if (scene.dialogue && scene.dialogue.length > 0) {
          scene.dialogue.forEach((dialogue: any, dialogueIndex: number) => {
            dialogueLines.push({
              character: dialogue.character,
              text: dialogue.text,
              voice: {
                voiceId: dialogue.character === 'MAYA' ? 'pNInz6obpgDQGcFmaJgB' : '29vD33N1CtxCmqQRPOHJ', // Adam and Arnold voices
                gender: dialogue.character === 'MAYA' ? 'FEMALE' : 'MALE',
                stability: 0.5,
                similarityBoost: 0.8
              },
              scene: sceneIndex,
              index: dialogueIndex
            });
          });
        }
      });
    } else {
      // Fallback dialogue for demo
      dialogueLines = [
        { 
          character: 'MAYA', 
          text: 'Yaar, mujhe samajh nahi aata...', 
          voice: { voiceId: 'pNInz6obpgDQGcFmaJgB', gender: 'FEMALE', stability: 0.5 },
          scene: 0,
          index: 0
        },
        { 
          character: 'KODEX', 
          text: 'Their data... dissolved.', 
          voice: { voiceId: '29vD33N1CtxCmqQRPOHJ', gender: 'MALE', stability: 0.7 },
          scene: 0,
          index: 1
        }
      ];
    }

    let outputs: string[] = [];

    for (let i = 0; i < dialogueLines.length; i++) {
      const { character, text, voice, scene, index } = dialogueLines[i];
      const progress = ((i + 1) / dialogueLines.length) * 100;

      setProcessingState(prev => ({
        ...prev,
        progress,
        currentStep: `Generating ${character} dialogue audio (Scene ${scene + 1})...`
      }));

      try {
        const audioUrl = await APIService.generateSpeech(text, voice);
        const filename = `${character.toLowerCase()}_scene${scene + 1}_${index + 1}.mp3`;
        outputs.push(filename);

        // Create audio output preview
        const outputPreview = APIService.createOutputPreview('audio', filename, audioUrl, {
          prompt: text,
          character,
          voice: voice.voiceId,
          scene: scene + 1,
          duration: Math.ceil(text.length / 10) // Rough estimate
        });

        APIService.storeOutput(selectedPhase, outputPreview);
        setGeneratedOutputs(prev => [...prev, outputPreview]);

        setProcessingState(prev => ({
          ...prev,
          outputs: [...prev.outputs, filename]
        }));
      } catch (error) {
        console.error(`Failed to generate audio for ${character}:`, error);
        const filename = `${character.toLowerCase()}_scene${scene + 1}_${index + 1}_fallback.mp3`;
        outputs.push(filename);

        // Create fallback audio preview (silent audio)
        const fallbackPreview = APIService.createOutputPreview('audio', filename, 
          'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABEsAQACABAAZGF0YQAAAAA=', {
          prompt: text,
          character,
          error: 'Generation failed',
          note: 'Silent audio placeholder due to API error'
        });
        
        APIService.storeOutput(selectedPhase, fallbackPreview);
        setGeneratedOutputs(prev => [...prev, fallbackPreview]);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setProcessingState(prev => ({
      ...prev,
      isProcessing: false
    }));

    onPhaseComplete(selectedPhase, outputs);
  };

  const processVideoGeneration = async () => {
    const scenes = [
      { description: 'MAYA sitting on floor eating ice cream, melancholic expression', duration: 10 },
      { description: 'KODEX talking in digital realm with floating code', duration: 20 }
    ];

    let outputs: string[] = [];

    for (let i = 0; i < scenes.length; i++) {
      const { description, duration } = scenes[i];
      const progress = ((i + 1) / scenes.length) * 100;

      setProcessingState(prev => ({
        ...prev,
        progress,
        currentStep: `Generating scene ${i + 1} video (${duration}s)...`
      }));

      try {
        const videoUrl = await APIService.generateVideo(description);
        const filename = `scene_${i + 1}_clip.mp4`;
        outputs.push(filename);

        // Create video output preview
        const outputPreview = APIService.createOutputPreview('video', filename, videoUrl, {
          prompt: description,
          scene: i + 1,
          duration,
          dimensions: '1920x1080'
        });

        APIService.storeOutput(selectedPhase, outputPreview);
        setGeneratedOutputs(prev => [...prev, outputPreview]);

        setProcessingState(prev => ({
          ...prev,
          outputs: [...prev.outputs, filename]
        }));
      } catch (error) {
        console.error(`Failed to generate video for scene ${i + 1}:`, error);
        const filename = `scene_${i + 1}_clip_placeholder.mp4`;
        outputs.push(filename);

        // Create placeholder video preview
        const placeholderPreview = APIService.createOutputPreview('video', filename, 
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', {
          prompt: description,
          scene: i + 1,
          error: 'Generation failed',
          note: 'Placeholder video due to API error'
        });
        
        APIService.storeOutput(selectedPhase, placeholderPreview);
        setGeneratedOutputs(prev => [...prev, placeholderPreview]);
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    setProcessingState(prev => ({
      ...prev,
      isProcessing: false
    }));

    onPhaseComplete(selectedPhase, outputs);
  };

  const simulateProcessing = async () => {
    const steps = [
      { step: 'Initializing...', progress: 20 },
      { step: 'Processing data...', progress: 50 },
      { step: 'Generating outputs...', progress: 80 },
      { step: 'Finalizing...', progress: 100 }
    ];

    for (const { step, progress } of steps) {
      setProcessingState(prev => ({
        ...prev,
        progress,
        currentStep: step
      }));
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    const mockOutputs = ['output_1.mp4', 'output_2.json'];
    setProcessingState(prev => ({
      ...prev,
      outputs: mockOutputs,
      isProcessing: false
    }));

    onPhaseComplete(selectedPhase, mockOutputs);
  };

  const renderPhaseContent = () => {
    switch (selectedPhase) {
      case 'node-1':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Upload Your Screenplay</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your screenplay file or paste the text directly. The AI will parse and extract all necessary data.
              </p>
              
              {(() => {
                try {
                  // Safe API key check
                  let apiKey = null;
                  if (typeof window !== 'undefined' && window.localStorage) {
                    try {
                      apiKey = localStorage.getItem('GEMINI_API_KEY');
                    } catch (err) {
                      console.warn('Cannot access localStorage:', err);
                    }
                  }
                  
                  const hasValidKey = apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE' && apiKey.trim() !== '' && apiKey.length > 10;
                  
                  return !hasValidKey && (
                    <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                            Gemini API Key Required
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
                            To parse screenplays with AI, you need a free Gemini API key. Without it, the app will use demo data.
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            Get your free key at{' '}
                            <a 
                              href="https://aistudio.google.com/app/apikey" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="underline font-medium"
                            >
                              Google AI Studio
                            </a>{' '}
                            then configure it in Settings.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                } catch (error) {
                  return (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>Note:</strong> Configure your API key in settings for full functionality.
                      </p>
                    </div>
                  );
                }
              })()}
            </div>
            <FileUpload
              onFileUpload={handleFileUpload}
              onTextInput={handleTextInput}
              isProcessing={processingState.isProcessing}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Phase Processing</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click the start button below to begin processing this phase with AI.
              </p>
            </div>
            
            <Button
              onClick={() => processPhase(selectedPhase)}
              disabled={processingState.isProcessing}
              className="w-full gap-2"
            >
              {processingState.isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Processing
                </>
              )}
            </Button>
          </div>
        );
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Workspace</CardTitle>
          <Badge variant={processingState.isProcessing ? 'default' : 'secondary'}>
            {processingState.isProcessing ? 'Processing' : 'Ready'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderPhaseContent()}

        {/* Processing Status */}
        {(processingState.isProcessing || processingState.outputs.length > 0 || processingState.error) && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium">Processing Status</h4>
              
              {processingState.isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{processingState.currentStep}</span>
                    <span>{processingState.progress}%</span>
                  </div>
                  <Progress value={processingState.progress} className="w-full" />
                </div>
              )}

              {processingState.error && (
                <div className="space-y-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <h5 className="font-medium text-red-800 dark:text-red-200">
                        Processing Error
                      </h5>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {processingState.error}
                      </p>
                      
                      {processingState.error.includes('API key') && (
                        <div className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded">
                          <strong>Quick Fix:</strong> Check your API keys in the settings. Make sure your Gemini API key is valid and has quota available.
                        </div>
                      )}
                      
                      {processingState.error.includes('Network') && (
                        <div className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded">
                          <strong>Quick Fix:</strong> Check your internet connection and try again.
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setProcessingState(prev => ({ ...prev, error: null }));
                            if (selectedPhase === 'node-1') {
                              handleFileUpload(phaseData[selectedPhase]?.screenplayContent || '', 'retry_screenplay.txt');
                            } else {
                              processPhase(selectedPhase);
                            }
                          }}
                          className="text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setProcessingState(prev => ({ ...prev, error: null }))}
                          className="text-red-600 dark:text-red-400"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {processingState.outputs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Generated Files</span>
                  </div>
                  <ScrollArea className="h-32 w-full border rounded-md p-2">
                    <div className="space-y-1">
                      {processingState.outputs.map((output, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 hover:bg-muted/50 rounded">
                          <span>{output}</span>
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </>
        )}

        {/* Generated Outputs Preview */}
        {generatedOutputs.length > 0 && (
          <>
            <Separator />
            <OutputPreview 
              outputs={generatedOutputs} 
              phaseTitle={`Phase ${selectedPhase?.split('-')[1]} Outputs`}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}