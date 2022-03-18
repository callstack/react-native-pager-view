// https://github.com/facebook/react-native/blob/main/ReactCommon/react/renderer/components/scrollview/RCTComponentViewHelpers.h

#import <Foundation/Foundation.h>
#import <React/RCTDefines.h>
#import <React/RCTLog.h>
#import "RNCPagerViewComponentView.h"

NS_ASSUME_NONNULL_BEGIN

RCT_EXTERN inline void
RNCPagerViewCommands(RNCPagerViewComponentView* componentView, NSString const *commandName, NSArray const *args)
{
      if ([commandName isEqualToString:@"setPage"]) {
    #if RCT_DEBUG
        if ([args count] != 1) {
          RCTLogError(
              @"%@ command %@ received %d arguments, expected %d.", @"PagerView", commandName, (int)[args count], 1);
          return;
        }
    #endif
              NSObject *arg0 = args[0];
          #if RCT_DEBUG
              if (!RCTValidateTypeOfViewCommandArgument(arg0, [NSNumber class], @"NSInteger", @"PagerView", commandName, @"1st")) {
                return;
              }
          #endif
    
        [componentView goTo:[(NSNumber *)arg0 intValue] animated:NO];
        return;
      }
    
    if ([commandName isEqualToString:@"setPageWithoutAnimation"]) {
  #if RCT_DEBUG
      if ([args count] != 1) {
        RCTLogError(
            @"%@ command %@ received %d arguments, expected %d.", @"PagerView", commandName, (int)[args count], 1);
        return;
      }
  #endif
            NSObject *arg0 = args[0];
        #if RCT_DEBUG
            if (!RCTValidateTypeOfViewCommandArgument(arg0, [NSNumber class], @"NSInteger", @"PagerView", commandName, @"1st")) {
              return;
            }
        #endif
  
        [componentView goTo:[(NSNumber *)arg0 intValue] animated:YES];
      return;
    }
}

NS_ASSUME_NONNULL_END
