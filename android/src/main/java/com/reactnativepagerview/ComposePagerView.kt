package com.reactnativepagerview

import android.content.Context
import android.graphics.Rect
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import android.widget.FrameLayout
import android.widget.HorizontalScrollView
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
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import androidx.lifecycle.findViewTreeLifecycleOwner
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.savedstate.SavedStateRegistry
import androidx.savedstate.SavedStateRegistryController
import androidx.savedstate.SavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.NativeGestureUtil
import com.reactnativepagerview.event.PageScrollEvent
import com.reactnativepagerview.event.PageScrollStateChangedEvent
import com.reactnativepagerview.event.PageSelectedEvent
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.launch
import kotlin.math.absoluteValue
import kotlin.math.max
import kotlin.math.sign

@OptIn(ExperimentalFoundationApi::class)
class ComposePagerView(context: Context) : FrameLayout(context) {
  private val reactContext = context as ReactContext
  // react-native-screens fully removes and re-adds this screen's Fragment
  // (rather than merely hiding it) while it's covered by another screen
  // (see #1103), destroying that Fragment's view-tree Lifecycle. Compose's
  // default composition-disposal strategies key off that ambient Lifecycle,
  // so a ComposeView left to use them gets torn down on every cover/reveal
  // cycle - and rebuilding the composition from scratch each time also
  // discarded every page's native view host, resetting their state (e.g. a
  // FlatList's scroll position, see #1104). Giving the ComposeView its own
  // Lifecycle - one we control instead of the ambient, repeatedly-destroyed
  // one - lets the composition (and each page's host) survive the cycle
  // untouched. It only reaches DESTROYED for real in dispose() below.
  private val composeLifecycleOwner = ComposeViewLifecycleOwner()
  private var composeView: ComposeView? = null
  private val pages = mutableStateListOf<View>()
  private val scrollEnabledState = mutableStateOf(true)
  private val orientationState = mutableStateOf(Orientation.Horizontal)
  private val layoutDirectionState = mutableStateOf(LayoutDirection.Ltr)
  private val pageMarginState = mutableStateOf(0)
  private val offscreenPageLimitState = mutableStateOf(DEFAULT_OFFSCREEN_PAGE_LIMIT)
  private val overScrollModeState = mutableStateOf(OverScrollMode.Auto)
  private var initialPage = 0
  private var didEmitInitialPage = false
  private var currentPage = 0
  private var nextScrollCommandId = 0
  private var touchSlop = 0
  private var initialTouchX = 0f
  private var initialTouchY = 0f
  private var isGestureResolved = false
  private var didStartNativeGesture = false
  private val scrollCommandState = mutableStateOf<ScrollCommand?>(null)
  private var lastEmittedScrollState: String? = null
  private var lastEmittedPageSelected: Int? = null

  init {
    id = View.generateViewId()
    layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    isSaveEnabled = false
    applyOverScrollMode()
    touchSlop = ViewConfiguration.get(context).scaledTouchSlop
  }

  private fun createComposeView(): ComposeView {
    return ComposeView(context).apply {
      layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
      isSaveEnabled = false
      layoutDirection = androidLayoutDirection()
      overScrollMode = androidOverScrollMode()
      // Bind our own Lifecycle before the composition is created, so Compose
      // resolves it instead of walking up to the ambient (and repeatedly
      // destroyed) Fragment view-tree Lifecycle - see the field comment above.
      setViewTreeLifecycleOwner(composeLifecycleOwner)
      // Same for saved state. Compose would otherwise store the pager's
      // rememberSaveable state (current page, page view state) in the host
      // Fragment's SavedStateRegistry under a key derived from this view's
      // id. It has none, so every pager shares one key and a remounted pager
      // restores the previous pager's page instead of using initialPage.
      // React owns the pager state, so the owner's registry is never saved.
      setViewTreeSavedStateRegistryOwner(composeLifecycleOwner)
      setViewCompositionStrategy(
        ViewCompositionStrategy.DisposeOnLifecycleDestroyed(composeLifecycleOwner)
      )
    }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    // Read the ambient owner from our parent before installing the stable
    // owner on the ComposeView below. This keeps the composition alive across
    // Fragment view-tree replacement while still following pause/stop events
    // from the currently active host.
    composeLifecycleOwner.attach(findViewTreeLifecycleOwner()?.lifecycle)
    if (composeView == null) {
      val view = createComposeView()
      composeView = view
      super.addView(view)
      view.setContent {
        PagerContent()
      }
    }
    post {
      measureAndLayoutComposeView()
    }
  }

  override fun onDetachedFromWindow() {
    // composeView is intentionally left attached and alive here: its
    // Lifecycle is self-owned (see composeLifecycleOwner) and only reaches
    // DESTROYED in dispose(). We pause it to CREATED instead, so lifecycle-
    // aware content within pages (video players, nested Compose effects,
    // screen-view tracking) stops doing work while covered - this doesn't
    // dispose the composition, since DisposeOnLifecycleDestroyed only acts
    // on ON_DESTROY.
    composeLifecycleOwner.detach()
    super.onDetachedFromWindow()
  }

