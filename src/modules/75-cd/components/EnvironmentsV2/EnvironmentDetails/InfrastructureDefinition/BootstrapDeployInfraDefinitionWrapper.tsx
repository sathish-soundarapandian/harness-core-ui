import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import { defaultTo, merge, set } from 'lodash-es'
import produce from 'immer'

import type { InfrastructureConfig, InfrastructureDefinitionConfig } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { DefaultPipeline } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import type {
  GetTemplateProps,
  GetTemplateResponse
} from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { DefaultNewStageId, DefaultNewStageName } from '@cd/components/Services/utils/ServiceUtils'
import { ServiceDeploymentType, StageType } from '@pipeline/utils/stageHelpers'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { Scope } from '@common/interfaces/SecretsInterface'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { InfrastructurePipelineProvider } from '@cd/context/InfrastructurePipelineContext'
import type { PipelineInfoConfig, TemplateLinkConfig } from 'services/pipeline-ng'
import { PipelineVariablesContextProvider } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { DeployStageErrorProvider } from '@pipeline/context/StageErrorContext'
import { BootstrapDeployInfraDefinitionWithRef } from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/BootstrapDeployInfraDefinition'

export interface InfraDefinitionWrapperRef {
  saveInfrastructure: () => void
}

interface WrapperProps {
  closeInfraDefinitionDetails: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetch: any
  scope: Scope
  selectedInfrastructure?: string
  environmentIdentifier: string
  stageDeploymentType?: ServiceDeploymentType
  stageCustomDeploymentData?: TemplateLinkConfig
  getTemplate?: (data: GetTemplateProps) => Promise<GetTemplateResponse>
  isDrawerView?: boolean
  setInfraSaveInProgress?: (data: boolean) => void
}

export function BootstrapDeployInfraDefinitionWrapper(
  props: WrapperProps,
  infraDefinitionFormRef: React.ForwardedRef<InfraDefinitionWrapperRef>
) {
  const {
    closeInfraDefinitionDetails,
    refetch,
    selectedInfrastructure,
    environmentIdentifier,
    stageDeploymentType,
    stageCustomDeploymentData,
    getTemplate,
    scope,
    isDrawerView = false,
    setInfraSaveInProgress
  } = props

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const infrastructureDefinition = useMemo(() => {
    return /* istanbul ignore next */ (parse(defaultTo(selectedInfrastructure, '{}')) as InfrastructureConfig)
      ?.infrastructureDefinition
  }, [selectedInfrastructure])

  const { type, spec, allowSimultaneousDeployments, deploymentType, identifier } = defaultTo(
    infrastructureDefinition,
    {}
  ) as InfrastructureDefinitionConfig

  const pipeline = React.useMemo(
    () =>
      produce({ ...DefaultPipeline }, draft => {
        set(
          draft,
          'stages[0].stage',
          merge({}, {} as DeploymentStageElementConfig, {
            name: DefaultNewStageName,
            identifier: DefaultNewStageId,
            type: StageType.DEPLOY,
            spec: {
              infrastructure: {
                infrastructureDefinition: {
                  ...(Boolean(type) && { type }),
                  ...(Boolean(spec) && { spec })
                },
                allowSimultaneousDeployments: Boolean(allowSimultaneousDeployments)
              },
              serviceConfig: {
                serviceDefinition: {
                  type: deploymentType
                }
              }
            }
          })
        )
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const [canEditInfrastructure] = usePermission(
    {
      resource: {
        resourceType: ResourceType.ENVIRONMENT,
        resourceIdentifier: environmentIdentifier
      },
      resourceScope: {
        accountIdentifier: accountId,
        ...(scope !== Scope.ACCOUNT && { orgIdentifier }),
        ...(scope === Scope.PROJECT && { projectIdentifier })
      },
      permissions: [PermissionIdentifier.EDIT_ENVIRONMENT]
    },
    [identifier]
  )

  return (
    <InfrastructurePipelineProvider
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier }}
      initialValue={pipeline as PipelineInfoConfig}
      isReadOnly={!canEditInfrastructure}
    >
      <PipelineVariablesContextProvider pipeline={pipeline}>
        <DeployStageErrorProvider>
          <BootstrapDeployInfraDefinitionWithRef
            closeInfraDefinitionDetails={closeInfraDefinitionDetails}
            refetch={refetch}
            infrastructureDefinition={infrastructureDefinition}
            environmentIdentifier={environmentIdentifier}
            stageDeploymentType={(deploymentType as Partial<ServiceDeploymentType>) || stageDeploymentType}
            isReadOnly={!canEditInfrastructure}
            getTemplate={getTemplate}
            stageCustomDeploymentData={stageCustomDeploymentData}
            selectedInfrastructure={selectedInfrastructure}
            scope={scope}
            isDrawerView={isDrawerView}
            ref={infraDefinitionFormRef}
            setInfraSaveInProgress={setInfraSaveInProgress}
          />
        </DeployStageErrorProvider>
      </PipelineVariablesContextProvider>
    </InfrastructurePipelineProvider>
  )
}

export const BootstrapDeployInfraDefinitionWrapperWithRef = React.forwardRef(BootstrapDeployInfraDefinitionWrapper)
