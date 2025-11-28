// Generate unique quiz ID
export function generateQuizId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `CODEBREAKER-QUIZZES-${timestamp}${random}`;
}
