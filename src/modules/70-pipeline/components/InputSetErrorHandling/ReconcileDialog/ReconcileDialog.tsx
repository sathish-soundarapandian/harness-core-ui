/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Container, Layout, PageSpinner, Text } from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { Color } from '@wings-software/design-system'
import { useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'
import { YamlDiffView } from '@pipeline/components/InputSetErrorHandling/YamlDiffView/YamlDiffView'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import type { InputSetDTO } from '@pipeline/utils/types'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import type { InputSetGitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { EntityGitDetails } from 'services/pipeline-ng'

interface ReconcileDialogProps {
  inputSet: InputSetDTO
  overlayInputSetIdentifier?: string
  oldYaml: string
  newYaml: string
  error: any
  refetchYamlDiff: () => void
  updateLoading: boolean
  onClose: () => void
  isOverlayInputSet?: boolean
  handleSubmit: (inputSetObjWithGitInfo: InputSetDTO, storeMetadata?: StoreMetadata) => Promise<void>
  yamlDiffGitDetails?: EntityGitDetails
}

export function ReconcileDialog({
  inputSet,
  overlayInputSetIdentifier,
  oldYaml,
  newYaml,
  error,
  refetchYamlDiff,
  updateLoading,
  onClose,
  isOverlayInputSet,
  handleSubmit,
  yamlDiffGitDetails
}: ReconcileDialogProps): React.ReactElement {
  const { getString } = useStrings()
  const [renderCount, setRenderCount] = useState<boolean>(true)
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { branch, connectorRef, repoName, storeType } = useQueryParams<InputSetGitQueryParams>()
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)

  const updatedObj: any = yamlParse(newYaml)
  const identifier = overlayInputSetIdentifier ?? get(inputSet, 'identifier')
  const defaultFilePath = identifier ? `.harness/${identifier}.yaml` : ''
  const storeMetadata = {
    branch: defaultTo(branch, get(yamlDiffGitDetails, 'branch')),
    connectorRef: defaultTo(connectorRef, get(inputSet, 'connectorRef')),
    repoName: defaultTo(repoName, get(yamlDiffGitDetails, 'repoName')),
    storeType: defaultTo(storeType, get(inputSet, 'storeType', StoreType.INLINE)),
    filePath: defaultTo(get(yamlDiffGitDetails, 'filePath'), defaultFilePath)
  }

  useEffect(() => {
    setRenderCount(false)
  }, [])

  useEffect(() => {
    /* istanbul ignore next */ if (!renderCount && !updateLoading) onClose()
  }, [updateLoading])

  const handleClick = (): void => {
    handleSubmit(isOverlayInputSet ? get(updatedObj, 'overlayInputSet', {}) : get(updatedObj, 'inputSet', {}), {
      ...storeMetadata
    })
    if (isGitSyncEnabled || storeMetadata.storeType === StoreType.REMOTE) onClose()
  }

  return (
    <Container>
      {updateLoading && <PageSpinner />}
      <Layout.Vertical>
        <Container
          border={{ bottom: true }}
          padding={{ top: 'large', right: 'xxxlarge', bottom: 'large', left: 'xxxlarge' }}
        >
          <Text font={{ variation: FontVariation.H4 }}>
            {getString('pipeline.inputSetErrorStrip.reconcileDialogTitle', {
              type: isOverlayInputSet ? 'OVERLAY INPUT SET' : 'INPUT SET'
            })}
          </Text>
        </Container>
        <Container
          style={{ flex: 1 }}
          width={'100%'}
          background={Color.FORM_BG}
          padding={{ top: 'large', right: 'xxxlarge', bottom: 'xxxlarge', left: 'xxxlarge' }}
        >
          <YamlDiffView oldYaml={oldYaml} newYaml={newYaml} error={error} refetchYamlDiff={refetchYamlDiff} />
        </Container>
        <Container
          border={{ bottom: true }}
          padding={{ top: 'large', right: 'xxxlarge', bottom: 'large', left: 'xxxlarge' }}
        >
          <RbacButton
            text={getString('pipeline.inputSets.removeInvalidFields')}
            width={232}
            intent="danger"
            disabled={!!error}
            permission={{
              resourceScope: {
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              },
              resource: {
                resourceType: ResourceType.PIPELINE,
                resourceIdentifier: pipelineIdentifier
              },
              permission: PermissionIdentifier.EDIT_PIPELINE
            }}
            onClick={handleClick}
            loading={updateLoading}
          />
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
