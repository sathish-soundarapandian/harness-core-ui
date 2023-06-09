/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, set, isEmpty, isArray } from 'lodash-es'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import type { FormikErrors } from 'formik'
import { StepViewType, ValidateInputSetProps, Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import {
  ServiceSpec,
  getConnectorListV2Promise,
  getBuildDetailsForDockerPromise,
  getBuildDetailsForGcrPromise,
  getBuildDetailsForEcrPromise
} from 'services/cd-ng'
import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'

import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getConnectorName, getConnectorValue } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import {
  GenericServiceSpecVariablesForm,
  K8sServiceSpecVariablesFormProps
} from '../Common/GenericServiceSpec/GenericServiceSpecVariablesForm'
import type { K8SDirectServiceStep } from './K8sServiceSpecInterface'
import GenericServiceSpecEditable from '../Common/GenericServiceSpec/GenericServiceSpecEditable'
import { GenericServiceSpecInputSetMode as GenericServiceSpecInputSetMode } from '../Common/GenericServiceSpec/GenericServiceSpecInputSetMode'
import type { ValidateArtifactInputSetFieldArgs, ValidateInputSetFieldArgs } from '../Common/types'

const logger = loggerFor(ModuleName.CD)

const ManifestConnectorRefRegex = /^.+manifest\.spec\.store\.spec\.connectorRef$/
const ManifestConnectorRefType = 'Git'
const ArtifactsSidecarRegex = /^.+.sidecar\.spec\.connectorRef$/
const ArtifactsPrimaryRegex = /^.+artifacts\.primary\.spec\.connectorRef$/
const ArtifactsSidecarTagRegex = /^.+.sidecar\.spec\.tag$/
const ArtifactsPrimaryTagRegex = /^.+artifacts\.primary\.spec\.tag$/

const allowedArtifactTypes: Array<ArtifactType> = [
  ENABLED_ARTIFACT_TYPES.DockerRegistry,
  ENABLED_ARTIFACT_TYPES.Gcr,
  ENABLED_ARTIFACT_TYPES.Ecr
]

export class GenericServiceSpec extends Step<ServiceSpec> {
  protected type = StepType.K8sServiceSpec
  protected defaultValues: ServiceSpec = {}

