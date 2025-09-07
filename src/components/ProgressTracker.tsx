import { CheckCircle, Play, Clock, AlertCircle, Sparkles, Trophy, Film } from 'lucide-react';
import { Badge } from './ui/badge';

interface Phase {
  id: number;
  name: string;
  description: string;
  icon?: React.ReactNode;
  color?: string;
}

interface ProgressTrackerProps {
  phases: Phase[];
  currentPhase: number;
  completedPhases: number[];
}

export function ProgressTracker({ phases, currentPhase, completedPhases }: ProgressTrackerProps) {
  const getPhaseStatus = (phaseId: number) => {
    if (completedPhases.includes(phaseId)) return 'completed';
    if (phaseId === currentPhase) return 'active';
    if (phaseId < currentPhase) return 'available';
    return 'locked';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'active':
        return <Play className="h-4 w-4 text-amber-400" />;
      case 'available':
        return <Clock className="h-4 w-4 text-blue-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStageGradient = (stage: number) => {
    const stagePhases = phases.filter(p => Math.ceil(p.id / 3) === stage);
    const completed = stagePhases.filter(p => completedPhases.includes(p.id)).length;
    const total = stagePhases.length;
    
    if (completed === total) return 'from-green-500 to-emerald-500';
    if (completed > 0) return 'from-amber-500 to-orange-500';
    if (stagePhases.some(p => p.id === currentPhase)) return 'from-blue-500 to-cyan-500';
    return 'from-gray-400 to-gray-500';
  };

  const stages = [
    { 
      id: 1, 
      name: 'Pre-Production & Asset Generation',
      subtitle: 'Foundation & Creative Assets',
      phases: phases.slice(0, 3),
      icon: <Sparkles className="h-5 w-5" />,
      gradient: 'from-amber-500/20 to-orange-500/20'
    },
    { 
      id: 2, 
      name: 'Scene Generation & Video Editing',
      subtitle: 'Content Creation & Processing',
      phases: phases.slice(3, 6),
      icon: <Film className="h-5 w-5" />,
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    { 
      id: 3, 
      name: 'Final Assembly & Polish',
      subtitle: 'Post-Production & Export',
      phases: phases.slice(6, 9),
      icon: <Trophy className="h-5 w-5" />,
      gradient: 'from-cyan-500/20 to-blue-500/20'
    }
  ];

  const overallProgress = (completedPhases.length / phases.length) * 100;

  return (
    <div className="space-y-8">
      {/* Cinematic Overall Progress */}
      <div className="relative p-6 glass-effect glow-border rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-purple-500/5 to-cyan-500/5 rounded-xl" />
        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg gradient-text">
                ReelChemist Production Status
              </h3>
              <p className="text-sm text-muted-foreground">
                AI-Powered Cinema Pipeline Progress
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold gradient-text">
                {Math.round(overallProgress)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {completedPhases.length} / {phases.length} Complete
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full h-4 bg-muted/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-cyan-500 transition-all duration-1000 animate-glow"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full" />
          </div>
        </div>
      </div>

      {/* Enhanced Stage Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stages.map((stage) => {
          const stageCompleted = stage.phases.filter(p => completedPhases.includes(p.id)).length;
          const stageTotal = stage.phases.length;
          const stageProgress = (stageCompleted / stageTotal) * 100;
          
          return (
            <div key={stage.id} className={`p-5 rounded-xl glass-effect glow-border bg-gradient-to-br ${stage.gradient}`}>
              <div className="space-y-4">
                {/* Stage Header */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    {stage.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{stage.name}</h4>
                    <p className="text-xs text-muted-foreground">{stage.subtitle}</p>
                  </div>
                </div>
                
                {/* Stage Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(stageProgress)}%</span>
                  </div>
                  <div className="relative">
                    <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${getStageGradient(stage.id)} transition-all duration-500`}
                        style={{ width: `${stageProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-center text-xs text-muted-foreground">
                    {stageCompleted} of {stageTotal} phases complete
                  </div>
                </div>
                
                {/* Phase List */}
                <div className="space-y-2">
                  {stage.phases.map((phase) => {
                    const status = getPhaseStatus(phase.id);
                    return (
                      <div key={phase.id} className="flex items-center space-x-2 text-xs">
                        {getStatusIcon(status)}
                        <span className={`flex-1 ${status === 'locked' ? 'text-muted-foreground' : ''}`}>
                          {phase.name}
                        </span>
                        {status === 'active' && (
                          <Badge variant="outline" className="text-xs py-0 px-2 border-amber-400/50 text-amber-400">
                            ⚡
                          </Badge>
                        )}
                        {status === 'completed' && (
                          <Badge variant="outline" className="text-xs py-0 px-2 border-green-400/50 text-green-400">
                            ✓
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cinematic Phase Timeline */}
      <div className="p-6 glass-effect glow-border rounded-xl">
        <h4 className="font-semibold mb-6 flex items-center space-x-2">
          <Film className="h-5 w-5 text-purple-500" />
          <span>Production Timeline</span>
        </h4>
        
        <div className="relative">
          {/* Enhanced timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 via-purple-500 to-cyan-500 rounded-full opacity-30"></div>
          
          <div className="space-y-6">
            {phases.map((phase, index) => {
              const status = getPhaseStatus(phase.id);
              const isLast = index === phases.length - 1;
              
              return (
                <div key={phase.id} className="relative flex items-start space-x-6">
                  {/* Enhanced timeline dot */}
                  <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-300
                    ${status === 'completed' ? 'border-green-400/50 bg-green-500/10 shadow-lg shadow-green-500/20' : ''}
                    ${status === 'active' ? 'border-amber-400/50 bg-amber-500/10 shadow-lg shadow-amber-500/20 animate-glow' : ''}
                    ${status === 'available' ? 'border-blue-400/50 bg-blue-500/10 shadow-lg shadow-blue-500/20' : ''}
                    ${status === 'locked' ? 'border-border/30 bg-muted/30' : ''}
                  `}>
                    <div className="flex flex-col items-center space-y-1">
                      {phase.icon || getStatusIcon(status)}
                      <span className="text-xs font-medium">{phase.id}</span>
                    </div>
                  </div>
                  
                  {/* Enhanced phase info */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="font-semibold">{phase.name}</h5>
                      {status === 'active' && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs animate-pulse">
                          🎬 Active
                        </Badge>
                      )}
                      {status === 'completed' && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                          ✨ Complete
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {phase.description}
                    </p>
                    
                    {/* Progress indicator for active phase */}
                    {status === 'active' && (
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Processing...</span>
                          <span>AI Generation Active</span>
                        </div>
                        <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse rounded-full" 
                               style={{ width: '45%' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}