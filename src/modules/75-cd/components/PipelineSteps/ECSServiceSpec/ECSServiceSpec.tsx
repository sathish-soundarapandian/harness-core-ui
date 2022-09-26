/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, set, get, isEmpty } from 'lodash-es'
import { parse } from 'yaml'
import type { FormikErrors } from 'formik'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'

import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import {
  ServiceSpec,
  getConnectorListV2Promise,
  getBuildDetailsForArtifactoryArtifactWithYamlPromise,
  ResponsePageConnectorResponse,
  ConnectorResponse,
  getBuildDetailsForDockerPromise,
  getBuildDetailsForEcrPromise,
  getBuildDetailsForNexusArtifactPromise,
  ResponseArtifactoryResponseDTO,
  ArtifactoryBuildDetailsDTO
} from 'services/cd-ng'
import type { StringsMap } from 'framework/strings/StringsContext'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import {
  ArtifactToConnectorMap,
  allowedArtifactTypes,
  ENABLED_ARTIFACT_TYPES
} from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { StepViewType, ValidateInputSetProps, Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type { K8SDirectServiceStep } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
import { getConnectorName, getConnectorValue } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import {
  GenericServiceSpecVariablesForm,
  K8sServiceSpecVariablesFormProps
} from '../Common/GenericServiceSpec/GenericServiceSpecVariablesForm'
import { GenericServiceSpecInputSetMode } from '../Common/GenericServiceSpec/GenericServiceSpecInputSetMode'
import { ECSServiceSpecEditable } from './ECSServiceSpecEditable'

interface ValidateInputSetField {
  data: K8SDirectServiceStep
  template?: K8SDirectServiceStep
  isRequired: boolean
  errors: FormikErrors<K8SDirectServiceStep>
  getString: ((key: keyof StringsMap, vars?: Record<string, string> | undefined) => string) | undefined
}

const logger = loggerFor(ModuleName.CD)
const tagExists = (value: unknown): boolean => typeof value === 'number' || !isEmpty(value)

const ManifestConnectorRefRegex = /^.+manifest\.spec\.store\.spec\.connectorRef$/
const ManifestConnectorRefType = 'Git'
const ArtifactsPrimaryRegex = /^.+artifacts\.primary\.spec\.connectorRef$/
const ArtifactsPrimaryTagRegex = /^.+artifacts\.primary\.spec\.artifactPath$/

const ecsAllowedArtifactTypes: Array<ArtifactType> = allowedArtifactTypes.ECS

export class ECSServiceSpec extends Step<ServiceSpec> {
  protected type = StepType.EcsService
  protected defaultValues: ServiceSpec = {}

  protected stepIcon: IconName = 'service-amazon-ecs'
  protected stepName = 'Deployment Service'
  protected stepPaletteVisible = false
  protected _hasStepVariables = true
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.invocationMap.set(ArtifactsPrimaryRegex, this.getArtifactsPrimaryConnectorsListForYaml.bind(this))
    this.invocationMap.set(ManifestConnectorRefRegex, this.getManifestConnectorsListForYaml.bind(this))
    this.invocationMap.set(ArtifactsPrimaryTagRegex, this.getArtifactsTagsListForYaml.bind(this))
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

  protected getManifestConnectorsListForYaml(
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
      if (obj?.type === ManifestConnectorRefType) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: ['Git', 'Github', 'Gitlab', 'Bitbucket'], filterType: 'Connector' }
        }).then(this.returnConnectorListFromResponse)
      }
    }

    return Promise.resolve([])
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
      if (ecsAllowedArtifactTypes.includes(obj?.type)) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: {
            types: [
              ArtifactToConnectorMap.Jenkins,
              ArtifactToConnectorMap.ArtifactoryRegistry,
              ArtifactToConnectorMap.DockerRegistry,
              ArtifactToConnectorMap.Ecr,
              ArtifactToConnectorMap.Nexus3Registry
            ],
            filterType: 'Connector'
          }
        }).then(this.returnConnectorListFromResponse)
      }
    }

    return Promise.resolve([])
  }

  trasformTagData(response: ResponseArtifactoryResponseDTO): CompletionItemInterface[] {
    const data = response?.data?.buildDetailsList?.map((buildDetails: ArtifactoryBuildDetailsDTO) => ({
      label: defaultTo(buildDetails.tag, ''),
      insertText: defaultTo(buildDetails.tag, ''),
      kind: CompletionItemKind.Field
    }))
    return defaultTo(data, [])
  }

  protected getArtifactsTagsListForYaml(
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
      const obj = get(pipelineObj, path.replace('.spec.tag', ''))
      if (ecsAllowedArtifactTypes.includes(obj?.type)) {
        switch (obj.type) {
          case ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry: {
            return getBuildDetailsForArtifactoryArtifactWithYamlPromise({
              queryParams: {
                artifactPath: obj.spec?.artifactPath,
                repository: obj.spec?.repository,
                repositoryFormat: 'docker',
                connectorRef: obj.spec?.connectorRef,
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier,
                pipelineIdentifier: pipelineObj.identifier,
                fqnPath: path
              },
              body: yamlStringify(pipelineObj)
            }).then(response => this.trasformTagData(response))
          }
          case ENABLED_ARTIFACT_TYPES.DockerRegistry: {
            return getBuildDetailsForDockerPromise({
              queryParams: {
                imagePath: obj.spec?.imagePath,
                connectorRef: obj.spec?.connectorRef,
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              }
            }).then(response => this.trasformTagData(response))
          }
          case ENABLED_ARTIFACT_TYPES.Ecr: {
            return getBuildDetailsForEcrPromise({
              queryParams: {
                imagePath: obj.spec?.imagePath,
                region: obj.spec?.region,
                connectorRef: obj.spec?.connectorRef,
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              }
            }).then(response => this.trasformTagData(response))
          }
          case ENABLED_ARTIFACT_TYPES.Nexus3Registry: {
            return getBuildDetailsForNexusArtifactPromise({
              queryParams: {
                artifactPath: obj.spec?.artifactPath,
                repository: obj.spec?.repository,
                repositoryFormat: 'docker',
                connectorRef: obj.spec?.connectorRef,
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              }
            }).then(response => this.trasformTagData(response))
          }
        }
      }
    }

    return Promise.resolve([])
  }

  validateSidecarInputSetFields({ data, template, isRequired, errors, getString }: ValidateInputSetField): void {
    data?.artifacts?.sidecars?.forEach((sidecar, index) => {
      const currentSidecarTemplate = get(template, `artifacts.sidecars[${index}].sidecar.spec`, '')
      if (
        isEmpty(sidecar?.sidecar?.spec?.connectorRef) &&
        isRequired &&
        getMultiTypeFromValue(currentSidecarTemplate?.connectorRef) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `artifacts.sidecars[${index}].sidecar.spec.connectorRef`,
          getString?.('fieldRequired', { field: 'Artifact Server' })
        )
      }
      if (
        isEmpty(sidecar?.sidecar?.spec?.imagePath) &&
        isRequired &&
        getMultiTypeFromValue(currentSidecarTemplate?.imagePath) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `artifacts.sidecars[${index}].sidecar.spec.imagePath`,
          getString?.('fieldRequired', { field: 'Image Path' })
        )
      }
      if (
        !tagExists(sidecar?.sidecar?.spec?.tag) &&
        isRequired &&
        getMultiTypeFromValue(currentSidecarTemplate?.tag) === MultiTypeInputType.RUNTIME
      ) {
        set(errors, `artifacts.sidecars[${index}].sidecar.spec.tag`, getString?.('fieldRequired', { field: 'Tag' }))
      }
      if (
        isEmpty(sidecar?.sidecar?.spec?.tagRegex) &&
        isRequired &&
        getMultiTypeFromValue(currentSidecarTemplate?.tagRegex) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `artifacts.sidecars[${index}].sidecar.spec.tagRegex`,
          getString?.('fieldRequired', { field: 'Tag Regex' })
        )
      }
      if (
        isEmpty(sidecar?.sidecar?.spec?.registryHostname) &&
        isRequired &&
        getMultiTypeFromValue(currentSidecarTemplate?.registryHostname) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `artifacts.sidecars[${index}].sidecar.spec.registryHostname`,
          getString?.('fieldRequired', { field: 'GCR Registry URL' })
        )
      }
    })
  }

  validateManifestInputSetFields({ data, template, isRequired, errors, getString }: ValidateInputSetField): void {
    data?.manifests?.forEach((manifest, index) => {
      const currentManifestTemplate = get(template, `manifests[${index}].manifest.spec.store.spec`, '')
      if (
        isEmpty(manifest?.manifest?.spec?.store?.spec?.connectorRef) &&
        isRequired &&
        getMultiTypeFromValue(currentManifestTemplate?.connectorRef) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.connectorRef`,
          getString?.('fieldRequired', { field: 'connectorRef' })
        )
      }
      if (
        isEmpty(manifest?.manifest?.spec?.store?.spec?.branch) &&
        isRequired &&
        getMultiTypeFromValue(currentManifestTemplate?.branch) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.branch`,
          getString?.('fieldRequired', { field: 'Branch' })
        )
      }
      if (
        isEmpty(manifest?.manifest?.spec?.store?.spec?.paths?.[0]) &&
        isRequired &&
        getMultiTypeFromValue(currentManifestTemplate?.paths) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.paths`,
          getString?.('fieldRequired', { field: 'Paths' })
        )
      }
    })
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<K8SDirectServiceStep>): FormikErrors<K8SDirectServiceStep> {
    const errors: FormikErrors<K8SDirectServiceStep> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      isEmpty(data?.artifacts?.primary?.spec?.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'artifacts.primary.spec.connectorRef', getString?.('fieldRequired', { field: 'ConnectorRef' }))
    }
    if (
      isEmpty(data?.artifacts?.primary?.spec?.imagePath) &&
      isRequired &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.imagePath) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'artifacts.primary.spec.imagePath', getString?.('fieldRequired', { field: 'Image Path' }))
    }
    if (
      !tagExists(data?.artifacts?.primary?.spec?.tag) &&
      isRequired &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.tag) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'artifacts.primary.spec.tag', getString?.('fieldRequired', { field: 'Tag' }))
    }
    if (
      isEmpty(data?.artifacts?.primary?.spec?.tagRegex) &&
      isRequired &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.tagRegex) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'artifacts.primary.spec.tagRegex', getString?.('fieldRequired', { field: 'Tag Regex' }))
    }

    this.validateSidecarInputSetFields({
      data,
      template,
      isRequired,
      getString,
      errors
    })

    this.validateManifestInputSetFields({
      data,
      template,
      isRequired,
      getString,
      errors
    })

    return errors
  }

  renderStep(props: StepProps<K8SDirectServiceStep>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, factory, customStepProps, readonly, allowableTypes } =
      props

    if (stepViewType === StepViewType.InputVariable) {
      return (
        <GenericServiceSpecVariablesForm
          {...(customStepProps as K8sServiceSpecVariablesFormProps)}
          initialValues={initialValues}
          stepsFactory={factory}
          onUpdate={onUpdate}
          readonly={readonly}
        />
      )
    }

    if (isTemplatizedView(stepViewType)) {
      return (
        <GenericServiceSpecInputSetMode
          {...(customStepProps as K8sServiceSpecVariablesFormProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          path={inputSetData?.path}
          readonly={inputSetData?.readonly || readonly}
          factory={factory}
          allowableTypes={allowableTypes}
        />
      )
    }

    return (
      <ECSServiceSpecEditable
        {...(customStepProps as K8sServiceSpecVariablesFormProps)}
        factory={factory}
        initialValues={initialValues}
        onUpdate={onUpdate}
        readonly={inputSetData?.readonly || readonly}
      />
    )
  }
}
