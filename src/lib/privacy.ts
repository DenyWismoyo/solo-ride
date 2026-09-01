export const maskName = (name?: string, isAnon?: boolean): string => {
  if (!name || name.trim() === "") return "—";
  if (isAnon || name.startsWith("Pemohon-")) return name; // Sudah anonim
  if (name.length <= 2) return name.charAt(0) + "*";
  return `${name.charAt(0)}${"*".repeat(name.length - 2)}${name.slice(-1)}`;
};

export const maskPhone = (phone?: string): string => {
  if (!phone || phone.trim() === "") return "—";
  const cleaned = phone.replace(/\s|-/g, "");
  if (cleaned.length < 7) return "****";
  return `${cleaned.slice(0, 4)}****${cleaned.slice(-3)}`;
};

export const generateAnonCode = (): string =>
  `Pemohon-${Math.floor(1000 + Math.random() * 9000)}`;

export const isAnonCode = (name?: string): boolean =>
  !name || name.startsWith("Pemohon-");
