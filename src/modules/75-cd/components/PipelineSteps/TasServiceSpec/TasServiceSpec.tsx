import { get } from 'lodash-es'
import { parse } from 'mustache'
import React from 'react'
import { CompletionItemKind } from 'vscode-languageserver-types'
import type { IconName } from '@harness/icons'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { allowedArtifactTypes, ArtifactToConnectorMap } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getConnectorName, getConnectorValue } from '@triggers/components/Triggers/utils'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import {
  ServiceSpec,
  ResponsePageConnectorResponse,
  ConnectorResponse,
  getConnectorListV2Promise
} from 'services/cd-ng'
import type { K8sServiceSpecVariablesFormProps } from '../Common/GenericServiceSpec/GenericServiceSpecVariablesForm'
import type { K8SDirectServiceStep } from '../K8sServiceSpec/K8sServiceSpecInterface'
// import TasServiceSpecEditable from './TasServiceSpecEditable'
import GenericServiceSpecEditable from '../Common/GenericServiceSpec/GenericServiceSpecEditable'

const logger = loggerFor(ModuleName.CD)

const ArtifactsPrimaryRegex = /^.+artifacts\.primary\.sources\.spec\.connectorRef$/

const tasAllowedArtifactTypes: Array<ArtifactType> = allowedArtifactTypes.TAS

export class TasServiceSpec extends Step<ServiceSpec> {
  protected type = StepType.TasService
  protected defaultValues: ServiceSpec = {}

  protected stepIcon: IconName = 'tas'
  protected stepName = 'Specify Tanzu Application Services'
  protected stepPaletteVisible = false
  protected _hasStepVariables = true
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.invocationMap.set(ArtifactsPrimaryRegex, this.getArtifactsPrimaryConnectorsListForYaml.bind(this))
  }
  protected returnConnectorListFromResponse(response: ResponsePageConnectorResponse): CompletionItemInterface[] {
    return (
      response?.data?.content?.map((connector: ConnectorResponse) => ({
        label: getConnectorName(connector),
        insertText: getConnectorValue(connector),
        kind: CompletionItemKind.Field
      })) || []
    )
  }

  protected getArtifactsPrimaryConnectorsListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (tasAllowedArtifactTypes.includes(obj?.type)) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: {
            types: [ArtifactToConnectorMap.AmazonS3],
            filterType: 'Connector'
          }
        }).then(this.returnConnectorListFromResponse)
      }
    }

    return Promise.resolve([])
  }

  renderStep(props: StepProps<K8SDirectServiceStep>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, factory, customStepProps, readonly, allowableTypes } =
      props

    // if (stepViewType === StepViewType.InputVariable) {
    //   return (
    //     <ElastigroupServiceSpecVariablesForm
    //       {...(customStepProps as K8sServiceSpecVariablesFormProps)}
    //       initialValues={initialValues}
    //       stepsFactory={factory}
    //       onUpdate={onUpdate}
    //       readonly={readonly}
    //     />
    //   )
    // }

    // if (isTemplatizedView(stepViewType)) {
    //   return (
    //     <ElastigroupServiceSpecInputSetMode
    //       {...(customStepProps as K8sServiceSpecVariablesFormProps)}
    //       initialValues={initialValues}
    //       onUpdate={onUpdate}
    //       stepViewType={stepViewType}
    //       template={inputSetData?.template}
    //       path={inputSetData?.path}
    //       readonly={inputSetData?.readonly || readonly}
    //       factory={factory}
    //       allowableTypes={allowableTypes}
    //     />
    //   )
    // }

    return (
      <GenericServiceSpecEditable
        {...(customStepProps as K8sServiceSpecVariablesFormProps)}
        factory={factory}
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        path={inputSetData?.path}
        readonly={inputSetData?.readonly || readonly}
        allowableTypes={allowableTypes}
      />
    )
  }
}
