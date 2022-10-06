/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Classes, Intent, Switch } from '@blueprintjs/core'
import { defaultTo } from 'lodash-es'
import { Dialog, PageSpinner, useConfirmationDialog, useToaster } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FreezeSummaryResponse, FreezeWindow, useGetGlobalFreeze, useGlobalFreeze } from 'services/cd-ng'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import { GlobalFreezeScheduleForm } from './GlobalFreezeScheduleForm'
import css from './GlobalFreezeToggle.module.scss'

interface GlobalFreezeToggleProps {
  freezeListLoading?: boolean
}

export const GlobalFreezeToggle: FC<GlobalFreezeToggleProps> = ({ freezeListLoading }) => {
  const { getString } = useStrings()
  const { showSuccess, showWarning } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const scope = getScopeFromDTO({ projectIdentifier, orgIdentifier, accountId })

  const {
    loading: getGlobalFreezeLoading,
    data: getGlobalFreezeData,
    refetch: refetchGetGlobalFreeze
  } = useGetGlobalFreeze({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { mutate: updateGlobalFreeze, loading: updateGlobalFreezeLoading } = useGlobalFreeze({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const freeze = yamlParse<FreezeSummaryResponse>(defaultTo(getGlobalFreezeData?.data?.yaml, ''))
  const freezeWindow = freeze?.freezeWindows?.[0] || {}
  const { endTime, timeZone } = freezeWindow

  const { openDialog: openDisableFreezeDialog } = useConfirmationDialog({
    titleText: `${getString('freezeWindows.globalFreeze.disableFreezeTitle', { scope })} ?`,
    contentText: getString('freezeWindows.globalFreeze.disableFreezeText'),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        handleDisableGlobalFreeze()
      }
    }
  })

  const [openEnableFreezeDialog, hideEnableFreezeDialog] = useModalHook(
    () => (
      <Dialog
        // usePortal={false}
        isOpen
        canOutsideClickClose={false}
        title={`${getString('freezeWindows.globalFreeze.enableFreezeTitle', { scope })} ?`}
        onClose={hideEnableFreezeDialog}
        enforceFocus={false}
        className={cx(css.dialog, Classes.DIALOG)}
      >
        <GlobalFreezeScheduleForm
          onSave={handleEnableGlobalFreeze}
          onCancel={hideEnableFreezeDialog}
          freezeWindow={freezeWindow}
        />
      </Dialog>
    ),
    []
  )
  const handleDisableGlobalFreeze = async (): Promise<void> => {
    try {
      freeze.status = 'Disabled'
      const body = yamlStringify({ freeze })
      await updateGlobalFreeze(body)
      refetchGetGlobalFreeze()
      showSuccess(getString('freezeWindows.globalFreeze.enableFreezeSuccess', { scope, endTime, timeZone }))
    } catch (err: any) {
      showWarning(defaultTo(getRBACErrorMessage(err), getString('freezeWindows.globalFreeze.enableFreezeFailure')))
    }
  }

  const handleEnableGlobalFreeze = async (scheduledFreezeWindow: FreezeWindow): Promise<void> => {
    try {
      freeze.status = 'Enabled'
      freeze.freezeWindows = [scheduledFreezeWindow]
      const body = yamlStringify({ freeze })
      await updateGlobalFreeze(body)
      refetchGetGlobalFreeze()
      hideEnableFreezeDialog()
      showSuccess(getString('freezeWindows.globalFreeze.disableFreezeSuccess', { scope }))
    } catch (err: any) {
      showWarning(defaultTo(getRBACErrorMessage(err), getString('freezeWindows.globalFreeze.disableFreezeFailure')))
    }
  }

  if (freezeListLoading && getGlobalFreezeLoading) {
    return null // avoid showing double loader
  }

  return (
    <>
      {(updateGlobalFreezeLoading || getGlobalFreezeLoading) && <PageSpinner />}
      <Switch
        label={
          getGlobalFreezeLoading
            ? getString('freezeWindows.globalFreeze.enabled', { scope })
            : getString('freezeWindows.globalFreeze.disabled', { scope, endTime, timeZone })
        }
        onChange={event => (event.currentTarget.checked ? openEnableFreezeDialog() : openDisableFreezeDialog())}
        className={css.switch}
        checked={getGlobalFreezeData?.data?.status === 'Enabled'}
      />
    </>
  )
}
