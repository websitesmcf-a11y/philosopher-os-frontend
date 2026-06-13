const MAX_INLINE_FILE_CHARS = 8000;

/** Fold an attached file into the outgoing chat message.
 *
 * There is no file-upload endpoint yet, so text-like files are read in the
 * browser and inlined (capped) so the agent can actually use their content;
 * binary files are passed along by name only.
 */
export async function composeMessageWithFile(rawText: string, file?: File): Promise<string> {
  const text = rawText.trim();
  if (!file) return text;

  const isTexty =
    /^text\//.test(file.type) ||
    /(json|csv|markdown|xml)/.test(file.type) ||
    /\.(txt|csv|md|json|log|xml|html?)$/i.test(file.name);

  if (isTexty) {
    try {
      const content = (await file.text()).slice(0, MAX_INLINE_FILE_CHARS);
      return `${text}\n\n--- Attached file: ${file.name} ---\n${content}`.trim();
    } catch {
      return `${text}\n\n[Attached file: ${file.name} — could not be read]`.trim();
    }
  }
  return `${text}\n\n[Attached file: ${file.name}]`.trim();
}
