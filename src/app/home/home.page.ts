import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActionSheetController, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements AfterViewInit {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;
  
  videoUrl: string | null = null;
  brushSize: number = 50;
  brushSizeStr: string = '50';
  isDrawing: boolean = false;
  fogMask: ImageData | null = null;
  contentId: string = 'main-content';
  
  private ctx: CanvasRenderingContext2D | null = null;
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private fogCanvas: HTMLCanvasElement | null = null;
  private fogCtx: CanvasRenderingContext2D | null = null;
  private fogMaskDirty: boolean = false;

  constructor(
    private actionSheetController: ActionSheetController,
    private menuController: MenuController
  ) {}
  
  closeMenu() {
    this.menuController.close('main-menu');
  }
  
  async openMenu() {
    await this.menuController.open('main-menu');
  }

  ngAfterViewInit() {
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
    
    input.onchange = (event: any) => {
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
      
      // Get video dimensions and aspect ratio
      const videoWidth = this.video.videoWidth;
      const videoHeight = this.video.videoHeight;
      const videoAspect = videoWidth / videoHeight;
      const containerAspect = containerWidth / containerHeight;
      
      // Determine which side of the video is longer
      const videoIsWider = videoWidth > videoHeight;
      
      // Calculate display size: fit the longer side to container and scale proportionally
      let displayWidth, displayHeight;
      
      if (videoIsWider) {
        // Video is wider (landscape) - fit width to container, scale height
        displayWidth = Math.min(containerWidth, containerHeight * videoAspect);
        displayHeight = displayWidth / videoAspect;
      } else {
        // Video is taller (portrait) or square - fit height to container, scale width
        displayHeight = Math.min(containerHeight, containerWidth / videoAspect);
        displayWidth = displayHeight * videoAspect;
      }
      
      // Ensure we don't exceed container bounds
      if (displayWidth > containerWidth) {
        displayWidth = containerWidth;
        displayHeight = containerWidth / videoAspect;
      }
      if (displayHeight > containerHeight) {
        displayHeight = containerHeight;
        displayWidth = containerHeight * videoAspect;
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
      
      // Initialize fog mask (fully opaque black - completely hides video)
      maskCtx.fillStyle = 'rgba(0, 0, 0, 1.0)';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      
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
      
      // Create cached fog canvas at canvas resolution
      this.fogCanvas = document.createElement('canvas');
      this.fogCanvas.width = this.canvas.width;
      this.fogCanvas.height = this.canvas.height;
      this.fogCtx = this.fogCanvas.getContext('2d');
      
      // Scale fog context to match main canvas
      if (this.fogCtx) {
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
        
        // Draw video - scale to canvas display size (context is already scaled by DPR)
        const drawWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const drawHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        this.ctx.drawImage(this.video, 0, 0, drawWidth, drawHeight);
        
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

  onCanvasTouch(event: TouchEvent) {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = this.canvas?.getBoundingClientRect();
    if (!rect || !this.ctx || !this.fogMask) return;
    
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    this.removeFog(x, y);
  }

  onCanvasMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDrawing = true;
    const rect = this.canvas?.getBoundingClientRect();
    if (!rect) {
      console.error('❌ MouseDown: No rect');
      return;
    }
    
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
    
    // Scale coordinates to canvas size
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.error('❌ Canvas has zero dimensions');
      return;
    }
    
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
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
    const radius = this.brushSize * scaleX;
    const radiusSquared = radius * radius;
    
    // Calculate bounds for the brush area
    const minX = Math.max(0, Math.floor(canvasX - radius));
    const maxX = Math.min(this.canvas.width, Math.ceil(canvasX + radius));
    const minY = Math.max(0, Math.floor(canvasY - radius));
    const maxY = Math.min(this.canvas.height, Math.ceil(canvasY + radius));
    
    let pixelsRemoved = 0;
    for (let py = minY; py < maxY; py++) {
      for (let px = minX; px < maxX; px++) {
        const dx = px - canvasX;
        const dy = py - canvasY;
        const distSquared = dx * dx + dy * dy;
        
        if (distSquared <= radiusSquared) {
          const index = (py * this.canvas.width + px) * 4;
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
  }

  resetFog() {
    if (!this.canvas) return;
    
    // Create a new mask canvas
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = this.canvas.width;
    maskCanvas.height = this.canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    
    if (!maskCtx) return;
    
    maskCtx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    this.fogMask = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    this.fogMaskDirty = true; // Mark as dirty
    
    console.log('🔄 Fog reset');
  }
}

