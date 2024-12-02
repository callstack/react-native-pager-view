import Foundation
import React

public protocol RCTEvent {}

@objc public class RCTOnPageScroll: NSObject, RCTEvent {
    private var position: NSNumber
    private var offset: NSNumber
    @objc public var viewTag: NSNumber
    @objc public var coalescingKey: UInt16
    
    @objc public var eventName: String {
        return "onPageScroll"
    }
    
    @objc public init(reactTag: NSNumber, position: NSNumber, offset: NSNumber, coalescingKey: UInt16) {
        self.viewTag = reactTag
        self.position = position
        self.offset = offset
        self.coalescingKey = coalescingKey
        super.init()
    }
    
    @objc public func canCoalesce() -> Bool {
        return true
    }
    
    public func coalesce(with newEvent: RCTEvent) ->  RCTEvent {
        return newEvent
    }
    
    @objc public class func moduleDotMethod() -> String {
        return "RCTEventEmitter.receiveEvent"
    }
    
    @objc public func arguments() -> [Any] {
        return [
            viewTag,
            RCTNormalizeInputEventName(eventName) ?? eventName,
            [
                "position": position,
                "offset": offset
            ]
        ]
    }
}
