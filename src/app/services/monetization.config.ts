/**
 * Monetization IDs for AdMob + Play Billing.
 *
 * AdMob App ID: Fog of war — ca-app-pub-9710890023203657~5109682400
 * Banner unit:  baner_fot_of_war — ca-app-pub-9710890023203657/3218996173
 *
 * Production IDs can also be overridden via GitHub Actions secrets
 * (ADMOB_APP_ID, ADMOB_BANNER_AD_UNIT_ID) during CI.
 *
 * Policy: never ship Google sample ad unit IDs (ca-app-pub-3940256099942544/…)
 * in a published build — they always show “Test Ad”.
 */
export const MonetizationConfig = {
  /**
   * false = production AdMob units (published builds).
   * true = Google sample test ads (local/dev only — never ship to Play).
   *
   * Production fill also needs an AdMob Privacy & messaging (UMP) form for
   * this app ID; without it EEA/PL often gets ERROR_CODE_NO_FILL (3).
   */
  useTestAds: false,

  /**
   * Hashed test device IDs from logcat:
   * "Use RequestConfiguration.Builder().setTestDeviceIds(Arrays.asList(\"…\"))"
   * Registered devices receive Google test creatives against production units
   * (labeled Test Ad) so we can verify UI without shipping sample unit IDs.
   */
  testingDeviceIds: [
    '55462EB1565FF8CBC86C6B2D9CD22C4E', // SM-S921B (current debug device)
    'CE09EB96FF3222E18B641786ACE1DF91' // previous session hash
  ] as readonly string[],

  admob: {
    /** Android App ID — also in res/values/strings.xml (admob_app_id) */
    androidAppId: 'ca-app-pub-9710890023203657~5109682400',
    banner: {
      test: 'ca-app-pub-3940256099942544/6300978111',
      /** baner_fot_of_war */
      production: 'ca-app-pub-9710890023203657/3218996173'
    },
    interstitial: {
      test: 'ca-app-pub-3940256099942544/1033173712',
      /**
       * Set after creating an Interstitial unit in AdMob.
       * Empty = interstitial disabled in production (avoids shipping test ads).
       */
      production: ''
    }
  },

  /** Must match product IDs created in Play Console → Monetize → Subscriptions */
  subscriptions: {
    /** Play Console: fogofwar_mounthly (1 zł / month) */
    adFreeMonthly: 'fogofwar_mounthly'
  },

  /** Minimum seconds between interstitial shows */
  interstitialCooldownSec: 120
} as const;

export function bannerAdUnitId(): string {
  return MonetizationConfig.useTestAds
    ? MonetizationConfig.admob.banner.test
    : MonetizationConfig.admob.banner.production;
}

/** Returns null when production interstitial is not configured. */
export function interstitialAdUnitId(): string | null {
  if (MonetizationConfig.useTestAds) {
    return MonetizationConfig.admob.interstitial.test;
  }
  const id = MonetizationConfig.admob.interstitial.production;
  return id.length > 0 ? id : null;
}
