import AsyncStorage from '@react-native-async-storage/async-storage';

const getKey = (scriptId: string) => `progress_${scriptId}`;

export async function saveProgress(scriptId: string, newScore: number): Promise<void> {
  const key = getKey(scriptId);
  try {
    const existing = await AsyncStorage.getItem(key);
    const scores: number[] = existing ? JSON.parse(existing) : [];
    const updated = [...scores.slice(-4), newScore]; // keep only last 5
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving progress:', err);
  }
}

export async function getProgress(scriptId: string): Promise<number[]> {
  const key = getKey(scriptId);
  try {
    const stored = await AsyncStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error fetching progress:', err);
    return [];
  }
}
