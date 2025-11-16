import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActionSheetController, MenuController, AlertController, Platform, ModalController } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { TranslationService } from '../services/translation.service';
import { TutorialComponent } from '../components/tutorial/tutorial.component';
import { LanguageSelectorComponent } from '../components/language-selector/language-selector.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;
  
  videoUrl: string | null = null;
  brushSize: number = 18;
  brushSizeStr: string = '18';
  isDrawing: boolean = false;
  fogMask: ImageData | null = null;
  contentId: string = 'main-content';
  hasFog: boolean = true;
  
  // Configuration: Video scale percentage (0.8 = 80% of container height)
  videoScale: number = 0.8;
  
  private ctx: CanvasRenderingContext2D | null = null;
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private fogCanvas: HTMLCanvasElement | null = null;
  private fogCtx: CanvasRenderingContext2D | null = null;
  private fogMaskDirty: boolean = false;
  private fogHistory: ImageData[] = []; // For undo functionality
  private backButtonListener: any;
  private twoFingerTapTimeout: any = null;
  private touchStartTime: number = 0;
  private activeTouches: number = 0;
  private twoFingerStartTime: number = 0;
  private isTwoFingerGesture: boolean = false;

  constructor(
    private actionSheetController: ActionSheetController,
    private menuController: MenuController,
    private alertController: AlertController,
    private platform: Platform,
    private modalController: ModalController,
    public translation: TranslationService
  ) {}
  
  closeMenu() {
    this.menuController.close('main-menu');
  }
  
  async openMenu() {
    await this.menuController.open('main-menu');
  }

  ngAfterViewInit() {
    // Request permissions on app start
    this.requestPermissions();
    // Prevent app from closing on back button
    this.setupBackButtonHandler();
    // Enable full screen mode
    this.enableFullScreen();
    // Show tutorial on first launch
    this.checkAndShowTutorial();
    // Wait a bit for view to initialize
    setTimeout(() => {
      if (this.videoElement?.nativeElement) {
        this.video = this.videoElement.nativeElement;
        this.video.addEventListener('loadedmetadata', () => {
          this.setupCanvas();
        });
      }
      if (this.canvasElement?.nativeElement) {
        this.canvas = this.canvasElement.nativeElement;
        this.ctx = this.canvas.getContext('2d');
      }
    }, 100);
  }

  async checkAndShowTutorial() {
    // First check if language has been selected
    const languageSelected = localStorage.getItem('fog-of-war-language-selected');
    
    if (!languageSelected) {
      // Show language selector first
      setTimeout(async () => {
        const langModal = await this.modalController.create({
          component: LanguageSelectorComponent,
          cssClass: 'language-selector-modal',
          backdropDismiss: false
        });
        await langModal.present();
        
        // Wait for language selector to close, then show tutorial
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
      // Language already selected, just check tutorial
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
    // Request full screen mode on web
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        // Ignore errors if fullscreen is not available
      });
    }
    
    // Hide address bar on mobile browsers
    if (this.platform.is('mobile')) {
      window.scrollTo(0, 1);
    }
  }

  async requestPermissions() {
    // Only request permissions on native platforms (Android/iOS)
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // For Android, permissions are typically requested when needed
      // The file picker will request permissions automatically
      // But we can check and request them proactively for better UX
      
      if (this.platform.is('android')) {
        // Android permissions are handled by the system when accessing files
        // The file input will trigger permission requests automatically
        console.log('📱 Android platform detected - permissions will be requested when selecting files');
      }
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
    }
  }

  setupBackButtonHandler() {
    // Listen for back button press
    this.backButtonListener = App.addListener('backButton', async () => {
      // Check if menu is open, close it first
      const isMenuOpen = await this.menuController.isOpen('main-menu');
      if (isMenuOpen) {
        await this.menuController.close('main-menu');
        return;
      }

      // Show confirmation dialog before closing app
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

  ngOnDestroy() {
    // Remove back button listener when component is destroyed
    if (this.backButtonListener) {
      this.backButtonListener.remove();
    }
  }

  async selectVideo() {
    // Close menu if open
    await this.menuController.close('main-menu');
    
    // Directly open file picker
    this.pickVideoFromGallery();
  }

  pickVideoFromGallery() {
    console.log('📁 pickVideoFromGallery called');
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        console.log('✅ File selected:', file.name, file.type, file.size);
        // Clean up previous video URL if exists
        if (this.videoUrl) {
          URL.revokeObjectURL(this.videoUrl);
        }
        this.videoUrl = URL.createObjectURL(file);
        console.log('🔗 Video URL created:', this.videoUrl);
        
        // Remove input element
        document.body.removeChild(input);
        
        // Ask if user wants fog of war AFTER video is selected
        const alert = await this.alertController.create({
          header: this.translation.t('alert.addFog'),
          message: this.translation.t('alert.addFogMessage'),
          cssClass: 'custom-alert',
          buttons: [
            {
              text: this.translation.t('alert.noFog'),
              cssClass: 'alert-button-secondary',
              handler: () => {
                this.hasFog = false;
                this.loadVideo();
              }
            },
            {
              text: this.translation.t('alert.addFogButton'),
              cssClass: 'alert-button-primary',
              handler: () => {
                this.hasFog = true;
                this.loadVideo();
              }
            }
          ]
        });
        
        await alert.present();
      } else {
        console.log('⚠️ No file selected');
        document.body.removeChild(input);
      }
    };
    
    input.oncancel = () => {
      console.log('⚠️ File picker cancelled');
      document.body.removeChild(input);
    };
    
    // Trigger file picker
    input.click();
  }

  loadVideo() {
    // Wait for view to update, then set video source
    setTimeout(() => {
      console.log('⏱️ Setting video source after timeout');
      if (this.videoElement?.nativeElement) {
        this.video = this.videoElement.nativeElement;
        console.log('🎥 Video element found:', this.video);
        this.video.src = this.videoUrl!;
        this.video.load();
        console.log('📥 Video load() called, readyState:', this.video.readyState);
        
        // Setup canvas when video metadata is loaded
        this.video.addEventListener('loadedmetadata', () => {
          console.log('📊 Video metadata loaded:', {
            videoWidth: this.video?.videoWidth,
            videoHeight: this.video?.videoHeight,
            readyState: this.video?.readyState,
            duration: this.video?.duration
          });
          if (this.canvasElement?.nativeElement && !this.ctx) {
            this.canvas = this.canvasElement.nativeElement;
            this.ctx = this.canvas.getContext('2d');
            console.log('🎨 Canvas element found and context created');
          }
          this.setupCanvas();
        }, { once: true });
        
        // Add more event listeners for debugging
        this.video.addEventListener('loadstart', () => console.log('🔄 Video loadstart'));
        this.video.addEventListener('loadeddata', () => console.log('📦 Video loadeddata'));
        this.video.addEventListener('canplay', () => console.log('▶️ Video canplay'));
        this.video.addEventListener('playing', () => console.log('🎬 Video playing'));
        this.video.addEventListener('error', (e) => console.error('❌ Video error:', e));
      } else {
        console.error('❌ Video element not found!');
      }
    }, 100);
  }

  setupCanvas() {
    console.log('🎨 setupCanvas called');
    if (!this.canvas || !this.video || !this.ctx) {
      console.error('❌ Setup canvas failed:', { 
        canvas: !!this.canvas, 
        video: !!this.video, 
        ctx: !!this.ctx,
        canvasElement: this.canvasElement?.nativeElement,
        videoElement: this.videoElement?.nativeElement
      });
      return;
    }
    
    console.log('✅ All elements available, video readyState:', this.video.readyState);
    
    // Wait for video to be ready
    if (this.video.readyState < 2) {
      console.log('⏳ Video not ready yet, waiting for loadeddata...');
      this.video.addEventListener('loadeddata', () => {
        console.log('✅ Video loadeddata received, calling setupCanvas again');
        this.setupCanvas();
      }, { once: true });
      return;
    }
    
    // Get container dimensions
    const container = this.canvas.parentElement;
    if (!container) {
      console.error('❌ No container found');
      return;
    }
    
    console.log('📦 Container found:', {
      tagName: container.tagName,
      className: container.className,
      clientWidth: container.clientWidth,
      clientHeight: container.clientHeight
    });
    
    // Wait a bit for container to have dimensions
    setTimeout(() => {
      // Re-check that canvas and video are still available
      if (!this.canvas || !this.video || !this.ctx) {
        console.log('Canvas or video no longer available');
        return;
      }
      
      // Get actual container dimensions - use multiple methods to ensure we get correct size
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width || container.clientWidth || window.innerWidth;
      const containerHeight = containerRect.height || container.clientHeight || window.innerHeight;
      
      console.log('📐 Container dimensions:', {
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight,
        rectWidth: containerRect.width,
        rectHeight: containerRect.height,
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      });
      
      if (containerWidth === 0 || containerHeight === 0 || !isFinite(containerWidth) || !isFinite(containerHeight)) {
        console.log('Container has invalid dimensions, retrying...');
        setTimeout(() => this.setupCanvas(), 200);
        return;
      }
      
      // Apply scale factor to container height (e.g., 80% = 0.8)
      const scaledContainerHeight = containerHeight * this.videoScale;
      const scaledContainerWidth = containerWidth;
      
      // Get video dimensions and aspect ratio
      const videoWidth = this.video.videoWidth;
      const videoHeight = this.video.videoHeight;
      const videoAspect = videoWidth / videoHeight;
      const containerAspect = scaledContainerWidth / scaledContainerHeight;
      
      // Determine which side of the video is longer
      const videoIsWider = videoWidth > videoHeight;
      
      // Calculate display size: fit the longer side to scaled container and scale proportionally
      let displayWidth, displayHeight;
      
      if (videoIsWider) {
        // Video is wider (landscape) - fit width to container, scale height
        displayWidth = Math.min(scaledContainerWidth, scaledContainerHeight * videoAspect);
        displayHeight = displayWidth / videoAspect;
      } else {
        // Video is taller (portrait) or square - fit height to scaled container, scale width
        displayHeight = Math.min(scaledContainerHeight, scaledContainerWidth / videoAspect);
        displayWidth = displayHeight * videoAspect;
      }
      
      // Ensure we don't exceed scaled container bounds
      if (displayWidth > scaledContainerWidth) {
        displayWidth = scaledContainerWidth;
        displayHeight = scaledContainerWidth / videoAspect;
      }
      if (displayHeight > scaledContainerHeight) {
        displayHeight = scaledContainerHeight;
        displayWidth = scaledContainerHeight * videoAspect;
      }
      
      console.log('📐 Calculated sizes:', {
        displayWidth,
        displayHeight,
        videoAspect: videoAspect.toFixed(2),
        containerAspect: containerAspect.toFixed(2),
        videoSize: `${this.video.videoWidth}x${this.video.videoHeight}`
      });
      
      // Set canvas display size using explicit pixel values
      this.canvas.style.width = displayWidth + 'px';
      this.canvas.style.height = displayHeight + 'px';
      this.canvas.style.maxWidth = '100%';
      this.canvas.style.maxHeight = '100%';
      this.canvas.style.objectFit = 'contain';
      this.canvas.style.display = 'block';
      
      // Set canvas internal resolution (use DPR for sharpness)
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = displayWidth * dpr;
      this.canvas.height = displayHeight * dpr;
      
      // Reset transform and scale the context to match DPR
      this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
      this.ctx.scale(dpr, dpr);
      
      // Update fog canvas size to match
      if (this.fogCanvas) {
        this.fogCanvas.width = this.canvas.width;
        this.fogCanvas.height = this.canvas.height;
        if (this.fogCtx) {
          this.fogCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
          this.fogCtx.scale(dpr, dpr);
        }
      }
      
      // Create a separate canvas for the fog mask at display resolution
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = displayWidth;
      maskCanvas.height = displayHeight;
      const maskCtx = maskCanvas.getContext('2d');
      
      if (!maskCtx) {
        console.log('Failed to get mask context');
        return;
      }
      
      // Initialize fog mask based on hasFog setting
      if (this.hasFog) {
        // Fully opaque black - completely hides video
        maskCtx.fillStyle = 'rgba(0, 0, 0, 1.0)';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      } else {
        // Fully transparent - shows all video
        maskCtx.fillStyle = 'rgba(0, 0, 0, 0.0)';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      }
      
      // Verify mask was created correctly
      const testMaskPixel = maskCtx.getImageData(100, 100, 1, 1);
      console.log('🧪 Fog mask pixel sample:', {
        r: testMaskPixel.data[0],
        g: testMaskPixel.data[1],
        b: testMaskPixel.data[2],
        a: testMaskPixel.data[3],
        expected: 'rgba(0, 0, 0, 255)' // Fully opaque
      });
      
      // Store the initial mask
      this.fogMask = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
      // Clear history when setting up new video
      this.fogHistory = [];
      
      // Create cached fog canvas at canvas resolution
      this.fogCanvas = document.createElement('canvas');
      this.fogCanvas.width = this.canvas.width;
      this.fogCanvas.height = this.canvas.height;
      this.fogCtx = this.fogCanvas.getContext('2d');
      
      // Scale fog context to match main canvas
      if (this.fogCtx) {
        this.fogCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        this.fogCtx.scale(dpr, dpr);
        // Draw the mask scaled to display size
        this.fogCtx.putImageData(this.fogMask, 0, 0);
      }
      
      const computedStyle = window.getComputedStyle(this.canvas);
      console.log('✅ Canvas setup complete:', {
        canvasSize: `${this.canvas.width}x${this.canvas.height}`,
        displaySize: `${displayWidth}x${displayHeight}`,
        videoSize: `${this.video.videoWidth}x${this.video.videoHeight}`,
        canvasStyle: {
          width: this.canvas.style.width,
          height: this.canvas.style.height,
          display: computedStyle.display,
          visibility: computedStyle.visibility,
          opacity: computedStyle.opacity,
          position: computedStyle.position,
          zIndex: computedStyle.zIndex
        },
        canvasBoundingRect: {
          width: this.canvas.getBoundingClientRect().width,
          height: this.canvas.getBoundingClientRect().height,
          top: this.canvas.getBoundingClientRect().top,
          left: this.canvas.getBoundingClientRect().left
        },
        fogMaskCreated: !!this.fogMask,
        fogMaskSize: this.fogMask ? `${this.fogMask.width}x${this.fogMask.height}` : 'none',
        fogMaskSample: this.fogMask ? {
          firstPixel: `rgba(${this.fogMask.data[0]}, ${this.fogMask.data[1]}, ${this.fogMask.data[2]}, ${this.fogMask.data[3]})`,
          middlePixel: {
            index: Math.floor(this.fogMask.data.length / 2),
            rgba: `rgba(${this.fogMask.data[Math.floor(this.fogMask.data.length / 2)]}, ${this.fogMask.data[Math.floor(this.fogMask.data.length / 2) + 1]}, ${this.fogMask.data[Math.floor(this.fogMask.data.length / 2) + 2]}, ${this.fogMask.data[Math.floor(this.fogMask.data.length / 2) + 3]})`
          }
        } : null
      });
      
      // Ensure video is playing
      console.log('▶️ Attempting to play video...');
      this.video.play()
        .then(() => console.log('✅ Video play() succeeded'))
        .catch(err => console.error('❌ Video play error:', err));
      
      // Start drawing loop
      console.log('🔄 Starting drawFog loop...');
      this.drawFog();
    }, 100);
  }

  private drawCount = 0;
  
  drawFog() {
    if (!this.canvas || !this.video || !this.ctx || !this.fogMask) {
      if (this.drawCount === 0) {
        console.error('❌ drawFog: Missing elements', {
          canvas: !!this.canvas,
          video: !!this.video,
          ctx: !!this.ctx,
          fogMask: !!this.fogMask
        });
      }
      return;
    }
    
    // Log first few draws
    if (this.drawCount < 5) {
      console.log(`🖼️ drawFog #${this.drawCount}:`, {
        videoReadyState: this.video.readyState,
        videoPaused: this.video.paused,
        videoCurrentTime: this.video.currentTime,
        canvasVisible: this.canvas.offsetWidth > 0 && this.canvas.offsetHeight > 0,
        canvasDisplaySize: `${this.canvas.offsetWidth}x${this.canvas.offsetHeight}`,
        canvasInternalSize: `${this.canvas.width}x${this.canvas.height}`
      });
    }
    
    // Check if video is ready
    if (this.video.readyState >= 2) {
      // Clear canvas with white background first to test visibility
      if (this.drawCount === 0) {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('🧪 Test: White background drawn - can you see white?');
      }
      
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Draw video frame scaled to canvas
      try {
        const videoWidth = this.video.videoWidth;
        const videoHeight = this.video.videoHeight;
        
        if (this.drawCount === 0) {
          console.log('🎥 Drawing video:', {
            videoSize: `${videoWidth}x${videoHeight}`,
            canvasSize: `${this.canvas.width}x${this.canvas.height}`,
            videoCurrentTime: this.video.currentTime,
            videoPaused: this.video.paused,
            videoEnded: this.video.ended
          });
        }
        
      // Draw video - use canvas display size (accounting for DPR scaling)
      // The context was scaled by DPR, so we need to draw at the display size
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = this.canvas.width / dpr;
      const displayHeight = this.canvas.height / dpr;
      
      // Clear and draw video frame
      this.ctx.drawImage(this.video, 0, 0, displayWidth, displayHeight);
        
        if (this.drawCount === 0) {
          console.log('✅ Video frame drawn to canvas');
          // Test: Get pixel data to verify video was drawn
          const testPixel = this.ctx.getImageData(10, 10, 1, 1);
          console.log('🧪 Pixel at (10,10) after video draw:', {
            r: testPixel.data[0],
            g: testPixel.data[1],
            b: testPixel.data[2],
            a: testPixel.data[3]
          });
        }
      } catch (e) {
        if (this.drawCount === 0) {
          console.error('❌ Error drawing video:', e);
        }
      }
      
      // Draw fog mask on top - use cached fog canvas
      if (this.fogMask && this.fogCanvas && this.fogCtx) {
        // Update fog canvas only if mask changed
        if (this.fogMaskDirty) {
          this.fogCtx.putImageData(this.fogMask, 0, 0);
          this.fogMaskDirty = false;
        }
        
        // Draw the fog canvas on top of the video
        // Transparent areas (alpha=0) will show the video underneath
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.drawImage(this.fogCanvas, 0, 0);
        
        if (this.drawCount === 0) {
          console.log('✅ Fog mask applied to canvas');
        }
      }
    } else {
      if (this.drawCount === 0) {
        console.warn('⚠️ Video not ready, readyState:', this.video.readyState);
        // Draw a test pattern even if video isn't ready
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('🧪 Test: Blue background drawn (video not ready) - can you see blue?');
      }
    }
    
    this.drawCount++;
    requestAnimationFrame(() => this.drawFog());
  }

  onContainerTouch(event: TouchEvent) {
    // Detect two-finger tap to open menu
    if (event.touches && event.touches.length === 2) {
      this.activeTouches = 2;
      this.isTwoFingerGesture = true;
      this.twoFingerStartTime = Date.now();
      this.touchStartTime = Date.now();
      console.log('👆 Container: Two fingers detected');
    } else {
      this.activeTouches = event.touches ? event.touches.length : 0;
      if (this.activeTouches < 2) {
        this.isTwoFingerGesture = false;
      }
    }
  }

  onContainerTouchEnd(event: TouchEvent) {
    // Check for two-finger tap on container
    const remainingTouches = event.touches ? event.touches.length : 0;
    
    if (this.isTwoFingerGesture && remainingTouches === 0) {
      const touchDuration = Date.now() - this.twoFingerStartTime;
      
      console.log('👆 Container: Two finger gesture ended:', {
        duration: touchDuration,
        remainingTouches
      });
      
      // If it was a quick tap (less than 500ms), open menu
      if (touchDuration < 500) {
        event.preventDefault();
        event.stopPropagation();
        console.log('✅ Opening menu via two-finger tap (container)');
        this.openMenu();
        this.isTwoFingerGesture = false;
        this.activeTouches = 0;
        return;
      }
    }
    
    // Reset if all fingers lifted
    if (remainingTouches === 0) {
      this.activeTouches = 0;
      this.isTwoFingerGesture = false;
    }
  }

  onCanvasTouch(event: TouchEvent) {
    // Check for two-finger tap first
    if (event.touches && event.touches.length === 2) {
      // Two fingers - don't draw, just track for menu gesture
      this.activeTouches = 2;
      this.isTwoFingerGesture = true;
      this.twoFingerStartTime = Date.now();
      this.touchStartTime = Date.now();
      console.log('👆 Two fingers detected');
      // Don't prevent default - let the gesture complete
      return; // Don't draw with two fingers
    }
    
    // If we had two fingers but now only one, reset
    if (this.isTwoFingerGesture && event.touches && event.touches.length === 1) {
      this.isTwoFingerGesture = false;
      this.activeTouches = 1;
    }
    
    // Single finger - normal drawing
    if (event.touches && event.touches.length === 1) {
      this.isTwoFingerGesture = false;
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!event.touches || event.touches.length === 0) return;
    
    const touch = event.touches[0];
    const rect = this.canvas?.getBoundingClientRect();
    if (!rect || !this.ctx || !this.fogMask || !this.canvas) {
      console.log('❌ Touch: Missing elements', {
        rect: !!rect,
        ctx: !!this.ctx,
        fogMask: !!this.fogMask,
        canvas: !!this.canvas
      });
      return;
    }
    
    // Save history when starting a new stroke
    if (!this.isDrawing && this.fogMask) {
      const historyMask = new ImageData(this.fogMask.width, this.fogMask.height);
      historyMask.data.set(this.fogMask.data);
      this.fogHistory.push(historyMask);
      if (this.fogHistory.length > 50) {
        this.fogHistory.shift();
      }
    }
    
    this.isDrawing = true;
    this.activeTouches = 1;
    
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    console.log('👆 Touch event:', { x, y, clientX: touch.clientX, clientY: touch.clientY, rect });
    
    this.removeFog(x, y);
  }

  onCanvasTouchMove(event: TouchEvent) {
    // If two fingers, don't draw - just track
    if (event.touches && event.touches.length === 2) {
      this.activeTouches = 2;
      this.isTwoFingerGesture = true;
      return; // Don't draw with two fingers
    }
    
    // If we had two fingers but now only one, reset
    if (this.isTwoFingerGesture && event.touches && event.touches.length === 1) {
      this.isTwoFingerGesture = false;
      this.activeTouches = 1;
    }
    
    // Single finger - continue drawing
    if (this.isDrawing && event.touches && event.touches.length === 1 && !this.isTwoFingerGesture) {
      event.preventDefault();
      event.stopPropagation();
      
      const touch = event.touches[0];
      const rect = this.canvas?.getBoundingClientRect();
      if (!rect || !this.ctx || !this.fogMask || !this.canvas) return;
      
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      this.removeFog(x, y);
    }
  }

  onCanvasTouchEnd(event: TouchEvent) {
    // Check for two-finger tap gesture
    // When both fingers are lifted, event.touches.length will be 0 or 1
    // and changedTouches will have the touches that ended
    const remainingTouches = event.touches ? event.touches.length : 0;
    const endedTouches = event.changedTouches ? event.changedTouches.length : 0;
    
    // If we had two fingers and now they're all lifted (or only 1 remaining)
    if (this.isTwoFingerGesture && (remainingTouches === 0 || (remainingTouches <= 1 && endedTouches >= 1))) {
      const touchDuration = Date.now() - this.twoFingerStartTime;
      
      console.log('👆 Two finger gesture ended:', {
        duration: touchDuration,
        remainingTouches,
        endedTouches,
        isTwoFinger: this.isTwoFingerGesture
      });
      
      // If it was a quick tap (less than 500ms), open menu
      if (touchDuration < 500) {
        event.preventDefault();
        event.stopPropagation();
        console.log('✅ Opening menu via two-finger tap');
        this.openMenu();
        this.isTwoFingerGesture = false;
        this.activeTouches = 0;
        this.isDrawing = false;
        return;
      }
    }
    
    // Single finger - normal behavior
    if (!this.isTwoFingerGesture && this.activeTouches === 1) {
      event.preventDefault();
      event.stopPropagation();
      this.isDrawing = false;
    }
    
    // Reset touch tracking if all fingers are lifted
    if (remainingTouches === 0) {
      this.activeTouches = 0;
      this.isTwoFingerGesture = false;
    }
  }

  onCanvasMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = this.canvas?.getBoundingClientRect();
    if (!rect) {
      console.error('❌ MouseDown: No rect');
      return;
    }
    
    // Save history when starting a new stroke
    if (!this.isDrawing && this.fogMask) {
      const historyMask = new ImageData(this.fogMask.width, this.fogMask.height);
      historyMask.data.set(this.fogMask.data);
      this.fogHistory.push(historyMask);
      if (this.fogHistory.length > 50) {
        this.fogHistory.shift();
      }
    }
    
    this.isDrawing = true;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    console.log('🖱️ MouseDown event:', { x, y, clientX: event.clientX, clientY: event.clientY });
    this.removeFog(x, y);
  }

  onCanvasMouseMove(event: MouseEvent) {
    if (!this.isDrawing) return;
    
    const rect = this.canvas?.getBoundingClientRect();
    if (!rect) return;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.removeFog(x, y);
  }

  onCanvasMouseUp() {
    this.isDrawing = false;
  }

  removeFog(x: number, y: number) {
    console.log('👆 removeFog called at:', { x, y });
    if (!this.ctx || !this.fogMask || !this.canvas) {
      console.error('❌ removeFog: Missing elements', {
        ctx: !!this.ctx,
        fogMask: !!this.fogMask,
        canvas: !!this.canvas
      });
      return;
    }
    
    // Scale coordinates to canvas size (accounting for DPR)
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.error('❌ Canvas has zero dimensions');
      return;
    }
    
    const dpr = window.devicePixelRatio || 1;
    // Canvas internal size is display size * DPR, so we need to scale by DPR
    const scaleX = (this.canvas.width / dpr) / rect.width;
    const scaleY = (this.canvas.height / dpr) / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    console.log('🎯 Scaled coordinates:', {
      screen: { x, y },
      canvas: { x: canvasX, y: canvasY },
      scale: { x: scaleX, y: scaleY },
      rect: { width: rect.width, height: rect.height },
      canvasSize: { width: this.canvas.width, height: this.canvas.height },
      brushSize: this.brushSize
    });
    
    // Create a new ImageData for the updated mask (copy current mask)
    const updatedMask = new ImageData(this.fogMask.width, this.fogMask.height);
    updatedMask.data.set(this.fogMask.data);
    
    // Apply brush to mask by making pixels transparent
    // Use display size for mask coordinates (mask is at display resolution)
    const displayWidth = this.canvas.width / dpr;
    const displayHeight = this.canvas.height / dpr;
    
    // Scale coordinates to mask size (mask is at display resolution, not DPR-scaled)
    const maskX = canvasX;
    const maskY = canvasY;
    const radius = this.brushSize;
    const radiusSquared = radius * radius;
    
    // Calculate bounds for the brush area (using mask dimensions)
    const minX = Math.max(0, Math.floor(maskX - radius));
    const maxX = Math.min(this.fogMask.width, Math.ceil(maskX + radius));
    const minY = Math.max(0, Math.floor(maskY - radius));
    const maxY = Math.min(this.fogMask.height, Math.ceil(maskY + radius));
    
    let pixelsRemoved = 0;
    for (let py = minY; py < maxY; py++) {
      for (let px = minX; px < maxX; px++) {
        const dx = px - maskX;
        const dy = py - maskY;
        const distSquared = dx * dx + dy * dy;
        
        if (distSquared <= radiusSquared) {
          // Use mask dimensions (display size), not canvas dimensions
          const index = (py * this.fogMask.width + px) * 4;
          updatedMask.data[index + 3] = 0; // Set alpha to 0 (transparent)
          pixelsRemoved++;
        }
      }
    }
    
    // Update fog mask
    this.fogMask = updatedMask;
    this.fogMaskDirty = true; // Mark as dirty so it gets updated in next frame
    
    console.log('✅ Fog mask updated:', {
      pixelsRemoved: pixelsRemoved,
      radius: radius,
      center: { x: canvasX, y: canvasY }
    });
  }

  changeBrushSize(event: any) {
    const value = event.detail.value;
    this.brushSizeStr = value;
    this.brushSize = parseInt(value, 10);
    // Close menu after selecting brush size
    this.closeMenu();
  }

  resetFog() {
    if (!this.canvas || !this.fogMask) return;
    
    // Save current state to history
    const historyMask = new ImageData(this.fogMask.width, this.fogMask.height);
    historyMask.data.set(this.fogMask.data);
    this.fogHistory.push(historyMask);
    if (this.fogHistory.length > 50) {
      this.fogHistory.shift();
    }
    
    // Create a new mask canvas
    const maskCanvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    maskCanvas.width = this.canvas.width / dpr;
    maskCanvas.height = this.canvas.height / dpr;
    const maskCtx = maskCanvas.getContext('2d');
    
    if (!maskCtx) return;
    
    maskCtx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    this.fogMask = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    this.fogMaskDirty = true; // Mark as dirty
    
    console.log('🔄 Fog reset');
  }

  removeAllFog() {
    if (!this.canvas || !this.fogMask) return;
    
    // Save current state to history
    const historyMask = new ImageData(this.fogMask.width, this.fogMask.height);
    historyMask.data.set(this.fogMask.data);
    this.fogHistory.push(historyMask);
    if (this.fogHistory.length > 50) {
      this.fogHistory.shift();
    }
    
    // Create a new mask canvas with fully transparent mask
    const maskCanvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    maskCanvas.width = this.fogMask.width;
    maskCanvas.height = this.fogMask.height;
    const maskCtx = maskCanvas.getContext('2d');
    
    if (!maskCtx) return;
    
    maskCtx.fillStyle = 'rgba(0, 0, 0, 0.0)';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    this.fogMask = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    this.fogMaskDirty = true; // Mark as dirty
    
    // Update fog canvas
    if (this.fogCtx) {
      this.fogCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
      this.fogCtx.scale(dpr, dpr);
      this.fogCtx.putImageData(this.fogMask, 0, 0);
    }
    
    console.log('👁️ All fog removed');
  }

  undo() {
    if (this.fogHistory.length === 0 || !this.fogMask) {
      console.log('⚠️ No history to undo');
      return;
    }
    
    // Restore previous state
    const previousMask = this.fogHistory.pop()!;
    this.fogMask = previousMask;
    this.fogMaskDirty = true; // Mark as dirty
    
    // Update fog canvas
    if (this.fogCtx) {
      const dpr = window.devicePixelRatio || 1;
      this.fogCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
      this.fogCtx.scale(dpr, dpr);
      this.fogCtx.putImageData(this.fogMask, 0, 0);
    }
    
    console.log('↩️ Undo - history remaining:', this.fogHistory.length);
  }
}

