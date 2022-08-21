/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Container, Layout, Text } from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { Color } from '@wings-software/design-system'
import { defaultTo, get } from 'lodash-es'
import { YamlDiffView } from '@pipeline/components/InputSetErrorHandling/YamlDiffView/YamlDiffView'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import type { InputSetDTO } from '@pipeline/utils/types'
import type { EntityGitDetails } from 'services/pipeline-ng'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import type { InputSetGitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'

interface ReconcileDialogProps {
  inputSet: InputSetDTO
  overlayInputSetIdentifier?: string
  canUpdateInputSet: boolean
  oldYaml: string
  newYaml: string
  error: any
  refetchYamlDiff: () => void
  updateLoading: boolean
  onClose: () => void
  isOverlayInputSet?: boolean
  handleSubmit?: (
    inputSetObjWithGitInfo: InputSetDTO,
    gitDetails?: EntityGitDetails,
    storeMetadata?: StoreMetadata
  ) => Promise<void>
}

export function ReconcileDialog({
  inputSet,
  overlayInputSetIdentifier,
  canUpdateInputSet,
  oldYaml,
  newYaml,
  error,
  refetchYamlDiff,
  updateLoading,
  onClose,
  isOverlayInputSet,
  handleSubmit
}: ReconcileDialogProps): React.ReactElement {
  const { getString } = useStrings()
  const [renderCount, setRenderCount] = useState<boolean>(true)
  const { repoIdentifier, branch, connectorRef, repoName, storeType } = useQueryParams<InputSetGitQueryParams>()
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)

  const updatedObj: any = yamlParse(newYaml)
  const identifier = overlayInputSetIdentifier ?? inputSet?.identifier
  const defaultFilePath = identifier ? `.harness/${identifier}.yaml` : ''
  const storeMetadata = {
    repo: isGitSyncEnabled ? defaultTo(repoIdentifier, '') : defaultTo(repoName, ''),
    branch: defaultTo(branch, ''),
    connectorRef: defaultTo(connectorRef, ''),
    repoName: defaultTo(repoName, ''),
    storeType: defaultTo(storeType, StoreType.INLINE),
    filePath: defaultTo(inputSet.gitDetails?.filePath, defaultFilePath)
  }

  useEffect(() => {
    setRenderCount(false)
  }, [])

  useEffect(() => {
    if (!renderCount && !updateLoading) onClose()
  }, [updateLoading])

  const handleClick = (): void => {
    handleSubmit?.(
      overlayInputSetIdentifier || isOverlayInputSet
        ? get(updatedObj, 'overlayInputSet', {})
        : get(updatedObj, 'inputSet', {}),
      { ...storeMetadata }
    )
    ;(isGitSyncEnabled || storeMetadata.storeType === StoreType.REMOTE) && onClose()
  }

  return (
    <Container>
      <Layout.Vertical>
        <Container
          border={{ bottom: true }}
          padding={{ top: 'large', right: 'xxxlarge', bottom: 'large', left: 'xxxlarge' }}
        >
          <Text font={{ variation: FontVariation.H4 }}>
            {overlayInputSetIdentifier ? ' OVERLAY INPUT SET ERROR INSPECTION' : 'INPUT SET ERROR INSPECTION'}
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
            disabled={!canUpdateInputSet}
            onClick={handleClick}
            loading={updateLoading}
          />
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
