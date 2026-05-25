package com.reactnativepagerview

import android.content.Context
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.interaction.DragInteraction
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.VerticalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.snapshotFlow
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.ViewCompositionStrategy
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.reactnativepagerview.event.PageScrollEvent
import com.reactnativepagerview.event.PageScrollStateChangedEvent
import com.reactnativepagerview.event.PageSelectedEvent
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.launch

@OptIn(ExperimentalFoundationApi::class)
class ComposePagerView(context: Context) : FrameLayout(context) {
  private val reactContext = context as ReactContext
  private val composeView = ComposeView(context)
  private val pages = mutableStateListOf<View>()
  private val scrollEnabledState = mutableStateOf(true)
  private val orientationState = mutableStateOf(Orientation.Horizontal)
  private val layoutDirectionState = mutableStateOf(LayoutDirection.Ltr)
  private val pageMarginState = mutableStateOf(0)
  private val offscreenPageLimitState = mutableStateOf(0)
  private val sameOrientationChildGestureState = mutableStateOf(false)
  private var initialPage = 0
  private var didEmitInitialPage = false
  private var currentPage = 0
  private var nextScrollCommandId = 0
  private val scrollCommandState = mutableStateOf<ScrollCommand?>(null)
  private var lastEmittedScrollState: String? = null
  private var didSetContent = false

