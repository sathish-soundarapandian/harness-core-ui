/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { Prompt } from 'react-router-dom'
import { useConfirmationDialog } from '@harness/uicore'
import { Intent } from '@harness/design-system'

import type * as History from 'history'
import { useStrings } from 'framework/strings'
import css from './NavigationCheck.module.scss'

export interface NavigationCheckProps {
  when?: boolean
  textProps?: {
    contentText?: string
    titleText?: string
    confirmButtonText?: string
    cancelButtonText?: string
  }
  navigate: (path: string) => void
  shouldBlockNavigation?: (location: History.Location) => boolean
}
export const NavigationCheck = ({
  when,
  navigate,
  shouldBlockNavigation,
  textProps
}: NavigationCheckProps): JSX.Element => {
  const [lastLocation, setLastLocation] = useState<History.Location | null>(null)
  const [confirmedNavigation, setConfirmedNavigation] = useState(false)
  const { getString } = useStrings()
  const handleBlockedNavigation = (nextLocation: History.Location): string | boolean => {
    if (!confirmedNavigation) {
      if (!shouldBlockNavigation || (shouldBlockNavigation && shouldBlockNavigation(nextLocation))) {
        openDialog()
        setLastLocation(nextLocation)
        return false
      }
    }
    return true
  }

  const handleConfirmNavigationClick = (): void => {
    setConfirmedNavigation(true)
  }

  const { openDialog } = useConfirmationDialog({
    cancelButtonText: textProps?.cancelButtonText || getString('common.stayOnThisPage'),
    showCloseButton: false,
    contentText: textProps?.contentText || getString('navigationCheckText'),
    titleText: textProps?.titleText || getString('navigationCheckTitle'),
    confirmButtonText: textProps?.confirmButtonText || getString('common.leaveThisPage'),
    intent: Intent.WARNING,
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        handleConfirmNavigationClick()
      }
    },
    className: css.dialogStyle
  })

  useEffect(() => {
    if (confirmedNavigation && lastLocation) {
      // Navigate to the previous blocked location with your navigate function
      navigate(lastLocation.pathname + lastLocation.search)
    }

    // reset back to false
    confirmedNavigation && setConfirmedNavigation(false)
  }, [confirmedNavigation, lastLocation])

  return (
    <>
      <Prompt when={when} message={handleBlockedNavigation} />
    </>
  )
}
