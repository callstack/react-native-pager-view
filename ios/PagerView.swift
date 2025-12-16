import SwiftUI
@_spi(Advanced) import SwiftUIIntrospect

struct PagerView: View {
  @ObservedObject var props: PagerViewProps
  @State private var scrollDelegate = PagerScrollDelegate()
  weak var delegate: PagerViewProviderDelegate?

  @Weak var collectionView: UICollectionView?

  var body: some View {
    TabView(selection: $props.currentPage) {
      ForEach(props.children) { child in
        if let index = props.children.firstIndex(of: child) {
          RepresentableView(view: child.view)
            .tag(index)
        }
      }
    }
    .id(props.children.count)
    .background(.clear)
    .tabViewStyle(.page(indexDisplayMode: .never))
    .environment(\.layoutDirection, props.layoutDirection.converted)
    .introspect(.tabView(style: .page), on: .iOS(.v14...)) { collectionView in
      self.collectionView = collectionView
      collectionView.bounces = props.overdrag
      collectionView.isScrollEnabled = props.scrollEnabled
      collectionView.keyboardDismissMode = props.keyboardDismissMode

      if let layout = collectionView.collectionViewLayout as? UICollectionViewFlowLayout {
        layout.scrollDirection = props.orientation
      }

      if scrollDelegate.originalDelegate == nil {
        scrollDelegate.originalDelegate = collectionView.delegate
        scrollDelegate.delegate = delegate
        scrollDelegate.orientation = props.orientation
        collectionView.delegate = scrollDelegate
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
