type ScriptPart = {
  type: 'dialogue' | 'action' | 'scene';
  character?: string;
  content: string;
};

export function parseallcapsScript(script: string): ScriptPart[] {
   console.log("ALL caps function"); 
  const lines = script.split('\n');
  const parsed: ScriptPart[] = [];

  let currentCharacter = '';
  let currentDialogue: string[] = [];

  const flushDialogue = () => {
    if (currentDialogue.length && currentCharacter) {
      const fullDialogue = currentDialogue.join(' ').trim();

      // Extract inline actions
      const actionMatches = [...fullDialogue.matchAll(/\([^)]*\)/g)];
      let cleanedDialogue = fullDialogue.replace(/\([^)]*\)/g, '').replace(/\s{2,}/g, ' ').trim();

      if (cleanedDialogue) {
        parsed.push({
          type: 'dialogue',
          character: currentCharacter,
          content: cleanedDialogue,
        });
      }

      // Add inline actions separately
      for (const match of actionMatches) {
        const actionText = match[0].slice(1, -1).trim(); // remove ( )
        if (actionText && actionText.toUpperCase() !== "CONT'D") {
          parsed.push({
            type: 'action',
            content: actionText,
          });
        }
      }

      currentDialogue = [];
    }
  };

  const isCharacterLine = (line: string, nextLine: string): string | null => {
    // Match CHARLIE or CHARLIE (CONT'D)
    const match = line.match(/^([A-Z][A-Z\s'-]{1,30})(\s*\(CONT'D\))?$/);
    if (match && nextLine && !/^[A-Z\s'-]{2,30}$/.test(nextLine)) {
      const characterName = match[1].trim();
      return characterName;
    }

    // Also handle colon format e.g. JOHN:
    const colonMatch = line.match(/^([A-Z][A-Z\s'-]{1,30}):/);
    if (colonMatch) {
      return colonMatch[1].trim();
    }

    return null;
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    line = line.replace(/\(CONT'D\)/gi, '').trim();
    if (!line || /^\d+\.$/.test(line)) continue;

    const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
    const maybeCharacter = isCharacterLine(line, nextLine);

    if (maybeCharacter) {
      flushDialogue();

      // If line contains (CONT'D) as a separate action, extract it
      if (/\(CONT'D\)/i.test(line)) {
        parsed.push({
          type: 'action',
          content: 'continues',
        });
      }

      currentCharacter = maybeCharacter;

      // If line is colon-style and includes dialogue
      if (line.includes(':')) {
        const dialogue = line.split(':').slice(1).join(':').trim();
        if (dialogue) {
          currentDialogue.push(dialogue);
        }
      }

      continue;
    }

    // Action line detection
    if (
      /\b(enters|exits|walks|runs|drinks|pours|fills|laughs|smiles|pause|looks|cheers|performs)\b/i.test(line) ||
      (line.startsWith('(') && line.endsWith(')'))
    ) {
      flushDialogue();
      parsed.push({
        type: 'action',
        content: line.replace(/^\(|\)$/g, '').trim(),
      });
      continue;
    }

    // Scene description if no current character
    if (!currentCharacter) {
      flushDialogue();
      parsed.push({
        type: 'scene',
        content: line,
      });
      continue;
    }

    // Otherwise, part of the current character's dialogue
    currentDialogue.push(line);
  }

  flushDialogue();
  return parsed;
}
