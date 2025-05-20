// utils/speechHelpers.ts
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

// 1️⃣ Request both microphone & speech‑recognizer permissions
export async function requestPermissions(): Promise<void> {
  const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  if (!granted) {
    throw new Error('Speech recognition permission not granted');
  }
}

// 2️⃣ Start recognition (single‑shot: stops automatically after you pause)
export function startSpeechRecognition(options = { lang: 'en-US', continuous: false, interimResults: false }): void {
  ExpoSpeechRecognitionModule.start(options);
}

// 3️⃣ Stop recognition and fire a final “result” event
export function stopSpeechRecognition(): void {
  ExpoSpeechRecognitionModule.stop();
}
