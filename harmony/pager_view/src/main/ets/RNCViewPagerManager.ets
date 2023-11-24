import { RNOHContext,RNViewManager,Tag } from 'rnoh';
import {ViewPagerDescriptor} from './RNCViewPager';

export class RNCViewPagerManager extends RNViewManager{
  protected page:number = 0;

  constructor(
    tag:Tag,
    ctx:RNOHContext,
    page:number
  ) {
    super(tag,ctx);
    this.page = page
  }

  setPage(page:number){
    this.page = page
  }

  public getActiveChildrenTags(): Tag[]{
    const descriptor = (this.descriptorRegistry.getDescriptor(this.tag)) as ViewPagerDescriptor;
    let page = this.page
    console.info(`RNOH in RNCViewPagerManager,descriptor:${JSON.stringify(descriptor)}`)
    console.info(`RNOH in RNCViewPagerManager,page:${JSON.stringify(page)}`)
    if (page < 0 || page >= descriptor.childrenTags.length) {
      console.error(`RNOH in RNCViewPagerManager,descriptor.childrenTags out-of-bounds`)
      page = 0
    }
    return [descriptor.childrenTags[page]];
  }
}