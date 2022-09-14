package com.reactnativepagerview;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.bridge.ReactApplicationContext;

import java.util.Map;
import com.facebook.react.uimanager.ViewGroupManager;

public class PagerViewViewManager extends ViewGroupManager<PagerViewView> {

  ReactApplicationContext mCallerContext;

  public PagerViewViewManager(ReactApplicationContext reactContext) {
    mCallerContext = reactContext;
  }

  @Override
  public String getName() {
    return PagerViewViewManagerImpl.NAME;
  }

  @Override
  public PagerViewView createViewInstance(ThemedReactContext context) {
    return PagerViewViewManagerImpl.createViewInstance(context);
  }

  @Override
  public Map<String, Integer> getCommandsMap() {
    return MapBuilder.of("changeBackgroundColor", 1);
  }

  @Override
  public void receiveCommand(
    @NonNull PagerViewView view,
    String commandId,
    @Nullable ReadableArray args
  ) {
    super.receiveCommand(view, commandId, args);
    String color = args.getString(0);

    switch (commandId) {
      case "changeBackgroundColor":
        setColor(view, color);
        break;
      default: {}
    }
  }


  @ReactProp(name = "color")
  public void setColor(PagerViewView view, String color) {
    PagerViewViewManagerImpl.setColor(view, color);
  }
}
