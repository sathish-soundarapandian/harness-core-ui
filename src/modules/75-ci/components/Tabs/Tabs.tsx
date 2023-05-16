/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { ITabsProps } from '@blueprintjs/core';
import { Tabs as BpTabs, Tab } from '@blueprintjs/core'
import css from './Tabs.module.scss'

export interface TabsProps extends Omit<ITabsProps, 'renderActiveTabPanelOnly'> {
  renderAllTabPanels?: boolean
  children?: React.ReactNode
}

const Tabs: React.FC<TabsProps> = (props: TabsProps) => {
  const { renderAllTabPanels, children, ...rest } = props

  return (
    <BpTabs {...rest} renderActiveTabPanelOnly={!renderAllTabPanels} className={css.main}>
      {children}
    </BpTabs>
  )
}

export { Tabs, Tab }
