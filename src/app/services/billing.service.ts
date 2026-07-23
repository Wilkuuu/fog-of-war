import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { MonetizationConfig } from './monetization.config';

/**
 * Google Play Billing via cordova-plugin-purchase.
 * Product IDs must exist in Play Console before purchase works on device.
 */
@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private readonly adFreeKey = 'fog-of-war-adfree';
  private adFreeSubject = new BehaviorSubject<boolean>(
    localStorage.getItem(this.adFreeKey) === '1'
  );
  readonly adFree$ = this.adFreeSubject.asObservable();

  private ready = false;
  private priceLabels: Record<string, string> = {};

  get isAdFree(): boolean {
    return this.adFreeSubject.value;
  }

  get monthlyPriceLabel(): string {
    return (
      this.priceLabels[MonetizationConfig.subscriptions.adFreeMonthly] ||
      '…'
    );
  }

  get yearlyPriceLabel(): string {
    return (
      this.priceLabels[MonetizationConfig.subscriptions.adFreeYearly] || '…'
    );
  }

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const store = this.getStore();
    if (!store) {
      console.warn('[BillingService] CdvPurchase.store unavailable');
      return;
    }

    try {
      const { ProductType, Platform } = (window as any).CdvPurchase;

      store.register([
        {
          id: MonetizationConfig.subscriptions.adFreeMonthly,
          type: ProductType.PAID_SUBSCRIPTION,
          platform: Platform.GOOGLE_PLAY
        },
        {
          id: MonetizationConfig.subscriptions.adFreeYearly,
          type: ProductType.PAID_SUBSCRIPTION,
          platform: Platform.GOOGLE_PLAY
        }
      ]);

      store
        .when()
        .productUpdated(() => this.refreshOwnership(store))
        .approved((transaction: any) => {
          transaction.verify();
        })
        .verified((receipt: any) => {
          receipt.finish();
          this.refreshOwnership(store);
        });

      await store.initialize([Platform.GOOGLE_PLAY]);
      this.ready = true;
      this.cachePrices(store);
      this.refreshOwnership(store);
    } catch (err) {
      console.warn('[BillingService] initialize failed', err);
    }
  }

  async purchaseMonthly(): Promise<boolean> {
    return this.order(MonetizationConfig.subscriptions.adFreeMonthly);
  }

  async purchaseYearly(): Promise<boolean> {
    return this.order(MonetizationConfig.subscriptions.adFreeYearly);
  }

  async restore(): Promise<boolean> {
    const store = this.getStore();
    if (!store) {
      return this.isAdFree;
    }
    try {
      await store.update();
      this.refreshOwnership(store);
      return this.isAdFree;
    } catch (err) {
      console.warn('[BillingService] restore failed', err);
      return this.isAdFree;
    }
  }

  private async order(productId: string): Promise<boolean> {
    const store = this.getStore();
    if (!store || !this.ready) {
      console.warn('[BillingService] store not ready — create products in Play Console');
      return false;
    }

    const product = store.get(productId);
    if (!product) {
      console.warn('[BillingService] product missing:', productId);
      return false;
    }

    try {
      const offer = product.getOffer?.() ?? product.offers?.[0];
      if (!offer) {
        console.warn('[BillingService] no offer for', productId);
        return false;
      }
      await offer.order();
      this.refreshOwnership(store);
      return this.isAdFree;
    } catch (err) {
      console.warn('[BillingService] order failed', err);
      return false;
    }
  }

  private refreshOwnership(store: any): void {
    const monthly = store.owned(MonetizationConfig.subscriptions.adFreeMonthly);
    const yearly = store.owned(MonetizationConfig.subscriptions.adFreeYearly);
    const owned = !!(monthly || yearly);
    this.setAdFree(owned);
  }

  private cachePrices(store: any): void {
    for (const id of [
      MonetizationConfig.subscriptions.adFreeMonthly,
      MonetizationConfig.subscriptions.adFreeYearly
    ]) {
      const product = store.get(id);
      const pricing = product?.pricing?.price || product?.offers?.[0]?.pricingPhases?.[0]?.price;
      if (pricing) {
        this.priceLabels[id] = pricing;
      }
    }
  }

  private setAdFree(value: boolean): void {
    this.adFreeSubject.next(value);
    localStorage.setItem(this.adFreeKey, value ? '1' : '0');
  }

  private getStore(): any | null {
    const CdvPurchase = (window as any).CdvPurchase;
    return CdvPurchase?.store ?? null;
  }
}
