import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Key, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { APIService } from '../services/api';
import { toast } from 'sonner@2.0.3';

interface SetupGuideProps {
  onComplete: () => void;
}

export function SetupGuide({ onComplete }: SetupGuideProps) {
  const [geminiKey, setGeminiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSaveKey = async () => {
    if (!geminiKey.trim()) {
      toast.error('Please enter your Gemini API key');
      return;
    }

    setIsTesting(true);
    try {
      // Test the API key
      const isValid = await APIService.testAPIKey('GEMINI_API_KEY', geminiKey);
      
      if (isValid) {
        APIService.saveAPIKey('GEMINI_API_KEY', geminiKey);
        toast.success('Gemini API key saved successfully!', {
          description: 'You can now use AI-powered screenplay parsing.'
        });
        onComplete();
      } else {
        toast.error('Invalid API key', {
          description: 'Please check your Gemini API key and try again.'
        });
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      toast.error('Failed to test API key', {
        description: 'There was an error validating your key. Please try again.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyExampleText = () => {
    const exampleText = `FADE IN:

EXT. CITY STREET - DAY

MAYA (20s), a young woman with long brown hair, walks down a busy street looking at her phone.

MAYA
(frustrated)
Another left swipe... Why is dating so hard?

She bumps into a MYSTERIOUS FIGURE.

MYSTERIOUS FIGURE
(calm, otherworldly voice)
Their data... dissolved.

Maya looks up, confused.

FADE OUT.`;

    navigator.clipboard.writeText(exampleText).then(() => {
      toast.success('Example screenplay copied to clipboard!');
    });
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-blue-600" />
          Welcome to AI Film Production Pipeline!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded">
              Step 1
            </span>
            Get Your Free Gemini API Key
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            You need a free Gemini API key to parse screenplays with AI. It takes just 30 seconds to get one.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Get Free API Key
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyExampleText}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Example Screenplay
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded">
              Step 2
            </span>
            Enter Your API Key
          </h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="gemini-key">Gemini API Key</Label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Input
                    id="gemini-key"
                    type={showKey ? 'text' : 'password'}
                    placeholder="AIzaSyC..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button 
                  onClick={handleSaveKey}
                  disabled={!geminiKey.trim() || isTesting}
                  className="gap-2"
                >
                  {isTesting ? (
                    <>Testing...</>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Save & Test
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <h4 className="font-medium mb-2 text-green-900 dark:text-green-100 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Already Configured
          </h4>
          <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
              RunwayML API - Video generation ready
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
              Stability AI API - Image generation ready
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={onComplete}
            className="text-muted-foreground"
          >
            Skip for now (use demo data)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}