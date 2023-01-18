/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { Dialog } from '@blueprintjs/core'
import { HideModal, ShowModal, useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import { ResourceType } from '@common/interfaces/GitSyncInterface'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import ImportResource from './ImportResource'
import MoveResource from './MoveResource'
import { ExtraQueryParams, MigrationType } from './MigrateUtils'

interface UseMigrateResourceReturnType {
  showMigrateResourceModal: ShowModal
  hideMigrateResourceModal: HideModal
}

interface UseMigrateResourceProps {
  resourceType: ResourceType
  modalTitle?: string
  onSuccess?: () => void
  onFailure?: () => void
  extraQueryParams?: ExtraQueryParams
  migrationType?: MigrationType
}

export default function useMigrateResource(props: UseMigrateResourceProps): UseMigrateResourceReturnType {
  const {
    resourceType,
    modalTitle,
    onSuccess,
    onFailure,
    extraQueryParams,
    migrationType = MigrationType.IMPORT
  } = props
  // Had to do this change to allow importing input set from same connector, repo and branch that of pipeline's
  const { connectorRef, repoName, branch } = useQueryParams<GitQueryParams>()

  const { getString } = useStrings()

  const onMigrateSuccess = (): void => {
    hideMigrateResourceModal()
    onSuccess?.()
  }

  const onMigrateFailure = (): void => {
    onFailure?.()
  }

  const getModalTitle = (): string => {
    let title = ''
    switch (migrationType) {
      case MigrationType.IMPORT:
        title = getString('common.importFromGit')
        break
      case MigrationType.INLINE_TO_REMOTE:
        title = getString('pipeline.moveInlieToRemote', {
          resource: resourceType
        })
        break
    }

    return modalTitle ?? title
  }

  const [showMigrateResourceModal, hideMigrateResourceModal] = useModalHook(() => {
    return (
      <Dialog
        style={{
          width: '800px',
          background: 'var(--form-bg)',
          paddingTop: '36px'
        }}
        enforceFocus={false}
        isOpen={true}
        className={'padded-dialog'}
        onClose={hideMigrateResourceModal}
        title={getModalTitle()}
      >
        {migrationType === MigrationType.IMPORT ? (
          <ImportResource
            initialValues={{
              identifier: '',
              name: '',
              description: '',
              tags: {},
              connectorRef: defaultTo(connectorRef, ''),
              repoName: defaultTo(repoName, ''),
              branch: defaultTo(branch, ''),
              filePath: '',
              versionLabel: ''
            }}
            resourceType={resourceType}
            onCancelClick={hideMigrateResourceModal}
            onSuccess={onMigrateSuccess}
            onFailure={onMigrateFailure}
            extraQueryParams={extraQueryParams}
          />
        ) : (
          <MoveResource
            initialValues={{
              identifier: defaultTo(
                resourceType === ResourceType.INPUT_SETS
                  ? extraQueryParams?.inputSetIdentifier
                  : extraQueryParams?.pipelineIdentifier,
                ''
              ),
              name: defaultTo(extraQueryParams?.name, ''),
              description: '',
              tags: {},
              connectorRef: defaultTo(connectorRef, ''),
              repoName: defaultTo(repoName, ''),
              branch: defaultTo(branch, ''),
              filePath: '',
              versionLabel: ''
            }}
            migrationType={migrationType}
            resourceType={resourceType}
            onCancelClick={hideMigrateResourceModal}
            onSuccess={onMigrateSuccess}
            onFailure={onMigrateFailure}
            extraQueryParams={extraQueryParams}
          />
        )}
      </Dialog>
    )
  }, [
    migrationType,
    resourceType,
    modalTitle,
    connectorRef,
    repoName,
    branch,
    onMigrateSuccess,
    onMigrateFailure,
    extraQueryParams
  ])

  return {
    showMigrateResourceModal: showMigrateResourceModal,
    hideMigrateResourceModal: hideMigrateResourceModal
  }
}
