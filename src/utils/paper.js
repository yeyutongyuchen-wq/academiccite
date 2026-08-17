/**
 * 规范化 DOI（去除可能的 doi: 或 https://doi.org/ 前缀）
 * @param {string | string[]} raw
 * @returns {string}
 */
export function normalizeDoi(raw) {
  if (!raw) return '';
  const joined = Array.isArray(raw) ? raw.join('/') : String(raw);
  return joined
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:/i, '')
    .trim();
}

/**
 * 构建 OpenAlex 与 Unpaywall 请求 URL
 */
export function buildApiUrls(doi) {
  const encoded = encodeURIComponent(doi);
  return {
    openAlex: `https://api.openalex.org/works/https://doi.org/${encoded}`,
    unpaywall: `https://api.unpaywall.org/v2/${encoded}?email=api-agent@academiccite.com`
  };
}