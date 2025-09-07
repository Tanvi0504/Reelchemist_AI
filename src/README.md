# AI-Powered Film Production Pipeline

A comprehensive web application for managing AI-powered film production workflows. This tool helps filmmakers create complete short films using various AI services for screenplay parsing, asset generation, and post-production.

## Features

### 🎬 Complete Production Pipeline
- **9-Phase Workflow**: From screenplay input to final film export
- **Real-time Progress Tracking**: Visual status indicators for each phase
- **Interactive Workspace**: Dedicated tools for each production phase

### 🤖 AI Integration
- **Gemini API**: Screenplay parsing and image generation
- **Google Cloud TTS**: High-quality voice synthesis
- **RunwayML**: AI video generation
- **Multiple AI Services**: Flexible integration with various providers

### 📁 File Management
- **Multi-format Support**: .txt, .docx, .pdf screenplay uploads
- **Drag & Drop Interface**: Easy file handling
- **Asset Organization**: Automatic categorization of generated content

### 🎨 Production Features
- **Character Model Sheets**: AI-generated consistent character references
- **Scene Generation**: Dynamic video clips with AI
- **Audio Synthesis**: Character-specific voice generation
- **Visual Effects**: Integrated post-production tools

## Required API Keys

To use all features, you'll need API keys from:

1. **Gemini API** (Required)
   - Get key: [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Used for: Screenplay parsing, image generation

2. **ElevenLabs API** (Recommended)
   - Get key: [ElevenLabs](https://elevenlabs.io/docs/api-reference/getting-started)
   - Used for: Professional voice synthesis and dialogue audio
   - Package: `@elevenlabs/elevenlabs-js`

3. **RunwayML API** (Optional)
   - Get key: [RunwayML API](https://runwayml.com/api)
   - Used for: AI video generation

4. **Stability AI** (Optional)
   - Get key: [Stability AI Platform](https://platform.stability.ai/docs/getting-started)
   - Used for: High-quality image generation

### Text-to-Speech Options
- **Primary**: ElevenLabs for professional voice synthesis
- **Fallback**: Browser's built-in Web Speech API (no key required)
- **Python TTS**: Can integrate with Python backend for additional options

## Getting Started

1. **Configure API Keys**
   - Click the "API Keys" button in the header
   - Add your API keys (start with Gemini for basic functionality)
   - Keys are stored securely in your browser

2. **Upload Screenplay**
   - Select Phase 1: Screenplay Input
   - Upload a .txt file or paste your screenplay directly
   - Use standard screenplay formatting for best results

3. **Process Pipeline**
   - Work through each phase sequentially
   - Monitor progress in the workspace
   - Review generated assets in the preview

4. **Export Film**
   - Use the preview modal to review your film
   - Export final video and project files
   - Save project progress locally

## Screenplay Format

For best AI parsing results, use standard screenplay format:

```
FADE IN:

INT. LOCATION - TIME

CHARACTER
Dialogue text here.

Action lines describing what happens.

FADE OUT.
```

## Example Project: "Left Swipe"

The application includes a sample project workflow:

- **Genre**: Sci-Fi Drama
- **Duration**: ~5 minutes  
- **Characters**: MAYA (human), KODEX (AI entity)
- **Themes**: Technology, connection, digital identity

## Phase Breakdown

1. **Screenplay Input**: Upload/paste screenplay text
2. **Screenplay Parsing**: AI extracts structured data
3. **Visual Asset Generation**: Create character model sheets
4. **Audio Generation**: Synthesize dialogue and effects
5. **Scene Video Generation**: AI-generated video clips
6. **Screen Recording & FX**: UI interactions and effects
7. **Video Assembly**: Combine all elements
8. **Final Touches**: Color grading and titles
9. **Export**: Final film delivery

## Technical Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **APIs**: Multiple AI service integrations
- **Audio**: ElevenLabs JavaScript SDK + Web Speech API fallback
- **Storage**: Browser localStorage for project data
- **Error Handling**: React Error Boundaries
- **Notifications**: Sonner toast notifications

## Privacy & Security

- All API keys stored locally in browser
- No server-side data storage
- Files processed client-side when possible
- Designed for creative professionals, not sensitive data

## Installation & Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Install ElevenLabs SDK: `npm install @elevenlabs/elevenlabs-js`
4. Start the development server: `npm start`
5. Configure your API keys using the in-app API Keys Manager
6. Upload a screenplay and begin your AI-powered film production journey!

## Troubleshooting

### Common Issues

**"Gemini API error" when parsing screenplay:**
- Check that your Gemini API key is valid and has quota
- Ensure you have enabled the Generative Language API in Google Cloud Console
- Try uploading a properly formatted screenplay (.txt files work best)
- The app will use fallback demo data if API parsing fails

**ElevenLabs TTS not working:**
- Verify your ElevenLabs API key is correct
- Check that your account has sufficient quota
- The app will fall back to browser TTS if ElevenLabs fails

**File upload issues:**
- Ensure your screenplay is in .txt format with UTF-8 encoding
- Check that the file size is reasonable (< 1MB recommended)
- Try copying and pasting the text directly if file upload fails

### API Key Setup

1. **Gemini API**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Enable "Generative Language API" in Google Cloud Console
   
2. **ElevenLabs**: Visit [ElevenLabs](https://elevenlabs.io/docs/api-reference/getting-started)
   - Sign up for an account
   - Generate an API key from your profile settings

### Error Recovery

The application includes comprehensive error handling:
- Failed API calls fall back to demo/mock data
- Retry buttons for transient errors
- Detailed error messages with suggested fixes
- Graceful degradation when services are unavailable

## Contributing

This is a demonstration application showcasing AI-powered creative workflows. Feel free to extend with additional AI services or production features.

## License

MIT License - See LICENSE file for details