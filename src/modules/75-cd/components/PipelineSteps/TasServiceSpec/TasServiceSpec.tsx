/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, set, get, isEmpty, isString } from 'lodash-es'
import { parse } from 'yaml'
import type { FormikErrors } from 'formik'
import { CompletionItemKind } from 'vscode-languageserver-types'

import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { StepViewType, ValidateInputSetProps, Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import {
  ServiceSpec,
  getConnectorListV2Promise,
  getBuildDetailsForArtifactoryArtifactWithYamlPromise,
  ResponsePageConnectorResponse,
  ConnectorResponse
} from 'services/cd-ng'
import { ArtifactToConnectorMap, allowedArtifactTypes } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'

import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getConnectorName, getConnectorValue } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type { K8SDirectServiceStep } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'

import {
  GenericServiceSpecVariablesForm,
  K8sServiceSpecVariablesFormProps
} from '../Common/GenericServiceSpec/GenericServiceSpecVariablesForm'
import GenericServiceSpecEditable from '../Common/GenericServiceSpec/GenericServiceSpecEditable'
import { GenericServiceSpecInputSetMode } from '../Common/GenericServiceSpec/GenericServiceSpecInputSetMode'

const logger = loggerFor(ModuleName.CD)
const tagExists = (value: unknown): boolean => typeof value === 'number' || !isEmpty(value)

const ManifestConnectorRefRegex = /^.+manifest\.spec\.store\.spec\.connectorRef$/
const ManifestConnectorRefType = 'Git'
const ArtifactsPrimaryRegex = /^.+artifacts\.primary\.spec\.connectorRef$/
const ArtifactsPrimaryTagRegex = /^.+artifacts\.primary\.spec\.tag$/

const tasAllowedArtifactTypes: Array<ArtifactType> = allowedArtifactTypes.TAS

export class TasServiceSpec extends Step<ServiceSpec> {
  protected type = StepType.TasService
  protected defaultValues: ServiceSpec = {}

