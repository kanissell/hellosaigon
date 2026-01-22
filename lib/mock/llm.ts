export async function mockLLM(message: string): Promise<{ text: string }> {
  const trimmed = message.trim();

  return {
    text:
      "Got it. Locals usually ask this when they're in town. " +
      (trimmed
        ? `You asked: ${trimmed}`
        : "You didn't ask anything specific, but I'm here to help when you do."),
  };
}
