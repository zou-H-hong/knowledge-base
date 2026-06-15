/**
 * 标签排序工具 — 按 tag-taxonomy.json 的分组优先级和组内顺序排列
 */

interface TaxonomyTag {
  id: string;
  label: string;
  aliases: string[];
}

interface TaxonomyGroup {
  id: string;
  label: string;
  priority: number;
  tags: TaxonomyTag[];
}

interface Taxonomy {
  groups: TaxonomyGroup[];
}

let _taxonomy: Taxonomy | null = null;

async function loadTaxonomy(): Promise<Taxonomy> {
  if (_taxonomy) return _taxonomy;
  try {
    const res = await fetch('/tag-taxonomy.json');
    _taxonomy = await res.json();
    return _taxonomy!;
  } catch {
    return { groups: [] };
  }
}

/**
 * 将标签名规范化为 taxonomy 中的标准 label
 * 支持别名匹配：如 "社会" → "社会学"，"乡村" → "乡村研究"
 */
function normalize(tagName: string, taxonomy: Taxonomy): { label: string; priority: number; groupOrder: number; tagOrder: number } {
  for (const group of taxonomy.groups) {
    for (let i = 0; i < group.tags.length; i++) {
      const tag = group.tags[i];
      if (tag.label === tagName || tag.aliases.includes(tagName)) {
        return { label: tag.label, priority: group.priority, groupOrder: group.priority, tagOrder: i };
      }
    }
  }
  // 未收录的标签排在最后
  return { label: tagName, priority: 999, groupOrder: 999, tagOrder: 0 };
}

/**
 * 按标签体系排序：先按分组优先级，再按组内顺序
 * @param tags 原始标签数组（逗号分隔的字符串或数组）
 * @returns 排序后的标签数组
 */
export async function sortTags(tags: string[] | string): Promise<string[]> {
  const taxonomy = await loadTaxonomy();
  const arr = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags;

  const sorted = arr
    .map(t => ({ original: t, ...normalize(t, taxonomy) }))
    .sort((a, b) => a.priority - b.priority || a.groupOrder - b.groupOrder || a.tagOrder - b.tagOrder);

  return sorted.map(t => t.label);
}

/**
 * 同步版本 — 用预加载的 taxonomy 排序（管理后台用）
 */
export function sortTagsSync(tags: string[], taxonomy: Taxonomy): string[] {
  const arr = typeof tags === 'string' ? (tags as string).split(',').map(t => t.trim()).filter(Boolean) : tags;
  return arr
    .map(t => ({ original: t, ...normalize(t, taxonomy) }))
    .sort((a, b) => a.priority - b.priority || a.groupOrder - b.groupOrder || a.tagOrder - b.tagOrder)
    .map(t => t.label);
}

/**
 * 获取所有 taxonomy 中的标签（管理后台选标签用）
 */
export function getAllTaxonomyTags(taxonomy: Taxonomy): { group: string; groupLabel: string; tags: string[] }[] {
  return taxonomy.groups.map(g => ({
    group: g.id,
    groupLabel: g.label,
    tags: g.tags.map(t => t.label),
  }));
}
