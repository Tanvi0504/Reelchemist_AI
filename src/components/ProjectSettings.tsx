import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertTriangle, Key, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProjectSettingsProps {
  onClose: () => void;
  onSettingsChange: () => void;
}

export function ProjectSettings({ onClose, onSettingsChange }: ProjectSettingsProps) {
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    elevenlabs: '',
    stability: ''
  });
  const [showKeys, setShowKeys] = useState({
    gemini: false,
    elevenlabs: false,
    stability: false
  });
  const [validationStatus, setValidationStatus] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    loadAPIKeys();
    // Auto-set the provided API keys if not already set
    setProvidedAPIKeys();
  }, []);

  const setProvidedAPIKeys = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const providedKeys = {
        elevenlabs: 'sk_37acad11c2259d2ee21a27f554c351d89553ff98a3c0da2c',
        stability: 'sk-nOYbyoWNxFdcFmO0rRb2LEslQ8bLryjVnBdcXGFtzPWz5dTG',
        gemini: 'YOUR_GEMINI_API_KEY_HERE'
      };

      // Only set if not already configured
      Object.entries(providedKeys).forEach(([service, key]) => {
        const storageKey = `${service.toUpperCase()}_API_KEY`;
        if (!localStorage.getItem(storageKey)) {
          localStorage.setItem(storageKey, key);
        }
      });
      
      loadAPIKeys(); // Reload to show the new keys
    }
  };

  const loadAPIKeys = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      setApiKeys({
        gemini: localStorage.getItem('GEMINI_API_KEY') || '',
        elevenlabs: localStorage.getItem('ELEVENLABS_API_KEY') || '',
        stability: localStorage.getItem('STABILITY_API_KEY') || ''
      });
    }
  };

  const saveAPIKey = (service: string, key: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storageKey = `${service.toUpperCase()}_API_KEY`;
      if (key.trim()) {
        localStorage.setItem(storageKey, key.trim());
      } else {
        localStorage.removeItem(storageKey);
      }
      
      setApiKeys(prev => ({ ...prev, [service]: key.trim() }));
      onSettingsChange();
    }
  };

  const validateAPIKey = async (service: string, key: string) => {
    if (!key.trim()) {
      setValidationStatus(prev => ({ ...prev, [service]: false }));
      return false;
    }

    setIsValidating(true);
    
    try {
      let isValid = false;
      
      switch (service) {
        case 'gemini':
          // Test Gemini API
          const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Hello' }] }]
            })
          });
          isValid = geminiResponse.status !== 401 && geminiResponse.status !== 403;
          break;
          
        case 'elevenlabs':
          // Test ElevenLabs API
          const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: { 'xi-api-key': key }
          });
          isValid = elevenLabsResponse.ok;
          break;
          

          
        case 'stability':
          // Test Stability AI API
          const stabilityResponse = await fetch('https://api.stability.ai/v1/engines/list', {
            headers: { 'Authorization': `Bearer ${key}` }
          });
          isValid = stabilityResponse.ok;
          break;
      }
      
      setValidationStatus(prev => ({ ...prev, [service]: isValid }));
      
      if (isValid) {
        toast.success(`${service} API key validated successfully`);
      } else {
        toast.error(`Invalid ${service} API key`);
      }
      
      return isValid;
    } catch (error) {
      console.error(`Error validating ${service} API key:`, error);
      setValidationStatus(prev => ({ ...prev, [service]: false }));
      toast.error(`Failed to validate ${service} API key`);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const apiServices = [
    {
      id: 'gemini',
      name: 'Gemini API',
      description: 'Google Gemini for screenplay parsing, text analysis, and video generation via Google Veo',
      website: 'https://makersuite.google.com/app/apikey',
      placeholder: 'AIzaSy...',
      required: true
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      description: 'Text-to-speech for character dialogue generation',
      website: 'https://elevenlabs.io/docs/api-reference/authentication',
      placeholder: 'sk_...',
      required: true
    },
    {
      id: 'stability',
      name: 'Stability AI',
      description: 'Image generation for character sheets and scene references',
      website: 'https://platform.stability.ai/account/keys',
      placeholder: 'sk-...',
      required: false
    }
  ];

  const getKeyStatus = (service: string) => {
    const keyValue = apiKeys[service as keyof typeof apiKeys];
    const isValid = validationStatus[service];
    
    // Enhanced validation for Gemini
    if (service === 'gemini') {
      const isValidGeminiKey = keyValue && 
                             keyValue.trim() !== '' && 
                             !keyValue.includes('YOUR_') && 
                             !keyValue.includes('API_KEY_HERE') &&
                             keyValue.length > 10 &&
                             keyValue.startsWith('AIza');
      
      if (!isValidGeminiKey) {
        if (keyValue && keyValue.includes('YOUR_')) {
          return { status: 'placeholder', color: 'blue', text: 'Demo Mode' };
        }
        return { status: 'missing', color: 'gray', text: 'Not set' };
      }
    } else {
      // Standard validation for other services
      const hasKey = keyValue && keyValue.length > 0 && !keyValue.includes('YOUR_') && !keyValue.includes('_API_KEY_HERE');
      
      if (!hasKey) {
        if (keyValue && keyValue.includes('YOUR_')) {
          return { status: 'placeholder', color: 'blue', text: 'Demo Mode' };
        }
        return { status: 'missing', color: 'gray', text: 'Not set' };
      }
    }
    
    if (isValid === true) return { status: 'valid', color: 'green', text: 'Valid' };
    if (isValid === false) return { status: 'invalid', color: 'red', text: 'Invalid' };
    return { status: 'unknown', color: 'yellow', text: 'Not tested' };
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Configure API keys and settings for your AI-powered film production pipeline.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="api-keys" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="instructions">Setup Instructions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api-keys" className="space-y-6">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Configure your API keys to enable AI-powered film production features. 
                Keys are stored locally in your browser and never sent to our servers.
                <br /><br />
                <strong>Demo Mode:</strong> The app will use sample data when API keys are not configured, 
                allowing you to explore all features with "Left Swipe" demo content.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6">
              {apiServices.map((service) => {
                const keyStatus = getKeyStatus(service.id);
                const currentKey = apiKeys[service.id as keyof typeof apiKeys];
                const isVisible = showKeys[service.id as keyof typeof showKeys];
                
                return (
                  <Card key={service.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {service.name}
                            {service.required && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                            <Badge 
                              variant="outline" 
                              className={`text-xs border-${keyStatus.color}-300 text-${keyStatus.color}-700`}
                            >
                              {keyStatus.text}
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(service.website, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Get API Key
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label htmlFor={`${service.id}-key`}>API Key</Label>
                          <div className="relative mt-1">
                            <Input
                              id={`${service.id}-key`}
                              type={isVisible ? 'text' : 'password'}
                              placeholder={service.placeholder}
                              value={currentKey}
                              onChange={(e) => setApiKeys(prev => ({ 
                                ...prev, 
                                [service.id]: e.target.value 
                              }))}
                              className="pr-10"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowKeys(prev => ({ 
                                ...prev, 
                                [service.id]: !isVisible 
                              }))}
                            >
                              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => saveAPIKey(service.id, currentKey)}
                            disabled={!currentKey.trim()}
                            size="sm"
                            className="mt-6"
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => validateAPIKey(service.id, currentKey)}
                            disabled={!currentKey.trim() || isValidating}
                            size="sm"
                          >
                            {isValidating ? 'Testing...' : 'Test'}
                          </Button>
                        </div>
                      </div>
                      
                      {keyStatus.status === 'valid' && (
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          API key is valid and ready to use
                        </div>
                      )}
                      
                      {keyStatus.status === 'invalid' && (
                        <div className="flex items-center gap-2 text-sm text-red-700">
                          <AlertTriangle className="h-4 w-4" />
                          API key validation failed. Please check the key and try again.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="instructions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Setup Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">1. Gemini API (Required)</h4>
                    <p className="text-sm text-muted-foreground">
                      Used for screenplay parsing, text analysis, and video generation via Google Veo.
                    </p>
                    <ol className="text-sm space-y-1 ml-4 list-decimal">
                      <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-blue-600 hover:underline">Google AI Studio</a></li>
                      <li>Sign in with your Google account</li>
                      <li>Click "Create API Key" and copy the key</li>
                      <li>Paste it in the Gemini API field above</li>
                      <li>This key enables both Gemini 2.0-Flash and Google Veo video generation</li>
                    </ol>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">2. ElevenLabs (Required)</h4>
                    <p className="text-sm text-muted-foreground">
                      Generates realistic voice dialogue for characters.
                    </p>
                    <ol className="text-sm space-y-1 ml-4 list-decimal">
                      <li>Go to <a href="https://elevenlabs.io/" target="_blank" className="text-blue-600 hover:underline">ElevenLabs</a></li>
                      <li>Create an account (free tier available)</li>
                      <li>Navigate to Profile → API Keys</li>
                      <li>Generate a new API key and copy it</li>
                    </ol>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">3. Stability AI (Optional)</h4>
                    <p className="text-sm text-muted-foreground">
                      Generates character model sheets and scene references.
                    </p>
                    <ol className="text-sm space-y-1 ml-4 list-decimal">
                      <li>Visit <a href="https://platform.stability.ai/" target="_blank" className="text-blue-600 hover:underline">Stability AI Platform</a></li>
                      <li>Create an account and add credits</li>
                      <li>Go to Account → API Keys</li>
                      <li>Generate and copy your API key</li>
                    </ol>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Cost Notice:</strong> AI video and image generation can be expensive. 
                    Start with small tests to estimate costs before processing full projects.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}