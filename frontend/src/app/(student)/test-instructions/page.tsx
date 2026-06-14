import fs from 'fs';
import path from 'path';

export default function TestInstructionsPage() {
  let content = '';
  try {
    const filePath = 'C:/Users/dazzb/.gemini/antigravity-ide/brain/90a42d30-e5ef-472c-aa7c-cdcef9f3686e/.system_generated/logs/transcript.jsonl';
    const firstLine = fs.readFileSync(filePath, 'utf-8').split('\n')[0];
    const parsed = JSON.parse(firstLine);
    content = parsed.content || 'No content';
  } catch (err: any) {
    content = 'Error: ' + err.message;
  }

  return (
    <div className="p-8 bg-zinc-900 text-zinc-100 min-h-screen font-mono whitespace-pre-wrap">
      <h1 className="text-2xl font-bold mb-4">Instructions</h1>
      <div className="border border-zinc-700 p-4 bg-zinc-950 rounded">
        {content}
      </div>
    </div>
  );
}
