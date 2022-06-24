/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo } from 'react'
import { Layout } from '@wings-software/uicore'

import { useParams } from 'react-router-dom'

// import produce from 'immer'
import get from 'lodash-es/get'
// import set from 'lodash-es/set'

// import { defaultTo, isEmpty, merge } from 'lodash-es'

import { useGetServiceV2 } from 'services/cd-ng'
// import { useGetConnectorListV2 } from 'services/cd-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
// import { yamlParse } from '@common/utils/YamlHelperMethods'

import type { PipelineType } from '@common/interfaces/RouteInterfaces'
// import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { isServerlessDeploymentType } from '@pipeline/utils/stageHelpers'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'

// import type { Scope } from '@common/interfaces/SecretsInterface'
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

  const { accountId, orgIdentifier, projectIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      accountId: string
    }>
  >()

  const {
    data: selectedServiceResponse
    // refetch: refetchServiceData,
    // loading: serviceLoading
  } = useGetServiceV2({
    serviceIdentifier: (stage?.stage?.spec as any)?.service?.serviceRef,
    queryParams: { accountIdentifier: accountId, orgIdentifier: orgIdentifier, projectIdentifier: projectIdentifier },
    lazy: true
  })

  //   const { showError } = useToaster()
  //   const { getRBACErrorMessage } = useRBACError()

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

  //   const getServiceData = useCallback(() => {
  //     const serviceData = selectedServiceResponse?.data?.service as ServiceResponseDTO
  //     if (!isEmpty(serviceData?.yaml)) {
  //       const parsedYaml = yamlParse<NGServiceConfig>(defaultTo(serviceData.yaml, ''))
  //       return parsedYaml.service?.serviceDefinition
  //     }
  //   }, [selectedServiceResponse?.data?.service])

  //   const getConfigFilesPath = useCallback((): any => {
  //     if (!isReadonly) {
  //       const serviceData = getServiceData()
  //       return serviceData?.spec?.configFiles
  //     }

  //     if (isPropagating) {
  //       return get(stage, 'stage.spec.serviceConfig.stageOverrides.configFiles', [])
  //     }
  //     return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.configFiles', [])
  //   }, [getServiceData, isPropagating, isReadonly, stage])

  //   const updateStageData = () => {
  //     return produce(stage, draft => {
  //       if (isPropagating && draft?.stage?.spec?.serviceConfig?.stageOverrides?.configFiles) {
  //         set(draft, 'stage.spec.serviceConfig.stageOverrides.configFiles', configFiles)
  //       } else {
  //         set(draft!, 'stage.spec.serviceConfig.serviceDefinition.spec.configFiles', configFiles)
  //       }
  //     })
  //   }

  const listOfConfigFiles = useMemo(() => {
    // if (!isReadonly) {
    //   const serviceData = selectedServiceResponse?.data?.service as ServiceResponseDTO
    //   if (!isEmpty(serviceData?.yaml)) {
    //     const parsedYaml = yamlParse<NGServiceConfig>(defaultTo(serviceData.yaml, ''))
    //     const serviceInfo = parsedYaml.service?.serviceDefinition
    //     return serviceInfo?.spec.configFiles
    //   }
    //   return []
    // }
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.configFiles', [])
    }

    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.configFiles', [])
  }, [isPropagating, isReadonly, selectedServiceResponse?.data?.service, stage])

  return (
    <Layout.Vertical>
      <ConfigFilesListView
        isPropagating={isPropagating}
        pipeline={pipeline}
        updateStage={updateStage}
        stage={stage}
        // connectors={fetchedConnectorResponse}
        // refetchConnectors={refetchConnectorList}
        listOfConfigFiles={listOfConfigFiles}
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
