/**
 * MIT License
 *
 * Copyright (C) 2023 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
#ifndef HARMONY_PAGERVIEW_SRC_MAIN_CPP_RCTCOMPONENTVIEWHELPERS_H
#define HARMONY_PAGERVIEW_SRC_MAIN_CPP_RCTCOMPONENTVIEWHELPERS_H
#import <Foundation/Foundation.h>
#import <React/RCTDefines.h>
#import <React/RCTLog.h>

NS_ASSUME_NONNULL_BEGIN

@protocol RCTRNCViewPagerViewProtocol <NSObject>
- (void)setPage:(NSInteger)selectedPage;
- (void)setPageWithoutAnimation:(NSInteger)selectedPage;
- (void)setScrollEnabledImperatively:(BOOL)scrollEnabled;
@end

RCT_EXTERN inline void RCTRNCViewPagerHandleCommand(
  id<RCTRNCViewPagerViewProtocol> componentView,
  NSString const *commandName,
  NSArray const *args)
{
  if([commandName isEqualToString:@"setPage"]){
    #if RCT_DEBUG
      if([args count] != 1){
        RCTLogError(@"%@ command %@ received %d arguments,expected %d.",@"RNCViewPager",commandName,(int)[args count],1);
        return;
      }
    #endif

    NSObject *arg0 = args[0];
    #if RCT_DEBUG
      if(!RCTValidateTypeOfViewCommandArgument(arg0,[NSNumber class],@"number",@"RNCViewPager",commandName,@"1st")){
        return;
      }
    #endif
    NSInteger selectedPage = [(NSNumber *)arg0 intValue];

    [componentView setPage:selectedPage];
    return;
  }

  if([commandName isEqualToString:@"setPageWithoutAnimation"]){
    #if RCT_DEBUG
      if([args count] != 1){
        RCTLogError(@"%@ command %@ received %d arguments,expected %d.",@"RNCViewPager",commandName,(int)[args count],1);
        return;
      }
    #endif

    NSObject *arg0 = args[0];
    #if RCT_DEBUG
      if(!RCTValidateTypeOfViewCommandArgument(arg0,[NSNumber class],@"number",@"RNCViewPager",commandName,@"1st")){
        return;
      }
    #endif
    NSInteger selectedPage = [(NSNumber *)arg0 intValue];

    [componentView setPageWithoutAnimation:selectedPage];
    return;
  }

  if([commandName isEqualToString:@"setScrollEnabledImperatively"]){
    #if RCT_DEBUG
      if([args count] != 1){
        RCTLogError(@"%@ command %@ received %d arguments,expected %d.",@"RNCViewPager",commandName,(int)[args count],1);
        return;
      }
    #endif

    NSObject *arg0 = args[0];
    #if RCT_DEBUG
      if(!RCTValidateTypeOfViewCommandArgument(arg0,[NSNumber class],@"boolean",@"RNCViewPager",commandName,@"1st")){
        return;
      }
    #endif
    BOOL scrollEnabled = [(NSNumber *)arg0 boolValue];

    [componentView setScrollEnabledImperatively:scrollEnabled];
    return;
  }

  #if RCT_DEBUG
    RCTLogError(@"%@ received command %@, which is not a supported command.", @"RNCViewPager",commandName);
  #endif
}

NS_ASSUME_NONNULL_END
#endif