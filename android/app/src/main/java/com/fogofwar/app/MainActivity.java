package com.fogofwar.app;

import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(VideoQueuePickerPlugin.class);
        super.onCreate(savedInstanceState);
        
        // Enable full screen immersive mode
        enableFullScreen();
        
        // Configure WebView for better video rendering and touch handling
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.getSettings().setDomStorageEnabled(true);
            webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
            // Hardware acceleration is enabled by default in modern Android
            // Use hardware layer for better performance
            webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
            
            // Keep full screen when WebView gains focus
            webView.setOnSystemUiVisibilityChangeListener(new View.OnSystemUiVisibilityChangeListener() {
                @Override
                public void onSystemUiVisibilityChange(int visibility) {
                    enableFullScreen();
                }
            });
        }
    }
    
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            enableFullScreen();
        }
    }
    
    private void enableFullScreen() {
        // Hide status bar and navigation bar
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat windowInsetsController = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        
        if (windowInsetsController != null) {
            // Hide system bars
            windowInsetsController.hide(androidx.core.view.WindowInsetsCompat.Type.systemBars());
            // Make them stay hidden
            windowInsetsController.setSystemBarsBehavior(
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            );
        }
        
        // Legacy full screen flags for older Android versions
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        );
        
        // Keep screen on
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }
}
