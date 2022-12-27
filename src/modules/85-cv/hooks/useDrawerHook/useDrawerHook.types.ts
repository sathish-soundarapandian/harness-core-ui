/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IDrawerProps } from '@blueprintjs/core'

export interface UseDrawerInterface {
  showDrawer: (data?: any) => void
  hideDrawer: () => void
  setDrawerHeaderProps?: (props: any) => void
}

export interface UseDrawerPropsInterface {
  drawerOptions?: Partial<IDrawerProps>
  createHeader?: (data?: any) => JSX.Element
  createDrawerContent: (props: any) => JSX.Element
  className?: string
}
