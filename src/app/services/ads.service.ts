import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
  AdOptions,
  AdmobConsentStatus,
  BannerAdPluginEvents
} from '@capacitor-community/admob';
import {
  MonetizationConfig,
  bannerAdUnitId,
  interstitialAdUnitId
} from './monetization.config';
import { BillingService } from './billing.service';

@Injectable({
  providedIn: 'root'
})
export class AdsService {
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private bannerVisible = false;
  private bannerDesired = false;
  private lastInterstitialAt = 0;

  /** Approximate banner height used to pad the empty-state UI */
  readonly bannerHeightPx = 60;
  private bannerActiveSubject = new BehaviorSubject<boolean>(false);
  readonly bannerActive$ = this.bannerActiveSubject.asObservable();

  constructor(private billing: BillingService) {}

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    if (this.initPromise) {
      return this.initPromise;
    }
    if (!Capacitor.isNativePlatform()) {
      this.initialized = true;
      return;
    }

    this.initPromise = (async () => {
      try {
        // Google Mobile Ads SDK init (App ID from AndroidManifest / admob_app_id)
        await AdMob.initialize({
          initializeForTesting: MonetizationConfig.useTestAds
        });

        AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
          this.bannerVisible = true;
          this.bannerActiveSubject.next(true);
        });
        AdMob.addListener(BannerAdPluginEvents.SizeChanged, () => {
          this.bannerActiveSubject.next(true);
        });

        // UMP consent (EEA / UK) before loading ads — AdMob policy
        const consentInfo = await AdMob.requestConsentInfo();
        if (
          consentInfo.isConsentFormAvailable &&
          consentInfo.status === AdmobConsentStatus.REQUIRED
        ) {
          await AdMob.showConsentForm();
        }

        this.initialized = true;
        await this.prepareInterstitial();

        if (this.bannerDesired && !this.billing.isAdFree) {
          await this.showBannerNow();
        }
      } catch (err) {
        console.warn('[AdsService] initialize failed', err);
        this.initialized = true;
      }
    })();

    return this.initPromise;
  }

  /** Show bottom banner (empty home screen). Safe to call before init completes. */
  async showBannerIfAllowed(): Promise<void> {
    this.bannerDesired = true;
    if (this.billing.isAdFree) {
      return;
    }
    await this.initialize();
    if (!Capacitor.isNativePlatform() || this.billing.isAdFree) {
      return;
    }
    if (this.bannerVisible) {
      try {
        await AdMob.resumeBanner();
        this.bannerActiveSubject.next(true);
        return;
      } catch {
        // fall through to show
      }
    }
    await this.showBannerNow();
  }

  async hideBanner(): Promise<void> {
    this.bannerDesired = false;
    if (!Capacitor.isNativePlatform() || !this.bannerVisible) {
      this.bannerActiveSubject.next(false);
      return;
    }
    try {
      await AdMob.hideBanner();
      this.bannerActiveSubject.next(false);
    } catch (err) {
      console.warn('[AdsService] hideBanner failed', err);
    }
  }

  async removeBanner(): Promise<void> {
    this.bannerDesired = false;
    if (!Capacitor.isNativePlatform()) {
      this.bannerActiveSubject.next(false);
      return;
    }
    try {
      await AdMob.removeBanner();
    } catch (err) {
      console.warn('[AdsService] removeBanner failed', err);
    }
    this.bannerVisible = false;
    this.bannerActiveSubject.next(false);
  }

  async showInterstitialIfAllowed(): Promise<void> {
    await this.initialize();
    if (!this.canShowAds() || !interstitialAdUnitId()) {
      return;
    }

    const now = Date.now();
    const cooldownMs = MonetizationConfig.interstitialCooldownSec * 1000;
    if (now - this.lastInterstitialAt < cooldownMs) {
      return;
    }

    try {
      await AdMob.showInterstitial();
      this.lastInterstitialAt = now;
      await this.prepareInterstitial();
    } catch (err) {
      console.warn('[AdsService] showInterstitial failed', err);
      await this.prepareInterstitial();
    }
  }

  private async showBannerNow(): Promise<void> {
    // Banner guide: adaptive size, bottom anchor, production unit baner_fot_of_war
    const options: BannerAdOptions = {
      adId: bannerAdUnitId(),
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: MonetizationConfig.useTestAds
    };

    try {
      await AdMob.showBanner(options);
      this.bannerVisible = true;
      this.bannerActiveSubject.next(true);
    } catch (err) {
      console.warn('[AdsService] showBanner failed', err);
    }
  }

  private async prepareInterstitial(): Promise<void> {
    const adId = interstitialAdUnitId();
    if (!Capacitor.isNativePlatform() || this.billing.isAdFree || !adId) {
      return;
    }
    const options: AdOptions = {
      adId,
      isTesting: MonetizationConfig.useTestAds
    };
    try {
      await AdMob.prepareInterstitial(options);
    } catch (err) {
      console.warn('[AdsService] prepareInterstitial failed', err);
    }
  }

  private canShowAds(): boolean {
    return (
      Capacitor.isNativePlatform() &&
      this.initialized &&
      !this.billing.isAdFree
    );
  }
}
