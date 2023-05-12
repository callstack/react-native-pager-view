//
//  FabricViewController.m
//  MeasurePerformance
//
//  Created by Samuel Susla on 13/02/2023.
//

#import "FabricViewController.h"

@interface FabricViewController ()

@end

@implementation FabricViewController

- (instancetype)init {
  if (self = [super init]) {
    self.tabBarItem = [[UITabBarItem alloc] initWithTitle:@"Fabric" image:[UIImage imageNamed:@"new-architecture"] tag:0];
    self.title = @"New Architecture";
  }
  return self;
}

@end
