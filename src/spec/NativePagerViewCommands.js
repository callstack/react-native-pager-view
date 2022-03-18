/**
 * @flow strict-local
 */

import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import * as React from 'react';
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';

import type { HostComponent } from 'react-native/Libraries/Renderer/shims/ReactNativeTypes';

type PagerViewNativeComponentType = HostComponent<mixed>;

interface NativeCommands {
  +setPage: (
    viewRef: React.ElementRef<PagerViewNativeComponentType>,
    number: Int32
  ) => void;
  +setPageWithoutAnimation: (
    viewRef: React.ElementRef<PagerViewNativeComponentType>,
    number: Int32
  ) => void;
}

export default (codegenNativeCommands<NativeCommands>({
  supportedCommands: ['setPage', 'setPageWithoutAnimation'],
}): NativeCommands);