  fun dispose() {
    composeLifecycleOwner.destroy()
  }

  override fun dispatchTouchEvent(event: MotionEvent): Boolean {
    when (event.actionMasked) {
      MotionEvent.ACTION_DOWN -> {
        initialTouchX = event.rawX
        initialTouchY = event.rawY
        isGestureResolved = false
      }
      MotionEvent.ACTION_MOVE -> if (!isGestureResolved) resolveGesture(event)
      MotionEvent.ACTION_UP,
      MotionEvent.ACTION_CANCEL -> {
        if (didStartNativeGesture && event.actionMasked == MotionEvent.ACTION_UP) {
          NativeGestureUtil.notifyNativeGestureEnded(this, event)
        }
        didStartNativeGesture = false
      }
    }
    return super.dispatchTouchEvent(event)
  }

  // Not called once a child, like a nested ScrollView, has claimed the touch, so the pager
  // only notifies when it is the one dragging.
  override fun onInterceptTouchEvent(event: MotionEvent): Boolean {
    if (event.actionMasked == MotionEvent.ACTION_MOVE) {
      notifyNativeGestureStartedForMove(event)
    }
    return super.onInterceptTouchEvent(event)
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
      composeView?.layout(0, 0, width, height)
    }
  }

  private fun measureComposeView(
    width: Int = measuredWidth,
    height: Int = measuredHeight
  ): Boolean {
    val view = composeView
    if (view == null || view.parent !== this || width <= 0 || height <= 0) {
      return false
    }

    view.measure(
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
    // Page keys must be unique. If Fabric re-adds a view it never removed, move it like a
    // ViewGroup would instead of listing it twice.
    pages.remove(child)
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
    layoutDirection = androidLayoutDirection()
    composeView?.layoutDirection = androidLayoutDirection()
  }

  private fun androidLayoutDirection(): Int {
    return if (layoutDirectionState.value == LayoutDirection.Rtl) {
      View.LAYOUT_DIRECTION_RTL
    } else {
      View.LAYOUT_DIRECTION_LTR
    }
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
    val androidOverScrollMode = androidOverScrollMode()
    overScrollMode = androidOverScrollMode
    composeView?.overScrollMode = androidOverScrollMode
  }

  private fun androidOverScrollMode(): Int {
    return when (overScrollModeState.value) {
      OverScrollMode.Never -> View.OVER_SCROLL_NEVER
      OverScrollMode.Always -> View.OVER_SCROLL_ALWAYS
      OverScrollMode.Auto -> View.OVER_SCROLL_IF_CONTENT_SCROLLS
    }
  }

  private fun resolveGesture(event: MotionEvent) {
    val dx = event.rawX - initialTouchX
    val dy = event.rawY - initialTouchY
    if (max(dx.absoluteValue, dy.absoluteValue) < touchSlop) {
      return
    }

    isGestureResolved = true
    val isHorizontal = orientationState.value == Orientation.Horizontal
    if (isHorizontal != (dx.absoluteValue > dy.absoluteValue)) {
      return
    }

    val direction = -(if (isHorizontal) dx else dy).sign.toInt()
    val x = initialTouchX.toInt()
    val y = initialTouchY.toInt()
    pages.firstNotNullOfOrNull { findScrollableViewAt(it, x, y, direction) }
      ?.parent
      ?.requestDisallowInterceptTouchEvent(true)
  }

  private fun findScrollableViewAt(view: View, x: Int, y: Int, direction: Int): View? {
    if (!view.isShown) {
      return null
    }
    val rect = Rect()
    if (!view.getGlobalVisibleRect(rect) || !rect.contains(x, y)) {
      return null
    }
    val children = when (view) {
      is ComposePagerView -> view.pages
      is ViewGroup -> (view.childCount - 1 downTo 0).map(view::getChildAt)
      else -> emptyList()
    }
    return children.firstNotNullOfOrNull { findScrollableViewAt(it, x, y, direction) }
      ?: view.takeIf { canViewScroll(it, direction) }
  }

  private fun canViewScroll(view: View, direction: Int): Boolean {
    if (orientationState.value == Orientation.Vertical) {
      return view.canScrollVertically(direction)
    }
    val canScroll = view.canScrollHorizontally(direction)
    if (!canScroll || view !is HorizontalScrollView) {
      return canScroll
    }
    val contentWidth = view.getChildAt(0)?.width ?: 0
    val maxScrollX = contentWidth - (view.width - view.paddingLeft - view.paddingRight)
    return if (direction < 0) view.scrollX > 0 else view.scrollX < maxScrollX
  }

  // Compose starts dragging once the touch moves touchSlop along the pager axis. Tell
  // React Native then, like ScrollView does, so the JS touch is cancelled instead of
  // ending as a press.
  private fun notifyNativeGestureStartedForMove(event: MotionEvent) {
    // Compose never drags with a mouse.
    val isMouse = event.getToolType(0) == MotionEvent.TOOL_TYPE_MOUSE
    if (didStartNativeGesture || !scrollEnabledState.value || isMouse) {
      return
    }

    val delta = if (orientationState.value == Orientation.Horizontal) {
      event.rawX - initialTouchX
    } else {
      event.rawY - initialTouchY
    }
    if (delta.absoluteValue >= touchSlop) {
      didStartNativeGesture = true
      NativeGestureUtil.notifyNativeGestureStarted(this, event)
    }
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
    clearFocusOutsidePage(position)
    UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)?.dispatchEvent(
      PageSelectedEvent(id, position)
    )
  }

  private fun clearFocusOutsidePage(position: Int) {
    val focused = findFocus() ?: return
    val selectedPage = pages.getOrNull(position)
    if (selectedPage?.hasFocus() == true) {
      return
    }
    val inputMethodManager = context.getSystemService(InputMethodManager::class.java)
    val wasServingFocused = inputMethodManager?.isActive(focused) == true
    clearFocus()
    if (hasFocus() && selectedPage?.hasFocus() != true) {
      if (selectedPage?.requestFocus(View.FOCUS_FORWARD) != true) {
        composeView?.requestFocus(View.FOCUS_FORWARD)
      }
    }
    // The keyboard has to be hidden manually, since unlike ViewPager2's
    // RecyclerView in v8, the pager no longer detaches the previous page.
    if (wasServingFocused && !focused.hasFocus()) {
      inputMethodManager?.hideSoftInputFromWindow(focused.windowToken, 0)
    }
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
    // Key pages by their React tag, so the visible page stays put and its new index is
    // reported when React inserts or removes pages before it.
    val pageKey: (Int) -> Any = { page -> pages[page].id }
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
          userScrollEnabled = scrollEnabledState.value,
          reverseLayout = false,
          beyondViewportPageCount = beyondViewportPageCount,
          key = pageKey
        ) { page ->
          PageHost(pages[page])
        }
      } else {
        HorizontalPager(
          state = pagerState,
          modifier = Modifier.fillMaxSize(),
          pageSpacing = pageSpacing,
          userScrollEnabled = scrollEnabledState.value,
          reverseLayout = false,
          beyondViewportPageCount = beyondViewportPageCount,
          key = pageKey
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
        // Reads pages so this runs again when React moves a page: removePageAt detached it,
        // and its keyed slot keeps the same view without recomposing.
        if (child in pages) {
          attachChild(container, child)
        }
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

// A stable Lifecycle that follows the currently attached host through
// CREATED/STARTED/RESUMED, but only moves to DESTROYED when destroy() is
// called explicitly. This lets it survive react-native-screens replacing the
// ambient Fragment view-tree owner (see the field comment above). It also
// provides an empty SavedStateRegistry that is never saved, so nothing in the
// composition is persisted or restored.
internal class ComposeViewLifecycleOwner :
  LifecycleOwner, SavedStateRegistryOwner, LifecycleEventObserver {
  private val registry = LifecycleRegistry(this)
  private val savedStateController = SavedStateRegistryController.create(this)
  private var hostLifecycle: Lifecycle? = null
  private var isAttached = false
  private var isDestroyed = false

  init {
    // Must run while the Lifecycle is still INITIALIZED.
    savedStateController.performRestore(null)
    registry.currentState = Lifecycle.State.CREATED
  }

  override val lifecycle: Lifecycle
    get() = registry

  override val savedStateRegistry: SavedStateRegistry
    get() = savedStateController.savedStateRegistry

  fun attach(lifecycle: Lifecycle?) {
    if (isDestroyed) {
      return
    }

    isAttached = true
    setHostLifecycle(lifecycle)
    updateState()
  }

  fun detach() {
    if (isDestroyed) {
      return
    }

    isAttached = false
    setHostLifecycle(null)
    updateState()
  }

  fun destroy() {
    if (isDestroyed) {
      return
    }

    isDestroyed = true
    isAttached = false
    setHostLifecycle(null)
    registry.currentState = Lifecycle.State.DESTROYED
  }

  override fun onStateChanged(source: LifecycleOwner, event: Lifecycle.Event) {
    if (event == Lifecycle.Event.ON_DESTROY && source.lifecycle === hostLifecycle) {
      setHostLifecycle(null)
    }
    updateState()
  }

  private fun setHostLifecycle(lifecycle: Lifecycle?) {
    if (hostLifecycle === lifecycle) {
      return
    }

    hostLifecycle?.removeObserver(this)
    hostLifecycle = lifecycle
    lifecycle?.addObserver(this)
  }

  private fun updateState() {
    if (isDestroyed) {
      return
    }

    registry.currentState = if (!isAttached) {
      Lifecycle.State.CREATED
    } else {
      when (hostLifecycle?.currentState) {
        Lifecycle.State.RESUMED -> Lifecycle.State.RESUMED
        Lifecycle.State.STARTED -> Lifecycle.State.STARTED
        // INITIALIZED is expected briefly when react-native-screens installs
        // a replacement Fragment view tree. DESTROYED belongs to the old
        // tree. Neither should destroy or block the retained composition.
        Lifecycle.State.INITIALIZED,
        Lifecycle.State.CREATED,
        Lifecycle.State.DESTROYED,
        null -> Lifecycle.State.CREATED
      }
    }
  }
}
