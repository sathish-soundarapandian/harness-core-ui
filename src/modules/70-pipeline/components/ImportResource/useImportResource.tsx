/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { Dialog } from '@blueprintjs/core'
import type { Omit } from 'restful-react/dist/useGet'
import { HideModal, ShowModal, useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import type { ResourceType } from '@common/interfaces/GitSyncInterface'
import type { NameIdDescriptionTagsType } from '@common/utils/Validation'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import ImportResource from './ImportResource'

export type InitialValuesType = NameIdDescriptionTagsType & StoreMetadata
export type ModifiedInitialValuesType = Omit<InitialValuesType, 'repoName'> & { repo?: string }

interface UseImportResourceReturnType {
  showImportResourceModal: ShowModal
  hideImportResourceModal: HideModal
}

export interface ExtraQueryParams {
  pipelineIdentifier?: string
}

interface UseImportResourceProps {
  resourceType: ResourceType
  modalTitle?: string
  onSuccess?: () => void
  onFailure?: () => void
  extraQueryParams?: ExtraQueryParams
}

export default function useImportResource(props: UseImportResourceProps): UseImportResourceReturnType {
  const { resourceType, modalTitle, onSuccess, onFailure, extraQueryParams } = props
  // Had to do this change to allow importing input set from same connector, repo and branch that of pipeline's
  const { connectorRef, repoName, branch } = useQueryParams<GitQueryParams>()

  const { getString } = useStrings()

  const onImportSuccess = () => {
    hideImportResourceModal()
    onSuccess?.()
  }

  const onImportFailure = () => {
    onFailure?.()
  }

  const [showImportResourceModal, hideImportResourceModal] = useModalHook(() => {
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
        onClose={hideImportResourceModal}
        title={modalTitle ?? getString('common.importFromGit')}
      >
        <ImportResource
          initialValues={{
            identifier: '',
            name: '',
            description: '',
            tags: {},
            connectorRef: defaultTo(connectorRef, ''),
            repoName: defaultTo(repoName, ''),
            branch: defaultTo(branch, ''),
            filePath: ''
          }}
          resourceType={resourceType}
          onCancelClick={hideImportResourceModal}
          onSuccess={onImportSuccess}
          onFailure={onImportFailure}
          extraQueryParams={extraQueryParams}
        />
      </Dialog>
    )
  }, [resourceType, modalTitle, connectorRef, repoName, branch, onImportSuccess, onImportFailure, extraQueryParams])

  return {
    showImportResourceModal,
    hideImportResourceModal
  }
}
