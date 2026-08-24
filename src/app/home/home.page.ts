import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { MenuController, AlertController, ModalController, ToastController } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Subscription } from 'rxjs';
import { TranslationService } from '../services/translation.service';
import { AdsService } from '../services/ads.service';
import { BillingService } from '../services/billing.service';
import { TutorialComponent } from '../components/tutorial/tutorial.component';
import { LanguageSelectorComponent } from '../components/language-selector/language-selector.component';

interface QueuedVideo {
  src: string;
  name?: string;
  isBlob?: boolean;
  fogSnapshot?: ImageData | null;
  rotation?: number;
  hasFog?: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;

  videoQueue: QueuedVideo[] = [];
  currentVideoIndex = 0;
  brushSize: number = 18;
  brushSizeStr: string = '18';
  isDrawing: boolean = false;
  contentId: string = 'main-content';
  hasFog: boolean = true;

  videoZoom: number = 1.0;
  videoRotation: number = 0;
  showBannerSlot = false;
  purchaseInFlight = false;

  private ctx: CanvasRenderingContext2D | null = null;
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private fogCanvas: HTMLCanvasElement | null = null;
  private fogCtx: CanvasRenderingContext2D | null = null;
  private fogHistory: ImageData[] = [];
  private backButtonListener?: PluginListenerHandle;
  private appStateListener?: PluginListenerHandle;
  private activeTouches: number = 0;
  private twoFingerStartTime: number = 0;
  private isTwoFingerGesture: boolean = false;
  private animationFrameId: number | null = null;
  private displayWidth: number = 0;
  private displayHeight: number = 0;
  private adFreeSub?: Subscription;
  private bannerSub?: Subscription;
  /** Suppress banner restore while file/billing sheets are open */
  private suppressBannerRestore = false;
  private swipeStartX = 0;
  private swipeStartY = 0;
  private swipeTouchDrawn = false;

  get hasVideo(): boolean {
    return this.videoQueue.length > 0;
  }

  get videoUrl(): string | null {
    return this.videoQueue[this.currentVideoIndex]?.src ?? null;
  }

  get queueSize(): number {
    return this.videoQueue.length;
  }

  get queuePositionLabel(): string {
    return `${this.currentVideoIndex + 1}/${this.videoQueue.length}`;
  }

  constructor(
    private menuController: MenuController,
    private alertController: AlertController,
    private modalController: ModalController,
    private toastController: ToastController,
    public translation: TranslationService,
    private ads: AdsService,
    public billing: BillingService
  ) {}

  async closeMenu() {
    await this.menuController.close('main-menu');
  }

  async openMenu() {
    await this.menuController.open('main-menu');
  }

  /** Native AdMob banner sits above the WebView and steals taps on Premium. */
  async onMenuDidOpen() {
    await this.ads.hideBanner();
  }

  async onMenuDidClose() {
    await this.maybeRestoreBanner();
  }

  ngAfterViewInit() {
    this.setupBackButtonHandler();
    this.setupAppStateHandler();
    this.enableFullScreen();
    this.checkAndShowTutorial();
    this.showBannerSlot = !this.billing.isAdFree;
    this.adFreeSub = this.billing.adFree$.subscribe(async (adFree) => {
      this.showBannerSlot = !adFree && !this.hasVideo;
      if (adFree) {
        await this.ads.removeBanner();
      } else if (!this.hasVideo && !this.suppressBannerRestore) {
        await this.ads.showBannerIfAllowed();
      }
    });
    this.bannerSub = this.ads.bannerActive$.subscribe((active) => {
      if (!this.billing.isAdFree && !this.hasVideo) {
        this.showBannerSlot = active || !Capacitor.isNativePlatform();
      }
    });
    setTimeout(async () => {
      if (this.videoElement?.nativeElement) {
        this.video = this.videoElement.nativeElement;
      }
      if (this.canvasElement?.nativeElement) {
        this.canvas = this.canvasElement.nativeElement;
        this.ctx = this.canvas.getContext('2d');
      }
      if (!this.hasVideo && !this.billing.isAdFree) {
        this.showBannerSlot = true;
        await this.ads.showBannerIfAllowed();
      }
    }, 100);
  }

  private async maybeRestoreBanner() {
    if (
      this.suppressBannerRestore ||
      this.hasVideo ||
      this.billing.isAdFree ||
      this.purchaseInFlight ||
      this.ads.isVideoModeActive()
    ) {
      return;
    }
    this.showBannerSlot = true;
    await this.ads.showBannerIfAllowed();
  }

