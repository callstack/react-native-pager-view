import Foundation
import React

@objc public class RCTOnPageSelected: NSObject, RCTEvent {
    private var position: NSNumber
    @objc public var viewTag: NSNumber
    @objc public var coalescingKey: UInt16
    
    @objc public var eventName: String {
        return "onPageSelected"
    }
    
    @objc public init(reactTag: NSNumber, position: NSNumber, coalescingKey: UInt16) {
        self.viewTag = reactTag
        self.position = position
        self.coalescingKey = coalescingKey
        super.init()
    }
    
    @objc public func canCoalesce() -> Bool {
        return false
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
                "position": position
            ]
        ]
    }
}
