import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
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
  ChevronRight,
  Check,
  Clock,
  AlertCircle
} from 'lucide-react';

interface PhaseNode {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  phase: number;
  tools: string[];
  outputs: string[];
}

interface FilmProductionPipelineProps {
  onPhaseSelect: (phaseId: string | null) => void;
  selectedPhase: string | null;
  phaseStatuses: Record<string, 'completed' | 'in-progress' | 'pending' | 'blocked'>;
  onPhaseStatusChange: (phaseId: string, status: 'completed' | 'in-progress' | 'pending' | 'blocked') => void;
}

export function FilmProductionPipeline({ onPhaseSelect, selectedPhase, phaseStatuses, onPhaseStatusChange }: FilmProductionPipelineProps) {

  const phases: PhaseNode[] = [
    {
      id: 'node-1',
      title: 'Screenplay Input',
      description: 'Raw screenplay text file provided by user',
      icon: FileText,
      status: phaseStatuses['node-1'],
      phase: 1,
      tools: ['Text file'],
      outputs: ['screenplay.txt']
    },
    {
      id: 'node-2',
      title: 'Screenplay Parsing',
      description: 'AI extracts structured data from screenplay',
      icon: Brain,
      status: phaseStatuses['node-2'],
      phase: 1,
      tools: ['Gemini API', 'Python script'],
      outputs: ['parsed_screenplay.json']
    },
    {
      id: 'node-3',
      title: 'Visual Asset Generation',
      description: 'Generate character model sheets and locations',
      icon: Image,
      status: phaseStatuses['node-3'],
      phase: 1,
      tools: ['Gemini API (Imagen)', 'Image generation'],
      outputs: ['maya_model_sheet.jpg', 'kodex_model_sheet.jpg', 'flat_interior.jpg']
    },
    {
      id: 'node-4',
      title: 'Dialogue Audio Generation',
      description: 'Convert dialogue to audio with voice synthesis',
      icon: Volume2,
      status: phaseStatuses['node-4'],
      phase: 1,
      tools: ['Google Cloud TTS', 'Gemini TTS'],
      outputs: ['maya_dialogue_1.mp3', 'kodex_dialogue_1.mp3']
    },
    {
      id: 'node-5',
      title: 'Scene Video Generation',
      description: 'Create dynamic video clips for each scene',
      icon: Video,
      status: phaseStatuses['node-5'],
      phase: 2,
      tools: ['Google Veo', 'RunwayML'],
      outputs: ['scene_1_clip.mp4', 'scene_8_clip.mp4']
    },
    {
      id: 'node-6',
      title: 'Screen Recording & FX',
      description: 'Record UI interactions and create visual effects',
      icon: Monitor,
      status: phaseStatuses['node-6'],
      phase: 2,
      tools: ['OBS', 'DaVinci Resolve', 'After Effects'],
      outputs: ['swiper_screen_rec.mp4', 'photo_glitch_fx.mp4']
    },
    {
      id: 'node-7',
      title: 'Video Assembly',
      description: 'Combine all clips and audio into timeline',
      icon: Scissors,
      status: phaseStatuses['node-7'],
      phase: 3,
      tools: ['DaVinci Resolve', 'Premiere Pro'],
      outputs: ['assembled_timeline.prproj']
    },
    {
      id: 'node-8',
      title: 'Final Touches & Export',
      description: 'Color grade, titles, and render final video',
      icon: Sparkles,
      status: phaseStatuses['node-8'],
      phase: 3,
      tools: ['Video editing software'],
      outputs: ['color_graded_timeline.prproj']
    },
    {
      id: 'node-9',
      title: 'Final Product',
      description: 'Completed short film ready for presentation',
      icon: Download,
      status: phaseStatuses['node-9'],
      phase: 3,
      tools: ['Export settings'],
      outputs: ['Left_Swipe_Final_Film.mp4']
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'in-progress':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'blocked':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const getPhaseTitle = (phase: number) => {
    switch (phase) {
      case 1:
        return 'Phase 1: Pre-Production & Asset Generation';
      case 2:
        return 'Phase 2: Scene Generation & Video Editing';
      case 3:
        return 'Phase 3: Final Assembly & Polish';
      default:
        return '';
    }
  };

  const toggleNodeStatus = (nodeId: string) => {
    const currentStatus = phaseStatuses[nodeId];
    let newStatus: 'completed' | 'in-progress' | 'pending' | 'blocked';
    
    switch (currentStatus) {
      case 'pending':
        newStatus = 'in-progress';
        break;
      case 'in-progress':
        newStatus = 'completed';
        break;
      case 'completed':
        newStatus = 'pending';
        break;
      case 'blocked':
        newStatus = 'in-progress';
        break;
      default:
        newStatus = 'pending';
    }
    
    onPhaseStatusChange(nodeId, newStatus);
  };

  const phaseGroups = phases.reduce((acc, node) => {
    if (!acc[node.phase]) acc[node.phase] = [];
    acc[node.phase].push(node);
    return acc;
  }, {} as Record<number, PhaseNode[]>);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Production Pipeline</h2>
        <Badge variant="outline" className="text-sm">
          9 Nodes • 3 Phases
        </Badge>
      </div>

      {Object.entries(phaseGroups).map(([phase, nodes]) => (
        <div key={phase} className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {getPhaseTitle(parseInt(phase))}
            </Badge>
          </div>
          
          <div className="grid gap-4">
            {nodes.map((node, index) => (
              <div key={node.id} className="flex items-center gap-4">
                <Card 
                  className={`flex-1 cursor-pointer transition-all duration-200 ${getStatusColor(node.status)} ${selectedPhase === node.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => onPhaseSelect(selectedPhase === node.id ? null : node.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <node.icon className="h-5 w-5 text-muted-foreground" />
                          {getStatusIcon(node.status)}
                        </div>
                        <div>
                          <h3 className="font-medium">{node.title}</h3>
                          <p className="text-sm text-muted-foreground">{node.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleNodeStatus(node.id);
                          }}
                        >
                          {node.status === 'pending' && 'Start'}
                          {node.status === 'in-progress' && 'Complete'}
                          {node.status === 'completed' && 'Reset'}
                          {node.status === 'blocked' && 'Unblock'}
                        </Button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {index < nodes.length - 1 && (
                  <div className="flex flex-col items-center">
                    <ChevronRight className="h-4 w-4 text-muted-foreground transform rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}