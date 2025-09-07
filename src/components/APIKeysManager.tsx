import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { 
  Settings, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Save
} from 'lucide-react';
import { APIService } from '../services/api';

interface APIKeysManagerProps {
  onKeysUpdated: () => void;
}

export function APIKeysManager({ onKeysUpdated }: APIKeysManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    GEMINI_API_KEY: '',
    ELEVENLABS_API_KEY: '',
    RUNWAYML_API_KEY: '',
    STABILITY_API_KEY: ''
  });
  const [showKeys, setShowKeys] = useState({
    GEMINI_API_KEY: false,
    ELEVENLABS_API_KEY: false,
    RUNWAYML_API_KEY: false,
    STABILITY_API_KEY: false
  });
  const [validation, setValidation] = useState<{ valid: string[]; missing: string[] }>({ valid: [], missing: [] });

  useEffect(() => {
    try {
      // Load existing API keys from localStorage or use defaults
      const savedKeys = { ...apiKeys };
      Object.keys(apiKeys).forEach(key => {
        let savedValue = null;
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            savedValue = localStorage.getItem(key);
          }
        } catch (err) {
          console.warn('Cannot access localStorage for key:', key, err);
        }
        
        if (savedValue && savedValue !== `YOUR_${key}_HERE`) {
          savedKeys[key as keyof typeof apiKeys] = savedValue;
        } else {
          // Use provided defaults for some keys
          if (key === 'STABILITY_API_KEY') {
            savedKeys[key as keyof typeof apiKeys] = 'sk-nOYbyoWNxFdcFmO0rRb2LEslQ8bLryjVnBdcXGFtzPWz5dTG';
          } else if (key === 'RUNWAYML_API_KEY') {
            savedKeys[key as keyof typeof apiKeys] = 'key_6c7649661ad997d4305edec35ce0a03a3d0b3055d1c8bdd44f3e73f0e725c4889a2333feb2e32f05ae57b29f80aa43180c941340dc8791d3dc42497d85ff2082';
          }
        }
      });
      setApiKeys(savedKeys);
      
      // Auto-save the provided keys
      Object.entries(savedKeys).forEach(([key, value]) => {
        if (value.trim() && value !== `YOUR_${key}_HERE`) {
          try {
            if (typeof window !== 'undefined' && window.localStorage && !localStorage.getItem(key)) {
              APIService.saveAPIKey(key, value);
            }
          } catch (err) {
            console.warn('Cannot save API key:', key, err);
          }
        }
      });
      
      // Validate keys
      const validationResult = APIService.validateAPIKeys();
      setValidation(validationResult);
    } catch (error) {
      console.error('Error initializing API keys:', error);
    }
  }, []);

  const handleKeyChange = (keyName: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [keyName]: value
    }));
  };

  const toggleShowKey = (keyName: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName as keyof typeof showKeys]
    }));
  };

  const saveKeys = () => {
    Object.entries(apiKeys).forEach(([key, value]) => {
      if (value.trim()) {
        APIService.saveAPIKey(key, value);
      }
    });
    
    const validationResult = APIService.validateAPIKeys();
    setValidation(validationResult);
    onKeysUpdated();
    setIsOpen(false);
  };

  const getKeyStatus = (keyName: string) => {
    return validation.valid.includes(keyName);
  };

  const keyConfigs = [
    {
      name: 'GEMINI_API_KEY',
      label: 'Gemini API Key',
      description: 'Required for screenplay parsing with AI. Get your free API key from Google AI Studio.',
      docsUrl: 'https://aistudio.google.com/app/apikey',
      required: true
    },
    {
      name: 'ELEVENLABS_API_KEY',
      label: 'ElevenLabs API Key',
      description: 'Optional: For high-quality voice synthesis and dialogue audio',
      docsUrl: 'https://elevenlabs.io/docs/api-reference/getting-started',
      required: false
    },
    {
      name: 'RUNWAYML_API_KEY',
      label: 'RunwayML API Key',
      description: 'For AI video generation',
      docsUrl: 'https://runwayml.com/api',
      required: false
    },
    {
      name: 'STABILITY_API_KEY',
      label: 'Stability AI API Key',
      description: 'For high-quality image generation',
      docsUrl: 'https://platform.stability.ai/docs/getting-started',
      required: false
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          API Keys
          {validation.missing.length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {validation.missing.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            AI API Keys Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your API keys to enable AI-powered features like screenplay parsing, voice synthesis, image generation, and video creation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Status Overview</h4>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{validation.valid.length} configured</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span>{validation.missing.length} missing</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            {keyConfigs.map((config) => (
              <Card key={config.name} className={getKeyStatus(config.name) ? 'border-green-200' : 'border-amber-200'}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{config.label}</CardTitle>
                      {config.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                      {getKeyStatus(config.name) && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(config.docsUrl, '_blank')}
                      className="gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Docs
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <Label htmlFor={config.name}>API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={config.name}
                          type={showKeys[config.name as keyof typeof showKeys] ? 'text' : 'password'}
                          placeholder="Enter your API key..."
                          value={apiKeys[config.name as keyof typeof apiKeys]}
                          onChange={(e) => handleKeyChange(config.name, e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleShowKey(config.name)}
                        >
                          {showKeys[config.name as keyof typeof showKeys] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Quick Setup Guide</h4>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
              <li>
                <strong>Gemini API Key (Required):</strong> Visit{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">
                  Google AI Studio
                </a>{' '}
                to get your free API key for screenplay parsing
              </li>
              <li><strong>RunwayML & Stability AI:</strong> Already configured for image/video generation</li>
              <li><strong>ElevenLabs (Optional):</strong> Add for professional voice synthesis</li>
              <li>All keys are stored securely in your browser only</li>
            </ol>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-green-900 dark:text-green-100">Pre-configured Keys</h4>
            <p className="text-sm text-green-800 dark:text-green-200 mb-2">
              RunwayML and Stability AI keys are already configured and ready to use for video generation and image creation.
            </p>
            <p className="text-sm text-green-800 dark:text-green-200">
              Add your Gemini API key for screenplay parsing and ElevenLabs key for professional voice synthesis.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveKeys} className="gap-2">
              <Save className="h-4 w-4" />
              Save Keys
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}