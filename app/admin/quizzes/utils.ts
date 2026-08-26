/* eslint-disable @typescript-eslint/no-explicit-any */
// Generate unique quiz ID
export function generateQuizId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `CODEBREAKER-QUIZZES-${timestamp}${random}`;
}

/**
 * Universal helper to extract questions for a specific Shift and Question Set from questionsJson.
 * Fully supports:
 * 1. Shift-wise structured JSON: { "shift_1": { "A": [...], "B": [...] }, "shift_2": { "A": [...] } }
 * 2. Flat shift keys: { "shift_1_A": [...], "1_A": [...] }
 * 3. Legacy set keys: { "A": [...], "B": [...] }
 * 4. Raw array format: [ ... ]
 */
export function getQuestionsForShiftAndSet(
  questionsDataOrJson: any,
  shiftNumber: number = 1,
  setLetter: string = "A"
): any[] {
  if (!questionsDataOrJson) return [];

  let data = questionsDataOrJson;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return [];
    }
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (typeof data !== "object" || data === null) {
    return [];
  }

  const cleanSet = (setLetter || "A").trim().toUpperCase();
  const shiftKey = `shift_${shiftNumber}`;

  // 1. Check nested shift object: data.shift_1["A"]
  if (data[shiftKey] && typeof data[shiftKey] === "object" && !Array.isArray(data[shiftKey])) {
    if (Array.isArray(data[shiftKey][cleanSet])) {
      return data[shiftKey][cleanSet];
    }
    // Fallback to first available set in that shift
    const firstSet = Object.keys(data[shiftKey])[0];
    if (firstSet && Array.isArray(data[shiftKey][firstSet])) {
      return data[shiftKey][firstSet];
    }
  }

  // 2. Check flat composite keys: "shift_1_A" or "1_A"
  if (Array.isArray(data[`shift_${shiftNumber}_${cleanSet}`])) {
    return data[`shift_${shiftNumber}_${cleanSet}`];
  }
  if (Array.isArray(data[`${shiftNumber}_${cleanSet}`])) {
    return data[`${shiftNumber}_${cleanSet}`];
  }

  // 3. Fallback to top-level set key: data["A"]
  if (Array.isArray(data[cleanSet])) {
    return data[cleanSet];
  }

  // 4. Fallback to default "A" or first array found
  if (Array.isArray(data["A"])) {
    return data["A"];
  }

  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }

  return [];
}

/**
 * Parse questionsJson into a nested shift map: { [shiftNumber]: { [setLetter]: Question[] } }
 */
export function parseQuestionsByShiftAndSet(
  questionsJson: string,
  totalShifts: number = 1,
  totalSets: number = 1
): Record<number, Record<string, any[]>> {
  const result: Record<number, Record<string, any[]>> = {};

  // Initialize empty shifts
  for (let s = 1; s <= Math.max(totalShifts, 1); s++) {
    result[s] = {};
    for (let setIdx = 0; setIdx < Math.max(totalSets, 1); setIdx++) {
      const letter = String.fromCharCode(65 + setIdx);
      result[s][letter] = [];
    }
  }

  if (!questionsJson || !questionsJson.trim()) {
    return result;
  }

  try {
    const parsed = JSON.parse(questionsJson);

    if (Array.isArray(parsed)) {
      if (!result[1]) result[1] = {};
      result[1]["A"] = parsed;
      return result;
    }

    if (typeof parsed === "object" && parsed !== null) {
      // Check if nested shift_X structure exists
      let hasNestedShifts = false;
      Object.keys(parsed).forEach((key) => {
        const match = key.match(/^shift_(\d+)$/);
        if (match) {
          hasNestedShifts = true;
          const sNum = parseInt(match[1], 10);
          if (!result[sNum]) result[sNum] = {};
          const shiftObj = parsed[key];
          if (typeof shiftObj === "object" && shiftObj !== null) {
            Object.entries(shiftObj).forEach(([letter, list]) => {
              if (Array.isArray(list)) {
                result[sNum][letter.toUpperCase()] = list;
              }
            });
          }
        }
      });

      if (!hasNestedShifts) {
        // Legacy flat format: { "A": [...], "B": [...] }
        Object.entries(parsed).forEach(([key, list]) => {
          if (Array.isArray(list) && key.length === 1 && key >= "A" && key <= "Z") {
            if (!result[1]) result[1] = {};
            result[1][key] = list;
          }
        });
      }
    }
  } catch (e) {
    console.error("Error parsing questions by shift and set:", e);
  }

  return result;
}
