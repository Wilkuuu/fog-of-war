# Fog of War - RPG Video App

An Ionic Angular app that allows you to select videos from your device and apply a "fog of war" dark mask that can be removed by touching or using a brush tool. Perfect for creating interactive video experiences where content is revealed progressively.

## Features

- 📹 Select videos from your device with optional fog of war
- 🌫️ Apply dark fog of war overlay on videos (optional on video selection)
- 👆 Remove fog by touching/clicking on areas with adjustable brush sizes
- 🖌️ Three brush sizes: Small (18px), Medium (60px), Large (192px)
- 👁️ Reveal All - Remove all fog at once to show entire video
- ↩️ Undo - Undo last brush stroke or action
- 🔄 Reset Fog - Cover entire video with fog again
- 🎮 Two-finger tap gesture to open menu (hidden menu button as fallback)
- 📱 Full-screen immersive mode (no status/navigation bars)
- 🎨 Modern dark UI with gradient buttons and glassmorphic design
- 🔒 Prevents accidental app closure with confirmation dialog

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Android Studio (for building Android app)
- Ionic CLI: `npm install -g @ionic/cli`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Add Android platform:
```bash
npx cap add android
```

3. Sync Capacitor:
```bash
npx cap sync
```

## Development

Run the app in browser for testing:
```bash
npm start
```

## Building for Android

1. Build the web app:
```bash
npm run build
```

2. Sync with Capacitor:
```bash
npx cap sync
```

3. Open in Android Studio:
```bash
npx cap open android
```

4. Build and run from Android Studio

## Usage

1. Tap "Select Video" to choose a video from your device
2. Choose whether to start with fog of war covering the video or show it fully visible
3. The video will play (with or without fog based on your choice)
4. **Remove fog**: Touch or click on areas to remove the fog and reveal the video
5. **Adjust brush size**: Open menu (two-finger tap or tap the barely visible button in top-left) and select Small/Medium/Large
6. **Reveal All**: Open menu and tap "Reveal All" to remove all fog at once
7. **Undo**: Open menu and tap "Undo" to undo your last action
8. **Reset Fog**: Open menu and tap "Reset Fog" to cover the entire video again
9. **Change Video**: Open menu and tap "Change Video" to select a different video

### Gestures

- **Two-finger tap**: Place two fingers on the screen and quickly lift them to open the menu
- **Single finger**: Touch and drag to remove fog with the brush tool
- **Back button**: Shows confirmation dialog before exiting the app

## Technologies

- **Ionic 7** - UI framework
- **Angular 17** - Application framework
- **Capacitor 5** - Native bridge for Android
- **TypeScript** - Programming language
- **Canvas API** - For fog overlay rendering

## Permissions

The app requires the following Android permissions:
- `READ_EXTERNAL_STORAGE` - To read videos from device
- `READ_MEDIA_VIDEO` - To access video files (Android 13+)

These are configured in `capacitor.config.ts`. Permissions are requested automatically when selecting a video.

## App Configuration

- **Screen Orientation**: Locked to landscape mode
- **Full Screen**: Immersive full-screen mode (hides status and navigation bars)
- **Background**: Pure black (#000000) throughout the app
- **Menu Access**: Two-finger tap gesture (menu button is barely visible as fallback)

