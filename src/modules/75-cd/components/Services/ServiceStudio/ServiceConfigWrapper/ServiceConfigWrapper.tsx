/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep, defaultTo, get, isEmpty, merge, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { produce } from 'immer'
import { useQueryParams } from '@common/hooks'
import { ServicePipelineProvider } from '@cd/context/ServicePipelineContext'
import type { GitQueryParams, ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import {
  PipelineContextType,
  usePipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { DefaultNewPipelineId } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { sanitize } from '@common/utils/JSONUtils'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import { GoogleCloudFunctionsEnvType, ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { GoogleCloudFunctionDeploymentMetaData, NGServiceConfig } from 'services/cd-ng'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { useServiceContext } from '@cd/context/ServiceContext'
import { PipelineVariablesContextProvider } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import {
  DefaultNewStageId,
  DefaultNewStageName,
  initialServiceState,
  newServiceState,
  ServicePipelineConfig,
  setNameIDDescription
} from '../../utils/ServiceUtils'
import ServiceStudioDetails from '../ServiceStudioDetails'

interface ServiceConfigurationWrapperProps {
  summaryPanel?: JSX.Element
  refercedByPanel?: JSX.Element
  invokeServiceHeaderRefetch?: () => void
}
function ServiceConfigurationWrapper(props: ServiceConfigurationWrapperProps): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()
  const { serviceResponse, isServiceCreateModalView, selectedDeploymentType, gitOpsEnabled, deploymentMetadata } =
    useServiceContext()

  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = usePipelineContext()

  const { stage: pipelineStage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')

  const [isEdit] = usePermission({
    resource: {
      resourceType: ResourceType.SERVICE,
      resourceIdentifier: serviceId
    },
    permissions: [PermissionIdentifier.EDIT_SERVICE],
    options: {
      skipCondition: ({ resourceIdentifier }) => !resourceIdentifier
    }
  })

  const serviceYaml = React.useMemo(
    () => yamlParse<NGServiceConfig>(defaultTo(serviceResponse?.yaml, '')),
    [serviceResponse?.yaml]
  )
  const getServiceData = React.useCallback((): NGServiceConfig => {
    if (isServiceCreateModalView) {
      return produce(newServiceState, draft => {
        set(draft, 'service.serviceDefinition.type', selectedDeploymentType)
        if (selectedDeploymentType === ServiceDeploymentType.CustomDeployment) {
          set(
            draft,
            'service.serviceDefinition.spec.customDeploymentRef',
            pipelineStage?.stage?.spec?.customDeploymentRef
          )
        }
        if (selectedDeploymentType === ServiceDeploymentType.GoogleCloudFunctions) {
          const googleCloudFunctionsEnvType = (deploymentMetadata as GoogleCloudFunctionDeploymentMetaData)
            ?.environmentType
          if (!isEmpty(googleCloudFunctionsEnvType)) {
            set(draft, 'service.serviceDefinition.spec.environmentType', googleCloudFunctionsEnvType)
          } else {
            set(draft, 'service.serviceDefinition.spec.environmentType', GoogleCloudFunctionsEnvType.GenTwo)
          }
        }
        set(draft, 'service.gitOpsEnabled', gitOpsEnabled)
      })
    } else {
      if (!isEmpty(serviceYaml?.service?.serviceDefinition)) {
        return serviceYaml
      }
      return merge(serviceYaml, initialServiceState)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [currentService, setCurrentService] = React.useState(getServiceData())
  const currentPipeline = React.useMemo(() => {
    const defaultPipeline = {
      name: serviceYaml?.service?.name,
      identifier: defaultTo(serviceYaml?.service?.identifier, DefaultNewPipelineId),
      description: serviceYaml?.service?.description,
      tags: serviceYaml?.service?.tags,
      gitOpsEnabled: serviceYaml?.service?.gitOpsEnabled
    }
    return produce({ ...defaultPipeline }, draft => {
      if (!isEmpty(serviceYaml?.service?.serviceDefinition)) {
        set(draft, 'stages[0].stage.name', DefaultNewStageName)
        set(draft, 'stages[0].stage.identifier', DefaultNewStageId)
        set(
          draft,
          'stages[0].stage.spec.serviceConfig.serviceDefinition',
          cloneDeep(serviceYaml?.service?.serviceDefinition)
        )
        set(draft, 'stages[0].stage.spec.serviceConfig.serviceRef', serviceYaml?.service?.identifier)
      }
    })
  }, [serviceYaml])

  const createPipeline = React.useMemo(() => {
    const defaultPipeline = {
      name: '',
      identifier: ''
    }
    return produce({ ...defaultPipeline }, draft => {
      if (!isEmpty(currentService?.service?.serviceDefinition)) {
        set(draft, 'stages[0].stage.name', DefaultNewStageName)
        set(draft, 'stages[0].stage.identifier', DefaultNewStageId)
        set(draft, 'gitOpsEnabled', currentService.service?.gitOpsEnabled)
        set(
          draft,
          'stages[0].stage.spec.serviceConfig.serviceDefinition',
          cloneDeep(currentService?.service?.serviceDefinition)
        )
        set(draft, 'stages[0].stage.spec.serviceConfig.serviceRef', currentService?.service?.identifier)
      }
    })
  }, [])

  const onUpdatePipeline = async (pipelineConfig: ServicePipelineConfig): Promise<void> => {
    const stage = get(pipelineConfig, 'stages[0].stage.spec.serviceConfig.serviceDefinition')
    sanitize(stage, { removeEmptyArray: false, removeEmptyObject: false, removeEmptyString: false })

    const updatedService = produce(currentService, draft => {
      setNameIDDescription(draft.service as PipelineInfoConfig, pipelineConfig)
      set(draft, 'service.serviceDefinition', stage)
    })
    setCurrentService(updatedService)
  }

  return (
    <ServicePipelineProvider
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }}
      initialValue={isServiceCreateModalView ? createPipeline : (currentPipeline as PipelineInfoConfig)}
      onUpdatePipeline={onUpdatePipeline}
      serviceIdentifier={serviceId}
      contextType={PipelineContextType.Pipeline}
      isReadOnly={!isEdit}
    >
      <PipelineVariablesContextProvider
        pipeline={isServiceCreateModalView ? createPipeline : (currentPipeline as PipelineInfoConfig)}
      >
        <ServiceStudioDetails serviceData={currentService} {...props} />
      </PipelineVariablesContextProvider>
    </ServicePipelineProvider>
  )
}

export default ServiceConfigurationWrapper
