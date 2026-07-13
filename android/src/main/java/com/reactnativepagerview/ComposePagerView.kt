package com.reactnativepagerview

import android.content.Context
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.LocalOverscrollConfiguration
import androidx.compose.foundation.interaction.DragInteraction
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.VerticalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
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
import kotlin.math.absoluteValue
import kotlin.math.sign

@OptIn(ExperimentalFoundationApi::class)
class ComposePagerView(context: Context) : FrameLayout(context) {
  private val reactContext = context as ReactContext
  private val composeView = ComposeView(context)
  private val pages = mutableStateListOf<View>()
  private val scrollEnabledState = mutableStateOf(true)
  private val orientationState = mutableStateOf(Orientation.Horizontal)
  private val layoutDirectionState = mutableStateOf(LayoutDirection.Ltr)
  private val pageMarginState = mutableStateOf(0)
  private val offscreenPageLimitState = mutableStateOf(DEFAULT_OFFSCREEN_PAGE_LIMIT)
  private val overScrollModeState = mutableStateOf(OverScrollMode.Auto)
  private val sameOrientationChildGestureState = mutableStateOf(false)
  private var initialPage = 0
  private var didEmitInitialPage = false
  private var currentPage = 0
  private var nextScrollCommandId = 0
  private var touchSlop = 0
  private var initialTouchX = 0f
  private var initialTouchY = 0f
  private var didDelegateGestureToAncestor = false
  private val scrollCommandState = mutableStateOf<ScrollCommand?>(null)
  private var lastEmittedScrollState: String? = null
  private var lastEmittedPageSelected: Int? = null
  private var didSetContent = false

