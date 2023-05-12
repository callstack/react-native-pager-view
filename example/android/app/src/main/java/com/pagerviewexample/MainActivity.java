package com.pagerviewexample;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;


import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import android.annotation.SuppressLint;
import android.os.Bundle;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import com.facebook.react.ReactFragment;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;


public class MainActivity extends AppCompatActivity {


  private ReactFragment oldArchitectureFragment;
  private ReactFragment newArchitectureFragment;

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    oldArchitectureFragment = new ReactFragment.Builder()
            .setComponentName("Paper")
            .setLaunchOptions()
            .build();
//    newArchitectureFragment = new ReactFragment.Builder()
//            .setComponentName("PagerViewExample")
//            .build();
//    binding.bottomNavigationView.setOnItemSelectedListener {
//      when (it.itemId) {
//        R.id.nv_old_architecture -> {
//          displayFragment(oldArchitectureFragment)
//          return@setOnItemSelectedListener true
//        }
//        R.id.nv_new_architecture -> {
//          displayFragment(newArchitectureFragment)
//          return@setOnItemSelectedListener true
//        }
//      }
//      return@setOnItemSelectedListener false
//    }

  }

  //  /**
//   * Returns the name of the main component registered from JavaScript. This is used to schedule
//   * rendering of the component.
//   */
//  @Override
//  protected String getMainComponentName() {
//    return "PagerViewExample";
//  }
//
//  /**
//   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
//   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
//   * (aka React 18) with two boolean flags.
//   */
//  @Override
//  protected ReactActivityDelegate createReactActivityDelegate() {
//    return new DefaultReactActivityDelegate(
//        this,
//        getMainComponentName(),
//        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
//        DefaultNewArchitectureEntryPoint.getFabricEnabled(), // fabricEnabled
//        // If you opted-in for the New Architecture, we enable Concurrent React (i.e. React 18).
//        DefaultNewArchitectureEntryPoint.getConcurrentReactEnabled() // concurrentRootEnabled
//        );
//  }
}
