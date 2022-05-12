/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { isNil, isEqual } from 'lodash-es'
import produce from 'immer'
import { Layout, Button, ButtonVariation, ButtonSize, Text } from '@wings-software/uicore'
import { useToggleOpen, ConfirmationDialog, Intent } from '@harness/uicore'
import { Color } from '@harness/design-system'
import NotificationTable, { NotificationRulesItem } from '@pipeline/components/Notifications/NotificationTable'
import type { NotificationRules } from 'services/pipeline-ng'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { Actions } from '@pipeline/components/Notifications/NotificationUtils'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { getStagesMultiSelectOptionFromPipeline } from '../CommonUtils/CommonUtils'
import css from './PipelineNotifications.module.scss'

const PAGE_SIZE = 10

interface NotificationsHeaderProps {
  isReadonly: boolean
  discardChanges: () => void
  applyChanges: () => void
  pipeline: PipelineInfoConfig
  isPipelineUpdated: boolean
}

export interface PipelineNotificationsRef {
  onRequestClose(): void
}

export const PipelineNotifications = React.forwardRef(PipelineNotificationsWithRef)

function NotificationsHeader(props: NotificationsHeaderProps) {
  const { applyChanges, discardChanges, pipeline, isPipelineUpdated, isReadonly } = props
  const { getString } = useStrings()
  return (
    <Layout.Horizontal
      padding={{ bottom: 'medium', top: 'medium', left: 'xlarge', right: 'xlarge' }}
      flex={{ distribution: 'space-between' }}
      border={{ bottom: true, color: Color.GREY_300 }}
    >
      <Text color={Color.BLACK} font={{ weight: 'bold', size: 'medium' }}>{`${pipeline.name} : ${getString(
        'notifications.name'
      )}`}</Text>
      <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center' }}>
        <Button
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          text={getString('applyChanges')}
          onClick={applyChanges}
          disabled={!isPipelineUpdated || isReadonly}
        />
        <Button
          minimal
          size={ButtonSize.SMALL}
          text={getString('pipeline.discard')}
          onClick={discardChanges}
          disabled={!isPipelineUpdated}
        />
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

function PipelineNotificationsWithRef(
  _props: React.PropsWithChildren<unknown>,
  ref: React.ForwardedRef<PipelineNotificationsRef>
): React.ReactElement {
  const {
    state: { pipeline, pipelineView },
    updatePipeline: updatePipelineInContext,
    updatePipelineView,
    isReadonly
  } = usePipelineContext()

  const [page, setPage] = React.useState(0)

  const [selectedNotificationTypeFilter, setSelectedNotificationTypeFilter] = useState<string | undefined>(undefined)

  const {
    isOpen: isConfirmationDialogOpen,
    open: openConfirmationDialog,
    close: closeConfirmationDialog
  } = useToggleOpen()

  const { getString } = useStrings()

  const [pipelineAsState, setPipelineAsState] = React.useState<PipelineInfoConfig>(pipeline)

  async function updatePipelineInState(pipelineValue: PipelineInfoConfig): Promise<void> {
    setPipelineAsState(pipelineValue)
    return Promise.resolve()
  }

  const closeDrawer = () => {
    updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
  }

  const applyChanges = async () => {
    await updatePipelineInContext(pipelineAsState)
    closeDrawer()
  }

  const discardChanges = () => {
    closeDrawer()
  }

  const onRequestClose = () => {
    if (!isEqual(pipeline, pipelineAsState)) {
      openConfirmationDialog()
      return
    }

    closeDrawer()
  }

  const handleConfirmation = (isConfirmed: boolean) => {
    if (isConfirmed) {
      applyChanges()
      closeConfirmationDialog()
      closeDrawer()

      return
    }

    closeConfirmationDialog()
  }

  React.useImperativeHandle(ref, () => ({
    onRequestClose
  }))

  React.useEffect(() => {
    setPipelineAsState(pipeline)
  }, [pipeline])

  const isPipelineUpdated = React.useMemo(() => !isEqual(pipeline, pipelineAsState), [pipeline, pipelineAsState])

  const allRowsData: NotificationRulesItem[] = (pipelineAsState.notificationRules || []).map(
    (notificationRules: NotificationRules, index: number) => ({
      index,
      notificationRules
    })
  )

  // filter table data
  let data = allRowsData
  if (selectedNotificationTypeFilter) {
    data = allRowsData.filter(
      item => item.notificationRules.notificationMethod?.type === selectedNotificationTypeFilter
    )
  }

  return (
    <>
      <NotificationsHeader
        isReadonly={isReadonly}
        applyChanges={applyChanges}
        discardChanges={discardChanges}
        pipeline={pipelineAsState}
        isPipelineUpdated={isPipelineUpdated}
      />
      <div className={css.pipelineNotifications}>
        <NotificationTable
          data={data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)}
          stagesOptions={getStagesMultiSelectOptionFromPipeline(pipelineAsState)}
          getExistingNotificationNames={(skipIndex?: number): string[] => {
            return allRowsData.filter(item => item.index !== skipIndex).map(item => item.notificationRules.name!)
          }}
          pageIndex={page}
          totalPages={Math.ceil(data.length / PAGE_SIZE)}
          pageItemCount={PAGE_SIZE}
          pageSize={PAGE_SIZE}
          filterType={selectedNotificationTypeFilter}
          totalItems={data.length}
          gotoPage={index => {
            setPage(index)
          }}
          onFilterType={type => {
            setSelectedNotificationTypeFilter(type)
          }}
          onUpdate={(notificationItem, action, closeModal) => {
            const index = notificationItem?.index
            const notification = notificationItem?.notificationRules
            if (action === Actions.Delete) {
              updatePipelineInState(
                produce(pipelineAsState, draft => {
                  draft.notificationRules?.splice(index || 0, 1)
                })
              )
            } else if (action === Actions.Added && notification) {
              updatePipelineInState(
                produce(pipelineAsState, draft => {
                  if (isNil(draft.notificationRules)) {
                    draft.notificationRules = []
                  }
                  notification.enabled = true
                  draft.notificationRules.unshift(notification)
                })
              ).then(() => {
                closeModal?.()
              })
            } else if (action === Actions.Update && notification) {
              updatePipelineInState(
                produce(pipelineAsState, draft => {
                  draft.notificationRules?.splice(index || 0, 1, notification)
                })
              ).then(() => {
                closeModal?.()
              })
            }
          }}
          isReadonly={isReadonly}
        />
      </div>
      <ConfirmationDialog
        titleText={getString('notifications.name')}
        contentText={getString('pipeline.stepConfigHasChanges')}
        isOpen={isConfirmationDialogOpen}
        confirmButtonText={getString('applyChanges')}
        cancelButtonText={getString('cancel')}
        onClose={handleConfirmation}
        intent={Intent.WARNING}
      />
    </>
  )
}