  async checkAndShowTutorial() {
    const languageSelected = localStorage.getItem('fog-of-war-language-selected');

    if (!languageSelected) {
      setTimeout(async () => {
        const langModal = await this.modalController.create({
          component: LanguageSelectorComponent,
          cssClass: 'language-selector-modal',
          backdropDismiss: false
        });
        await langModal.present();

        langModal.onDidDismiss().then(async () => {
          const tutorialCompleted = localStorage.getItem('fog-of-war-tutorial-completed');
          if (!tutorialCompleted) {
            const tutorialModal = await this.modalController.create({
              component: TutorialComponent,
              cssClass: 'tutorial-modal',
              backdropDismiss: false
            });
            await tutorialModal.present();
          }
        });
      }, 500);
    } else {
      const tutorialCompleted = localStorage.getItem('fog-of-war-tutorial-completed');
      if (!tutorialCompleted) {
        setTimeout(async () => {
          const modal = await this.modalController.create({
            component: TutorialComponent,
            cssClass: 'tutorial-modal',
            backdropDismiss: false
          });
          await modal.present();
        }, 500);
      }
    }
  }

  async openLanguageSelector() {
    const modal = await this.modalController.create({
      component: LanguageSelectorComponent,
      cssClass: 'language-selector-modal',
      backdropDismiss: true
    });
    await modal.present();
  }

