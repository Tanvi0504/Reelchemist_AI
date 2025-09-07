// Safe localStorage access helper
const safeLocalStorageGet = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (error) {
    console.warn('localStorage access failed:', error);
  }
  return null;
};

const safeLocalStorageSet = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    console.warn('localStorage set failed:', error);
  }
};

// API Configuration and Services
export const API_ENDPOINTS = {
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models',
  RUNWAYML: 'https://api.runwayml.com/v1',
  STABILITY: 'https://api.stability.ai/v1',
  ELEVENLABS: 'https://api.elevenlabs.io/v1'
};

// Initialize API Keys safely
let API_KEYS: Record<string, string>;

try {
  API_KEYS = {
    GEMINI_API_KEY: safeLocalStorageGet('GEMINI_API_KEY') || '',
    RUNWAYML_API_KEY: safeLocalStorageGet('RUNWAYML_API_KEY') || 'key_6c7649661ad997d4305edec35ce0a03a3d0b3055d1c8bdd44f3e73f0e725c4889a2333feb2e32f05ae57b29f80aa43180c941340dc8791d3dc42497d85ff2082',
    STABILITY_API_KEY: safeLocalStorageGet('STABILITY_API_KEY') || 'sk-nOYbyoWNxFdcFmO0rRb2LEslQ8bLryjVnBdcXGFtzPWz5dTG',
    ELEVENLABS_API_KEY: safeLocalStorageGet('ELEVENLABS_API_KEY') || ''
  };
} catch (error) {
  console.warn('Failed to initialize API keys from localStorage:', error);
  API_KEYS = {
    GEMINI_API_KEY: '',
    RUNWAYML_API_KEY: 'key_6c7649661ad997d4305edec35ce0a03a3d0b3055d1c8bdd44f3e73f0e725c4889a2333feb2e32f05ae57b29f80aa43180c941340dc8791d3dc42497d85ff2082',
    STABILITY_API_KEY: 'sk-nOYbyoWNxFdcFmO0rRb2LEslQ8bLryjVnBdcXGFtzPWz5dTG',
    ELEVENLABS_API_KEY: ''
  };
}

export { API_KEYS };

export interface ScreenplayData {
  characters: Array<{
    name: string;
    description: string;
    emotions: string[];
  }>;
  scenes: Array<{
    location: string;
    time: string;
    description: string;
    dialogue: Array<{
      character: string;
      text: string;
      emotion?: string;
    }>;
    actions: string[];
  }>;
  metadata: {
    title: string;
    genre: string;
    duration: string;
  };
}

