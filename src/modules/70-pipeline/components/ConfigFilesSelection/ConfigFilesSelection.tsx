/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout } from '@wings-software/uicore'

// import { useParams } from 'react-router-dom'
// import { get } from 'lodash-es'
// import { useGetConnectorListV2 } from 'services/cd-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

// import type { PipelineType } from '@common/interfaces/RouteInterfaces'
// import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { isServerlessDeploymentType } from '@pipeline/utils/stageHelpers'

// import type { Scope } from '@common/interfaces/SecretsInterface'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
// import { useDeepCompareEffect } from '@common/hooks'
// import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { ConfigFilesMap } from './ConfigFilesHelper'
import type { ConfigFilesSelectionProps, ConfigFileType } from './ConfigFilesInterface'
import ConfigFilesListView from './ConfigFilesListView/ConfigFilesListView'

export default function ConfigFilesSelection({
  isPropagating,
  deploymentType
}: ConfigFilesSelectionProps): JSX.Element {
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    updateStage,
    isReadonly,
    allowableTypes
  } = usePipelineContext()

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const [selectedConfig, setSelectedConfig] = useState<ConfigFileType>(ConfigFilesMap.Harness)
  //   const { showError } = useToaster()
  //   const { getRBACErrorMessage } = useRBACError()

  //   const { accountId, orgIdentifier, projectIdentifier } = useParams<
  //     PipelineType<{
  //       orgIdentifier: string
  //       projectIdentifier: string
  //       accountId: string
  //     }>
  //   >()
  //   const defaultQueryParams = {
  //     pageIndex: 0,
  //     pageSize: 10,
  //     searchTerm: '',
  //     accountIdentifier: accountId,
  //     orgIdentifier,
  //     projectIdentifier,
  //     includeAllConnectorsAvailableAtScope: true
  //   }
  //   const { mutate: fetchConnectors } = useGetConnectorListV2({
  //     queryParams: defaultQueryParams
  //   })

  const handleSelect = (configFile: ConfigFileType) => {
    setSelectedConfig(configFile)
  }

  //   const listOfManifests = useMemo(() => {
  //     if (isPropagating) {
  //       return get(stage, 'stage.spec.serviceConfig.stageOverrides.manifests', [])
  //     }

  //     return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', [])
  //   }, [isPropagating, stage])

  return (
    <Layout.Vertical>
      <ConfigFilesListView
        isPropagating={isPropagating}
        pipeline={pipeline}
        updateStage={updateStage}
        stage={stage}
        // connectors={fetchedConnectorResponse}
        // refetchConnectors={refetchConnectorList}
        // listOfManifests={listOfManifests}
        setSelectedConfig={handleSelect}
        selectedConfig={selectedConfig}
        isReadonly={isReadonly}
        deploymentType={deploymentType}
        allowableTypes={allowableTypes}
        allowOnlyOne={isServerlessDeploymentType(deploymentType)}
      />
    </Layout.Vertical>
  )
}
