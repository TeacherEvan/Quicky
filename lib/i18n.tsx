"use client";

/**
 * UI i18n. Every user-visible string in the app lives in STRINGS.
 * Selected language is read from SettingsContext (lib/settings).
 *
 * This is separate from lib/translate.ts (MyMemory OCR→Thai). Do not
 * confuse them: STRINGS is a local const lookup; lib/translate.ts is
 * network-bound machine translation for the Cost tile.
 */

import { useMemo } from "react";
import { useSettings, type Language } from "./settings";

const STRINGS = {
  en: {
    // App shell
    "app.skipToContent": "Skip to main content",
    "app.brandName": "Quicky",
    "app.brandTagline": "Travel tools for where you are",
    "app.nav.settings": "Settings",
    "app.nav.dashboard": "Home",

    // Dashboard
    "dashboard.eyebrow": "Live where you are",
    "dashboard.heading": "Travel tools that don't lie to you",
    "dashboard.intro":
      "Eight real, network-driven utilities that work wherever you are. Weather, places, and prices come from live public APIs — no mocks, no cached sample data. Features adapt to your detected location and selected language.",
    "dashboard.navLabel": "Quick tools",
    "dashboard.group.live.label": "Live where you are",
    "dashboard.group.live.hint": "Network calls",
    "dashboard.group.tools.label": "Handy tools",
    "dashboard.group.tools.hint": "Camera + offline",
    "dashboard.group.apps.label": "Open other apps",
    "dashboard.group.apps.hint": "Deep links",
    "dashboard.group.live.label.explicit": "Live where you are",
    "dashboard.group.live.hint.explicit": "Network calls",
    "dashboard.group.tools.label.explicit": "Handy tools",
    "dashboard.group.tools.hint.explicit": "Camera + offline",
    "dashboard.group.apps.label.explicit": "Open other apps",
    "dashboard.group.apps.hint.explicit": "Deep links",

    // Tile: Cost
    "tile.cost.label": "Cost",
    "tile.cost.desc": "Translate price tags",
    "tile.cost.title": "Cost translator",
    "tile.cost.intro":
      "Take a photo of any price tag or menu. Text is recognised in your browser (no upload, no API key), then translated to your selected language via MyMemory. No mocks. Language is picked from your settings, not locked to any country.",
    "tile.cost.pickPhoto": "Pick a photo of text",
    "tile.cost.progress.loadOcr": "Loading OCR engine…",
    "tile.cost.progress.ocr": "Recognising text…",
    "tile.cost.progress.translate": "Translating…",
    "tile.cost.error.emptyOcr":
      "OCR returned no text. Try a clearer, well-lit photo of printed text.",
    "tile.cost.error.translate": "Translation failed",
    "tile.cost.recognisedHeading": "Recognised text",
    "tile.cost.thaiHeading": "Translation",
    "tile.cost.confidence": "Match confidence",
    "tile.cost.running": "Working…",
    "tile.cost.thaiLabel": "Target-language translation",
    "tile.cost.copy": "Copy",
    "tile.cost.copyThai": "Copy translation",

    // Tile: Location
    "tile.location.label": "Location",
    "tile.location.desc": "Photo GPS lookup",
    "tile.location.title": "Location",
    "tile.location.intro":
      "Upload a photo with GPS metadata. The real coordinates are sent to OpenStreetMap Nominatim via your Convex backend.",
    "tile.location.pickPhoto": "Pick a photo",
    "tile.location.noExif":
      "No GPS data in this image. Enable location on your camera, or pick another photo.",
    "tile.location.reading": "Reading EXIF + reverse-geocoding…",
    "tile.location.previewAlt": "Selected photo preview",
    "tile.location.noGeolocation":
      "Your browser does not expose geolocation.",
    "tile.location.coords": "Coordinates",
    "tile.location.openInOsm": "Open in OpenStreetMap",

    // Tile: Bathroom
    "tile.bathroom.label": "Bathroom",
    "tile.bathroom.desc": "Find the right one",
    "tile.bathroom.title": "Bathroom",
    "tile.bathroom.intro": "Tap the card or the swap button to toggle.",
    "tile.bathroom.current": "Current",
    "tile.bathroom.currentlyMale": "Currently set to",
    "tile.bathroom.currentlyFemale": "Currently set to",
    "tile.bathroom.male": "Male",
    "tile.bathroom.female": "Female",
    "tile.bathroom.swap": "Swap",
    "tile.bathroom.toggleToMale": "Switch to male bathroom",
    "tile.bathroom.toggleToFemale": "Switch to female bathroom",

    // Tile: Attractions
    "tile.attractions.label": "Attractions",
    "tile.attractions.desc": "Nearby places",
    "tile.attractions.title": "Attractions",
    "tile.attractions.intro":
      "Live data from OpenStreetMap (Overpass) via your Convex backend. No cached or sample values.",
    "tile.attractions.useLocation": "Use my location",
    "tile.attractions.bangkok": "Bangkok (sample; picks your region via geolocation)" ,
    "tile.attractions.radius": "Search radius",
    "tile.attractions.empty":
      "No attractions found in {radius} km. Try a larger radius.",
    "tile.attractions.found": "Found {count} places",
    "tile.attractions.openNow": "open now",
    "tile.attractions.closedNow": "closed now",
    "tile.attractions.noGeolocation":
      "Your browser does not expose geolocation.",
    "tile.attractions.location": "Location",

    // Tile: Counter
    "tile.counter.label": "Day Counter",
    "tile.counter.desc": "Count down to a date",
    "tile.counter.title": "Day counter",
    "tile.counter.intro":
      "Pick a future date. Days remaining is computed locally in your browser.",
    "tile.counter.targetLabel": "Target date",
    "tile.counter.noTarget": "No target set.",
    "tile.counter.daysRemaining": "days remaining",
    "tile.counter.today": "Today is the day.",
    "tile.counter.pastOne": "That date is {n} day in the past.",
    "tile.counter.pastMany": "That date is {n} days in the past.",

    // Tile: Bolt
    "tile.bolt.label": "Bolt",
    "tile.bolt.desc": "Open the app",
    "tile.bolt.title": "Bolt",
    "tile.bolt.intro":
      "Opens the Bolt app via the boltd:// URL scheme. Only works on a device where Bolt is installed; on desktop or where the scheme is unregistered, nothing happens.",
    "tile.bolt.open": "Open Bolt",
    "tile.bolt.action": "Launch",
    "tile.bolt.afterLaunch":
      "If Bolt is installed on this device, the app should now be opening. If nothing happened, Bolt is not installed — install it from your app store and try again.",
    "tile.bolt.howItWorks": "How it works",
    "tile.bolt.helpText":
      "This button tries to open the <code>boltd://home</code> URL scheme. On iOS/Android with the Bolt app installed, it will launch directly. On desktop or if Bolt isn't installed, the browser will show an error or do nothing.",

    // Tile: Banking
    "tile.banking.label": "Banking",
    "tile.banking.desc": "Open bank apps (region-based)",
    "tile.banking.title": "Banking",
    "tile.banking.intro":
      "Tap a bank to open its app. On a device where the app is installed, the bank's URL scheme is invoked. On desktop or where the app is not installed, nothing happens.",
    "tile.banking.open": "Open",
    "tile.banking.afterLaunch":
      "Tried to open {name}. If nothing happened, the app is not installed.",
    "tile.banking.banks": "Banks",
    "tile.banking.note": "Note",
    "tile.banking.noteText":
      "URL schemes are community-reported and may change without notice. If a bank doesn't open, check for app updates or search for the latest scheme.",

    // Tile: Weather
    "tile.weather.label": "Weather",
    "tile.weather.desc": "Live forecast",
    "tile.weather.title": "Weather",
    "tile.weather.intro":
      "Live data from Open-Meteo via your Convex backend. No cached or sample values.",
    "tile.weather.useLocation": "Use my location",
    "tile.weather.bangkok": "Bangkok",
    "tile.weather.units": "Units",
    "tile.weather.celsius": "Celsius",
    "tile.weather.fahrenheit": "Fahrenheit",
    "tile.weather.forecast": "3-day forecast",
    "tile.weather.forecastHint": "Hi / Lo · Condition",
    "tile.weather.lo": "Lo",
    "tile.weather.dayN": "Day {n}",
    "tile.weather.condition": "Condition",
    "tile.weather.coords": "Coordinates",
    "tile.weather.location": "Location",
    "tile.weather.error.geoUnsupported":
      "Your browser does not expose geolocation.",
    "tile.weather.error.geoFailed": "Geolocation denied or failed: {message}",
    "tile.weather.live": "Live",
    "tile.weather.fetched": "Updated {time}",

    // Settings
    "settings.title": "Settings",
    "settings.appearance": "Appearance",
    "settings.theme": "Theme",
    "settings.theme.system": "Match system",
    "settings.theme.light": "Light",
    "settings.theme.dark": "Dark",
    "settings.language": "Language",
    "settings.language.en": "English",
    "settings.language.th": "ไทย (Thai)",
    "settings.weather": "Weather",
    "settings.units": "Units",
    "settings.units.c": "Celsius",
    "settings.units.f": "Fahrenheit",
    "settings.about": "About",
    "settings.about.body":
      "Quicky is a pure Next.js webapp. Weather, places, and reverse geocoding are live from Open-Meteo, OpenStreetMap Overpass, and Nominatim via the Convex backend. The Cost translator runs OCR in your browser and translates via MyMemory. No mocks, no sample data.",

    // Common
    "common.loading": "Loading…",
    "common.retry": "Try again",
    "common.errorTitle": "Something went wrong",
    "common.emptyTitle": "Nothing here yet",
    "common.back": "Back to home",
    "common.open": "Open",

    // Not found
    "notfound.title": "Page not found",
    "notfound.body": "That page does not exist.",
    "notfound.cta": "Go home",

    // Status banner
    "status.offline": "You appear to be offline.",
  },

  th: {
    "app.skipToContent": "ข้ามไปยังเนื้อหาหลัก",
    "app.brandName": "Quicky",
    "app.brandTagline": "ศูนย์รวมการเดินทางในประเทศไทย",
    "app.nav.settings": "ตั้งค่า",
    "app.nav.dashboard": "หน้าหลัก",

    "dashboard.heading": "เครื่องมือที่ไม่โกหกคุณ",
    "dashboard.intro":
      "ยูทิลิตี้แปดอย่างที่ขับเคลื่อนด้วยเครือข่ายจริงสำหรับนักเดินทางในประเทศไทย สภาพอากาศ สถานที่ และราคามาจาก API สาธารณะแบบสด — ไม่มีข้อมูลจำลอง ไม่มีแคช ถ่ายรูปเมนู ดูว่าอะไรเปิดอยู่ใกล้ๆ และข้ามกำแพงภาษา",
    "dashboard.navLabel": "เครื่องมือด่วน",
    "dashboard.eyebrow": "ใช้งานจริงในไทย",
    "dashboard.group.live.label": "สดในพื้นที่ของคุณ",
    "dashboard.group.live.hint": "เรียก API",
    "dashboard.group.tools.label": "เครื่องมือช่วยเหลือ",
    "dashboard.group.tools.hint": "กล้อง + ออฟไลน์",
    "dashboard.group.apps.label": "เปิดแอปอื่น",
    "dashboard.group.apps.hint": "Deep link",
    "dashboard.group.live.label.explicit": "สดในพื้นที่ของคุณ",
    "dashboard.group.live.hint.explicit": "เรียก API",
    "dashboard.group.tools.label.explicit": "เครื่องมือช่วยเหลือ",
    "dashboard.group.tools.hint.explicit": "กล้อง + ออฟไลน์",
    "dashboard.group.apps.label.explicit": "เปิดแอปอื่น",
    "dashboard.group.apps.hint.explicit": "Deep link",

    "tile.cost.label": "ค่าใช้จ่าย",
    "tile.cost.desc": "แปลป้ายราคา",
    "tile.cost.title": "ตัวแปลราคา",
    "tile.cost.intro":
      "ถ่ายรูปป้ายราคาหรือเมนูใดก็ได้ ระบบจะอ่านตัวอักษรในเบราว์เซอร์ของคุณด้วย Tesseract.js (ไม่อัปโหลด ไม่ต้องใช้คีย์ API) แล้วแปลเป็นภาษาไทยผ่าน MyMemory ไม่มีข้อมูลจำลอง",
    "tile.cost.pickPhoto": "เลือกรูปภาพที่มีข้อความ",
    "tile.cost.progress.loadOcr": "กำลังโหลดเครื่องมืออ่านตัวอักษร…",
    "tile.cost.progress.ocr": "กำลังอ่านตัวอักษร…",
    "tile.cost.progress.translate": "กำลังแปลภาษา…",
    "tile.cost.error.emptyOcr":
      "ระบบอ่านตัวอักษรไม่พบข้อความ ลองถ่ายรูปป้ายที่ชัดเจนและมีแสงสว่างเพียงพอ",
    "tile.cost.error.translate": "การแปลล้มเหลว",
    "tile.cost.recognisedHeading": "ข้อความที่อ่านได้",
    "tile.cost.thaiHeading": "ภาษาไทย",
    "tile.cost.confidence": "ความเชื่อมั่นของการจับคู่",
    "tile.cost.running": "กำลังทำงาน…",
    "tile.cost.thaiLabel": "คำแปลภาษาไทย",
    "tile.cost.copy": "คัดลอก",
    "tile.cost.copyThai": "คัดลอกภาษาไทยไปคลิปบอร์ด",

    "tile.location.label": "ตำแหน่ง",
    "tile.location.desc": "ค้นหาจาก GPS ในรูป",
    "tile.location.title": "ตำแหน่ง",
    "tile.location.intro":
      "อัปโหลดรูปภาพที่มีข้อมูล GPS ระบบจะส่งพิกัดจริงไปยัง OpenStreetMap Nominatim ผ่านแบ็กเอนด์ Convex ของคุณ",
    "tile.location.pickPhoto": "เลือกรูปภาพ",
    "tile.location.noExif":
      "ไม่มีข้อมูล GPS ในรูปนี้ กรุณาเปิดการระบุตำแหน่งในกล้องของคุณ หรือเลือกรูปอื่น",
    "tile.location.reading": "กำลังอ่าน EXIF และค้นหาสถานที่ย้อนกลับ…",
    "tile.location.previewAlt": "ตัวอย่างรูปภาพที่เลือก",
    "tile.location.noGeolocation":
      "เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง",
    "tile.location.coords": "พิกัด",
    "tile.location.openInOsm": "เปิดใน OpenStreetMap",

    "tile.bathroom.label": "ห้องน้ำ",
    "tile.bathroom.desc": "หาให้ตรงกับคุณ",
    "tile.bathroom.title": "ห้องน้ำ",
    "tile.bathroom.intro": "แตะที่การ์ดหรือปุ่มสลับเพื่อเปลี่ยน",
    "tile.bathroom.current": "ปัจจุบัน",
    "tile.bathroom.currentlyMale": "ตั้งค่าเป็น",
    "tile.bathroom.currentlyFemale": "ตั้งค่าเป็น",
    "tile.bathroom.male": "ชาย",
    "tile.bathroom.female": "หญิง",
    "tile.bathroom.swap": "สลับ",
    "tile.bathroom.toggleToMale": "เปลี่ยนเป็นห้องน้ำชาย",
    "tile.bathroom.toggleToFemale": "เปลี่ยนเป็นห้องน้ำหญิง",

    "tile.attractions.label": "สถานที่ท่องเที่ยว",
    "tile.attractions.desc": "สถานที่ใกล้ตัว",
    "tile.attractions.title": "สถานที่ท่องเที่ยว",
    "tile.attractions.intro":
      "ข้อมูลสดจาก OpenStreetMap (Overpass) ผ่านแบ็กเอนด์ Convex ไม่มีการแคช ไม่มีข้อมูลตัวอย่าง",
    "tile.attractions.useLocation": "ใช้ตำแหน่งของฉัน",
    "tile.attractions.bangkok": "กรุงเทพฯ",
    "tile.attractions.radius": "รัศมีการค้นหา",
    "tile.attractions.empty":
      "ไม่พบสถานที่ท่องเที่ยวในรัศมี {radius} กม. ลองเพิ่มรัศมีดู",
    "tile.attractions.found": "พบ {count} แห่ง",
    "tile.attractions.openNow": "เปิดอยู่ตอนนี้",
    "tile.attractions.closedNow": "ปิดตอนนี้",
    "tile.attractions.noGeolocation":
      "เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง",
    "tile.attractions.location": "ตำแหน่ง",

    "tile.counter.label": "นับวัน",
    "tile.counter.desc": "นับถอยหลังถึงวันที่",
    "tile.counter.title": "นับวัน",
    "tile.counter.intro":
      "เลือกวันที่ในอนาคต ระบบจะคำนวณจำนวนวันที่เหลือในเบราว์เซอร์ของคุณ",
    "tile.counter.targetLabel": "วันที่เป้าหมาย",
    "tile.counter.noTarget": "ยังไม่ได้ตั้งวันเป้าหมาย",
    "tile.counter.daysRemaining": "วันที่เหลือ",
    "tile.counter.today": "วันนี้คือวันนั้นแล้ว",
    "tile.counter.pastOne": "วันดังกล่าวผ่านมาแล้ว {n} วัน",
    "tile.counter.pastMany": "วันดังกล่าวผ่านมาแล้ว {n} วัน",

    "tile.bolt.label": "Bolt",
    "tile.bolt.desc": "เปิดแอป",
    "tile.bolt.title": "Bolt",
    "tile.bolt.intro":
      "เปิดแอป Bolt ผ่าน URL scheme boltd:// ใช้ได้เฉพาะบนอุปกรณ์ที่ติดตั้ง Bolt ไว้ บนเดสก์ท็อปหรือหากไม่ได้ลงทะเบียน scheme จะไม่มีอะไรเกิดขึ้น",
    "tile.bolt.open": "เปิด Bolt",
    "tile.bolt.action": "เปิดใช้งาน",
    "tile.bolt.afterLaunch":
      "หากอุปกรณ์ของคุณติดตั้ง Bolt ไว้ แอปควรกำลังเปิดขึ้น หากไม่มีอะไรเกิดขึ้น แสดงว่ายังไม่ได้ติดตั้ง Bolt กรุณาติดตั้งจากแอปสโตร์แล้วลองอีกครั้ง",
    "tile.bolt.howItWorks": "วิธีการทำงาน",
    "tile.bolt.helpText":
      "ปุ่มนี้จะพยายามเปิด URL scheme <code>boltd://home</code> บน iOS/Android ที่ติดตั้ง Bolt แอปจะเปิดทันที บนเดสก์ท็อปหรือหากยังไม่ติดตั้ง Bolt เบราว์เซอร์จะแสดงข้อผิดพลาดหรือไม่เกิดอะไรขึ้น",

    "tile.banking.label": "ธนาคาร",
    "tile.banking.desc": "เปิดแอปธนาคารไทย",
    "tile.banking.title": "ธนาคาร",
    "tile.banking.intro":
      "แตะธนาคารเพื่อเปิดแอป บนอุปกรณ์ที่ติดตั้งแอปไว้ ระบบจะเรียก URL scheme ของธนาคาร บนเดสก์ท็อปหรือหากไม่ได้ติดตั้งแอป จะไม่มีอะไรเกิดขึ้น",
    "tile.banking.open": "เปิด",
    "tile.banking.afterLaunch":
      "พยายามเปิด {name} แล้ว หากไม่มีอะไรเกิดขึ้น แสดงว่ายังไม่ได้ติดตั้งแอป",
    "tile.banking.banks": "ธนาคาร",
    "tile.banking.note": "หมายเหตุ",
    "tile.banking.noteText":
      "URL scheme เป็นข้อมูลจากชุมชน อาจเปลี่ยนแปลงได้ตลอดเวลา หากเปิดไม่ได้ ลองอัปเดตแอปหรือค้นหา scheme ใหม่",

    "tile.weather.label": "สภาพอากาศ",
    "tile.weather.desc": "พยากรณ์แบบสด",
    "tile.weather.title": "สภาพอากาศ",
    "tile.weather.intro":
      "ข้อมูลสดจาก Open-Meteo ผ่านแบ็กเอนด์ Convex ไม่มีการแคช ไม่มีข้อมูลตัวอย่าง",
    "tile.weather.useLocation": "ใช้ตำแหน่งของฉัน",
    "tile.weather.bangkok": "กรุงเทพฯ",
    "tile.weather.units": "หน่วย",
    "tile.weather.celsius": "เซลเซียส",
    "tile.weather.fahrenheit": "ฟาเรนไฮต์",
    "tile.weather.forecast": "พยากรณ์ 3 วัน",
    "tile.weather.forecastHint": "สูง/ต่ำ · สภาพ",
    "tile.weather.lo": "ต่ำ",
    "tile.weather.dayN": "วันที่ {n}",
    "tile.weather.condition": "สภาพอากาศ",
    "tile.weather.coords": "พิกัด",
    "tile.weather.location": "ตำแหน่ง",
    "tile.weather.error.geoUnsupported":
      "เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง",
    "tile.weather.error.geoFailed": "การระบุตำแหน่งถูกปฏิเสธหรือล้มเหลว: {message}",
    "tile.weather.live": "สด",
    "tile.weather.fetched": "อัปเดต {time}",

    "settings.title": "ตั้งค่า",
    "settings.appearance": "การแสดงผล",
    "settings.theme": "ธีม",
    "settings.theme.system": "ตามระบบ",
    "settings.theme.light": "สว่าง",
    "settings.theme.dark": "มืด",
    "settings.language": "ภาษา",
    "settings.language.en": "English (อังกฤษ)",
    "settings.language.th": "ไทย",
    "settings.weather": "สภาพอากาศ",
    "settings.units": "หน่วย",
    "settings.units.c": "เซลเซียส",
    "settings.units.f": "ฟาเรนไฮต์",
    "settings.about": "เกี่ยวกับ",
    "settings.about.body":
      "Quicky เป็นเว็บแอป Next.js ล้วนๆ ข้อมูลสภาพอากาศ สถานที่ และการค้นหาสถานที่ย้อนกลับดึงสดจาก Open-Meteo, OpenStreetMap Overpass และ Nominatim ผ่านแบ็กเอนด์ Convex ตัวแปลราคาทำ OCR ในเบราว์เซอร์ของคุณและแปลผ่าน MyMemory ไม่มีข้อมูลจำลอง ไม่มีข้อมูลตัวอย่าง",

    "common.loading": "กำลังโหลด…",
    "common.retry": "ลองอีกครั้ง",
    "common.errorTitle": "เกิดข้อผิดพลาด",
    "common.emptyTitle": "ยังไม่มีข้อมูล",
    "common.back": "กลับหน้าหลัก",
    "common.open": "เปิด",

    "notfound.title": "ไม่พบหน้าที่ต้องการ",
    "notfound.body": "ไม่มีหน้านี้อยู่",
    "notfound.cta": "กลับหน้าหลัก",

    "status.offline": "ดูเหมือนว่าคุณออฟไลน์อยู่",
  },
} as const satisfies Record<Language, Record<string, string>>;

export type StringKey = keyof typeof STRINGS.en;

export type TFunction = (
  key: StringKey,
  vars?: Record<string, string | number>,
) => string;

function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, name: string) => {
    const v = vars[name];
    return v === undefined || v === null ? m : String(v);
  });
}

export function translate(
  language: Language,
  key: StringKey,
  vars?: Record<string, string | number>,
): string {
  const dict = STRINGS[language] ?? STRINGS.en;
  const raw = (dict as Record<string, string>)[key];
  if (raw === undefined) {
    if (typeof console !== "undefined") {
      console.warn(`[i18n] missing key: ${String(key)}`);
    }
    const fallback =
      (STRINGS.en as Record<string, string>)[key] ?? String(key);
    return interpolate(fallback, vars);
  }
  return interpolate(raw, vars);
}

export function useT(): TFunction {
  const { language } = useSettings();
  return useMemo(() => {
    return (key: StringKey, vars?: Record<string, string | number>) =>
      translate(language, key, vars);
  }, [language]);
}
