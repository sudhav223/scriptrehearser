type ScriptPart = {
  type: 'dialogue' | 'action' | 'scene';
  character?: string;
  content: string;
};

export function parseColonScript(script: string): ScriptPart[] {
    
  const lines = script.split('\n');
  const parsed: ScriptPart[] = [];

  let currentCharacter = '';
  let currentDialogue: string[] = [];

 const flushDialogue = () => {
  if (currentDialogue.length && currentCharacter) {
    const fullDialogue = currentDialogue.join(' ').trim();

    // Extract inline actions (anything inside parentheses)
    const actionMatches = [...fullDialogue.matchAll(/\([^)]*\)/g)];
    let cleanedDialogue = fullDialogue.replace(/\([^)]*\)/g, '').replace(/\s{2,}/g, ' ').trim();

    if (cleanedDialogue) {
      parsed.push({
        type: 'dialogue',
        character: currentCharacter,
        content: cleanedDialogue,
      });
    }

    for (const match of actionMatches) {
      const actionText = match[0].slice(1, -1).trim(); // remove parentheses
      if (actionText) {
        parsed.push({
          type: 'action',
          content: actionText,
        });
      }
    }

    currentDialogue = [];
  }
};

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    // type 1: Character with colon (e.g., JOHN:)
    const colonMatch = line.match(/^([A-Z][A-Z\s'-]{1,30}):/);
    if (colonMatch) {
      flushDialogue();
      currentCharacter = colonMatch[1].trim();
      const dialogue = line.replace(`${currentCharacter}:`, '').trim();
      if (dialogue) currentDialogue.push(dialogue);
      continue;
    }

    // type 2: Character in all caps, next line is dialogue
    const allCapsName = /^[A-Z\s'-]{2,30}$/.test(line);
    const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
    if (
      allCapsName &&
      nextLine &&
      !/^[A-Z\s'-]{2,30}$/.test(nextLine)
    ) {
      flushDialogue();
      currentCharacter = line.trim();
      continue;
    }

    // Actions like (Smiles) or enters/exits
    if (
      (line.startsWith('(') && line.endsWith(')')) ||
      /(begins|holds|enters|exits)/i.test(line)
    ) {
      flushDialogue();
      parsed.push({
        type: 'action',
        content: line,
      });
      continue;
    }

    // Scene description (no current character)
    if (!currentCharacter) {
      flushDialogue();
      parsed.push({
        type: 'scene',
        content: line,
      });
      continue;
    }

    // Add to current character's dialogue
    currentDialogue.push(line);
  }

  flushDialogue();
  console.log("colon function");  // Final cleanup
  return parsed;
}
