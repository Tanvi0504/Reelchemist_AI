import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { 
  Terminal, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Zap
} from 'lucide-react';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  phase: string;
  message: string;
  details?: any;
}

interface ProcessingLogProps {
  logs: LogEntry[];
  isProcessing: boolean;
}

export function ProcessingLog({ logs, isProcessing }: ProcessingLogProps) {
  const [visibleLogs, setVisibleLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    setVisibleLogs(logs.slice(-50)); // Show last 50 logs
  }, [logs]);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Zap className="h-4 w-4 text-blue-600" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'warning':
        return 'text-amber-800 dark:text-amber-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      default:
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (logs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Terminal className="h-4 w-4" />
          Processing Log
          {isProcessing && (
            <Badge variant="default" className="animate-pulse">
              Running
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 w-full">
          <div className="space-y-2 font-mono text-sm">
            {visibleLogs.map((log, index) => (
              <div 
                key={index}
                className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatTime(log.timestamp)}
                  </span>
                  {getLogIcon(log.type)}
                  <Badge variant="outline" className="text-xs">
                    {log.phase}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${getLogColor(log.type)}`}>
                    {log.message}
                  </p>
                  {log.details && (
                    <pre className="text-xs text-muted-foreground mt-1 bg-muted/30 p-1 rounded overflow-x-auto">
                      {typeof log.details === 'string' 
                        ? log.details 
                        : JSON.stringify(log.details, null, 2)
                      }
                    </pre>
                  )}
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex items-center gap-2 p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  Processing...
                </span>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}