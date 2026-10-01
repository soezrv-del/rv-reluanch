package com.markclass.rvfax;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

/**
 * Android shell tweaks (native only; web code untouched).
 *
 * 1. Status bar: targetSdk 35+ forces edge-to-edge, so the WebView would draw
 *    under the clock / battery icons. Pad the WebView by the system-bar insets,
 *    paint the area behind the bars with the light theme background (white),
 *    and use dark status / nav bar icons.
 * 2. Back button: go back a screen in the WebView when it has history;
 *    otherwise minimize the app (moveTaskToBack) instead of closing it.
 */
public class MainActivity extends BridgeActivity {

    private static final int LIGHT_BG = Color.WHITE;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupSystemBars();
        setupBackButton();
    }

    private void setupSystemBars() {
        getWindow().getDecorView().setBackgroundColor(LIGHT_BG);
        WindowInsetsControllerCompat controller =
                WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.setAppearanceLightStatusBars(true);
        controller.setAppearanceLightNavigationBars(true);

        if (getBridge() == null || getBridge().getWebView() == null) return;
        View container = (View) getBridge().getWebView().getParent();
        if (container == null) return;
        container.setBackgroundColor(LIGHT_BG);
        ViewCompat.setOnApplyWindowInsetsListener(container, (v, insets) -> {
            Insets bars = insets.getInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
        ViewCompat.requestApplyInsets(container);
    }

    private void setupBackButton() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    moveTaskToBack(true);
                }
            }
        });
    }
}
