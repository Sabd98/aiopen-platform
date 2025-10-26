// Try to extract a single primary answer text from known shapes
export const extractAnswerText = (node: any, depth = 0): string | null => {
  if (node == null || depth > 6) return null;
  if (typeof node === "string") return node.trim() || null;
  if (typeof node.text === "string" && node.text.trim() !== "")
    return node.text.trim();

  // steps -> content[].text
  if (Array.isArray(node.steps)) {
    for (const step of node.steps) {
      if (Array.isArray(step.content)) {
        for (const piece of step.content) {
          if (
            piece &&
            typeof piece.text === "string" &&
            piece.text.trim() !== ""
          )
            return piece.text.trim();
        }
      }
      const r = extractAnswerText(step, depth + 1);
      if (r) return r;
    }
  }

  // content array
  if (Array.isArray(node.content)) {
    for (const el of node.content) {
      if (el && typeof el.text === "string" && el.text.trim() !== "")
        return el.text.trim();
    }
  }

  // output array
  if (Array.isArray(node.output)) {
    for (const out of node.output) {
      if (Array.isArray(out.content)) {
        for (const piece of out.content) {
          if (
            piece &&
            typeof piece.text === "string" &&
            piece.text.trim() !== ""
          )
            return piece.text.trim();
        }
      }
      const r = extractAnswerText(out, depth + 1);
      if (r) return r;
    }
  }

  // shallow scan other props
  if (typeof node === "object") {
    for (const k of Object.keys(node)) {
      const v = node[k];
      if (v && (typeof v === "object" || typeof v === "string")) {
        const r = extractAnswerText(v, depth + 1);
        if (r) return r;
      }
    }
  }

  return null;
};
