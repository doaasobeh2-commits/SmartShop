import type { CuisineFamilyId, ShareYumLocale } from "./ids";

export type CuisineFamilyLocalization = {
  familyId: CuisineFamilyId;
  locale: ShareYumLocale;
  name: string;
  description: string;
};

export const CUISINE_FAMILY_LOCALIZATIONS: readonly CuisineFamilyLocalization[] = [
  {
    familyId: "arab",
    locale: "en",
    name: "Arab cuisines",
    description: "Levantine, Gulf, Iraqi, Egyptian, and Maghreb home cooking.",
  },
  {
    familyId: "arab",
    locale: "de",
    name: "Arabische Küchen",
    description: "Levante, Golf, Irak, Ägypten und Maghreb.",
  },
  {
    familyId: "arab",
    locale: "ar",
    name: "المطابخ العربية",
    description: "مطبخ الشام والخليج والعراق ومصر والمغرب العربي.",
  },
  {
    familyId: "arab",
    locale: "tr",
    name: "Arap mutfakları",
    description: "Levant, Körfez, Irak, Mısır ve Mağrip ev yemekleri.",
  },
  {
    familyId: "turkish",
    locale: "en",
    name: "Turkish",
    description: "Turkish home and family meals.",
  },
  {
    familyId: "turkish",
    locale: "de",
    name: "Türkisch",
    description: "Türkische Hausmannskost.",
  },
  {
    familyId: "turkish",
    locale: "ar",
    name: "المطبخ التركي",
    description: "أطباق تركية منزلية.",
  },
  {
    familyId: "turkish",
    locale: "tr",
    name: "Türk mutfağı",
    description: "Türk ev yemekleri.",
  },
  {
    familyId: "central_european",
    locale: "en",
    name: "Central European",
    description: "Austrian, German, and broader Central European household meals.",
  },
  {
    familyId: "central_european",
    locale: "de",
    name: "Mitteleuropäisch",
    description: "Österreichische, deutsche und mitteleuropäische Hausmannskost.",
  },
  {
    familyId: "central_european",
    locale: "ar",
    name: "المطبخ الأوروبي الوسطى",
    description: "أطباق نمساوية وألمانية وأوروبية وسطى.",
  },
  {
    familyId: "central_european",
    locale: "tr",
    name: "Orta Avrupa",
    description: "Avusturya, Alman ve Orta Avrupa ev yemekleri.",
  },
  {
    familyId: "italian",
    locale: "en",
    name: "Italian",
    description: "Italian household pasta, risotto, and family classics.",
  },
  {
    familyId: "italian",
    locale: "de",
    name: "Italienisch",
    description: "Italienische Pasta, Risotto und Familienklassiker.",
  },
  {
    familyId: "italian",
    locale: "ar",
    name: "المطبخ الإيطالي",
    description: "أطباق إيطالية منزلية.",
  },
  {
    familyId: "italian",
    locale: "tr",
    name: "İtalyan",
    description: "İtalyan ev yemekleri.",
  },
  {
    familyId: "chinese",
    locale: "en",
    name: "Chinese",
    description: "Accessible Chinese home-style dishes for European households.",
  },
  {
    familyId: "chinese",
    locale: "de",
    name: "Chinesisch",
    description: "Zugängliche chinesische Hausmannskost.",
  },
  {
    familyId: "chinese",
    locale: "ar",
    name: "المطبخ الصيني",
    description: "أطباق صينية منزلية مألوفة.",
  },
  {
    familyId: "chinese",
    locale: "tr",
    name: "Çin",
    description: "Erişilebilir Çin ev yemekleri.",
  },
  {
    familyId: "indian",
    locale: "en",
    name: "Indian",
    description: "Representative Indian home dishes; spice tolerance matters.",
  },
  {
    familyId: "indian",
    locale: "de",
    name: "Indisch",
    description: "Repräsentative indische Hausgerichte.",
  },
  {
    familyId: "indian",
    locale: "ar",
    name: "المطبخ الهندي",
    description: "أطباق هندية منزلية.",
  },
  {
    familyId: "indian",
    locale: "tr",
    name: "Hint",
    description: "Hint ev yemekleri.",
  },
  {
    familyId: "mexican",
    locale: "en",
    name: "Mexican",
    description: "Mexican home and family meals.",
  },
  {
    familyId: "mexican",
    locale: "de",
    name: "Mexikanisch",
    description: "Mexikanische Hausmannskost.",
  },
  {
    familyId: "mexican",
    locale: "ar",
    name: "المطبخ المكسيكي",
    description: "أطباق مكسيكية منزلية.",
  },
  {
    familyId: "mexican",
    locale: "tr",
    name: "Meksika",
    description: "Meksika ev yemekleri.",
  },
  {
    familyId: "romanian",
    locale: "en",
    name: "Romanian",
    description: "Registered for future catalog expansion.",
  },
  {
    familyId: "romanian",
    locale: "de",
    name: "Rumänisch",
    description: "Für künftigen Katalog registriert.",
  },
  {
    familyId: "romanian",
    locale: "ar",
    name: "المطبخ الروماني",
    description: "مسجل للتوسع المستقبلي.",
  },
  {
    familyId: "romanian",
    locale: "tr",
    name: "Romen",
    description: "Gelecek katalog için kayıtlı.",
  },
  {
    familyId: "japanese",
    locale: "en",
    name: "Japanese",
    description: "Registered for future catalog expansion.",
  },
  {
    familyId: "japanese",
    locale: "de",
    name: "Japanisch",
    description: "Für künftigen Katalog registriert.",
  },
  {
    familyId: "japanese",
    locale: "ar",
    name: "المطبخ الياباني",
    description: "مسجل للتوسع المستقبلي.",
  },
  {
    familyId: "japanese",
    locale: "tr",
    name: "Japon",
    description: "Gelecek katalog için kayıtlı.",
  },
] as const;

export function getFamilyLocalization(
  familyId: CuisineFamilyId,
  locale: ShareYumLocale,
): CuisineFamilyLocalization {
  const row = CUISINE_FAMILY_LOCALIZATIONS.find(
    (entry) => entry.familyId === familyId && entry.locale === locale,
  );
  if (!row) {
    throw new Error(`Missing localization for ${familyId}/${locale}`);
  }
  return row;
}
