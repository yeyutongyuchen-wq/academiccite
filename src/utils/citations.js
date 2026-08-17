/**
 * 解析作者姓名（OpenAlex display_name 格式）
 * @param {string} fullName
 * @returns {{ last: string, first: string, initials: string, fullFirst: string }}
 */
function parseName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return { last: '', first: '', initials: '', fullFirst: '' };
  }
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { last: '', first: '', initials: '', fullFirst: '' };
  if (parts.length === 1) {
    return { last: parts[0], first: '', initials: '', fullFirst: '' };
  }
  const last = parts[parts.length - 1];
  const firstParts = parts.slice(0, -1);
  const first = firstParts[0] || '';
  const initials = firstParts.map(p => (p[0] ? p[0].toUpperCase() + '.' : '')).join(' ');
  const fullFirst = firstParts.join(' ');
  return { last, first, initials, fullFirst };
}

/**
 * 安全获取字符串，避免 undefined / null
 */
function safe(str) {
  return (str && String(str).trim()) || '';
}

/**
 * APA 第 7 版引用格式
 * 规则：>20 作者时前 19 名 + ... + 最后一名
 */
export function formatAPA(paper) {
  const authors = (paper.authorships || []).map(a => a.author?.display_name).filter(Boolean);
  const year = paper.publication_year || 'n.d.';
  const title = safe(paper.title) || 'Untitled';
  const journal = safe(paper.primary_location?.source?.display_name);
  const volume = safe(paper.biblio?.volume);
  const issue = safe(paper.biblio?.issue);
  const firstPage = safe(paper.biblio?.first_page);
  const lastPage = safe(paper.biblio?.last_page);
  const pages = firstPage && lastPage ? `${firstPage}-${lastPage}` : firstPage || lastPage || '';

  // 作者部分
  let authorStr = '';
  if (authors.length === 0) {
    authorStr = '';
  } else if (authors.length === 1) {
    const p = parseName(authors[0]);
    authorStr = `${p.last}, ${p.initials || p.first}`.trim().replace(/,$/, '');
  } else if (authors.length <= 20) {
    const parsed = authors.map(parseName);
    const names = parsed.map((p, i) => {
      const name = `${p.last}, ${p.initials || p.first}`.trim().replace(/,$/, '');
      return i === parsed.length - 1 ? `& ${name}` : name;
    });
    authorStr = names.join(', ').replace(', &', ' &');
  } else {
    // >20 作者
    const parsed = authors.map(parseName);
    const first19 = parsed.slice(0, 19).map(p => `${p.last}, ${p.initials || p.first}`.trim().replace(/,$/, ''));
    const last = parsed[parsed.length - 1];
    authorStr = `${first19.join(', ')}, ... ${last.last}, ${last.initials || last.first}`.trim();
  }

  // 期刊与卷期页码（动态省略缺失字段）
  const journalParts = [];
  if (journal) journalParts.push(journal);
  if (volume) {
    const volIssue = issue ? `${volume}(${issue})` : volume;
    journalParts.push(volIssue);
  }
  if (pages) journalParts.push(pages);

  const journalStr = journalParts.length > 0 ? journalParts.join(', ') + '.' : '';

  const parts = [
    authorStr ? `${authorStr}.` : '',
    `(${year}).`,
    `${title}.`,
    journalStr
  ].filter(Boolean);

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * IEEE 引用格式
 * 姓名顺序：Initials. Last
 */
export function formatIEEE(paper) {
  const authors = (paper.authorships || []).map(a => a.author?.display_name).filter(Boolean);
  const year = paper.publication_year || 'n.d.';
  const title = safe(paper.title) || 'Untitled';
  const journal = safe(paper.primary_location?.source?.display_name);
  const volume = safe(paper.biblio?.volume);
  const issue = safe(paper.biblio?.issue);
  const firstPage = safe(paper.biblio?.first_page);
  const lastPage = safe(paper.biblio?.last_page);
  const pages = firstPage && lastPage ? `${firstPage}-${lastPage}` : firstPage || lastPage || '';

  // 作者：Initials. Last
  let authorStr = '';
  if (authors.length > 0) {
    const parsed = authors.map(parseName);
    const names = parsed.map(p => {
      const init = p.initials || (p.first ? p.first[0].toUpperCase() + '.' : '');
      return `${init} ${p.last}`.trim();
    });
    if (names.length === 1) {
      authorStr = names[0];
    } else if (names.length === 2) {
      authorStr = `${names[0]} and ${names[1]}`;
    } else {
      authorStr = names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1];
    }
  }

  const parts = [];
  if (authorStr) parts.push(`${authorStr},`);
  parts.push(`"${title},"`);
  if (journal) parts.push(journal + ',');
  if (volume) parts.push(`vol. ${volume},`);
  if (issue) parts.push(`no. ${issue},`);
  if (pages) parts.push(`pp. ${pages},`);
  parts.push(`${year}.`);

  return parts.join(' ').replace(/\s+/g, ' ').replace(/ ,/g, ',').trim();
}

/**
 * MLA 第 9 版引用格式
 * 第一作者：Last, First
 */
export function formatMLA(paper) {
  const authors = (paper.authorships || []).map(a => a.author?.display_name).filter(Boolean);
  const year = paper.publication_year || 'n.d.';
  const title = safe(paper.title) || 'Untitled';
  const journal = safe(paper.primary_location?.source?.display_name);
  const volume = safe(paper.biblio?.volume);
  const issue = safe(paper.biblio?.issue);
  const firstPage = safe(paper.biblio?.first_page);
  const lastPage = safe(paper.biblio?.last_page);
  const pages = firstPage && lastPage ? `${firstPage}-${lastPage}` : firstPage || lastPage || '';

  // 作者
  let authorStr = '';
  if (authors.length === 1) {
    const p = parseName(authors[0]);
    authorStr = `${p.last}, ${p.fullFirst || p.first}`.trim();
  } else if (authors.length === 2) {
    const p1 = parseName(authors[0]);
    const p2 = parseName(authors[1]);
    authorStr = `${p1.last}, ${p1.fullFirst || p1.first}, and ${p2.fullFirst || p2.first} ${p2.last}`.trim();
  } else if (authors.length > 2) {
    const p1 = parseName(authors[0]);
    authorStr = `${p1.last}, ${p1.fullFirst || p1.first}, et al.`.trim();
  }

  const parts = [];
  if (authorStr) parts.push(`${authorStr}.`);
  parts.push(`"${title}."`);
  if (journal) parts.push(journal + ',');
  if (volume) parts.push(`vol. ${volume},`);
  if (issue) parts.push(`no. ${issue},`);
  parts.push(`${year},`);
  if (pages) parts.push(`pp. ${pages}.`);
  else parts[parts.length - 1] = parts[parts.length - 1].replace(/,$/, '.');

  return parts.join(' ').replace(/\s+/g, ' ').replace(/ ,/g, ',').trim();
}