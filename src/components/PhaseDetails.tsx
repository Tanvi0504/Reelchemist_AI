import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  FileText, 
  Brain, 
  Image, 
  Volume2, 
  Video, 
  Monitor, 
  Scissors, 
  Sparkles,
  Download,
  ExternalLink,
  Upload,
  Settings
} from 'lucide-react';

interface PhaseDetailsProps {
  selectedPhase: string | null;
}

export function PhaseDetails({ selectedPhase }: PhaseDetailsProps) {
  const phaseData: Record<string, any> = {
    'node-1': {
      title: 'Screenplay Input',
      icon: FileText,
      description: 'The foundation of your film project. Upload or paste your screenplay text to begin the AI-powered production pipeline.',
      tools: ['Text file editor', 'Document upload'],
      inputs: ['Raw screenplay text'],
      outputs: ['screenplay.txt'],
      prompts: [
        'Upload your screenplay in .txt, .docx, or .pdf format',
        'Ensure proper formatting with character names in ALL CAPS',
        'Include scene headings (INT./EXT. LOCATION - TIME)'
      ],
      tips: [
        'Use standard screenplay formatting for best results',
        'Clear character dialogue separation improves AI parsing',
        'Include emotional context in parentheticals'
      ]
    },
    'node-2': {
      title: 'Screenplay Parsing',
      icon: Brain,
      description: 'Advanced AI extracts structured data including characters, scenes, dialogue, actions, and emotions from your screenplay.',
      tools: ['Gemini API', 'Python script', 'JSON parser'],
      inputs: ['screenplay.txt'],
      outputs: ['parsed_screenplay.json', 'character_list.json', 'scene_breakdown.json'],
      prompts: [
        'You are a screenplay parser. Extract scenes, characters, dialogue, actions, and emotions from the following screenplay. Format the output as a single, well-formed JSON object.',
        'Identify character emotions and motivations for each scene',
        'Parse visual descriptions and action lines separately'
      ],
      tips: [
        'Review parsed data for accuracy before proceeding',
        'Check that all characters are properly identified',
        'Ensure scene locations are correctly extracted'
      ]
    },
    'node-3': {
      title: 'Visual Asset Generation',
      icon: Image,
      description: 'Generate consistent character model sheets and location references using AI image generation to maintain visual consistency.',
      tools: ['Gemini API (Imagen)', 'Stable Diffusion', 'Image editor'],
      inputs: ['parsed_screenplay.json', 'character_descriptions'],
      outputs: ['maya_model_sheet.jpg', 'kodex_model_sheet.jpg', 'flat_interior.jpg', 'digital_realm.jpg'],
      prompts: [
        'Generate a full-body model sheet for a woman named MAYA. She has long, brown hair and is wearing a cozy, oversized grey hoodie. The art style is photorealistic with a soft-focus aesthetic.',
        'Generate a full-body model sheet for the sentient AI KODEX. He has a sharp, symmetrical face, luminous holographic skin, and wears a metallic suit. The style is highly futuristic and sleek.',
        'Generate an image of a cozy, warm-lit flat interior with modern furniture and soft lighting.'
      ],
      tips: [
        'Save all model sheets for consistent reference',
        'Generate multiple angles for each character',
        'Maintain consistent lighting and art style'
      ]
    },
    'node-4': {
      title: 'Dialogue Audio Generation',
      icon: Volume2,
      description: 'Convert all dialogue lines into high-quality audio files with appropriate voice characteristics for each character.',
      tools: ['Google Cloud TTS', 'Gemini TTS API', 'Audio editor'],
      inputs: ['parsed_screenplay.json', 'character_voices'],
      outputs: ['maya_dialogue_1.mp3', 'kodex_dialogue_1.mp3', 'narrator_voice.mp3'],
      prompts: [
        'Synthesize the text "Yaar, mujhe samajh nahi aata..." with a natural, Hindi-English accent female voice.',
        'Synthesize the text "Their data... dissolved." with a calm, robotic, male voice with a slight reverb.',
        'Create ambient sound effects for emotional emphasis'
      ],
      tips: [
        'Test different voice models for character fit',
        'Add emotion and pacing variations',
        'Consider background music integration'
      ]
    },
    'node-5': {
      title: 'Scene Video Generation',
      icon: Video,
      description: 'Create dynamic video clips for each scene using AI video generation, maintaining character and location consistency.',
      tools: ['Google Veo API', 'RunwayML', 'Video AI tools'],
      inputs: ['Character model sheets', 'Location images', 'Scene descriptions'],
      outputs: ['scene_1_clip.mp4', 'scene_8_clip.mp4', 'character_action.mp4'],
      prompts: [
        'Generate a 10-second video of a woman (MAYA, consistent with model sheet) sitting on the floor in a warm-lit flat eating ice cream. Her expression is melancholic.',
        'Generate a 20-second video of a futuristic AI (KODEX) talking on a glass floor in a surreal realm with floating code. The mood is unsettling.',
        'Create smooth camera movements and natural character animations'
      ],
      tips: [
        'Use model sheets for character consistency',
        'Plan camera angles and movements',
        'Generate extra footage for editing flexibility'
      ]
    },
    'node-6': {
      title: 'Screen Recording & Visual FX',
      icon: Monitor,
      description: 'Record UI interactions and create custom visual effects like glitches, transitions, and digital elements.',
      tools: ['OBS Studio', 'DaVinci Resolve', 'After Effects', 'Phone simulator'],
      inputs: ['UI mockups', 'App interface', 'Effect specifications'],
      outputs: ['swiper_screen_rec.mp4', 'photo_glitch_fx.mp4', 'ui_interactions.mp4'],
      prompts: [
        'Screen record the SWYPR app UI interaction sequence',
        'Create glitch effects for photo disappearing scene',
        'Design futuristic UI elements and transitions'
      ],
      tips: [
        'Record at high resolution for quality',
        'Create seamless transitions',
        'Layer effects for realistic compositing'
      ]
    },
    'node-7': {
      title: 'Video Assembly',
      icon: Scissors,
      description: 'Combine all video clips, audio files, and effects into a cohesive timeline with proper pacing and flow.',
      tools: ['DaVinci Resolve', 'Adobe Premiere Pro', 'Final Cut Pro'],
      inputs: ['All video clips', 'Audio files', 'Sound effects', 'Music'],
      outputs: ['assembled_timeline.prproj', 'rough_cut.mp4'],
      prompts: [
        'Arrange video clips according to screenplay sequence',
        'Sync dialogue audio with character lip movements',
        'Add background music and sound effects'
      ],
      tips: [
        'Create multiple audio tracks for organization',
        'Use color coding for different asset types',
        'Save project files frequently'
      ]
    },
    'node-8': {
      title: 'Final Touches & Export',
      icon: Sparkles,
      description: 'Apply color grading, add title cards, fine-tune audio levels, and prepare for final export.',
      tools: ['Color grading tools', 'Audio mixer', 'Title generator'],
      inputs: ['assembled_timeline.prproj', 'Color LUTs', 'Title designs'],
      outputs: ['color_graded_timeline.prproj', 'final_audio_mix.wav'],
      prompts: [
        'Apply consistent color grade for unified look',
        'Create opening title card for "Left Swipe"',
        'Add final "Story Repeats" title card'
      ],
      tips: [
        'Preview on different devices for quality',
        'Check audio levels across all scenes',
        'Export test renders before final'
      ]
    },
    'node-9': {
      title: 'Final Product',
      icon: Download,
      description: 'Export the completed short film in multiple formats for different platforms and presentation needs.',
      tools: ['Export presets', 'Compression tools', 'Quality control'],
      inputs: ['color_graded_timeline.prproj', 'Export settings'],
      outputs: ['Left_Swipe_Final_Film.mp4', 'Left_Swipe_HD.mov', 'Left_Swipe_Web.mp4'],
      prompts: [
        'Export in 4K for cinema presentation',
        'Create 1080p version for web platforms',
        'Generate compressed version for social media'
      ],
      tips: [
        'Test playback on target devices',
        'Archive all project files',
        'Create backup copies of final export'
      ]
    }
  };

  if (!selectedPhase || !phaseData[selectedPhase]) {
    return (
      <Card className="h-fit sticky top-4">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a phase from the pipeline to view detailed information, tools, and tips.</p>
        </CardContent>
      </Card>
    );
  }

  const phase = phaseData[selectedPhase];
  const IconComponent = phase.icon;

  return (
    <Card className="h-fit sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className="h-5 w-5" />
          {phase.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">{phase.description}</p>
        
        <div>
          <h4 className="mb-2">Tools & Technologies</h4>
          <div className="flex flex-wrap gap-2">
            {phase.tools.map((tool: string, index: number) => (
              <Badge key={index} variant="outline">{tool}</Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="mb-2">Inputs</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {phase.inputs.map((input: string, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <Upload className="h-3 w-3" />
                {input}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-2">Outputs</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {phase.outputs.map((output: string, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <Download className="h-3 w-3" />
                {output}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div>
          <h4 className="mb-2">AI Prompts</h4>
          <div className="space-y-2">
            {phase.prompts.map((prompt: string, index: number) => (
              <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                "{prompt}"
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-2">Pro Tips</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            {phase.tips.map((tip: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Tools
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}