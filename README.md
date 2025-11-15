# Fog of War - RPG Video App

An Ionic Angular app that allows you to select videos from your device and apply a "fog of war" dark mask that can be removed by touching or using a brush tool.

## Features

- 📹 Select videos from your device
- 🌫️ Apply dark fog of war overlay on videos
- 👆 Remove fog by touching/clicking on areas
- 🖌️ Adjustable brush size (Small, Medium, Large)
- 🔄 Reset fog to cover entire video again

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
2. The video will play with a dark fog overlay
3. Touch or click on areas to remove the fog (reveal the video)
4. Use the brush size selector to adjust the removal area
5. Tap "Reset Fog" to cover the entire video again
6. Tap "Change Video" to select a different video

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

These are configured in `capacitor.config.ts`.

