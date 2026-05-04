import type { IconType } from '@icons-pack/react-simple-icons';
import {
  SiInstagram,
  SiTelegram,
  SiFacebook,
  SiWhatsapp,
  SiGoogle,
  SiLine,
  SiX,
  SiGithub,
  SiGmail,
  SiGooglecalendar,
  SiGoogledrive,
  SiGooglesheets,
  SiGoogletranslate,
  SiHubspot,
  SiLinear,
  SiMercadopago,
  SiNotion,
  SiPaypal,
  SiShopify,
  SiStripe,
  SiSupabase,
  SiAsana,
  SiAtlassian,
  SiBookingdotcom,
  SiDialogflow,
  SiElevenlabs,
  SiIntercom,
} from '@icons-pack/react-simple-icons';

const BRAND_ICONS: Record<string, IconType> = {
  instagram: SiInstagram,
  telegram: SiTelegram,
  facebook: SiFacebook,
  whatsapp: SiWhatsapp,
  google: SiGoogle,
  line: SiLine,
  twitter: SiX,
  x: SiX,
  twitterprofile: SiX,
  github: SiGithub,
  gmail: SiGmail,
  'google-calendar': SiGooglecalendar,
  googledrive: SiGoogledrive,
  'google-drive': SiGoogledrive,
  googlesheets: SiGooglesheets,
  'google-sheets': SiGooglesheets,
  googletranslate: SiGoogletranslate,
  'google-translate': SiGoogletranslate,
  google_translate: SiGoogletranslate,
  hubspot: SiHubspot,
  linear: SiLinear,
  mercadopago: SiMercadopago,
  'mercado-pago': SiMercadopago,
  notion: SiNotion,
  paypal: SiPaypal,
  shopify: SiShopify,
  stripe: SiStripe,
  supabase: SiSupabase,
  asana: SiAsana,
  atlassian: SiAtlassian,
  booking: SiBookingdotcom,
  dialogflow: SiDialogflow,
  elevenlabs: SiElevenlabs,
  intercom: SiIntercom,
  'eleven-labs': SiElevenlabs,
  whatsappcloud: SiWhatsapp,
  'whatsapp-cloud': SiWhatsapp,
};

export function getBrandIcon(id?: string): IconType | undefined {
  if (!id) return undefined;
  const key = id.toLowerCase().replace(/\s|_/g, '');
  return BRAND_ICONS[key] || BRAND_ICONS[id.toLowerCase().replace(/_/g, '-')];
}

interface BrandIconProps {
  id?: string;
  size?: number | string;
  className?: string;
  color?: string;
}

export default function BrandIcon({ id, size = 24, className, color }: BrandIconProps) {
  const Icon = getBrandIcon(id);
  if (!Icon) return null;
  return <Icon size={size} className={className} color={color} />;
}
