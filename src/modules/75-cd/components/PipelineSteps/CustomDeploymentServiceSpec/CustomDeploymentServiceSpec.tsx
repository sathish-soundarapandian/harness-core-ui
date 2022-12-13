/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, set, get, isEmpty, isArray } from 'lodash-es'
import { parse } from 'yaml'
import type { FormikErrors } from 'formik'
import { CompletionItemKind } from 'vscode-languageserver-types'

import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import {
  StepViewType,
  ValidateInputSetProps,
  Step,
  StepProps,
  InputSetData
} from '@pipeline/components/AbstractSteps/Step'
import {
  ServiceSpec,
  getConnectorListV2Promise,
  getBuildDetailsForArtifactoryArtifactWithYamlPromise,
  ResponsePageConnectorResponse,
  ConnectorResponse
} from 'services/cd-ng'
import {
  ArtifactToConnectorMap,
  allowedArtifactTypes,
  ENABLED_ARTIFACT_TYPES
} from '@pipeline/components/ArtifactsSelection/ArtifactHelper'

import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getConnectorName, getConnectorValue } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type { K8SDirectServiceStep } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
import CustomDeploymentServiceSpecEditable from './CustomDeploymentServiceSpecEditable'
import {
  CustomDeploymentServiceSpecVariablesFormProps,
  CustomDeploymentSpecVariablesForm
} from './CustomDeploymentServiceSpecVariablesForm'
import { CustomDeploymentServiceSpecInputSetMode } from './CustomDeploymentServiceSpecInputSetMode'
import type { ValidateArtifactInputSetFieldArgs, ValidateInputSetFieldArgs } from '../Common/types'

const logger = loggerFor(ModuleName.CD)

const ArtifactsPrimaryRegex = /^.+artifacts\.primary\.spec\.connectorRef$/
const ArtifactsPrimaryTagRegex = /^.+artifacts\.primary\.spec\.artifactPath$/

const customDeplpoymenyAllowedArtifactTypes: Array<ArtifactType> = allowedArtifactTypes.CustomDeployment

export class CustomDeploymentServiceSpec extends Step<ServiceSpec> {
  protected type = StepType.CustomDeploymentServiceSpec
  protected defaultValues: ServiceSpec = {}

