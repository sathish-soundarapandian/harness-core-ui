/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Classes, Intent, Spinner, Switch } from '@blueprintjs/core'
import { defaultTo } from 'lodash-es'
import { Dialog, OverlaySpinner, useConfirmationDialog, useToaster, Text, Layout, FontVariation } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { useStrings, String } from 'framework/strings'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FreezeWindow, useGetGlobalFreeze, useGlobalFreeze } from 'services/cd-ng'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import { scopeText } from '@freeze-windows/utils/freezeWindowUtils'
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
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const freeze = yamlParse<any>(defaultTo(getGlobalFreezeData?.data?.yaml, ''))?.freeze || {}
  const freezeWindow = freeze?.windows?.[0] || ({} as FreezeWindow)
  const { endTime, timeZone, startTime, duration } = freezeWindow

  const { openDialog: openDisableFreezeDialog } = useConfirmationDialog({
    titleText: `${getString('freezeWindows.globalFreeze.disableFreezeTitle', { scope: scopeText[scope] })} ?`,
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
        title={`${getString('freezeWindows.globalFreeze.enableFreezeTitle', { scope: scopeText[scope] })} ?`}
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
    [freeze]
  )
  const handleDisableGlobalFreeze = async (): Promise<void> => {
    try {
      freeze.status = 'Disabled'
      const body = yamlStringify({ freeze })
      await updateGlobalFreeze(body)
      refetchGetGlobalFreeze()
      showSuccess(getString('freezeWindows.globalFreeze.disableFreezeSuccess', { scope: scopeText[scope] }))
    } catch (err: any) {
      showWarning(defaultTo(getRBACErrorMessage(err), getString('freezeWindows.globalFreeze.disableFreezeFailure')))
    }
  }

  const handleEnableGlobalFreeze = async (scheduledFreezeWindow: FreezeWindow): Promise<void> => {
    try {
      freeze.status = 'Enabled'
      freeze.description = undefined
      freeze.windows = [scheduledFreezeWindow]
      const body = yamlStringify({ freeze: freeze })
      await updateGlobalFreeze(body)
      refetchGetGlobalFreeze()
      hideEnableFreezeDialog()
      showSuccess(getString('freezeWindows.globalFreeze.enableFreezeSuccess', { scope: scopeText[scope] }))
    } catch (err: any) {
      showWarning(defaultTo(getRBACErrorMessage(err), getString('freezeWindows.globalFreeze.enableFreezeFailure')))
    }
  }

  if (freezeListLoading && getGlobalFreezeLoading) {
    return null // avoid showing double loader
  }

  const isGlobalFreezeEnabled = getGlobalFreezeData?.data?.status === 'Enabled'

  return (
    <OverlaySpinner show={updateGlobalFreezeLoading || getGlobalFreezeLoading} size={Spinner.SIZE_SMALL}>
      <Layout.Horizontal>
        <Switch
          disabled={!updateGlobalFreeze}
          onChange={event => (event.currentTarget.checked ? openEnableFreezeDialog() : openDisableFreezeDialog())}
          className={css.switch}
          checked={isGlobalFreezeEnabled}
        />
        <Text font={{ variation: FontVariation.SMALL }}>
          <String
            stringID={
              isGlobalFreezeEnabled ? 'freezeWindows.globalFreeze.enabled' : 'freezeWindows.globalFreeze.disabled'
            }
            useRichText
            vars={{
              scope: scopeText[scope]
            }}
          />
        </Text>

        {isGlobalFreezeEnabled && (
          <Text font={{ variation: FontVariation.SMALL }}>
            &nbsp;
            <String
              stringID="freezeWindows.globalFreeze.enabledWindow"
              useRichText
              vars={{
                startTime: moment(startTime).format('lll'),
                supportText: duration ? 'for' : 'to',
                endTimeOrDuration: duration || moment(endTime).format('lll'),
                timeZone
              }}
            />
          </Text>
        )}
      </Layout.Horizontal>
    </OverlaySpinner>
  )
}
