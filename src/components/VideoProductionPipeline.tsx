import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle, Play, Clock, AlertCircle, Sparkles, Zap, Trophy } from 'lucide-react';

interface Phase {
  id: number;
  name: string;
  description: string;
  icon?: React.ReactNode;
  color?: string;
}

interface VideoProductionPipelineProps {
  phases: Phase[];
  currentPhase: number;
  phaseOutputs: Record<number, any[]>;
  onPhaseSelect: (phaseId: number) => void;
}

export function VideoProductionPipeline({ 
  phases, 
  currentPhase, 
  phaseOutputs, 
  onPhaseSelect 
}: VideoProductionPipelineProps) {
  const getPhaseStatus = (phaseId: number) => {
    if (phaseOutputs[phaseId]?.length > 0) return 'completed';
    if (phaseId === currentPhase) return 'active';
    if (phaseId < currentPhase) return 'available';
    return 'locked';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'active':
        return <Play className="h-5 w-5 text-amber-400" />;
      case 'available':
        return <Clock className="h-5 w-5 text-blue-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusStyling = (status: string, phase: Phase) => {
    const baseClasses = "glass-effect transition-all duration-300 hover:scale-[1.02] cursor-pointer";
    
    switch (status) {
      case 'completed':
        return `${baseClasses} border-green-500/30 bg-green-500/5 hover:border-green-400/50`;
      case 'active':
        return `${baseClasses} border-amber-500/50 bg-amber-500/10 hover:border-amber-400/70 animate-glow`;
      case 'available':
        return `${baseClasses} border-blue-500/30 bg-blue-500/5 hover:border-blue-400/50`;
      default:
        return `${baseClasses} border-border/30 opacity-60 cursor-not-allowed hover:scale-100`;
    }
  };

  const stages = [
    {
      title: "Pre-Production & Asset Generation",
      subtitle: "AI-Powered Creative Foundation",
      phases: phases.slice(0, 3),
      gradient: "from-amber-500/20 via-orange-500/20 to-red-500/20",
      icon: <Sparkles className="h-5 w-5" />
    },
    {
      title: "Scene Generation & Video Editing", 
      subtitle: "Cinematic Content Creation",
      phases: phases.slice(3, 6),
      gradient: "from-purple-500/20 via-pink-500/20 to-rose-500/20",
      icon: <Zap className="h-5 w-5" />
    },
    {
      title: "Final Assembly & Polish",
      subtitle: "Professional Post-Production",
      phases: phases.slice(6, 9),
      gradient: "from-cyan-500/20 via-blue-500/20 to-indigo-500/20", 
      icon: <Trophy className="h-5 w-5" />
    }
  ];

  return (
    <div className="space-y-8">
      {stages.map((stage, stageIndex) => (
        <div key={stageIndex} className="space-y-4">
          {/* Stage Header */}
          <div className={`p-4 rounded-xl bg-gradient-to-r ${stage.gradient} border border-border/30`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                {stage.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  {stage.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {stage.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Phase Cards */}
          <div className="grid gap-4">
            {stage.phases.map((phase) => {
              const status = getPhaseStatus(phase.id);
              const outputs = phaseOutputs[phase.id] || [];
              
              return (
                <Card 
                  key={phase.id} 
                  className={getStatusStyling(status, phase)}
                  onClick={() => {
                    if (status !== 'locked') {
                      onPhaseSelect(phase.id);
                      // Scroll to workspace
                      document.querySelector('[data-phase-workspace]')?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Phase Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${phase.color || 'from-gray-500 to-gray-600'}`}>
                          {phase.icon || <div className="w-6 h-6 bg-white/80 rounded" />}
                        </div>
                        
                        {/* Phase Info */}
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-foreground">
                              Phase {phase.id}: {phase.name}
                            </h4>
                            {getStatusIcon(status)}
                          </div>
                          <p className="text-sm text-muted-foreground max-w-md">
                            {phase.description}
                          </p>
                        </div>
                      </div>

                      {/* Status & Outputs */}
                      <div className="flex items-center space-x-3">
                        {outputs.length > 0 && (
                          <div className="text-center">
                            <Badge variant="secondary" className="glass-effect">
                              {outputs.length} assets
                            </Badge>
                          </div>
                        )}
                        
                        {status === 'active' && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium animate-pulse">
                            ⚡ Active
                          </Badge>
                        )}
                        
                        {status === 'completed' && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium">
                            ✅ Complete
                          </Badge>
                        )}

                        {status === 'available' && (
                          <Badge variant="outline" className="border-blue-400/50 text-blue-400">
                            📋 Ready
                          </Badge>
                        )}

                        {status === 'locked' && (
                          <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                            🔒 Locked
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for Active Phase */}
                    {status === 'active' && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Processing...</span>
                          <span>AI Generation in Progress</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse" 
                               style={{ width: '60%' }} />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Pipeline Status Legend */}
      <div className="mt-8 p-6 glass-effect glow-border rounded-xl">
        <h4 className="font-semibold mb-4 flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span>Production Pipeline Status</span>
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="text-green-400 font-medium">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>
            <span className="text-amber-400 font-medium">Active Phase</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-blue-400 font-medium">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
            <span className="text-muted-foreground font-medium">Locked</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="text-amber-400 font-medium">
              {Object.keys(phaseOutputs).length} / 9 Phases Complete
            </span>
          </div>
          <div className="mt-2 w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-500"
              style={{ width: `${(Object.keys(phaseOutputs).length / 9) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}