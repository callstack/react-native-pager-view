package com.reactnativepagerview;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.viewmanagers.PagerViewViewManagerDelegate;
import com.facebook.react.viewmanagers.PagerViewViewManagerInterface;

import androidx.annotation.Nullable;

@ReactModule(name = PagerViewViewManagerImpl.NAME)
public class PagerViewViewManager extends SimpleViewManager<PagerViewView> implements PagerViewViewManagerInterface<PagerViewView> {
  private final ViewManagerDelegate<PagerViewView> mDelegate;

  public PagerViewViewManager(ReactApplicationContext context) {
    mDelegate = new PagerViewViewManagerDelegate(this);
  }

  @Nullable
  @Override
  protected ViewManagerDelegate<PagerViewView> getDelegate() {
    return mDelegate;
  }

  @Override
  public String getName() {
    return PagerViewViewManagerImpl.NAME;
  }

  @Override
  public PagerViewView createViewInstance(ThemedReactContext context) {
    return PagerViewViewManagerImpl.createViewInstance(context);
  }

  @ReactProp(name = "color")
  public void setColor(PagerViewView view, String color) {
    PagerViewViewManagerImpl.setColor(view, color);
  }

  @Override
  public void changeBackgroundColor(PagerViewView view, String color) {
    PagerViewViewManagerImpl.setColor(view, color);
  }

  @Override
  public void receiveCommand(PagerViewView root, String commandId, ReadableArray args) {
    mDelegate.receiveCommand(root, commandId, args);
  }
}
