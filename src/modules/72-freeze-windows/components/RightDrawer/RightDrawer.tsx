/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Drawer, Position } from '@blueprintjs/core'
import { Button } from '@wings-software/uicore'
import { FreezeWindowContext } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowContext'
import { DrawerTypes } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWidowActions'
import { FreezeNotifications } from '@freeze-windows/components/FreezeNotifications/FreezeNotifications'
import css from '@pipeline/components/PipelineStudio/RightDrawer/RightDrawer.module.scss'

export function RightDrawer(): React.ReactElement {
  const { drawerType, setDrawerType } = React.useContext(FreezeWindowContext)

  return (
    <Drawer
      onClose={() => setDrawerType()}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
      enforceFocus={false}
      hasBackdrop={true}
      size={'calc(100% - 270px - 60px)'}
      isOpen={!!drawerType}
      position={Position.RIGHT}
      className={cx(css.main, css.almostFullScreen, css.fullScreen, css.showRighDrawer)}
      isCloseButtonShown={false}
      portalClassName={css.almostFullScreenPortal}
    >
      <Button
        minimal
        className={css.almostFullScreenCloseBtn}
        icon="cross"
        withoutBoxShadow
        onClick={() => setDrawerType()}
      />
      {drawerType === DrawerTypes.Notification ? <FreezeNotifications /> : null}
    </Drawer>
  )
}
