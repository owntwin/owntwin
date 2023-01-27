export const coordSorter = (a: number[], b: number[]) =>
  a[0] - b[0] != 0 ? a[0] - b[0] : a[1] - b[1] != 0 ? a[1] - b[1] : a[2] - b[2];

// https://qiita.com/nagtkk/items/e1cc3f929b61b1882bd1
export const groupBy = <K, V>(
  array: readonly V[],
  getKey: (cur: V, idx: number, src: readonly V[]) => K,
): [K, V[]][] =>
  Array.from(
    array.reduce((map, cur, idx, src) => {
      const key = getKey(cur, idx, src);
      const list = map.get(key);
      if (list) list.push(cur);
      else map.set(key, [cur]);
      return map;
    }, new Map<K, V[]>()),
  );
