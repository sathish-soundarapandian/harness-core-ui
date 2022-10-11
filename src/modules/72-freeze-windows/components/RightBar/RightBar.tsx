/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Button, ButtonVariation } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { FreezeWindowContext } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowContext'
import { DrawerTypes } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWidowActions'
import { RightDrawer } from '../RightDrawer/RightDrawer'
import css from '@pipeline/components/PipelineStudio/RightBar/RightBar.module.scss'

export const RightBar = (): JSX.Element => {
  const { getString } = useStrings()
  const { drawerType, setDrawerType } = React.useContext(FreezeWindowContext)
  // const isDrawerOpened = false
  // const type = DrawerTypes.Notification
  return (
    <div className={css.rightBar}>
      <Button
        className={cx(css.iconButton, { [css.selected]: drawerType === DrawerTypes.Notification })}
        variation={ButtonVariation.TERTIARY}
        onClick={() => setDrawerType(DrawerTypes.Notification)}
        font={{ weight: 'semi-bold', size: 'xsmall' }}
        icon="pipeline-deploy"
        iconProps={{ size: 24 }}
        text={getString('notifications.pipelineName')}
        withoutCurrentColor={true}
      />
      <RightDrawer />
    </div>
  )
}