  protected stepIcon: IconName = 'service-pivotal' //TODO::  icon change to 'tas'
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
      if (tasAllowedArtifactTypes.includes(obj?.type)) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: {
            types: [
              ArtifactToConnectorMap.DockerRegistry,
              ArtifactToConnectorMap.Gcr,
              ArtifactToConnectorMap.Ecr,
              ArtifactToConnectorMap.AmazonS3
            ], // TODO:: CHECK WHY NEEDED?
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
      if (tasAllowedArtifactTypes.includes(obj?.type)) {
        return getBuildDetailsForArtifactoryArtifactWithYamlPromise({
          //TODO:: CHECK
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

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<K8SDirectServiceStep>): FormikErrors<K8SDirectServiceStep> {
    const errors: FormikErrors<K8SDirectServiceStep> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    const artifactType = !isEmpty(data?.artifacts?.primary?.sources?.[0]?.spec)
      ? 'artifacts.primary.sources[0].type'
      : 'artifacts.primary.type'
    const artifactPath = !isEmpty(data?.artifacts?.primary?.sources?.[0]?.spec)
      ? 'artifacts.primary.sources[0].spec'
      : 'artifacts.primary.spec'

    const artifactSourceTemplatePath = 'artifacts.primary.sources'

    const isArtifactSourceRuntime =
      isString(template?.artifacts?.primary?.sources) &&
      getMultiTypeFromValue(template?.artifacts?.primary?.sources) === MultiTypeInputType.RUNTIME

    if (
      isEmpty(data?.artifacts?.primary?.primaryArtifactRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.artifacts?.primary?.primaryArtifactRef) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        'artifacts.primary.primaryArtifactRef',
        getString?.('fieldRequired', { field: 'Primary Artifact Ref' })
      )
    }

    if (
      isEmpty(get(data, `${artifactPath}.connectorRef`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.connectorRef`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.connectorRef`, getString?.('fieldRequired', { field: 'ConnectorRef' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.tag`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.tag`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.tag`, getString?.('fieldRequired', { field: 'Tag' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.tagRegex`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.tagRegex`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.tagRegex`, getString?.('fieldRequired', { field: 'tagRegex' }))
    }

    if (
      isEmpty(get(data, `${artifactPath}.imagePath`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.imagePath`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.imagePath`, getString?.('fieldRequired', { field: 'Image Path' }))
    }

    if (
      !tagExists(get(data, `${artifactPath}.artifactPath`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.artifactPath`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.artifactPath`, getString?.('fieldRequired', { field: 'Artifact Path' }))
    }
    if (
      !tagExists(get(data, `${artifactPath}.spec.artifactPath`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.spec.artifactPath`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.spec.artifactPath`, getString?.('fieldRequired', { field: 'Artifact Path' }))
    }

    if (
      isEmpty(get(data, `${artifactPath}.repository`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.repository`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.repository`, getString?.('fieldRequired', { field: 'Repository' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.repositoryUrl`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.repositoryUrl`)
      ) === MultiTypeInputType.RUNTIME &&
      get(data, artifactType) !== 'ArtifactoryRegistry'
    ) {
      set(errors, `${artifactPath}.repositoryUrl`, getString?.('fieldRequired', { field: 'Repository Url' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.spec.repositoryUrl`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.spec.repositoryUrl`)
      ) === MultiTypeInputType.RUNTIME &&
      get(data, artifactType) !== 'ArtifactoryRegistry'
    ) {
      set(errors, `${artifactPath}.spec.repositoryUrl`, getString?.('fieldRequired', { field: 'Repository Url' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.repositoryPort`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.repositoryPort`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.repositoryPort`, getString?.('fieldRequired', { field: 'repository Port' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.bucketName`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.bucketName`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.bucketName`, getString?.('fieldRequired', { field: 'Bucket Name' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.filePath`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.filePath`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.filePath`, getString?.('fieldRequired', { field: 'File Path' }))
    }

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
        isEmpty(manifest?.manifest?.spec?.store?.spec?.folderPath) &&
        isRequired &&
        getMultiTypeFromValue(currentManifestTemplate?.folderPath) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.folderPath`,
          getString?.('fieldRequired', { field: 'folderPath' })
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

    // Config Files validation
    data?.configFiles?.forEach((configFile, index) => {
      const currentFileTemplate = get(template, `configFiles[${index}].configFile.spec.store.spec`, '')
      if (
        isEmpty(configFile?.configFile?.spec?.store?.spec?.files) &&
        isRequired &&
        getMultiTypeFromValue(currentFileTemplate?.files) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `configFiles[${index}].configFile.spec.store.spec.files[0]`,
          getString?.('fieldRequired', { field: 'File' })
        )
      }
      if (!isEmpty(configFile?.configFile?.spec?.store?.spec?.files)) {
        configFile?.configFile?.spec?.store?.spec?.files?.forEach((value: string, fileIndex: number) => {
          if (!value) {
            set(
              errors,
              `configFiles[${index}].configFile.spec.store.spec.files[${fileIndex}]`,
              getString?.('fieldRequired', { field: 'File' })
            )
          }
        })
      }
      if (
        isEmpty(configFile?.configFile?.spec?.store?.spec?.secretFiles) &&
        isRequired &&
        getMultiTypeFromValue(currentFileTemplate?.secretFiles) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `configFiles[${index}].configFile.spec.store.spec.secretFiles[0]`,
          getString?.('fieldRequired', { field: 'File' })
        )
      }
      if (!isEmpty(configFile?.configFile?.spec?.store?.spec?.secretFiles)) {
        configFile?.configFile?.spec?.store?.spec?.secretFiles?.forEach((value: string, secretFileIndex: number) => {
          if (!value) {
            set(
              errors,
              `configFiles[${index}].configFile.spec.store.spec.secretFiles[${secretFileIndex}]`,
              getString?.('fieldRequired', { field: 'File' })
            )
          }
        })
      }
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
