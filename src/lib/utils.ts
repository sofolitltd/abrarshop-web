import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const avroMapping: { [key: string]: string } = {
  // স্বরবর্ণ (Vowels)
  'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'I', 'উ': 'u', 'ঊ': 'U',
  'এ': 'e', 'ঐ': 'oi', 'ও': 'O', 'ঔ': 'ou',

  // ব্যঞ্জনবর্ণ (Consonants)
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
  'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'NG',
  'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
  'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
  'য': 'z', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
  'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't',

  // কার ও চিহ্ন (Vowel Signs & Symbols)
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou',
  'ং': 'ng', 'ঃ': 'ng', 'ঁ': 'n', '্': '', '্য': 'y', '্র': 'r'
};

export const generateSlug = (name: string) => {
  if (!name) return "";

  // 1. Map Bengali to Banglish (transliteration)
  const processed = name.split('').map(char => avroMapping[char] || char).join('');

  // 2. Convert to slug
  return processed
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-')      // Spaces to hyphens
    .replace(/-+/g, '-');      // Remove multiple hyphens
};
