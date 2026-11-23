import { uz, type Dict } from "./uz";

export type Locale = "uz";
const dicts: Record<Locale, Dict> = { uz };

export function getDict(locale: Locale = "uz"): Dict {
  return dicts[locale];
}

/** Qisqa yo'l: t.nav.home */
export const t = getDict();
