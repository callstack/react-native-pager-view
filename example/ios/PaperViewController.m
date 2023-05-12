//
//  PaperViewController.m
//  MeasurePerformance
//
//  Created by Samuel Susla on 13/02/2023.
//

#import "PaperViewController.h"

@interface PaperViewController ()

@end

@implementation PaperViewController

- (instancetype)init {
  if (self = [super init]) {
    self.tabBarItem = [[UITabBarItem alloc] initWithTitle:@"Paper" image:[UIImage imageNamed:@"old-architecture"] tag:0];
    self.title = @"Old Architecture";
  }
  return self;
}

@end
