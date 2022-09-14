package com.reactnativepagerview;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.viewmanagers.PagerViewViewManagerDelegate;
import com.facebook.react.viewmanagers.PagerViewViewManagerInterface;

import androidx.annotation.Nullable;

@ReactModule(name = PagerViewViewManagerImpl.NAME)
public class PagerViewViewManager extends ViewGroupManager<PagerViewView> implements PagerViewViewManagerInterface<PagerViewView> {
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

  @Override
  public void receiveCommand(PagerViewView root, String commandId, ReadableArray args) {
    mDelegate.receiveCommand(root, commandId, args);
  }

  @Override
  public void setLayoutDirection(PagerViewView view, @Nullable String value) {

  }

  @Override
  public void setInitialPage(PagerViewView view, int value) {

  }

  @Override
  public void setOrientation(PagerViewView view, @Nullable String value) {

  }

  @Override
  public void setOffscreenPageLimit(PagerViewView view, int value) {

  }

  @Override
  public void setPageMargin(PagerViewView view, int value) {

  }

  @Override
  public void setOverScrollMode(PagerViewView view, @Nullable String value) {

  }

  @Override
  public void setPage(PagerViewView view, int selectedPage) {

  }

  @Override
  public void setPageWithoutAnimation(PagerViewView view, int selectedPage) {

  }

  @Override
  public void setScrollEnabledImperatively(PagerViewView view, boolean scrollEnabled) {

  }

  @Override
  public void setScrollEnabled(PagerViewView view, boolean scrollEnabled) {

  }
}
