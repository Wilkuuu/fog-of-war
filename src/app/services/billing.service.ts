import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { MonetizationConfig } from './monetization.config';

/**
 * Google Play Billing via cordova-plugin-purchase.
 * Product IDs must exist in Play Console before purchase works on device.
 *
 * No remote receipt validator — finish locally on approval (see plugin docs
 * “without receipt validation”).
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
  private lastError: string | null = null;

  get isAdFree(): boolean {
    return this.adFreeSubject.value;
  }

  get monthlyPriceLabel(): string {
    return (
      this.priceLabels[MonetizationConfig.subscriptions.adFreeMonthly] ||
      '…'
    );
  }

  /** Last purchase/init error for UI toasts */
  get purchaseError(): string | null {
    return this.lastError;
  }

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const store = this.getStore();
    if (!store) {
      console.warn('[BillingService] CdvPurchase.store unavailable');
      this.lastError = 'store_unavailable';
      return;
    }

    try {
      const { ProductType, Platform } = (window as any).CdvPurchase;

      store.register([
        {
          id: MonetizationConfig.subscriptions.adFreeMonthly,
          type: ProductType.PAID_SUBSCRIPTION,
          platform: Platform.GOOGLE_PLAY,
          group: 'default'
        }
      ]);

      // Local-only flow: finish on approve (no iaptic / remote validator).
      store
        .when()
        .productUpdated(() => {
          this.cachePrices(store);
          this.refreshOwnership(store);
        })
        .approved(async (transaction: any) => {
          try {
            await transaction.finish();
          } catch (err) {
            console.warn('[BillingService] finish failed', err);
          }
          this.refreshOwnership(store);
        })
        .receiptUpdated(() => {
          this.refreshOwnership(store);
        });

      await store.initialize([Platform.GOOGLE_PLAY]);
      try {
        await store.update();
      } catch (err) {
        console.warn('[BillingService] store.update failed', err);
      }

      this.ready = true;
      this.cachePrices(store);
      this.refreshOwnership(store);
      this.lastError = null;
    } catch (err) {
      console.warn('[BillingService] initialize failed', err);
      this.lastError = 'init_failed';
    }
  }

  async purchaseMonthly(): Promise<boolean> {
    return this.order(MonetizationConfig.subscriptions.adFreeMonthly);
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
    this.lastError = null;
    const store = this.getStore();
    if (!store || !this.ready) {
      console.warn('[BillingService] store not ready — create products in Play Console');
      this.lastError = 'store_not_ready';
      return false;
    }

    const CdvPurchase = (window as any).CdvPurchase;
    const product =
      store.get(productId, CdvPurchase?.Platform?.GOOGLE_PLAY) ??
      store.get(productId);

    if (!product) {
      console.warn('[BillingService] product missing:', productId);
      this.lastError = 'product_missing';
      // Retry catalog once — new Play products can lag after first launch.
      try {
        await store.update();
        this.cachePrices(store);
      } catch {
        /* ignore */
      }
      const retry =
        store.get(productId, CdvPurchase?.Platform?.GOOGLE_PLAY) ??
        store.get(productId);
      if (!retry) {
        return false;
      }
      return this.orderProduct(store, retry);
    }

    return this.orderProduct(store, product);
  }

  private async orderProduct(store: any, product: any): Promise<boolean> {
    try {
      const offer = product.getOffer?.() ?? product.offers?.[0];
      if (!offer) {
        console.warn('[BillingService] no offer for', product.id);
        this.lastError = 'no_offer';
        return false;
      }

      // order() resolves to an Error on failure / cancel, or undefined/null on OK.
      const error = await offer.order();
      if (error) {
        const ErrorCode = (window as any).CdvPurchase?.ErrorCode;
        if (error.code === ErrorCode?.PAYMENT_CANCELLED) {
          this.lastError = 'cancelled';
        } else {
          console.warn('[BillingService] order error', error);
          this.lastError = error.message || 'order_failed';
        }
        return false;
      }

      this.refreshOwnership(store);
      if (this.isAdFree) {
        return true;
      }

      // Ownership can update slightly after the Play sheet closes.
      await this.waitForOwnership(store, 4000);
      return this.isAdFree;
    } catch (err) {
      console.warn('[BillingService] order failed', err);
      this.lastError = 'order_failed';
      return false;
    }
  }

  private waitForOwnership(store: any, timeoutMs: number): Promise<void> {
    return new Promise((resolve) => {
      const started = Date.now();
      const tick = () => {
        this.refreshOwnership(store);
        if (this.isAdFree || Date.now() - started >= timeoutMs) {
          resolve();
          return;
        }
        setTimeout(tick, 250);
      };
      tick();
    });
  }

  private refreshOwnership(store: any): void {
    const id = MonetizationConfig.subscriptions.adFreeMonthly;
    const owned = !!(store.owned?.(id) || store.get?.(id)?.owned);
    this.setAdFree(owned);
  }

  private cachePrices(store: any): void {
    const id = MonetizationConfig.subscriptions.adFreeMonthly;
    const product = store.get(id);
    const pricing =
      product?.pricing?.price ||
      product?.offers?.[0]?.pricingPhases?.[0]?.price;
    if (pricing) {
      this.priceLabels[id] = pricing;
    }
  }

  private setAdFree(value: boolean): void {
    if (this.adFreeSubject.value === value) {
      return;
    }
    this.adFreeSubject.next(value);
    localStorage.setItem(this.adFreeKey, value ? '1' : '0');
  }

  private getStore(): any | null {
    const CdvPurchase = (window as any).CdvPurchase;
    return CdvPurchase?.store ?? null;
  }
}