  enableFullScreen() {
    if (document.documentElement.requestFullscreen && !Capacitor.isNativePlatform()) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  setupBackButtonHandler() {
    this.backButtonListener = App.addListener('backButton', async () => {
      const isMenuOpen = await this.menuController.isOpen('main-menu');
      if (isMenuOpen) {
        await this.menuController.close('main-menu');
        return;
      }

      const alert = await this.alertController.create({
        header: this.translation.t('alert.exitApp'),
        message: this.translation.t('alert.exitConfirm'),
        cssClass: 'custom-alert',
        buttons: [
          {
            text: this.translation.t('alert.cancel'),
            role: 'cancel',
            cssClass: 'alert-button-cancel'
          },
          {
            text: this.translation.t('alert.exit'),
            role: 'destructive',
            cssClass: 'alert-button-destructive',
            handler: () => {
              App.exitApp();
            }
          }
        ]
      });

      await alert.present();
    });
  }

  /** After Play Billing / picker sheets, restore a usable UI state. */
  setupAppStateHandler() {
    this.appStateListener = App.addListener('appStateChange', async ({ isActive }) => {
      if (!isActive) {
        return;
      }
      this.purchaseInFlight = false;
      this.suppressBannerRestore = false;
      // Billing sheets can leave the side menu half-open and blocking taps.
      await this.menuController.enable(true, 'main-menu');
      const isMenuOpen = await this.menuController.isOpen('main-menu');
      if (isMenuOpen && !this.hasVideo) {
        await this.menuController.close('main-menu');
      }
      await this.maybeRestoreBanner();
    });
  }

  ngOnDestroy() {
    this.adFreeSub?.unsubscribe();
    this.bannerSub?.unsubscribe();
    this.backButtonListener?.remove();
    this.appStateListener?.remove();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.revokeAllVideoUrls();
    this.ads.removeBanner();
  }

  async selectVideo() {
    await this.menuController.close('main-menu');
    await this.pickVideoFromGallery();
  }

  async subscribeMonthly() {
    if (this.purchaseInFlight) {
      return;
    }
    this.purchaseInFlight = true;
    this.suppressBannerRestore = true;
    await this.ads.hideBanner();
    await this.menuController.close('main-menu');

    try {
      const ok = await this.billing.purchaseMonthly();
      if (this.billing.purchaseError === 'cancelled') {
        return;
      }
      await this.showPremiumToast(ok);
      if (ok) {
        await this.ads.removeBanner();
        this.showBannerSlot = false;
      }
    } finally {
      this.purchaseInFlight = false;
      this.suppressBannerRestore = false;
      await this.menuController.close('main-menu');
      await this.maybeRestoreBanner();
    }
  }

  async restorePurchases() {
    const ok = await this.billing.restore();
    const toast = await this.toastController.create({
      message: ok
        ? this.translation.t('premium.restoreOk')
        : this.translation.t('premium.restoreEmpty'),
      duration: 2500,
      position: 'bottom',
      cssClass: 'premium-toast'
    });
    await toast.present();
    if (ok) {
      await this.ads.removeBanner();
    }
  }

  private async showPremiumToast(ok: boolean) {
    const toast = await this.toastController.create({
      message: ok
        ? this.translation.t('premium.purchaseOk')
        : this.translation.t('premium.purchaseFail'),
      duration: 2800,
      position: 'middle',
      cssClass: 'premium-toast'
    });
    await toast.present();
  }

  /**
   * Native FilePicker avoids WebView <input type="file"> activity-result races
   * with cordova-plugin-purchase / Play Billing sheets.
   */
  async pickVideoFromGallery() {
    this.suppressBannerRestore = true;
    await this.ads.hideBanner();

    try {
      if (Capacitor.isNativePlatform()) {
        const result = await FilePicker.pickVideos({
          limit: 0,
          readData: false
        });
        const files = result.files ?? [];
        if (files.length === 0) {
          return;
        }
        const videos: QueuedVideo[] = files
          .filter((file) => !!file.path)
          .map((file) => ({
            src: Capacitor.convertFileSrc(file.path!),
            name: file.name
          }));
        if (videos.length === 0) {
          return;
        }
        await this.applySelectedVideos(videos);
        return;
      }

      await this.pickVideoWithHtmlInput();
    } catch (err: any) {
      // User cancel / dismiss — keep current video
      const message = String(err?.message || err || '');
      if (!/cancel|dismiss|picker/i.test(message)) {
        console.warn('[HomePage] pickVideo failed', err);
      }
    } finally {
      this.suppressBannerRestore = false;
      await this.maybeRestoreBanner();
    }
  }

  private pickVideoWithHtmlInput(): Promise<void> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      input.multiple = true;
      input.style.display = 'none';
      document.body.appendChild(input);

      const cleanup = () => {
        if (input.parentNode) {
          document.body.removeChild(input);
        }
      };

      input.onchange = async (event: any) => {
        const files = Array.from(event.target.files ?? []) as File[];
        cleanup();
        if (files.length > 0) {
          const videos: QueuedVideo[] = files.map((file) => ({
            src: URL.createObjectURL(file),
            name: file.name,
            isBlob: true
          }));
          await this.applySelectedVideos(videos);
        }
        resolve();
      };

      input.oncancel = () => {
        cleanup();
        resolve();
      };

      input.click();
    });
  }

  private revokeAllVideoUrls() {
    for (const video of this.videoQueue) {
      if (video.isBlob) {
        URL.revokeObjectURL(video.src);
      }
    }
  }

  private saveCurrentVideoState() {
    const current = this.videoQueue[this.currentVideoIndex];
    if (!current || !this.fogCtx || !this.fogCanvas) {
      return;
    }
    current.fogSnapshot = this.fogCtx.getImageData(
      0,
      0,
      this.fogCanvas.width,
      this.fogCanvas.height
    );
    current.rotation = this.videoRotation;
    current.hasFog = this.hasFog;
  }

  private async applySelectedVideos(videos: QueuedVideo[]) {
    this.saveCurrentVideoState();
    this.revokeAllVideoUrls();
    this.videoQueue = videos;
    this.currentVideoIndex = 0;
    this.hasFog = true;
    this.videoRotation = 0;
    this.showBannerSlot = false;
    await this.ads.setVideoModeActive(true);

    const alert = await this.alertController.create({
      header: this.translation.t('alert.addFog'),
      message: this.translation.t('alert.addFogMessage'),
      cssClass: 'custom-alert',
      buttons: [
        {
          text: this.translation.t('alert.noFog'),
          cssClass: 'alert-button-secondary',
          handler: () => {
            void this.startSelectedVideo(false);
          }
        },
        {
          text: this.translation.t('alert.addFogButton'),
          cssClass: 'alert-button-primary',
          handler: () => {
            void this.startSelectedVideo(true);
          }
        }
      ]
    });
    await alert.present();
  }

  private async startSelectedVideo(withFog: boolean) {
    this.hasFog = withFog;
    this.videoQueue[this.currentVideoIndex].hasFog = withFog;
    await this.ads.showInterstitialIfAllowed();
    await this.ads.setPlaybackSuppressed(true);
    this.loadVideo();
  }

  goToNextVideo() {
    if (this.currentVideoIndex >= this.videoQueue.length - 1) {
      return;
    }
    void this.goToVideoIndex(this.currentVideoIndex + 1);
  }

  goToPreviousVideo() {
    if (this.currentVideoIndex <= 0) {
      return;
    }
    void this.goToVideoIndex(this.currentVideoIndex - 1);
  }

  private async goToVideoIndex(index: number) {
    if (index < 0 || index >= this.videoQueue.length || index === this.currentVideoIndex) {
      return;
    }

    this.saveCurrentVideoState();
    this.currentVideoIndex = index;
    const next = this.videoQueue[index];
    this.hasFog = next.hasFog ?? true;
    this.videoRotation = next.rotation ?? 0;
    this.fogHistory = [];
    await this.ads.setPlaybackSuppressed(true);
    this.loadVideo(true);
  }

  private trySwipeNavigation(endX: number, endY: number) {
    if (this.videoQueue.length <= 1 || this.swipeTouchDrawn) {
      return;
    }

    const dx = endX - this.swipeStartX;
    const dy = endY - this.swipeStartY;
    if (Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy) * 1.5) {
      return;
    }

    if (dx < 0) {
      this.goToNextVideo();
    } else {
      this.goToPreviousVideo();
    }
  }
  
  loadVideo(restoreSnapshot = false) {
    if (!this.videoUrl) {
      return;
    }

    this.videoZoom = 1.0;

    // Cancel existing animation loop before loading new video
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    setTimeout(() => {
      if (!this.videoElement?.nativeElement) return;

      this.video = this.videoElement.nativeElement;
      this.video.src = this.videoUrl!;
      this.video.load();

      this.video.addEventListener('loadedmetadata', () => {
        const saved = this.videoQueue[this.currentVideoIndex];
        if (restoreSnapshot && saved?.rotation !== undefined) {
          this.videoRotation = saved.rotation;
        } else if (this.video && this.video.videoHeight > this.video.videoWidth) {
          this.videoRotation = 90;
        } else {
          this.videoRotation = 0;
        }

        if (this.canvasElement?.nativeElement && !this.ctx) {
          this.canvas = this.canvasElement.nativeElement;
          this.ctx = this.canvas.getContext('2d');
        }
        this.setupCanvas(restoreSnapshot);
      }, { once: true });
    }, 100);
  }

  setupCanvas(restoreSnapshot = false) {
    if (!this.canvas || !this.video || !this.ctx) return;

    if (this.video.readyState < 2) {
      this.video.addEventListener('loadeddata', () => this.setupCanvas(restoreSnapshot), { once: true });
      return;
    }

    const container = this.canvas.parentElement;
    if (!container) return;

    setTimeout(() => {
      if (!this.canvas || !this.video || !this.ctx) return;

      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width || container.clientWidth || window.innerWidth;
      const containerHeight = containerRect.height || container.clientHeight || window.innerHeight;

      if (containerWidth === 0 || containerHeight === 0) {
        setTimeout(() => this.setupCanvas(restoreSnapshot), 200);
        return;
      }

      // Determine effective video dimensions after rotation
      let effectiveVideoWidth = this.video.videoWidth;
      let effectiveVideoHeight = this.video.videoHeight;

      if (this.videoRotation === 90 || this.videoRotation === 270) {
        [effectiveVideoWidth, effectiveVideoHeight] = [effectiveVideoHeight, effectiveVideoWidth];
      }

      const videoAspect = effectiveVideoWidth / effectiveVideoHeight;
      const containerAspect = containerWidth / containerHeight;

      let displayWidth: number, displayHeight: number;

      if (videoAspect > containerAspect) {
        displayWidth = containerWidth;
        displayHeight = containerWidth / videoAspect;
      } else {
        displayHeight = containerHeight;
        displayWidth = containerHeight * videoAspect;
      }

      this.displayWidth = Math.round(displayWidth);
      this.displayHeight = Math.round(displayHeight);

      // Size canvas display area to match video aspect ratio
      this.canvas.style.width = this.displayWidth + 'px';
      this.canvas.style.height = this.displayHeight + 'px';

      // Set canvas internal resolution scaled by DPR for sharpness
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = this.displayWidth * dpr;
      this.canvas.height = this.displayHeight * dpr;

      // Scale context so drawing uses logical (display) coordinates
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);

      // Create fog canvas at display resolution (not DPR-scaled)
      // This canvas uses destination-out compositing to erase fog
      this.fogCanvas = document.createElement('canvas');
      this.fogCanvas.width = this.displayWidth;
      this.fogCanvas.height = this.displayHeight;
      this.fogCtx = this.fogCanvas.getContext('2d');

      if (!this.fogCtx) return;

      if (this.hasFog) {
        this.fogCtx.fillStyle = '#000000';
        this.fogCtx.fillRect(0, 0, this.displayWidth, this.displayHeight);
      }

      const snapshot = this.videoQueue[this.currentVideoIndex]?.fogSnapshot;
      if (
        restoreSnapshot &&
        snapshot &&
        snapshot.width === this.fogCanvas.width &&
        snapshot.height === this.fogCanvas.height
      ) {
        this.fogCtx.putImageData(snapshot, 0, 0);
      }

      this.fogHistory = [];

      this.video.play().catch(() => {});

      // Cancel any existing loop before starting a new one
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.drawFog();
    }, 100);
  }

  drawFog() {
    if (!this.canvas || !this.video || !this.ctx || !this.fogCanvas) return;

    if (this.video.readyState >= 2) {
      const dw = this.displayWidth;
      const dh = this.displayHeight;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const videoWidth = this.video.videoWidth;
      const videoHeight = this.video.videoHeight;

      // Swap draw dimensions for 90/270 rotation since canvas is sized for rotated video
      let drawWidth = dw * this.videoZoom;
      let drawHeight = dh * this.videoZoom;

      if (this.videoRotation === 90 || this.videoRotation === 270) {
        [drawWidth, drawHeight] = [drawHeight, drawWidth];
      }

      // Draw video frame with rotation applied
      this.ctx.save();
      this.ctx.translate(dw / 2, dh / 2);
      if (this.videoRotation !== 0) {
        this.ctx.rotate((this.videoRotation * Math.PI) / 180);
      }
      this.ctx.drawImage(
        this.video,
        0, 0, videoWidth, videoHeight,
        -drawWidth / 2, -drawHeight / 2,
        drawWidth, drawHeight
      );
      this.ctx.restore();

      // Draw fog overlay - transparent areas reveal video beneath
      this.ctx.drawImage(this.fogCanvas, 0, 0, dw, dh);
    }

    this.animationFrameId = requestAnimationFrame(() => this.drawFog());
  }

  onContainerTouch(event: TouchEvent) {
    if (event.touches && event.touches.length === 2) {
      this.activeTouches = 2;
      this.isTwoFingerGesture = true;
      this.twoFingerStartTime = Date.now();
    } else {
      this.activeTouches = event.touches ? event.touches.length : 0;
      if (this.activeTouches < 2) {
        this.isTwoFingerGesture = false;
      }
    }
  }

  onContainerTouchEnd(event: TouchEvent) {
    const remainingTouches = event.touches ? event.touches.length : 0;

    if (this.isTwoFingerGesture && remainingTouches === 0) {
      const touchDuration = Date.now() - this.twoFingerStartTime;
      if (touchDuration < 500) {
        event.preventDefault();
        event.stopPropagation();
        this.openMenu();
        this.isTwoFingerGesture = false;
        this.activeTouches = 0;
        return;
      }
    }

    if (remainingTouches === 0) {
      this.activeTouches = 0;
      this.isTwoFingerGesture = false;
    }
  }

  onCanvasTouch(event: TouchEvent) {
    if (event.touches && event.touches.length === 2) {
      this.activeTouches = 2;
      this.isTwoFingerGesture = true;
      this.twoFingerStartTime = Date.now();
      return;
    }

    if (this.isTwoFingerGesture && event.touches && event.touches.length === 1) {
      this.isTwoFingerGesture = false;
      this.activeTouches = 1;
    }

    if (event.touches && event.touches.length === 1) {
      this.isTwoFingerGesture = false;
      event.preventDefault();
      event.stopPropagation();
    }

    if (!event.touches || event.touches.length === 0) return;

    const touch = event.touches[0];
    this.swipeStartX = touch.clientX;
    this.swipeStartY = touch.clientY;
    this.swipeTouchDrawn = false;

    const rect = this.canvas?.getBoundingClientRect();
    if (!rect || !this.fogCtx || !this.fogCanvas) return;

    if (!this.isDrawing) {
      this.saveHistory();
    }

    this.isDrawing = true;
    this.activeTouches = 1;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    this.removeFog(x, y, rect);
  }

  onCanvasTouchMove(event: TouchEvent) {
    if (event.touches && event.touches.length === 2) {
      this.activeTouches = 2;
      this.isTwoFingerGesture = true;
      return;
    }

    if (this.isTwoFingerGesture && event.touches && event.touches.length === 1) {
      this.isTwoFingerGesture = false;
      this.activeTouches = 1;
    }

    if (this.isDrawing && event.touches && event.touches.length === 1 && !this.isTwoFingerGesture) {
      this.swipeTouchDrawn = true;
      event.preventDefault();
      event.stopPropagation();

      const touch = event.touches[0];
      const rect = this.canvas?.getBoundingClientRect();
      if (!rect || !this.fogCtx || !this.fogCanvas) return;

      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      this.removeFog(x, y, rect);
    }
  }

  onCanvasTouchEnd(event: TouchEvent) {
    const remainingTouches = event.touches ? event.touches.length : 0;
    const endedTouches = event.changedTouches ? event.changedTouches.length : 0;

    if (this.isTwoFingerGesture && (remainingTouches === 0 || (remainingTouches <= 1 && endedTouches >= 1))) {
      const touchDuration = Date.now() - this.twoFingerStartTime;
      if (touchDuration < 500) {
        event.preventDefault();
        event.stopPropagation();
        this.openMenu();
        this.isTwoFingerGesture = false;
        this.activeTouches = 0;
        this.isDrawing = false;
        return;
      }
    }

    if (!this.isTwoFingerGesture && this.activeTouches === 1) {
      event.preventDefault();
      event.stopPropagation();
      this.isDrawing = false;
      if (event.changedTouches?.[0]) {
        const touch = event.changedTouches[0];
        this.trySwipeNavigation(touch.clientX, touch.clientY);
      }
    }

    if (remainingTouches === 0) {
      this.activeTouches = 0;
      this.isTwoFingerGesture = false;
    }
  }

  onCanvasMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const rect = this.canvas?.getBoundingClientRect();
    if (!rect) return;

    if (!this.isDrawing) {
      this.saveHistory();
    }

    this.isDrawing = true;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.removeFog(x, y, rect);
  }

  onCanvasMouseMove(event: MouseEvent) {
    if (!this.isDrawing) return;

    const rect = this.canvas?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.removeFog(x, y, rect);
  }

  onCanvasMouseUp() {
    this.isDrawing = false;
  }

  // Erase fog using Canvas 2D destination-out compositing - vastly faster than pixel loops
  private removeFog(x: number, y: number, rect: DOMRect) {
    if (!this.fogCtx || !this.fogCanvas) return;
    if (rect.width === 0 || rect.height === 0) return;

    // Scale CSS display coordinates to fog canvas pixel coordinates
    const scaleX = this.fogCanvas.width / rect.width;
    const scaleY = this.fogCanvas.height / rect.height;
    const fogX = x * scaleX;
    const fogY = y * scaleY;
    const radius = this.brushSize * ((scaleX + scaleY) / 2);

    this.fogCtx.save();
    this.fogCtx.globalCompositeOperation = 'destination-out';
    this.fogCtx.beginPath();
    this.fogCtx.arc(fogX, fogY, radius, 0, Math.PI * 2);
    this.fogCtx.fill();
    this.fogCtx.restore();
  }

  private saveHistory() {
    if (!this.fogCtx || !this.fogCanvas) return;
    const snapshot = this.fogCtx.getImageData(0, 0, this.fogCanvas.width, this.fogCanvas.height);
    this.fogHistory.push(snapshot);
    if (this.fogHistory.length > 20) {
      this.fogHistory.shift();
    }
  }

  changeBrushSize(event: any) {
    const value = event.detail.value;
    this.brushSizeStr = value;
    this.brushSize = parseInt(value, 10);
    this.closeMenu();
  }

  resetFog() {
    if (!this.fogCtx || !this.fogCanvas) return;
    this.saveHistory();
    this.fogCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.fogCtx.fillStyle = '#000000';
    this.fogCtx.fillRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
  }

  removeAllFog() {
    if (!this.fogCtx || !this.fogCanvas) return;
    this.saveHistory();
    this.fogCtx.clearRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
  }

  undo() {
    if (this.fogHistory.length === 0 || !this.fogCtx || !this.fogCanvas) return;
    const previous = this.fogHistory.pop()!;
    this.fogCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.fogCtx.putImageData(previous, 0, 0);
  }

  rotateVideo() {
    this.videoRotation = (this.videoRotation + 90) % 360;
  }
}
