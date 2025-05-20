import { parseallcapsScript } from './parseallcapsScript'; 
import { parseColonScript } from './parseColonScript'; 

type ScriptPart = {
  type: 'dialogue' | 'action' | 'scene';
  character?: string;
  content: string;
};

/**
 * Main parser that determines which sub-parser to use: colon or all-caps
 */
export function parseScript(script: string): ScriptPart[] {
  // Detect if script has any colon-based character lines
  const lines = script.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    // Match character lines like JOHN: Hello there
    if (/^[A-Z][A-Z\s'-]{1,30}:/.test(trimmedLine)) {
      console.log("colon function"); 
      // Delegate to colon parser
      return parseColonScript(script);
    }
  }

  // Default to ALL CAPS format
  return parseallcapsScript(script);
}
