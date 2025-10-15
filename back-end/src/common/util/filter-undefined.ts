export function filterUndefined(obj: any): any {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(filterUndefined);
  return Object.keys(obj).reduce<any>((acc, key) => {
    const value = obj[key];
    if (value !== undefined) {
      acc[key] = typeof value === "object" ? filterUndefined(value) : value;
    }
    return acc;
  }, {});
}