  protected inputSetData: InputSetData<K8SDirectServiceStep> | undefined = undefined
  protected stepIcon: IconName = 'template-library'
  protected stepName = 'Deplyment Template Type'
  protected stepPaletteVisible = false
  protected _hasStepVariables = true
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.invocationMap.set(ArtifactsPrimaryRegex, this.getArtifactsPrimaryConnectorsListForYaml.bind(this))
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
      if (customDeplpoymenyAllowedArtifactTypes.includes(obj?.type)) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: {
            types: [ArtifactToConnectorMap.ArtifactoryRegistry],
            filterType: 'Connector'
          }
        }).then(this.returnConnectorListFromResponse)
      }
    }

    return Promise.resolve([])
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
      const obj = get(pipelineObj, path.replace('.spec.artifactPath', ''))
      if (customDeplpoymenyAllowedArtifactTypes.includes(obj?.type)) {
        return getBuildDetailsForArtifactoryArtifactWithYamlPromise({
          queryParams: {
            artifactPath: obj.spec?.artifactDirectory,
            repository: obj.spec?.repository,
            repositoryFormat: 'generic',
            connectorRef: obj.spec?.connectorRef,
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            pipelineIdentifier: pipelineObj.identifier,
            fqnPath: path
          },
          body: yamlStringify({
            pipeline: pipelineObj
          })
        }).then(response => {
          return (
            response?.data?.buildDetailsList?.map(buildDetails => ({
              label: defaultTo(buildDetails.artifactPath, ''),
              insertText: defaultTo(buildDetails.artifactPath, ''),
              kind: CompletionItemKind.Field
            })) || []
          )
        })
      }
    }

    return Promise.resolve([])
  }

  validateArtifactInputSetFields({
    artifactType,
    data,
    dataPathToField,
    template,
    templatePathToField,
    getString,
    isRequired,
    errors
  }: ValidateArtifactInputSetFieldArgs) {
    /** Most common artifact fields */
    if (
      isEmpty(get(data, `${dataPathToField}.connectorRef`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.connectorRef`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.connectorRef`, getString?.('fieldRequired', { field: 'Artifact Server' }))
    }
    if (
      isEmpty(get(data, `${dataPathToField}.imagePath`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.imagePath`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.imagePath`, getString?.('fieldRequired', { field: 'Image Path' }))
    }
    if (
      isEmpty(get(data, `${dataPathToField}.tag`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.tag`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.tag`, getString?.('fieldRequired', { field: 'Tag' }))
    }
    if (
      isEmpty(get(data, `${dataPathToField}.tagRegex`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.tagRegex`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.tagRegex`, getString?.('fieldRequired', { field: 'Tag Regex' }))
    }

    if (
      isEmpty(get(data, `${dataPathToField}.repository`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.repository`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.repository`, getString?.('fieldRequired', { field: 'Repository' }))
    }
    if (
      isEmpty(get(data, `${dataPathToField}.artifactDirectory`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.artifactDirectory`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.artifactDirectory`, getString?.('fieldRequired', { field: 'Artifact Directory' }))
    }

    if (
      isEmpty(get(data, `${dataPathToField}.artifactPath`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.artifactPath`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.artifactPath`, getString?.('fieldRequired', { field: 'Artifact Path' }))
    }
    if (
      isEmpty(get(data, `${dataPathToField}.artifactPathFilter`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.artifactPathFilter`)) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        `${dataPathToField}.artifactPathFilter`,
        getString?.('fieldRequired', { field: 'Artifact Path Filter' })
      )
    }
    // ECR artifact specific fields
    if (artifactType !== ENABLED_ARTIFACT_TYPES.AmazonS3) {
      if (
        isEmpty(get(data, `${dataPathToField}.region`)) &&
        isRequired &&
        getMultiTypeFromValue(get(template, `${templatePathToField}.region`)) === MultiTypeInputType.RUNTIME
      ) {
        set(errors, `${dataPathToField}.region`, getString?.('fieldRequired', { field: 'Region' }))
      }
    }

    // Nexus3 artifact specific fields
    if (artifactType === ENABLED_ARTIFACT_TYPES.Nexus3Registry) {
      if (
        isEmpty(get(data, `${dataPathToField}.spec.repositoryUrl`)) &&
        isRequired &&
        getMultiTypeFromValue(get(template, `${templatePathToField}.spec.repositoryUrl`)) === MultiTypeInputType.RUNTIME
      ) {
        set(errors, `${dataPathToField}.spec.repositoryUrl`, getString?.('fieldRequired', { field: 'Repository URL' }))
      }
    }
    if (artifactType !== ENABLED_ARTIFACT_TYPES.Jenkins) {
      if (
        isEmpty(get(data, `${dataPathToField}.spec.artifactPath`)) &&
        isRequired &&
        getMultiTypeFromValue(get(template, `${templatePathToField}.spec.artifactPath`)) === MultiTypeInputType.RUNTIME
      ) {
        set(errors, `${dataPathToField}.spec.artifactPath`, getString?.('fieldRequired', { field: 'Artifact Path' }))
      }
    }

    // GCR artifact specific fields
    if (
      isEmpty(get(data, `${dataPathToField}.registryHostname`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.registryHostname`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.registryHostname`, getString?.('fieldRequired', { field: 'GCR Registry URL' }))
    }

    // Amazon S3 artifact specific field
    if (
      isEmpty(get(data, `${dataPathToField}.bucketName`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.bucketName`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.bucketName`, getString?.('fieldRequired', { field: 'Bucket Name' }))
    }
    if (
      isEmpty(get(data, `${dataPathToField}.filePath`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.filePath`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.filePath`, getString?.('fieldRequired', { field: 'File Path' }))
    }
    if (
      isEmpty(get(data, `${dataPathToField}.filePathRegex`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.filePathRegex`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.filePathRegex`, getString?.('fieldRequired', { field: 'File Path Regex' }))
    }

    // ACR artifact specific fields
    if (
      isEmpty(get(data, `${dataPathToField}.subscriptionId`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.subscriptionId`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.subscriptionId`, getString?.('fieldRequired', { field: 'Subscription Id' }))
    }
    if (
      isEmpty(get(data, `${dataPathToField}.registry`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.registry`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.registry`, getString?.('fieldRequired', { field: 'Registry' }))
    }
    // Jenkins specific
    if (
      isEmpty(get(data, `${dataPathToField}.build`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.build`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.build`, getString?.('fieldRequired', { field: 'Build' }))
    }
    if (
      isEmpty(get(data, `${dataPathToField}.jobName`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.jobName`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.jobName`, getString?.('fieldRequired', { field: 'Job Name' }))
    }

    // Google Artifact Registry Specific
    if (
      isEmpty(get(data, `${dataPathToField}.project`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.project`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.project`, getString?.('fieldRequired', { field: 'Project' }))
    }

    if (
      isEmpty(get(data, `${dataPathToField}.repositoryName`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.repositoryName`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.repositoryName`, getString?.('fieldRequired', { field: 'Repository Name' }))
    }
    if (
      isEmpty(get(data, `${dataPathToField}.package`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.package`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.package`, getString?.('fieldRequired', { field: 'Package' }))
    }

    // Custom artifact specific fields
    if (
      isEmpty(get(data, `${dataPathToField}.timeout`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.timeout`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.timeout`, getString?.('fieldRequired', { field: 'Timeout' }))
    }
    if (
      isEmpty(get(data, `${dataPathToField}.scripts.fetchAllArtifacts.spec.source.spec.script`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, `${templatePathToField}.scripts.fetchAllArtifacts.spec.source.spec.script`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        `${dataPathToField}.scripts.fetchAllArtifacts.spec.source.spec.script`,
        getString?.('fieldRequired', { field: 'Script' })
      )
    }
    if (
      isEmpty(get(data, `${dataPathToField}.scripts.fetchAllArtifacts.artifactsArrayPath`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.scripts.fetchAllArtifacts.artifactsArrayPath`)) ===
        MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        `${dataPathToField}.scripts.fetchAllArtifacts.artifactsArrayPath`,
        getString?.('fieldRequired', { field: 'Artifacts Array Path' })
      )
    }
    if (
      isEmpty(get(data, `${dataPathToField}.scripts.fetchAllArtifacts.versionPath`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.scripts.fetchAllArtifacts.versionPath`)) ===
        MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        `${dataPathToField}.scripts.fetchAllArtifacts.versionPath`,
        getString?.('fieldRequired', { field: 'Version Path' })
      )
    }
    if (
      isEmpty(get(data, `${dataPathToField}.version`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.version`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.version`, getString?.('fieldRequired', { field: 'Version' }))
    }
  }

  validatePrimaryArtifactInputSetFields({
    data,
    template,
    getString,
    isRequired,
    errors
  }: ValidateInputSetFieldArgs): void {
    this.validateArtifactInputSetFields({
      artifactType: data.artifacts?.primary?.type,
      data,
      dataPathToField: 'artifacts.primary.spec',
      template,
      templatePathToField: 'artifacts.primary.spec',
      getString,
      isRequired,
      errors
    })
  }

  validatePrimaryArtifactSourcesInputSetFields({
    data,
    template,
    getString,
    isRequired,
    errors
  }: ValidateInputSetFieldArgs): void {
    if (
      isEmpty(data?.artifacts?.primary?.primaryArtifactRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.artifacts?.primary?.primaryArtifactRef) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'artifacts.primary.primaryArtifactRef', getString?.('fieldRequired', { field: 'Primary Artifact' }))
    }
    if (isArray(data?.artifacts?.primary?.sources)) {
      data?.artifacts?.primary?.sources?.forEach((_artifactSource, index) => {
        this.validateArtifactInputSetFields({
          artifactType: data?.artifacts?.primary?.sources?.[index].type,
          data,
          dataPathToField: `artifacts.primary.sources[${index}].spec`,
          template,
          templatePathToField: `artifacts.primary.sources[${index}].spec`,
          getString,
          isRequired,
          errors
        })
      })
    }
  }

  validateInputSet({
    data,
    getString,
    viewType
  }: ValidateInputSetProps<K8SDirectServiceStep>): FormikErrors<K8SDirectServiceStep> {
    const errors: FormikErrors<K8SDirectServiceStep> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    const template = this.inputSetData?.template

    /** Primary Artifact fields validation */
    this.validatePrimaryArtifactInputSetFields({
      data,
      template,
      getString,
      isRequired,
      errors
    })

    /** Primary Artifact Sources fields validation */
    this.validatePrimaryArtifactSourcesInputSetFields({
      data,
      template,
      getString,
      isRequired,
      errors
    })

    return errors
  }

  renderStep(props: StepProps<K8SDirectServiceStep>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, factory, customStepProps, readonly, allowableTypes } =
      props

    this.inputSetData = inputSetData
    if (stepViewType === StepViewType.InputVariable) {
      return (
        <CustomDeploymentSpecVariablesForm
          {...(customStepProps as CustomDeploymentServiceSpecVariablesFormProps)}
          initialValues={initialValues}
          stepsFactory={factory}
          onUpdate={onUpdate}
          readonly={readonly}
        />
      )
    }

    if (isTemplatizedView(stepViewType)) {
      return (
        <CustomDeploymentServiceSpecInputSetMode
          {...(customStepProps as CustomDeploymentServiceSpecVariablesFormProps)}
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
      <CustomDeploymentServiceSpecEditable
        {...(customStepProps as CustomDeploymentServiceSpecVariablesFormProps)}
        factory={factory}
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        path={inputSetData?.path}
        readonly={readonly}
        allowableTypes={allowableTypes}
      />
    )
  }
}
