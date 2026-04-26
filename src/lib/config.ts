/**
 * Site-wide configuration.
 * Change social links, contact details, and brand info here — reflects everywhere automatically.
 */

export const SITE_CONFIG = {
  name: "Abrar Shop",
  tagline: "Quality products, trusted service.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://abrarshop.vercel.app",
} as const;

// ─── Social Media ────────────────────────────────────────────────────────────
const SOCIAL_USERNAME = "abrarshopx";
const WHATSAPP_NUMBER = "8801725877772";
const PHONE = "+8801725877772";
const EMAIL = "hello.abrarshop@gmail.com";
const ADDRESS = "Balarcira, Sundorgonj, Gaibandha";

export const SOCIAL_LINKS = {
  facebook:  `https://facebook.com/${SOCIAL_USERNAME}`,
  instagram: `https://instagram.com/${SOCIAL_USERNAME}`,
  twitter:   `https://twitter.com/${SOCIAL_USERNAME}`,
  youtube:   `https://youtube.com/@${SOCIAL_USERNAME}`,
  whatsapp:  `https://wa.me/${WHATSAPP_NUMBER}`, 
} as const;

// ─── Contact Info ────────────────────────────────────────────────────────────
export const CONTACT_INFO = {
  email:   EMAIL,
  phone:   PHONE,
  address: ADDRESS,         
} as const;