  protected stepIcon: IconName = 'service-kubernetes'
  protected stepName = 'Deplyment Service'
  protected stepPaletteVisible = false
  protected _hasStepVariables = true
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.invocationMap.set(ArtifactsPrimaryRegex, this.getArtifactsPrimaryConnectorsListForYaml.bind(this))
    this.invocationMap.set(ArtifactsSidecarRegex, this.getArtifactsSidecarConnectorsListForYaml.bind(this))
    this.invocationMap.set(ManifestConnectorRefRegex, this.getManifestConnectorsListForYaml.bind(this))
    this.invocationMap.set(ArtifactsPrimaryTagRegex, this.getArtifactsTagsListForYaml.bind(this))
    this.invocationMap.set(ArtifactsSidecarTagRegex, this.getArtifactsTagsListForYaml.bind(this))
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
        }).then(response => {
          const data =
            response?.data?.content?.map(connector => ({
              label: getConnectorName(connector),
              insertText: getConnectorValue(connector),
              kind: CompletionItemKind.Field
            })) || []
          return data
        })
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
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
      if (allowedArtifactTypes.includes(obj?.type)) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: {
            types: [ArtifactToConnectorMap.DockerRegistry, ArtifactToConnectorMap.Gcr, ArtifactToConnectorMap.Ecr],
            filterType: 'Connector'
          }
        }).then(response => {
          const data =
            response?.data?.content?.map(connector => ({
              label: getConnectorName(connector),
              insertText: getConnectorValue(connector),
              kind: CompletionItemKind.Field
            })) || []
          return data
        })
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
  }

  protected getArtifactsSidecarConnectorsListForYaml(
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
      if (allowedArtifactTypes.includes(obj?.type)) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: {
            types: [ArtifactToConnectorMap.DockerRegistry, ArtifactToConnectorMap.Gcr, ArtifactToConnectorMap.Ecr],
            filterType: 'Connector'
          }
        }).then(response => {
          const data =
            response?.data?.content?.map(connector => ({
              label: getConnectorName(connector),
              insertText: getConnectorValue(connector),
              kind: CompletionItemKind.Field
            })) || []
          return data
        })
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
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
      if (allowedArtifactTypes.includes(obj?.type)) {
        switch (obj.type) {
          case ENABLED_ARTIFACT_TYPES.DockerRegistry: {
            return getBuildDetailsForDockerPromise({
              queryParams: {
                imagePath: obj.spec?.imagePath,
                connectorRef: obj.spec?.connectorRef,
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              }
            }).then(response => {
              const data =
                response?.data?.buildDetailsList?.map(buildDetails => ({
                  label: buildDetails.tag || '',
                  insertText: buildDetails.tag || '',
                  kind: CompletionItemKind.Field
                })) || []
              return data
            })
          }
          case ENABLED_ARTIFACT_TYPES.Gcr: {
            return getBuildDetailsForGcrPromise({
              queryParams: {
                imagePath: obj.spec?.imagePath,
                registryHostname: obj.spec?.registryHostname,
                connectorRef: obj.spec?.connectorRef,
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              }
            }).then(response => {
              const data =
                response?.data?.buildDetailsList?.map(buildDetails => ({
                  label: buildDetails.tag || '',
                  insertText: buildDetails.tag || '',
                  kind: CompletionItemKind.Field
                })) || []
              return data
            })
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
            }).then(response => {
              const data =
                response?.data?.buildDetailsList?.map(buildDetails => ({
                  label: buildDetails.tag || '',
                  insertText: buildDetails.tag || '',
                  kind: CompletionItemKind.Field
                })) || []
              return data
            })
          }
        }
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
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
          getString?.('fieldRequired', { field: 'Connector' })
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
        isEmpty(manifest?.manifest?.spec?.store?.spec?.folderPath) &&
        isRequired &&
        getMultiTypeFromValue(currentManifestTemplate?.folderPath) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.folderPath`,
          getString?.('fieldRequired', {
            field: manifest.manifest?.type === ManifestDataType.HelmChart ? getString?.('chartPath') : 'Folder Path'
          })
        )
      }

      if (
        isArray(manifest.manifest?.spec?.valuesPaths) &&
        manifest.manifest?.spec?.valuesPaths?.includes('') &&
        getMultiTypeFromValue(get(template, `manifests[${index}].manifest.spec.valuesPaths`, '')) ===
          MultiTypeInputType.RUNTIME
      ) {
        set(errors, `manifests[${index}].manifest.spec.valuesPaths`, getString?.('cd.valuesYamlValidation'))
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

      // S3 manifest store specific fields
      if (
        isEmpty(manifest?.manifest?.spec?.store?.spec?.region) &&
        isRequired &&
        getMultiTypeFromValue(currentManifestTemplate?.region) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.region`,
          getString?.('fieldRequired', { field: 'Region' })
        )
      }
      if (
        isEmpty(manifest?.manifest?.spec?.store?.spec?.bucketName) &&
        isRequired &&
        getMultiTypeFromValue(currentManifestTemplate?.bucketName) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.bucketName`,
          getString?.('fieldRequired', { field: 'Bucket Name' })
        )
      }

      // Helm With S3 manifest store specific fields
      if (
        isEmpty(manifest?.manifest?.spec?.chartName) &&
        isRequired &&
        getMultiTypeFromValue(get(template, `manifests[${index}].manifest.spec.chartName`)) ===
          MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.chartName`,
          getString?.('fieldRequired', { field: 'Chart Name' })
        )
      }

      // Custom Remote Manifest store specific fields
      if (
        isEmpty(manifest?.manifest?.spec?.store?.spec?.extractionScript) &&
        isRequired &&
        getMultiTypeFromValue(currentManifestTemplate?.extractionScript) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.extractionScript`,
          getString?.('fieldRequired', { field: getString?.('pipeline.manifestType.customRemoteExtractionScript') })
        )
      }
      if (
        isEmpty(manifest?.manifest?.spec?.store?.spec?.filePath) &&
        isRequired &&
        getMultiTypeFromValue(currentManifestTemplate?.filePath) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.filePath`,
          getString?.('fieldRequired', {
            field: getString?.('pipeline.manifestType.customRemoteExtractedFileLocation')
          })
        )
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

    // Common fields for Artifactory, Nexus3, ACR
    if (
      isEmpty(get(data, `${dataPathToField}.repository`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.repository`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.repository`, getString?.('fieldRequired', { field: 'Repository' }))
    }

    // Artifactory artifact specific fields
    if (
      isEmpty(get(data, `${dataPathToField}.artifactPath`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.artifactPath`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.artifactPath`, getString?.('fieldRequired', { field: 'Artifact Path' }))
    }

    if (
      isEmpty(get(data, `${dataPathToField}.repositoryUrl`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.repositoryUrl`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.repositoryUrl`, getString?.('fieldRequired', { field: 'Repository Url' }))
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
      set(errors, `${dataPathToField}.version`, getString?.('fieldRequired', { field: getString?.('version') }))
    }

    // Github Package Registry specific fields
    if (
      isEmpty(get(data, `${dataPathToField}.packageName`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.packageName`)) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        `${dataPathToField}.packageName`,
        getString?.('fieldRequired', { field: getString?.('pipeline.artifactsSelection.packageName') })
      )
    }

    // Azure Artifact specific fields
    if (
      isEmpty(get(data, `${dataPathToField}.project`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.project`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${dataPathToField}.project`, getString?.('fieldRequired', { field: getString?.('projectLabel') }))
    }
    if (
      isEmpty(get(data, `${dataPathToField}.feed`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.feed`)) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        `${dataPathToField}.feed`,
        getString?.('fieldRequired', { field: getString?.('pipeline.artifactsSelection.feed') })
      )
    }
    if (
      isEmpty(get(data, `${dataPathToField}.package`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.package`)) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        `${dataPathToField}.package`,
        getString?.('fieldRequired', {
          field:
            artifactType === ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry
              ? getString?.('pipeline.testsReports.callgraphField.package')
              : getString?.('pipeline.artifactsSelection.packageName')
        })
      )
    }

    // Google Artifact Registry specific fields
    if (
      isEmpty(get(data, `${dataPathToField}.repositoryName`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${templatePathToField}.repositoryName`)) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        `${dataPathToField}.repositoryName`,
        getString?.('fieldRequired', { field: getString?.('common.repositoryName') })
      )
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
      artifactType: data?.artifacts?.primary?.type,
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

  validateSidecarsInputSetFields({ data, template, isRequired, errors, getString }: ValidateInputSetFieldArgs): void {
    data?.artifacts?.sidecars?.forEach((_sidecar, index) => {
      this.validateArtifactInputSetFields({
        artifactType: data?.artifacts?.sidecars?.[index].sidecar?.type,
        data,
        dataPathToField: `artifacts.sidecars[${index}].sidecar.spec`,
        template,
        templatePathToField: `artifacts.sidecars[${index}].sidecar.spec`,
        getString,
        isRequired,
        errors
      })
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

    /** Sidecar Artifact fields validation */
    this.validateSidecarsInputSetFields({
      data,
      template,
      getString,
      isRequired,
      errors
    })

    return errors
  }

  renderStep(props: StepProps<K8SDirectServiceStep>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      factory,
      customStepProps,
      readonly,
      allowableTypes,
      viewTypeMetadata
    } = props
    if (stepViewType === StepViewType.InputVariable) {
      return (
        <GenericServiceSpecVariablesForm
          {...(customStepProps as K8sServiceSpecVariablesFormProps)}
          initialValues={initialValues}
          stepsFactory={factory}
          onUpdate={onUpdate}
          readonly={readonly}
          allowableTypes={allowableTypes}
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
          viewTypeMetadata={viewTypeMetadata}
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
