import { useState } from 'react';
import { Film, Edit3, Save, Play, FolderOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ProjectHeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onSaveProject: () => void;
  onPreviewFilm: () => void;
  onLoadProject?: () => void;
}

export function ProjectHeader({ projectName, onProjectNameChange, onSaveProject, onPreviewFilm, onLoadProject }: ProjectHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(projectName);

  const handleSave = () => {
    onProjectNameChange(tempName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(projectName);
    setIsEditing(false);
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Film className="h-8 w-8 text-primary" />
              <div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="text-2xl h-10"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                      }}
                    />
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl">{projectName}</h1>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="text-muted-foreground">AI-Powered Film Production Pipeline</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {onLoadProject && (
              <Button variant="outline" onClick={onLoadProject}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Load Project
              </Button>
            )}
            <Button variant="outline" onClick={onSaveProject}>
              <Save className="h-4 w-4 mr-2" />
              Save Project
            </Button>
            <Button onClick={onPreviewFilm}>
              <Play className="h-4 w-4 mr-2" />
              Preview Film
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}