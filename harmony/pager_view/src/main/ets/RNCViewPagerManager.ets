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