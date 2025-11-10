import Foundation
import SwiftUI
import UIKit

/**
 Helper used to render UIView inside of SwiftUI.
 */
struct RepresentableView: UIViewRepresentable {
  var view: UIView

  // Adding a wrapper UIView to avoid SwiftUI directly managing React Native views.
  // This fixes issues with incorrect layout rendering.
  func makeUIView(context: Context) -> UIView {
    let wrapper = UIView()
    wrapper.addSubview(view)
    return wrapper
  }

  func updateUIView(_ uiView: UIView, context: Context) {}
}

extension Collection {
  // Returns the element at the specified index if it is within bounds, otherwise nil.
  subscript(safe index: Index) -> Element? {
    indices.contains(index) ? self[index] : nil
  }
}

extension UIView {
  func pinEdges(to other: UIView) {
    NSLayoutConstraint.activate([
      leadingAnchor.constraint(equalTo: other.leadingAnchor),
      trailingAnchor.constraint(equalTo: other.trailingAnchor),
      topAnchor.constraint(equalTo: other.topAnchor),
      bottomAnchor.constraint(equalTo: other.bottomAnchor)
    ])
  }
}

