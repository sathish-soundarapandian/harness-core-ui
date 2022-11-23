/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Drawer, IDrawerProps, Classes } from '@blueprintjs/core'
import { Button, Layout } from '@harness/uicore'
import { String } from 'framework/strings'
import css from './FilterDrawer.module.scss'

class FilterDrawer extends React.Component<{ isFilterPanelOpen: boolean; onClose?: () => void }> {
  state: IDrawerProps = {
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    hasBackdrop: true,
    usePortal: true,
    isOpen: false,
    size: 550
  }

  render() {
    return (
      <Drawer
        className={css.filterDrawer}
        {...this.state}
        isOpen={this.props.isFilterPanelOpen}
        onClose={this.props.onClose}
        icon="settings"
        title={<String stringID="filters.filtersLabel" />}
      >
        <div className={Classes.DRAWER_BODY}>
          <div className={Classes.DIALOG_BODY}>{this.props.children}</div>
        </div>
        <div className={Classes.DRAWER_FOOTER}>
          <Layout.Horizontal spacing="medium" flex={true} style={{ justifyContent: 'flex-end' }}>
            <Button text={<String stringID="filters.saveFilter" />} intent="none" className={css.secondaryBtn} />
            <Button text={<String stringID="filters.apply" />} intent="primary" />
          </Layout.Horizontal>
        </div>
      </Drawer>
    )
  }
}

export default FilterDrawer
