package com.reactnativepagerview;

import com.facebook.react.uimanager.ThemedReactContext;
import android.graphics.Color;

public class PagerViewViewManagerImpl {

  public static final String NAME = "PagerViewView";

  public static PagerViewView createViewInstance(ThemedReactContext context) {
    return new PagerViewView(context);
  }

  public static void setColor(PagerViewView view, String color) {
    view.setBackgroundColor(Color.parseColor(color));
  }
}
