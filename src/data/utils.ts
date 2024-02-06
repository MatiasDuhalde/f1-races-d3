export const numberOrUndefined = (value: string): number | undefined => {
  return value === '\\N' ? undefined : +value;
};

export const stringOrUndefined = (value: string): string | undefined => {
  return value === '\\N' ? undefined : value;
};

export const dateOrUndefined = (value: string): Date | undefined => {
  return value === '\\N' ? undefined : new Date(value);
};
