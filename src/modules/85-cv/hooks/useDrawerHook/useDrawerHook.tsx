/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Drawer, Intent } from '@blueprintjs/core'
import { Button, useConfirmationDialog } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import { getDefaultDrawerProps, getParsedDrawerOptions } from './useDrawerHook.utils'
import type { UseDrawerInterface, UseDrawerPropsInterface } from './useDrawerHook.types'
import css from './useDrawerHook.module.scss'

export const useDrawer = ({
  createHeader,
  createDrawerContent,
  drawerOptions
}: UseDrawerPropsInterface): UseDrawerInterface => {
  const { getString } = useStrings()
  const [drawerContentProps, setDrawerContentProps] = useState({})
  const [drawerHeaderProps, setDrawerHeaderProps] = useState({})

  const { openDialog: showWarning } = useConfirmationDialog({
    intent: Intent.WARNING,
    contentText: getString('common.unsavedChanges'),
    titleText: getString('common.confirmText'),
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: (isConfirmed: boolean) => isConfirmed && hideModal()
  })

  const header = createHeader ? createHeader(drawerHeaderProps) : undefined
  const defaultOptions = useMemo(() => getDefaultDrawerProps({ showWarning, header }), [drawerHeaderProps])
  const parsedOptions = useMemo(
    () => getParsedDrawerOptions(defaultOptions, drawerOptions),
    [defaultOptions, drawerOptions]
  )

  const [showModal, hideModal] = useModalHook(
    () => (
      <>
        <Drawer {...parsedOptions}>
          <div className={css.formFullheight}>{createDrawerContent(drawerContentProps)}</div>
        </Drawer>
        <Button
          minimal
          style={parsedOptions?.size ? { right: parsedOptions?.size } : {}}
          className={css.almostFullScreenCloseBtn}
          icon="cross"
          withoutBoxShadow
          onClick={hideModal}
        />
      </>
    ),
    [drawerContentProps]
  )

  return {
    showDrawer: data => {
      if (data) {
        setDrawerContentProps(data)
      }
      showModal()
    },
    setDrawerHeaderProps: props => setDrawerHeaderProps(props),
    hideDrawer: hideModal
  }
}