  init {
    id = View.generateViewId()
    layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    isSaveEnabled = false

    composeView.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    composeView.setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnDetachedFromWindow)
    applyOverScrollMode()
    touchSlop = ViewConfiguration.get(context).scaledTouchSlop
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
      MotionEvent.ACTION_DOWN -> {
        initialTouchX = event.x
        initialTouchY = event.y
        didDelegateGestureToAncestor = false
        updateSameOrientationAncestorsGestureState(true)
      }
      MotionEvent.ACTION_MOVE -> updateSameOrientationAncestorsGestureStateForMove(event)
      MotionEvent.ACTION_UP,
      MotionEvent.ACTION_CANCEL -> {
        didDelegateGestureToAncestor = false
        updateSameOrientationAncestorsGestureState(false)
      }
    }
    return super.dispatchTouchEvent(event)
  }

  override fun canScrollHorizontally(direction: Int): Boolean {
    if (orientationState.value != Orientation.Horizontal) {
      return false
    }

    return canScrollInDirection(direction)
  }

  override fun canScrollVertically(direction: Int): Boolean {
    if (orientationState.value != Orientation.Vertical) {
      return false
    }

    return canScrollInDirection(direction)
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
    resetPagerState()
  }

  private fun resetPagerState() {
    didEmitInitialPage = false
    currentPage = initialPage
    scrollCommandState.value = null
    lastEmittedScrollState = null
    lastEmittedPageSelected = null
    didDelegateGestureToAncestor = false
    sameOrientationChildGestureState.value = false
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
    val androidLayoutDirection = if (layoutDirectionState.value == LayoutDirection.Rtl) {
      View.LAYOUT_DIRECTION_RTL
    } else {
      View.LAYOUT_DIRECTION_LTR
    }
    layoutDirection = androidLayoutDirection
    composeView.layoutDirection = androidLayoutDirection
  }

  fun setOffscreenPageLimit(value: Int) {
    offscreenPageLimitState.value = value
  }

  fun setPageMargin(value: Int) {
    pageMarginState.value = value
  }

  fun setOverScrollMode(value: String) {
    overScrollModeState.value = when (value) {
      "never" -> OverScrollMode.Never
      "always" -> OverScrollMode.Always
      else -> OverScrollMode.Auto
    }
    applyOverScrollMode()
  }

  private fun applyOverScrollMode() {
    val androidOverScrollMode = when (overScrollModeState.value) {
      OverScrollMode.Never -> View.OVER_SCROLL_NEVER
      OverScrollMode.Always -> View.OVER_SCROLL_ALWAYS
      OverScrollMode.Auto -> View.OVER_SCROLL_IF_CONTENT_SCROLLS
    }
    overScrollMode = androidOverScrollMode
    composeView.overScrollMode = androidOverScrollMode
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

  private fun updateSameOrientationAncestorsGestureStateForMove(event: MotionEvent) {
    val dx = event.x - initialTouchX
    val dy = event.y - initialTouchY
    val orientation = orientationState.value
    val isHorizontal = orientation == Orientation.Horizontal
    val scaledDx = dx.absoluteValue * if (isHorizontal) .5f else 1f
    val scaledDy = dy.absoluteValue * if (isHorizontal) 1f else .5f

    if (scaledDx <= touchSlop && scaledDy <= touchSlop) {
      return
    }

    val isPerpendicularGesture = isHorizontal == (scaledDy > scaledDx)
    if (isPerpendicularGesture) {
      updateSameOrientationAncestorsGestureState(false)
      return
    }

    val delta = if (isHorizontal) dx else dy
    val direction = -delta.sign.toInt()
    val canScroll = canScrollInDirection(direction)
    updateSameOrientationAncestorsGestureState(canScroll)

    if (shouldHandleRtlHorizontalGesture(canScroll)) {
      didDelegateGestureToAncestor = scrollInDirection(direction)
    } else if (!canScroll && !didDelegateGestureToAncestor) {
      didDelegateGestureToAncestor = scrollSameOrientationAncestorInDirection(direction)
    }
  }

  private fun shouldHandleRtlHorizontalGesture(canScroll: Boolean): Boolean {
    return canScroll &&
      !didDelegateGestureToAncestor &&
      orientationState.value == Orientation.Horizontal &&
      layoutDirectionState.value == LayoutDirection.Rtl
  }

  private fun canScrollInDirection(direction: Int): Boolean {
    if (!scrollEnabledState.value || pages.size <= 1 || direction == 0) {
      return false
    }

    val isRtlHorizontal =
      orientationState.value == Orientation.Horizontal &&
        layoutDirectionState.value == LayoutDirection.Rtl
    val effectiveDirection = if (isRtlHorizontal) -direction else direction

    return if (effectiveDirection < 0) {
      currentPage > 0
    } else {
      currentPage < pages.size - 1
    }
  }

  private fun scrollSameOrientationAncestorInDirection(direction: Int): Boolean {
    val orientation = orientationState.value
    var ancestor = parent
    while (ancestor != null) {
      if (ancestor is ComposePagerView && ancestor.orientationState.value == orientation) {
        return ancestor.scrollInDirection(direction)
      }
      ancestor = (ancestor as? View)?.parent
    }
    return false
  }

  private fun scrollInDirection(direction: Int): Boolean {
    if (!canScrollInDirection(direction)) {
      return false
    }

    val isRtlHorizontal =
      orientationState.value == Orientation.Horizontal &&
        layoutDirectionState.value == LayoutDirection.Rtl
    val effectiveDirection = if (isRtlHorizontal) -direction else direction
    setCurrentItem(currentPage + if (effectiveDirection < 0) -1 else 1, true)
    return true
  }

  fun setCurrentItem(selectedPage: Int, animated: Boolean) {
    if (selectedPage < 0 || selectedPage >= pages.size) {
      return
    }
    scrollCommandState.value = ScrollCommand(
      id = nextScrollCommandId++,
      page = selectedPage,
      animated = animated
    )
  }

  private fun dispatchPageSelected(position: Int) {
    if (lastEmittedPageSelected == position) {
      return
    }
    lastEmittedPageSelected = position
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
        if (command.page != pagerState.currentPage) {
          dispatchScrollState("settling")
        }
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

    val pageSpacing = pageMarginState.value.dp
    val beyondViewportPageCount = getBeyondViewportPageCount()
    val userScrollEnabled = scrollEnabledState.value && !sameOrientationChildGestureState.value
    val overscrollConfiguration = if (overScrollModeState.value == OverScrollMode.Never) {
      null
    } else {
      LocalOverscrollConfiguration.current
    }

    CompositionLocalProvider(LocalOverscrollConfiguration provides overscrollConfiguration) {
      if (orientationState.value == Orientation.Vertical) {
        VerticalPager(
          state = pagerState,
          modifier = Modifier.fillMaxSize(),
          pageSpacing = pageSpacing,
          userScrollEnabled = userScrollEnabled,
          reverseLayout = false,
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
          reverseLayout = false,
          beyondViewportPageCount = beyondViewportPageCount
        ) { page ->
          PageHost(pages[page])
        }
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

  private enum class OverScrollMode {
    Auto,
    Always,
    Never
  }

  private data class ScrollCommand(
    val id: Int,
    val page: Int,
    val animated: Boolean
  )

  private companion object {
    const val DEFAULT_OFFSCREEN_PAGE_LIMIT = -1
    const val DEFAULT_BEYOND_VIEWPORT_PAGE_COUNT = 1
  }

  private fun getBeyondViewportPageCount(): Int {
    return if (offscreenPageLimitState.value == DEFAULT_OFFSCREEN_PAGE_LIMIT) {
      DEFAULT_BEYOND_VIEWPORT_PAGE_COUNT
    } else {
      offscreenPageLimitState.value.coerceAtLeast(0)
    }
  }
}
