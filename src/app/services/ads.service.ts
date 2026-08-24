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
  private bannerShowInFlight: Promise<void> | null = null;
  private lastInterstitialAt = 0;
  private listenersAttached = false;
  /** Prefer NPA when UMP forms are missing / consent unavailable (common in EEA). */
  private preferNpa = false;
  private bannerRetryAttempt = 0;
  private bannerRetryTimer: ReturnType<typeof setTimeout> | null = null;
  /** When true, no banner may show (video selected / playing). */
  private videoModeActive = false;
  /** When true, no interstitial may show (video is actively playing). */
  private playbackSuppressed = false;

  /** Approximate banner height used to pad the empty-state UI */
  readonly bannerHeightPx = 100;
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
        const testingDevices = [...MonetizationConfig.testingDeviceIds];
        await AdMob.initialize({
          initializeForTesting:
            MonetizationConfig.useTestAds || testingDevices.length > 0,
          testingDevices
        });

        this.attachBannerListeners();
        this.initialized = true;

        // Consent must not block the empty-state banner.
        await this.requestConsentBestEffort();

        await this.prepareInterstitial();

        if (this.canShowBanner()) {
          await this.showBannerNow();
        }
      } catch (err) {
        console.warn('[AdsService] initialize failed', err);
        this.initialized = true;
      }
    })();

    return this.initPromise;
  }

  private attachBannerListeners() {
    if (this.listenersAttached) {
      return;
    }
    this.listenersAttached = true;

    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      if (this.videoModeActive || this.playbackSuppressed) {
        void this.removeBanner();
        return;
      }
      this.bannerVisible = true;
      this.bannerRetryAttempt = 0;
      this.bannerActiveSubject.next(true);
      console.info('[AdsService] banner loaded');
    });

    AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size: any) => {
      if (this.videoModeActive || this.playbackSuppressed) {
        void this.removeBanner();
        return;
      }
      if (size?.width > 0 && size?.height > 0) {
        this.bannerVisible = true;
        this.bannerActiveSubject.next(true);
      }
    });

    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (info: any) => {
      this.bannerVisible = false;
      this.bannerActiveSubject.next(false);
      console.warn('[AdsService] banner FailedToLoad', info);
      // ERROR_CODE_NO_FILL = 3 — common until AdMob has inventory / consent forms.
      void this.scheduleBannerRetry();
    });
  }

  private async requestConsentBestEffort(): Promise<void> {
    try {
      const consentInfo = await AdMob.requestConsentInfo();
      if (
        consentInfo.isConsentFormAvailable &&
        consentInfo.status === AdmobConsentStatus.REQUIRED
      ) {
        await AdMob.showConsentForm();
      }
    } catch (err) {
      // "no form(s) configured" → still request ads as non-personalized.
      this.preferNpa = true;
      console.warn('[AdsService] consent request failed — using NPA ads', err);
    }
  }

  /** Hide banner for the whole video session (picker → playback). */
  async setVideoModeActive(active: boolean): Promise<void> {
    this.videoModeActive = active;
    if (active) {
      this.bannerDesired = false;
      this.clearBannerRetry();
      await this.removeBanner();
    } else {
      this.playbackSuppressed = false;
    }
  }

  /** Block interstitials while frames are playing. */
  async setPlaybackSuppressed(suppressed: boolean): Promise<void> {
    this.playbackSuppressed = suppressed;
    if (suppressed) {
      this.bannerDesired = false;
      this.clearBannerRetry();
      await this.removeBanner();
    }
  }

  isVideoModeActive(): boolean {
    return this.videoModeActive;
  }

  isPlaybackSuppressed(): boolean {
    return this.playbackSuppressed;
  }

  /** Show bottom banner (empty home screen). Safe to call before init completes. */
  async showBannerIfAllowed(): Promise<void> {
    if (this.videoModeActive || this.playbackSuppressed) {
      return;
    }
    this.bannerDesired = true;
    if (this.billing.isAdFree) {
      return;
    }
    await this.initialize();
    if (!this.canShowBanner()) {
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
    this.clearBannerRetry();
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
    this.clearBannerRetry();
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
    if (this.playbackSuppressed || !this.canShowAds() || !interstitialAdUnitId()) {
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
    if (!this.canShowBanner()) {
      return;
    }
    if (this.bannerShowInFlight) {
      return this.bannerShowInFlight;
    }
    if (this.bannerVisible) {
      try {
        await AdMob.resumeBanner();
        this.bannerActiveSubject.next(true);
        return;
      } catch {
        /* fall through */
      }
    }

    this.bannerShowInFlight = (async () => {
      const options: BannerAdOptions = {
        adId: bannerAdUnitId(),
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: MonetizationConfig.useTestAds,
        npa: this.preferNpa
      };

      try {
        // Do not removeBanner() here — concurrent callers were destroying the
        // in-flight AdView before Loaded fired (NO_FILL / blank UI).
        await AdMob.showBanner(options);
      } catch (err) {
        console.warn('[AdsService] showBanner failed', err);
        this.bannerVisible = false;
        this.bannerActiveSubject.next(false);
        void this.scheduleBannerRetry();
      }
    })();

    try {
      await this.bannerShowInFlight;
    } finally {
      this.bannerShowInFlight = null;
    }
  }

  private scheduleBannerRetry() {
    if (!this.canShowBanner()) {
      return;
    }
    if (this.bannerRetryAttempt >= 4) {
      return;
    }
    this.clearBannerRetry();
    this.bannerRetryAttempt += 1;
    // After first NO_FILL, also try NPA (helps when UMP forms are missing in EEA).
    if (this.bannerRetryAttempt >= 1) {
      this.preferNpa = true;
    }
    const delayMs = Math.min(15000, 2000 * this.bannerRetryAttempt);
    this.bannerRetryTimer = setTimeout(() => {
      this.bannerRetryTimer = null;
      if (this.canShowBanner() && !this.bannerVisible) {
        void this.showBannerNow();
      }
    }, delayMs);
  }

  private clearBannerRetry() {
    if (this.bannerRetryTimer) {
      clearTimeout(this.bannerRetryTimer);
      this.bannerRetryTimer = null;
    }
  }

  private async prepareInterstitial(): Promise<void> {
    const adId = interstitialAdUnitId();
    if (!Capacitor.isNativePlatform() || this.billing.isAdFree || !adId) {
      return;
    }
    const options: AdOptions = {
      adId,
      isTesting: MonetizationConfig.useTestAds,
      npa: this.preferNpa
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

  private canShowBanner(): boolean {
    return (
      this.bannerDesired &&
      !this.videoModeActive &&
      !this.playbackSuppressed &&
      !this.billing.isAdFree &&
      Capacitor.isNativePlatform()
    );
  }
}