  init {
    id = View.generateViewId()
    layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    isSaveEnabled = false

    composeView.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    composeView.setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnDetachedFromWindow)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    if (composeView.parent == null) {
      super.addView(composeView)
      post {
        measureAndLayoutComposeView()
      }
    }
    if (!didSetContent) {
      didSetContent = true
      composeView.setContent {
        PagerContent()
      }
    }
  }

  override fun onDetachedFromWindow() {
    updateSameOrientationAncestorsGestureState(false)
    if (composeView.parent === this) {
      super.removeView(composeView)
      didSetContent = false
    }
    super.onDetachedFromWindow()
  }

  override fun dispatchTouchEvent(event: MotionEvent): Boolean {
    when (event.actionMasked) {
      MotionEvent.ACTION_DOWN -> updateSameOrientationAncestorsGestureState(true)
      MotionEvent.ACTION_UP,
      MotionEvent.ACTION_CANCEL -> updateSameOrientationAncestorsGestureState(false)
    }
    return super.dispatchTouchEvent(event)
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    super.onMeasure(widthMeasureSpec, heightMeasureSpec)
    measureComposeView()
  }

  override fun onSizeChanged(width: Int, height: Int, oldWidth: Int, oldHeight: Int) {
    super.onSizeChanged(width, height, oldWidth, oldHeight)
    measureAndLayoutComposeView()
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    super.onLayout(changed, left, top, right, bottom)
    measureAndLayoutComposeView()
  }

  private fun measureAndLayoutComposeView() {
    val width = width.takeIf { it > 0 } ?: measuredWidth
    val height = height.takeIf { it > 0 } ?: measuredHeight
    if (measureComposeView(width, height)) {
      composeView.layout(0, 0, width, height)
    }
  }

  private fun measureComposeView(
    width: Int = measuredWidth,
    height: Int = measuredHeight
  ): Boolean {
    if (composeView.parent !== this || width <= 0 || height <= 0) {
      return false
    }

    composeView.measure(
      MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
    )
    return true
  }

  override fun addView(child: View?, index: Int) {
    if (child === composeView) {
      super.addView(child, index)
      return
    }
    addPage(child, index)
  }

  fun addPage(child: View?, index: Int) {
    if (child == null) {
      return
    }
    val insertionIndex = index.coerceIn(0, pages.size)
    pages.add(insertionIndex, child)
  }

  fun getPageCount(): Int = pages.size

  fun getPageAt(index: Int): View = pages[index]

  fun removePage(view: View) {
    val index = pages.indexOf(view)
    if (index >= 0) {
      removePageAt(index)
    }
  }

  fun removePageAt(index: Int) {
    if (index !in pages.indices) {
      return
    }
    val view = pages.removeAt(index)
    (view.parent as? ViewGroup)?.removeView(view)
  }

  fun removeAllPages() {
    pages.forEach { view ->
      (view.parent as? ViewGroup)?.removeView(view)
    }
    pages.clear()
  }

  fun setInitialPage(value: Int) {
    if (!didEmitInitialPage) {
      initialPage = value.coerceAtLeast(0)
      currentPage = initialPage
    }
  }

  fun setScrollEnabled(value: Boolean) {
    scrollEnabledState.value = value
  }

  fun setOrientation(value: String) {
    orientationState.value = if (value == "vertical") Orientation.Vertical else Orientation.Horizontal
  }

  fun setLayoutDirection(value: String) {
    layoutDirectionState.value = if (value == "rtl") LayoutDirection.Rtl else LayoutDirection.Ltr
  }

  fun setOffscreenPageLimit(value: Int) {
    offscreenPageLimitState.value = value.coerceAtLeast(0)
  }

  fun setPageMargin(value: Int) {
    pageMarginState.value = value
  }

  private fun setSameOrientationChildGestureActive(value: Boolean) {
    sameOrientationChildGestureState.value = value
  }

  private fun updateSameOrientationAncestorsGestureState(value: Boolean) {
    val orientation = orientationState.value
    var ancestor = parent
    while (ancestor != null) {
      if (ancestor is ComposePagerView && ancestor.orientationState.value == orientation) {
        ancestor.setSameOrientationChildGestureActive(value)
      }
      ancestor = (ancestor as? View)?.parent
    }
  }

  fun setCurrentItem(selectedPage: Int, animated: Boolean) {
    if (selectedPage < 0 || pages.isNotEmpty() && selectedPage >= pages.size) {
      return
    }
    scrollCommandState.value = ScrollCommand(
      id = nextScrollCommandId++,
      page = selectedPage,
      animated = animated
    )
  }

  private fun dispatchPageSelected(position: Int) {
    UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)?.dispatchEvent(
      PageSelectedEvent(id, position)
    )
  }

  private fun dispatchPageScroll(position: Int, offset: Float) {
    UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)?.dispatchEvent(
      PageScrollEvent(id, position, offset)
    )
  }

  private fun dispatchScrollState(state: String) {
    if (lastEmittedScrollState == state) {
      return
    }
    lastEmittedScrollState = state
    UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)?.dispatchEvent(
      PageScrollStateChangedEvent(id, state)
    )
  }

  @Composable
  private fun PagerContent() {
    val pageCount = pages.size
    if (pageCount == 0) {
      return
    }

    val pagerState = rememberPagerState(initialPage = initialPage.coerceIn(0, pageCount - 1)) {
      pages.size
    }

    LaunchedEffect(pageCount) {
      if (!didEmitInitialPage) {
        didEmitInitialPage = true
        currentPage = pagerState.currentPage
        dispatchPageSelected(pagerState.currentPage)
      }

      if (pagerState.currentPage >= pageCount) {
        val target = pageCount - 1
        pagerState.scrollToPage(target)
        currentPage = target
        dispatchPageSelected(target)
      }
    }

    LaunchedEffect(scrollCommandState.value, pageCount) {
      val command = scrollCommandState.value ?: return@LaunchedEffect
      if (command.page !in 0 until pageCount) {
        if (scrollCommandState.value == command) {
          scrollCommandState.value = null
        }
        return@LaunchedEffect
      }
      if (command.animated) {
        pagerState.animateScrollToPage(command.page)
      } else {
        pagerState.scrollToPage(command.page)
      }
      if (scrollCommandState.value == command) {
        scrollCommandState.value = null
      }
    }

    LaunchedEffect(pagerState) {
      launch {
        snapshotFlow { pagerState.settledPage }
          .drop(1)
          .collect { page ->
            currentPage = page
            dispatchPageSelected(page)
          }
      }
      launch {
        snapshotFlow { pagerState.currentPage to pagerState.currentPageOffsetFraction }
          .drop(1)
          .collect { (page, fraction) ->
            val (position, offset) = composePageToPageScroll(page, fraction)
            dispatchPageScroll(position.coerceAtLeast(0), offset)
          }
      }
      launch {
        snapshotFlow { pagerState.isScrollInProgress }
          .drop(1)
          .collect { inProgress ->
            if (!inProgress) {
              dispatchPageScroll(pagerState.settledPage, 0f)
              dispatchScrollState("idle")
            }
          }
      }
      launch {
        pagerState.interactionSource.interactions.collect { interaction ->
          when (interaction) {
            is DragInteraction.Start -> dispatchScrollState("dragging")
            is DragInteraction.Stop,
            is DragInteraction.Cancel -> {
              if (pagerState.isScrollInProgress) {
                dispatchScrollState("settling")
              } else {
                dispatchScrollState("idle")
              }
            }
          }
        }
      }
    }

    val reverseLayout = layoutDirectionState.value == LayoutDirection.Rtl
    val pageSpacing = pageMarginState.value.dp
    val beyondViewportPageCount = offscreenPageLimitState.value
    val userScrollEnabled = scrollEnabledState.value && !sameOrientationChildGestureState.value

    if (orientationState.value == Orientation.Vertical) {
      VerticalPager(
        state = pagerState,
        modifier = Modifier.fillMaxSize(),
        pageSpacing = pageSpacing,
        userScrollEnabled = userScrollEnabled,
        reverseLayout = reverseLayout,
        beyondViewportPageCount = beyondViewportPageCount
      ) { page ->
        PageHost(pages[page])
      }
    } else {
      HorizontalPager(
        state = pagerState,
        modifier = Modifier.fillMaxSize(),
        pageSpacing = pageSpacing,
        userScrollEnabled = userScrollEnabled,
        reverseLayout = reverseLayout,
        beyondViewportPageCount = beyondViewportPageCount
      ) { page ->
        PageHost(pages[page])
      }
    }
  }

  @Composable
  private fun PageHost(child: View) {
    AndroidView(
      modifier = Modifier.fillMaxSize(),
      factory = { context ->
        FrameLayout(context).apply {
          layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
          isSaveEnabled = false
          attachChild(this, child)
        }
      },
      update = { container ->
        attachChild(container, child)
      }
    )
  }

  private fun attachChild(container: FrameLayout, child: View) {
    if (child.parent !== container) {
      (child.parent as? ViewGroup)?.removeView(child)
      container.removeAllViews()
      container.addView(
        child,
        LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
      )
    }
  }

  private fun composePageToPageScroll(
    currentPage: Int,
    currentPageOffsetFraction: Float
  ): Pair<Int, Float> {
    return if (currentPageOffsetFraction >= 0) {
      currentPage to currentPageOffsetFraction
    } else {
      (currentPage - 1) to (1 + currentPageOffsetFraction)
    }
  }

  private enum class Orientation {
    Horizontal,
    Vertical
  }

  private enum class LayoutDirection {
    Ltr,
    Rtl
  }

  private data class ScrollCommand(
    val id: Int,
    val page: Int,
    val animated: Boolean
  )
}
