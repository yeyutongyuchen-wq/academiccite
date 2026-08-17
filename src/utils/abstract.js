/**
 * 将 OpenAlex abstract_inverted_index 还原为可读纯文本摘要
 * @param {Record<string, number[]> | null | undefined} invertedIndex
 * @returns {string}
 */
export function reconstructAbstract(invertedIndex) {
  if (!invertedIndex || typeof invertedIndex !== 'object') {
    return '';
  }

  const positions = [];
  for (const [word, idxs] of Object.entries(invertedIndex)) {
    if (!Array.isArray(idxs)) continue;
    for (const idx of idxs) {
      if (typeof idx === 'number' && idx >= 0) {
        positions[idx] = word;
      }
    }
  }

  // 过滤空洞并拼接
  return positions.filter(Boolean).join(' ').trim();
}

/**
 * 从摘要中提取前 3 个有意义的句子作为 Takeaways
 * （零成本启发式，生产环境可后续接入本地 LLM）
 * @param {string} abstract
 * @returns {string[]}
 */
export function extractTakeaways(abstract) {
  if (!abstract || abstract.length < 40) return [];

  const sentences = abstract
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 25 && s.length < 280);

  return sentences.slice(0, 3);
}