export class APIService {
  // Gemini API for screenplay parsing and image generation
  static async parseScreenplay(screenplayText: string): Promise<ScreenplayData> {
    // Validate API key first
    console.log('Checking Gemini API key:', API_KEYS.GEMINI_API_KEY ? `Key exists (${API_KEYS.GEMINI_API_KEY.substring(0, 10)}...)` : 'No key');
    
    // Comprehensive API key validation
    const hasValidKey = API_KEYS.GEMINI_API_KEY && 
                       API_KEYS.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' && 
                       API_KEYS.GEMINI_API_KEY.trim() !== '' &&
                       API_KEYS.GEMINI_API_KEY.length > 20 &&
                       API_KEYS.GEMINI_API_KEY.startsWith('AIzaSy');
    
    if (!hasValidKey) {
      console.warn('Gemini API key not configured or invalid, using mock data');
      console.warn('Key details:', {
        exists: !!API_KEYS.GEMINI_API_KEY,
        notDefault: API_KEYS.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE',
        notEmpty: API_KEYS.GEMINI_API_KEY.trim() !== '',
        minLength: API_KEYS.GEMINI_API_KEY.length > 20,
        correctPrefix: API_KEYS.GEMINI_API_KEY.startsWith('AIzaSy')
      });
      return this.getMockScreenplayData();
    }

    // Validate input
    if (!screenplayText || screenplayText.trim().length === 0) {
      throw new Error('No screenplay text provided');
    }

    const prompt = `You are a professional screenplay parser. Analyze the following screenplay text and extract structured data. 

IMPORTANT: Return ONLY a valid JSON object with no additional text, markdown formatting, or explanations.

Required JSON structure:
{
  "characters": [{"name": "CHARACTER_NAME", "description": "physical description", "emotions": ["emotion1", "emotion2"]}],
  "scenes": [{"location": "location", "time": "time", "description": "scene description", "dialogue": [{"character": "CHARACTER_NAME", "text": "dialogue text", "emotion": "emotion"}], "actions": ["action description"]}],
  "metadata": {"title": "screenplay title", "genre": "genre", "duration": "estimated duration"}
}

Screenplay text:
${screenplayText.trim()}`;

    try {
      // Use the correct Gemini endpoint
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEYS.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error Response:', errorText);
        
        if (response.status === 403) {
          throw new Error('Gemini API key is invalid or has no quota. Please check your API key.');
        } else if (response.status === 429) {
          throw new Error('Gemini API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Gemini API error (${response.status}): ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      // Check if response has expected structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        console.error('Unexpected Gemini API response structure:', data);
        throw new Error('Invalid response structure from Gemini API');
      }

      const parsedContent = data.candidates[0].content.parts[0].text;
      console.log('Gemini raw response:', parsedContent);
      
      // Clean up the response to extract JSON
      let cleanedContent = parsedContent.trim();
      
      // Remove markdown code blocks if present
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Extract JSON from response
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedData = JSON.parse(jsonMatch[0]);
          
          // Validate the parsed data structure
          if (this.validateScreenplayData(parsedData)) {
            return parsedData;
          } else {
            throw new Error('Parsed data does not match expected structure');
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          throw new Error('Failed to parse JSON from Gemini response');
        }
      }
      
      throw new Error('No valid JSON found in Gemini response');
    } catch (error) {
      console.error('Error parsing screenplay:', error);
      
      // If it's a network error, throw it to show user
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Please check your internet connection');
      }
      
      // For API errors, throw the original error
      if (error instanceof Error && error.message.includes('Gemini API')) {
        throw error;
      }
      
      // For other errors, return mock data with warning
      console.warn('Using mock data due to parsing error:', error);
      return this.getMockScreenplayData();
    }
  }

  // Validate screenplay data structure
  static validateScreenplayData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    
    // Check required properties
    if (!Array.isArray(data.characters)) return false;
    if (!Array.isArray(data.scenes)) return false;
    if (!data.metadata || typeof data.metadata !== 'object') return false;
    
    // Validate characters
    for (const character of data.characters) {
      if (!character.name || !character.description || !Array.isArray(character.emotions)) {
        return false;
      }
    }
    
    // Validate scenes
    for (const scene of data.scenes) {
      if (!scene.location || !scene.time || !Array.isArray(scene.dialogue) || !Array.isArray(scene.actions)) {
        return false;
      }
    }
    
    // Validate metadata
    if (!data.metadata.title || !data.metadata.genre) return false;
    
    return true;
  }

  // Get mock screenplay data
  static getMockScreenplayData(): ScreenplayData {
    // Show a helpful message to the user
    if (typeof window !== 'undefined') {
      console.info('📽️ Using mock screenplay data. Configure your Gemini API key for real AI parsing.');
    }
    
    return {
      characters: [
        {
          name: "MAYA",
          description: "Young woman with long brown hair, wearing oversized grey hoodie",
          emotions: ["melancholic", "confused", "hopeful"]
        },
        {
          name: "KODEX",
          description: "Sentient AI with sharp features, luminous holographic skin, metallic suit",
          emotions: ["calm", "mysterious", "unsettling"]
        }
      ],
      scenes: [
        {
          location: "Maya's flat",
          time: "Night",
          description: "Warm-lit interior, cozy atmosphere",
          dialogue: [
            {
              character: "MAYA",
              text: "Yaar, mujhe samajh nahi aata...",
              emotion: "confused"
            },
            {
              character: "KODEX",
              text: "Their data... dissolved.",
              emotion: "mysterious"
            }
          ],
          actions: ["Maya sits on floor eating ice cream", "KODEX materializes in the digital realm"]
        }
      ],
      metadata: {
        title: "Left Swipe",
        genre: "Sci-Fi Drama",
        duration: "5 minutes"
      }
    };
  }

  // Generate images using Stability AI (primary method)
  static async generateImage(prompt: string): Promise<string> {
    try {
      console.log('Generating image with prompt:', prompt);
      
      // Try Stability AI first
      if (API_KEYS.STABILITY_API_KEY && API_KEYS.STABILITY_API_KEY !== 'YOUR_STABILITY_API_KEY_HERE') {
        try {
          return await this.generateImageStability(prompt);
        } catch (stabilityError) {
          console.warn('Stability AI failed, using fallback:', stabilityError);
        }
      }
      
      // Fallback to placeholder
      return `https://picsum.photos/800/600?random=${Math.random()}`;
    } catch (error) {
      console.error('Error generating image:', error);
      return `https://picsum.photos/800/600?random=${Math.random()}`;
    }
  }

  // Text-to-Speech using ElevenLabs REST API
  static async generateSpeech(text: string, voiceConfig: any): Promise<string> {
    try {
      // Check if ElevenLabs API key is available
      if (API_KEYS.ELEVENLABS_API_KEY && API_KEYS.ELEVENLABS_API_KEY !== 'YOUR_ELEVENLABS_API_KEY_HERE') {
        // Use ElevenLabs REST API directly
        const voiceId = voiceConfig.voiceId || 'pNInz6obpgDQGcFmaJgB'; // Adam voice as default
        
        const response = await fetch(`${API_ENDPOINTS.ELEVENLABS}/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': API_KEYS.ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: voiceConfig.stability || 0.5,
              similarity_boost: voiceConfig.similarityBoost || 0.8,
              style: voiceConfig.style || 0.0,
              use_speaker_boost: true
            }
          })
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          return URL.createObjectURL(audioBlob);
        } else {
          console.warn('ElevenLabs API request failed:', response.statusText);
          throw new Error('ElevenLabs API failed');
        }
      } else {
        console.log('ElevenLabs API key not configured, using fallback TTS');
        return await this.generateFallbackSpeech(text, voiceConfig);
      }
    } catch (error) {
      console.error('Error generating speech with ElevenLabs:', error);
      return await this.generateFallbackSpeech(text, voiceConfig);
    }
  }

  // Fallback TTS using Web Speech API
  static async generateFallbackSpeech(text: string, voiceConfig: any): Promise<string> {
    try {
      // For now, we'll use the browser's speech synthesis as a fallback
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        return new Promise((resolve) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = voiceConfig.rate || 1.0;
          utterance.pitch = voiceConfig.pitch || 1.0;
          utterance.volume = 0.8;
          
          // Try to find appropriate voice
          const voices = speechSynthesis.getVoices();
          if (voiceConfig.gender === 'FEMALE') {
            utterance.voice = voices.find(voice => voice.name.includes('Female')) || voices[0];
          } else {
            utterance.voice = voices.find(voice => voice.name.includes('Male')) || voices[1] || voices[0];
          }

          utterance.onend = () => {
            // Return a placeholder URL since Web Speech API doesn't return audio data
            resolve('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABEsAQACABAAZGF0YQAAAAA=');
          };

          utterance.onerror = () => {
            resolve('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABEsAQACABAAZGF0YQAAAAA=');
          };

          speechSynthesis.speak(utterance);
        });
      }

      // Ultimate fallback
      return 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABEsAQACABAAZGF0YQAAAAA=';
    } catch (error) {
      console.error('Fallback TTS failed:', error);
      return 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABEsAQACABAAZGF0YQAAAAA=';
    }
  }

  // Generate video using RunwayML
  static async generateVideo(prompt: string, imageUrl?: string): Promise<string> {
    try {
      console.log('Generating video with prompt:', prompt);
      
      if (!API_KEYS.RUNWAYML_API_KEY || API_KEYS.RUNWAYML_API_KEY === 'YOUR_RUNWAYML_API_KEY_HERE') {
        console.warn('RunwayML API key not configured, using placeholder video');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
        return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
      }

      // Try RunwayML API
      const requestBody: any = {
        text_prompt: prompt,
        model: 'gen3a_turbo',
        aspect_ratio: '16:9',
        duration: 10
      };

      if (imageUrl) {
        requestBody.image_prompt = imageUrl;
      }

      const response = await fetch(`${API_ENDPOINTS.RUNWAYML}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEYS.RUNWAYML_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('RunwayML API Error Response:', errorText);
        throw new Error(`RunwayML API error (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();
      
      // RunwayML returns a generation ID that we'd need to poll for completion
      // For now, return placeholder video
      console.log('RunwayML response:', data);
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time
      return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
      
    } catch (error) {
      console.error('Error generating video:', error);
      // Fallback to placeholder
      await new Promise(resolve => setTimeout(resolve, 2000));
      return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
    }
  }

  // Generate images using Stability AI
  static async generateImageStability(prompt: string): Promise<string> {
    try {
      if (!API_KEYS.STABILITY_API_KEY || API_KEYS.STABILITY_API_KEY === 'YOUR_STABILITY_API_KEY_HERE') {
        console.warn('Stability AI API key not configured, using placeholder image');
        return `https://picsum.photos/1024/1024?random=${Math.random()}`;
      }

      const response = await fetch(`${API_ENDPOINTS.STABILITY}/generation/stable-diffusion-xl-1024-v1-0/text-to-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEYS.STABILITY_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text_prompts: [{ 
            text: prompt,
            weight: 1
          }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: 1,
          seed: 0
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stability AI API Error Response:', errorText);
        throw new Error(`Stability AI error (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();
      if (data.artifacts && data.artifacts[0] && data.artifacts[0].base64) {
        return `data:image/png;base64,${data.artifacts[0].base64}`;
      } else {
        throw new Error('Invalid response structure from Stability AI');
      }
    } catch (error) {
      console.error('Error with Stability AI:', error);
      // Fallback to placeholder
      return `https://picsum.photos/1024/1024?random=${Math.random()}`;
    }
  }

  // Validate API keys
  static validateAPIKeys(): { valid: string[]; missing: string[] } {
    const valid: string[] = [];
    const missing: string[] = [];

    Object.entries(API_KEYS).forEach(([key, value]) => {
      if (value && value !== `YOUR_${key}_HERE` && value.trim() !== '') {
        valid.push(key);
      } else {
        missing.push(key);
      }
    });

    return { valid, missing };
  }

  // Save API keys to localStorage
  static saveAPIKey(keyName: string, keyValue: string) {
    try {
      safeLocalStorageSet(keyName, keyValue);
      (API_KEYS as any)[keyName] = keyValue;
    } catch (error) {
      console.error('Failed to save API key:', error);
      throw new Error('Failed to save API key to local storage');
    }
  }

  // Test API key validity
  static async testAPIKey(keyName: string, keyValue: string): Promise<boolean> {
    try {
      if (keyName === 'GEMINI_API_KEY') {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyValue}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        return response.ok;
      } else if (keyName === 'ELEVENLABS_API_KEY') {
        const response = await fetch(`${API_ENDPOINTS.ELEVENLABS}/models`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'xi-api-key': keyValue
          }
        });
        return response.ok;
      } else if (keyName === 'STABILITY_API_KEY') {
        const response = await fetch(`${API_ENDPOINTS.STABILITY}/engines/list`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${keyValue}`
          }
        });
        return response.ok;
      }
      return true; // For other APIs, assume valid for now
    } catch (error) {
      console.error(`Error testing ${keyName}:`, error);
      return false;
    }
  }

  // Get available ElevenLabs voices
  static async getAvailableVoices(): Promise<any[]> {
    try {
      if (!API_KEYS.ELEVENLABS_API_KEY || API_KEYS.ELEVENLABS_API_KEY === 'YOUR_ELEVENLABS_API_KEY_HERE') {
        return [
          { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', category: 'premade' },
          { voice_id: '29vD33N1CtxCmqQRPOHJ', name: 'Arnold', category: 'premade' }
        ];
      }

      const response = await fetch(`${API_ENDPOINTS.ELEVENLABS}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': API_KEYS.ELEVENLABS_API_KEY
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.voices || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  // Create output preview data
  static createOutputPreview(type: string, filename: string, url?: string, metadata?: any) {
    return {
      type,
      filename,
      url,
      metadata,
      createdAt: new Date().toISOString(),
      size: metadata?.size || 'Unknown',
      preview: url || null
    };
  }

  // Store generated output data
  static storeOutput(phaseId: string, output: any) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const existingOutputs = JSON.parse(safeLocalStorageGet(`outputs_${phaseId}`) || '[]');
        existingOutputs.push(output);
        safeLocalStorageSet(`outputs_${phaseId}`, JSON.stringify(existingOutputs));
      }
    } catch (error) {
      console.warn('Failed to store output:', error);
    }
  }

  // Retrieve stored outputs for a phase
  static getStoredOutputs(phaseId: string): any[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return JSON.parse(safeLocalStorageGet(`outputs_${phaseId}`) || '[]');
      }
    } catch (error) {
      console.warn('Failed to retrieve outputs:', error);
    }
    return [];
  }
}