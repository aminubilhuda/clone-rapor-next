export interface MapelHierarkiRow {
  id_mapel: number;
  parent_id: number | null;
  nama_mapel: string;
  urut: number | null;
}

export interface MapelHierarkiNode<T extends MapelHierarkiRow> {
  id_mapel: number;
  nama_mapel: string;
  is_parent: boolean;
  items: T[];
}

const compareText = (a: string, b: string) => a.localeCompare(b, 'id');

const leaf = <T extends MapelHierarkiRow>(item: T): MapelHierarkiNode<T> => ({
  id_mapel: item.id_mapel,
  nama_mapel: item.nama_mapel,
  is_parent: false,
  items: [item],
});

/**
 * Mengelompokkan mapel anak di bawah induknya.
 * Jika tidak ada satu pun anak, urutan input dikembalikan apa adanya
 * (menjaga tampilan periode lama).
 */
export function buildMapelHierarki<T extends MapelHierarkiRow>(
  items: T[],
  parentById: Map<number, MapelHierarkiRow> = new Map(),
): MapelHierarkiNode<T>[] {
  if (!items.some((item) => item.parent_id != null)) {
    return items.map(leaf);
  }

  const itemById = new Map(items.map((item) => [item.id_mapel, item]));
  const lookupParent = (parentId: number): MapelHierarkiRow | undefined =>
    parentById.get(parentId) ?? itemById.get(parentId);

  const groups = new Map<number, T[]>();
  const standalone: T[] = [];

  for (const item of items) {
    const parent = item.parent_id == null ? undefined : lookupParent(item.parent_id);
    if (!parent) {
      standalone.push(item);
      continue;
    }
    const group = groups.get(item.parent_id!) ?? [];
    group.push(item);
    groups.set(item.parent_id!, group);
  }

  if (groups.size === 0) {
    return items.map(leaf);
  }

  // Induk yang ikut terdaftar sebagai mapel siswa tidak dirender ganda.
  const parentIds = new Set(groups.keys());
  const entries: Array<{
    sortUrut: number;
    sortNama: string;
    sortId: number;
    node: MapelHierarkiNode<T>;
  }> = [];

  for (const item of standalone) {
    if (parentIds.has(item.id_mapel)) continue;
    entries.push({
      sortUrut: item.urut ?? 0,
      sortNama: item.nama_mapel,
      sortId: item.id_mapel,
      node: leaf(item),
    });
  }

  for (const [parentId, children] of groups) {
    const parent = lookupParent(parentId)!;
    const sorted = [...children].sort(
      (a, b) =>
        (a.urut ?? 0) - (b.urut ?? 0) ||
        compareText(a.nama_mapel, b.nama_mapel) ||
        a.id_mapel - b.id_mapel,
    );
    entries.push({
      sortUrut: parent.urut ?? 0,
      sortNama: parent.nama_mapel,
      sortId: parent.id_mapel,
      node: {
        id_mapel: parent.id_mapel,
        nama_mapel: parent.nama_mapel,
        is_parent: true,
        items: sorted,
      },
    });
  }

  entries.sort(
    (a, b) =>
      a.sortUrut - b.sortUrut ||
      compareText(a.sortNama, b.sortNama) ||
      a.sortId - b.sortId,
  );

  return entries.map((entry) => entry.node);
}
