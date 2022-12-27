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
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
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
import type { ValidateArtifactInputSetFieldArgs, ValidateInputSetFieldArgs } from '../Common/types'

interface ProjectParamsProps {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}
const logger = loggerFor(ModuleName.CD)

const ManifestConnectorRefRegex = /^.+manifest\.spec\.store\.spec\.connectorRef$/
const ManifestConnectorRefType = 'Git'
const ArtifactsPrimaryRegex = /^.+artifacts\.primary\.spec\.connectorRef$/
const ArtifactsPrimaryTagRegex = /^.+artifacts\.primary\.spec\.tag$/

const tasAllowedArtifactTypes: Array<ArtifactType> = allowedArtifactTypes.TAS

export class TasServiceSpec extends Step<ServiceSpec> {
  protected type = StepType.TasService
  protected defaultValues: ServiceSpec = {}
  protected inputSetData: InputSetData<K8SDirectServiceStep> | undefined = undefined

  protected stepIcon: IconName = 'tas'
  protected stepName = 'Specify Tanzu Application Service'
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
    return defaultTo(response?.data?.content, []).map((connector: ConnectorResponse) => ({
      label: getConnectorName(connector),
      insertText: getConnectorValue(connector),
      kind: CompletionItemKind.Field
    }))
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
    const { accountId, projectIdentifier, orgIdentifier } = params as unknown as ProjectParamsProps

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
    const { accountId, projectIdentifier, orgIdentifier } = params as unknown as ProjectParamsProps

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
              ArtifactToConnectorMap.AmazonS3,
              ArtifactToConnectorMap.ArtifactoryRegistry,
              ArtifactToConnectorMap.Acr,
              ArtifactToConnectorMap.DockerRegistry,
              ArtifactToConnectorMap.Ecr,
              ArtifactToConnectorMap.Gcr,
              ArtifactToConnectorMap.Jenkins,
              ArtifactToConnectorMap.Nexus3Registry,
              ArtifactToConnectorMap.CustomArtifact
            ],
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

    const { accountId, projectIdentifier, orgIdentifier } = params as unknown as ProjectParamsProps

    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.artifactPath', ''))
      if (tasAllowedArtifactTypes.includes(obj?.type)) {
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
          return defaultTo(response?.data?.buildDetailsList, [])?.map(buildDetails => ({
            label: defaultTo(buildDetails.artifactPath, ''),
            insertText: defaultTo(buildDetails.artifactPath, ''),
            kind: CompletionItemKind.Field
          }))
        })
      }
    }

    return Promise.resolve([])
  }

  validateManifestInputSetFields({ data, template, isRequired, errors, getString }: ValidateInputSetFieldArgs): void {
    data?.manifests?.forEach((manifest, index) => {
      const currentManifestTemplate = get(template, `manifests[${index}].manifest.spec.store.spec`, '')

      // Git provider manifest store specific fields
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
          getString?.('fieldRequired', { field: 'File or Folder Path' })
        )
      }

      if (
        isEmpty(manifest?.manifest?.spec?.store?.spec?.filePath?.[0]) &&
        isRequired &&
        getMultiTypeFromValue(currentManifestTemplate?.filePath) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.filePath`,
          getString?.('fieldRequired', { field: 'File or Folder Path' })
        )
      }

      if (
        isEmpty(manifest?.manifest?.spec?.store?.spec?.extractionScript?.[0]) &&
        isRequired &&
        getMultiTypeFromValue(currentManifestTemplate?.extractionScript) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.extractionScript`,
          getString?.('fieldRequired', { field: 'Extraction Script' })
        )
      }

      if (
        isEmpty(manifest?.manifest?.spec?.store?.spec?.varsPaths?.[0]) &&
        isRequired &&
        getMultiTypeFromValue(currentManifestTemplate?.varsPaths) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.varsPaths`,
          getString?.('fieldRequired', { field: 'Vars Paths' })
        )
      }

      if (
        isEmpty(manifest?.manifest?.spec?.store?.spec?.autoScalerPath?.[0]) &&
        isRequired &&
        getMultiTypeFromValue(currentManifestTemplate?.autoScalerPath) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.autoScalerPath`,
          getString?.('fieldRequired', { field: 'AutoScaler Path' })
        )
      }

      // Harness manifest store spcific fields
      if (
        isEmpty(manifest?.manifest?.spec?.store?.spec?.files?.[0]) &&
        isRequired &&
        getMultiTypeFromValue(currentManifestTemplate?.files) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.files[0]`,
          getString?.('fieldRequired', { field: 'File Store' })
        )
      }

      if (
        isEmpty(manifest?.manifest?.spec?.varsPaths) &&
        isRequired &&
        getMultiTypeFromValue(get(template, `manifests[${index}].manifest.spec.varsPaths`, '')) ===
          MultiTypeInputType.RUNTIME
      ) {
        set(errors, `manifests[${index}].manifest.spec.varsPaths`, getString?.('fieldRequired', { field: 'Vars Path' }))
      }
      if (
        isEmpty(manifest?.manifest?.spec?.autoScalerPath) &&
        isRequired &&
        getMultiTypeFromValue(get(template, `manifests[${index}].manifest.spec.autoScalerPath`, '')) ===
          MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.autoScalerPath`,
          getString?.('fieldRequired', { field: 'AutoScaler Path' })
        )
      }
    })
  }

  validateConfigFields({ data, template, isRequired, errors, getString }: ValidateInputSetFieldArgs): void {
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

    if (
      isEmpty(get(data, `${dataPathToField}.repositoryUrl`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.repositoryUrl`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.repositoryUrl`, getString?.('fieldRequired', { field: 'Repository URL' }))
    }

    // ECR artifact specific fields
    if (
      isEmpty(get(data, `${dataPathToField}.region`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.region`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.region`, getString?.('fieldRequired', { field: 'Region' }))
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
    if (
      isEmpty(get(data, `${dataPathToField}.spec.artifactPath`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.spec.artifactPath`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.spec.artifactPath`, getString?.('fieldRequired', { field: 'Artifact Path' }))
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

    /** Manifest fields validation */
    this.validateManifestInputSetFields({
      data,
      template,
      isRequired,
      getString,
      errors
    })

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

    // Manifest Fields Validation
    this.validateManifestInputSetFields({
      data,
      template,
      isRequired,
      getString,
      errors
    })

    // Config Fields Validation
    this.validateConfigFields({
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
    this.inputSetData = inputSetData

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
