import type { OnChunk } from "../types/api";

// helper: process buffer for SSE events separated by \n\n
export const processBuffer = (buffer: string, onChunk: OnChunk) => {
  const parts = buffer.split("\n\n");

  for (const rawEvent of parts) {
    // each event can have multiple lines; we care lines starting with "data:"
    const lines = rawEvent.split("\n");
    for (const line of lines) {
      if (line.startsWith("data:")) {
        const payload = line.replace(/^data:\s*/, "");
        const obj = JSON.parse(payload);
        if (obj.chunk) {
          onChunk(obj.chunk);
        } else if (obj.error) {
          onChunk(`[error] ${obj.error}`);
        }
      }
    }
  }
};
