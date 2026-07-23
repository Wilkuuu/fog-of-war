/**
 * Monetization IDs for AdMob + Play Billing.
 * Production AdMob IDs are also stored as GitHub Actions secrets
 * (ADMOB_APP_ID, ADMOB_BANNER_AD_UNIT_ID) and injected in CI.
 */
export const MonetizationConfig = {
  /** false = production AdMob units; true = Google sample test ads */
  useTestAds: false,

  admob: {
    /** Android App ID — also set in AndroidManifest meta-data */
    androidAppId: 'ca-app-pub-9710890023203657~5109682400',
    banner: {
      test: 'ca-app-pub-3940256099942544/6300978111',
      production: 'ca-app-pub-9710890023203657/3218996173'
    },
    interstitial: {
      test: 'ca-app-pub-3940256099942544/1033173712',
      // No production interstitial unit yet — uses Google test unit until you add one
      production: 'ca-app-pub-3940256099942544/1033173712'
    }
  },

  /** Must match product IDs created in Play Console → Monetize → Subscriptions */
  subscriptions: {
    adFreeMonthly: 'fogofwar_adfree_monthly',
    adFreeYearly: 'fogofwar_adfree_yearly'
  },

  /** Minimum seconds between interstitial shows */
  interstitialCooldownSec: 120
} as const;

export function bannerAdUnitId(): string {
  return MonetizationConfig.useTestAds
    ? MonetizationConfig.admob.banner.test
    : MonetizationConfig.admob.banner.production;
}

export function interstitialAdUnitId(): string {
  return MonetizationConfig.useTestAds
    ? MonetizationConfig.admob.interstitial.test
    : MonetizationConfig.admob.interstitial.production;
}
