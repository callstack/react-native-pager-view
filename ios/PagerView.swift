// Vertical pager layout adapted from VTabView by Lorenzo Fiamingo:
// https://github.com/lorenzofiamingo/swiftui-vertical-tab-view/blob/main/Sources/VTabView/VTabView.swift

import SwiftUI
@_spi(Advanced) import SwiftUIIntrospect

struct PagerView: View {
  @ObservedObject var props: PagerViewProps
  @State private var scrollDelegate = PagerScrollDelegate()
  @State private var didEmitInitialPageSelection = false
  weak var delegate: PagerViewProviderDelegate?

  @Weak var collectionView: UICollectionView?

  private var isVertical: Bool {
    props.orientation == .vertical
  }

  var body: some View {
    GeometryReader { proxy in
      TabView(selection: $props.currentPage) {
        ForEach(Array(props.children.enumerated()), id: \.element.id) { index, child in
          RepresentableView(view: child.view)
            .frame(width: proxy.size.width, height: proxy.size.height)
            .rotationEffect(isVertical ? .degrees(-90) : .zero)
            .tag(index)
        }
      }
      .id(props.children.count)
      .background(.clear)
      .tabViewStyle(.page(indexDisplayMode: .never))
      .frame(
        width: isVertical ? proxy.size.height : proxy.size.width,
        height: isVertical ? proxy.size.width : proxy.size.height
      )
      .rotationEffect(isVertical ? .degrees(90) : .zero, anchor: .topLeading)
      .offset(x: isVertical ? proxy.size.width : 0)
      .ignoresSafeArea()
      .environment(\.layoutDirection, props.layoutDirection.converted)
      .introspect(.tabView(style: .page), on: .iOS(.v14...)) { collectionView in
        self.collectionView = collectionView
        collectionView.bounces = props.overdrag
        collectionView.isScrollEnabled = props.scrollEnabled
        collectionView.keyboardDismissMode = props.keyboardDismissMode
        collectionView.showsVerticalScrollIndicator = false
        collectionView.showsHorizontalScrollIndicator = false

        if scrollDelegate.originalDelegate == nil {
          scrollDelegate.originalDelegate = collectionView.delegate
          scrollDelegate.delegate = delegate
          // VTabView-style rotation preserves TabView's horizontal collection view.
          scrollDelegate.orientation = .horizontal
          collectionView.delegate = scrollDelegate
        }
      }
    }
    .onAppear {
      // Apply initial prop values that .onChange won't catch
      // (.onChange only fires on changes, not on initial values)
      DispatchQueue.main.async {
        collectionView?.isScrollEnabled = props.scrollEnabled
        collectionView?.bounces = props.overdrag
      }

      // `onChange` does not fire for the initial `currentPage` value. Emit the
      // initial selection once so React Native receives `onPageSelected` for
      // `initialPage`, just as it does for subsequent page changes.
      if !didEmitInitialPageSelection && props.currentPage >= 0 {
        didEmitInitialPageSelection = true
        delegate?.onPageSelected(position: props.currentPage)
      }
    }
    .onChange(of: props.children) { newValue in
      if props.currentPage >= newValue.count && !newValue.isEmpty {
        props.currentPage = newValue.count - 1
      }
    }
    .onChange(of: props.currentPage) { newValue in
      delegate?.onPageSelected(position: newValue)
    }
    .onChange(of: props.scrollEnabled) { newValue in
      collectionView?.isScrollEnabled = newValue
    }
    .onChange(of: props.overdrag) { newValue in
      collectionView?.bounces = newValue
    }
    .onChange(of: props.keyboardDismissMode) { newValue in
      collectionView?.keyboardDismissMode = newValue
    }
  }
}
