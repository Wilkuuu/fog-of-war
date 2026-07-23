# Fog of War — Google Play Store Listing

Copy these texts into Google Play Console. Assets live in this folder.

## Assets checklist

| Asset | File | Spec |
|-------|------|------|
| High-res icon | `icon-512.png` | 512×512 PNG, 32-bit |
| Feature graphic (EN) | `feature-graphic-1024x500.png` | 1024×500 |
| Feature graphic (PL) | `feature-graphic-1024x500-pl.png` | 1024×500 |
| Phone screenshots | `screenshots/*.jpg` | 5 landscape shots (2340×1080) |

Upload at least 2 phone screenshots. Landscape is correct — the app is locked to landscape.

---

## English (en-US)

### App name (max 30)
Fog of War

### Short description (max 80)
Reveal RPG videos with a fog-of-war brush. Optional ad-free subscription.

### Full description
Fog of War helps game masters and RPG storytellers reveal video content gradually. Cover any local video with a dark fog, then wipe it away with your finger as the adventure unfolds.

**What you can do**
• Pick a video from your device and optionally start with full fog cover
• Reveal areas by touch with Small, Medium, or Large brush sizes
• Reveal All when the party sees everything at once
• Undo the last stroke or Reset Fog to cover the map again
• Open the in-session menu with a two-finger tap (or the subtle corner button)
• Play in immersive landscape mode for TV/projector setups
• Optional ad-free monthly or yearly subscription (removes ads)

**Built for RPG sessions**
Use battle-map walkthrough videos, animated maps, or prep clips. Keep surprises hidden until the right moment — no account required. Your videos stay on your device (ads/billing use Google services; videos are not uploaded to us).

**Permissions**
The app may request access to videos so you can choose a file from your gallery. Video processing happens on-device. See the Privacy Policy for ads and subscription details.

### App category
Tools (or Entertainment)

### Tags / keywords (for your notes)
RPG, fog of war, battle map, dungeon master, tabletop, video reveal, GM tools

---

## Polski (pl-PL)

### Nazwa aplikacji (max 30)
Mgła Wojny

### Krótki opis (max 80)
Odkrywaj wideo RPG mgłą wojny. Opcjonalna subskrypcja bez reklam.

### Pełny opis
Mgła Wojny pomaga mistrzom gry i narratorom RPG odkrywać treść wideo stopniowo. Nałóż ciemną mgłę na dowolne lokalne wideo, a potem zdejmuj ją palcem w miarę rozwoju przygody.

**Co możesz zrobić**
• Wybierz wideo z urządzenia i opcjonalnie zacznij z pełnym pokryciem mgłą
• Odkrywaj obszary dotykiem — pędzel Mały, Średni lub Duży
• Odkryj wszystko, gdy drużyna widzi mapę w całości
• Cofnij ostatnie pociągnięcie lub zresetuj mgłę
• Otwórz menu dwoma palcami (albo subtelnym przyciskiem w rogu)
• Tryb immersyjny w poziomie — wygodny na TV i projektor
• Opcjonalna subskrypcja miesięczna lub roczna bez reklam

**Na sesje RPG**
Sprawdzi się przy filmach z mapami bitewnymi, animowanymi planami lub materiałami przygotowawczymi. Zachowaj niespodzianki do właściwego momentu — bez własnego konta. Wideo zostaje na urządzeniu (reklamy/płatności obsługuje Google; plików do nas nie wysyłamy).

**Uprawnienia**
Aplikacja może poprosić o dostęp do wideo, abyś mógł wybrać plik z galerii. Przetwarzanie wideo odbywa się lokalnie. Szczegóły reklam i subskrypcji w Polityce prywatności.

### Kategoria
Narzędzia (lub Rozrywka)

---

## Content rating & Data safety (notes)

- **Content rating**: Everyone / PEGI 3 (no user-generated chat; depends on user videos — declare “Users can share user-generated content” only if applicable; typically No)
- **Ads**: Yes (AdMob banner on empty screen + interstitial on video load; removed by subscription)
- **In-app purchases**: Yes — subscriptions `fogofwar_adfree_monthly` and `fogofwar_adfree_yearly`
- **Data safety**:
  - Photos and videos: Accessed (user-selected) — not collected / not shared by the developer
  - Device / advertising ID: collected/shared by Google AdMob (declare Ads = Yes)
  - Purchase history: handled by Google Play Billing
  - App info & preferences (language/tutorial/ad-free cache): stored on device
  - Data encrypted in transit: Yes for Google ads/billing traffic
- **Privacy policy URL**: `https://wilkuuu.github.io/fog-of-war/` (source: `docs/index.html`)

## Play Console — Ads & subscriptions setup

1. **Monetize with AdMob** (or link existing AdMob app) → replace test IDs in `src/app/services/monetization.config.ts` and `AndroidManifest` `APPLICATION_ID`
2. **Monetize → Products → Subscriptions** create:
   - `fogofwar_adfree_monthly`
   - `fogofwar_adfree_yearly`
3. **App content → Ads**: declare that the app contains ads
4. **App content → Data safety**: mark Advertising ID / Device IDs as collected by AdMob; Purchases via Google Play
5. Activate products, then test on a license-tester account with a signed build from Play (Internal testing)
