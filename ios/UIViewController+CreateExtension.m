//
//  UIViewController+CreateExtension.m
//  react-native-viewpager
//
//  Created by Krystian Śliwa on 24/06/2020.
//

#import "UIViewController+CreateExtension.h"

@implementation UIViewController (CreateExtension)

- (instancetype)initWithView:(UIView *)view {
    if (self = [self init]) {
        self.view = view;
    }
    return self;
}

@end
