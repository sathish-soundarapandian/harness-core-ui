/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isEmpty, set, isString } from 'lodash-es'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'

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
import AzureWebAppServiceSpecEditable from './AzureWebAppServiceSpecEditable'
import { AzureWebAppServiceSpecInputSetForm } from './AzureWebAppServiceSpecInputSetForm'
import { AzureWebAppServiceSpecVariablesForm } from './AzureWebAppServiceSpecVariableForm'
import type {
  AzureWebAppServiceSpecFormProps,
  AzureWebAppServiceSpecVariablesFormProps,
  AzureWebAppServiceStep
} from './AzureWebAppServiceSpecInterface.types'

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

export class AzureWebAppServiceSpec extends Step<ServiceSpec> {
  protected type = StepType.AzureWebAppServiceSpec
  protected defaultValues: ServiceSpec = {}

  protected stepIcon: IconName = 'azurewebapp'
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

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<AzureWebAppServiceStep>): FormikErrors<AzureWebAppServiceStep> {
    const errors: FormikErrors<AzureWebAppServiceStep> = {}
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

    // artifacts validation
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
      isEmpty(get(data, `${artifactPath}.imagePath`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.imagePath`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.imagePath`, getString?.('fieldRequired', { field: 'Image Path' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.artifactPath`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.artifactPath`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.artifactPath`, getString?.('fieldRequired', { field: 'Artifact Path' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.spec.artifactPath`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.spec.artifactPath`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.spec.artifactPath`, getString?.('fieldRequired', { field: 'Artifact Path' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.build`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.build`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.build`, getString?.('fieldRequired', { field: 'Build' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.jobName`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.jobName`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.jobName`, getString?.('fieldRequired', { field: 'Job Name' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.subscriptionId`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.subscriptionId`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.subscriptionId`, getString?.('fieldRequired', { field: 'Subscription Id' }))
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
      isEmpty(get(data, `${artifactPath}.registry`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.registry`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.registry`, getString?.('fieldRequired', { field: 'Registry' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.artifactDirectory`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.artifactDirectory`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.artifactDirectory`, getString?.('fieldRequired', { field: 'Artifact Directory' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.registryHostname`)) &&
      isRequired &&
      getMultiTypeFromValue(
        get(template, isArtifactSourceRuntime ? artifactSourceTemplatePath : `${artifactPath}.registryHostname`)
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.registryHostname`, getString?.('fieldRequired', { field: 'Registry Hostname' }))
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

    // application settings validation
    if (
      isEmpty(data?.applicationSettings?.store?.spec?.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.applicationSettings?.store?.spec?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'applicationSettings.store.spec.connectorRef', getString?.('fieldRequired', { field: 'Connector' }))
    }
    if (
      isEmpty(data?.applicationSettings?.store?.spec?.branch) &&
      isRequired &&
      getMultiTypeFromValue(template?.applicationSettings?.store?.spec?.branch) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'applicationSettings.store.spec.branch', getString?.('fieldRequired', { field: 'Branch' }))
    }

    if (
      isEmpty(data?.applicationSettings?.store?.spec?.commitId) &&
      isRequired &&
      getMultiTypeFromValue(template?.applicationSettings?.store?.spec?.commitId) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'applicationSettings.store.spec.commitId', getString?.('fieldRequired', { field: 'CommitId' }))
    }

    if (
      isEmpty(data?.applicationSettings?.store?.spec?.repoName) &&
      isRequired &&
      getMultiTypeFromValue(template?.applicationSettings?.store?.spec?.repoName) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'applicationSettings.store.spec.repoName', getString?.('fieldRequired', { field: 'Repository Name' }))
    }

    if (
      isEmpty(data?.applicationSettings?.store?.spec?.paths) &&
      isRequired &&
      getMultiTypeFromValue(template?.applicationSettings?.store?.spec?.paths) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        'applicationSettings.store.spec.paths[0]',
        getString?.('fieldRequired', { field: 'Application Settings File Path' })
      )
    }

    if (
      isEmpty(data?.applicationSettings?.store?.spec?.files) &&
      isRequired &&
      getMultiTypeFromValue(template?.applicationSettings?.store?.spec?.files) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'applicationSettings.store.spec.files[0]', getString?.('fieldRequired', { field: 'File' }))
    }

    if (
      isEmpty(data?.applicationSettings?.store?.spec?.secretFiles) &&
      isRequired &&
      getMultiTypeFromValue(template?.applicationSettings?.store?.spec?.secretFiles) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'applicationSettings.store.spec.secretFiles[0]', getString?.('fieldRequired', { field: 'File' }))
    }

    // startup command validation
    if (
      isEmpty(data?.startupCommand?.store?.spec?.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.startupCommand?.store?.spec?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'startupCommand.store.spec.connectorRef', getString?.('fieldRequired', { field: 'Connector' }))
    }
    if (
      isEmpty(data?.startupCommand?.store?.spec?.branch) &&
      isRequired &&
      getMultiTypeFromValue(template?.startupCommand?.store?.spec?.branch) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'startupCommand.store.spec.branch', getString?.('fieldRequired', { field: 'Branch' }))
    }

    if (
      isEmpty(data?.startupCommand?.store?.spec?.commitId) &&
      isRequired &&
      getMultiTypeFromValue(template?.startupCommand?.store?.spec?.commitId) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'startupCommand.store.spec.commitId', getString?.('fieldRequired', { field: 'CommitId' }))
    }

    if (
      isEmpty(data?.startupCommand?.store?.spec?.repoName) &&
      isRequired &&
      getMultiTypeFromValue(template?.startupCommand?.store?.spec?.repoName) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'startupCommand.store.spec.repoName', getString?.('fieldRequired', { field: 'Repository Name' }))
    }

    if (
      isEmpty(data?.startupCommand?.store?.spec?.paths) &&
      isRequired &&
      getMultiTypeFromValue(template?.startupCommand?.store?.spec?.paths) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'startupCommand.store.spec.paths[0]', getString?.('fieldRequired', { field: 'Script File Path' }))
    }

    if (
      isEmpty(data?.startupCommand?.store?.spec?.files) &&
      isRequired &&
      getMultiTypeFromValue(template?.startupCommand?.store?.spec?.files) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'startupCommand.store.spec.files[0]', getString?.('fieldRequired', { field: 'File' }))
    }

    if (
      isEmpty(data?.startupCommand?.store?.spec?.secretFiles) &&
      isRequired &&
      getMultiTypeFromValue(template?.startupCommand?.store?.spec?.secretFiles) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'startupCommand.store.spec.secretFiles[0]', getString?.('fieldRequired', { field: 'File' }))
    }

    // connection strings validation
    if (
      isEmpty(data?.connectionStrings?.store?.spec?.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectionStrings?.store?.spec?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'connectionStrings.store.spec.connectorRef', getString?.('fieldRequired', { field: 'Connector' }))
    }
    if (
      isEmpty(data?.connectionStrings?.store?.spec?.branch) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectionStrings?.store?.spec?.branch) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'connectionStrings.store.spec.branch', getString?.('fieldRequired', { field: 'Branch' }))
    }

    if (
      isEmpty(data?.connectionStrings?.store?.spec?.commitId) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectionStrings?.store?.spec?.commitId) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'connectionStrings.store.spec.commitId', getString?.('fieldRequired', { field: 'CommitId' }))
    }

    if (
      isEmpty(data?.connectionStrings?.store?.spec?.repoName) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectionStrings?.store?.spec?.repoName) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'connectionStrings.store.spec.repoName', getString?.('fieldRequired', { field: 'Repository Name' }))
    }

    if (
      isEmpty(data?.connectionStrings?.store?.spec?.paths) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectionStrings?.store?.spec?.paths) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        'connectionStrings.store.spec.paths[0]',
        getString?.('fieldRequired', { field: 'Connection Strings File Path' })
      )
    }

    if (
      isEmpty(data?.connectionStrings?.store?.spec?.files) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectionStrings?.store?.spec?.files) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'connectionStrings.store.spec.files[0]', getString?.('fieldRequired', { field: 'File' }))
    }

    if (
      isEmpty(data?.connectionStrings?.store?.spec?.secretFiles) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectionStrings?.store?.spec?.secretFiles) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'connectionStrings.store.spec.secretFiles[0]', getString?.('fieldRequired', { field: 'File' }))
    }

    // config files validation
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
              `configFiles[${index}].configFile.spec.store.spec.files[${secretFileIndex}]`,
              getString?.('fieldRequired', { field: 'File' })
            )
          }
        })
      }
    })

    return errors
  }

  renderStep(props: StepProps<AzureWebAppServiceStep>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, factory, customStepProps, readonly, allowableTypes } =
      props
    if (stepViewType === StepViewType.InputVariable) {
      return (
        <AzureWebAppServiceSpecVariablesForm
          {...(customStepProps as AzureWebAppServiceSpecVariablesFormProps)}
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
        <AzureWebAppServiceSpecInputSetForm
          {...(customStepProps as AzureWebAppServiceSpecFormProps)}
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
      <AzureWebAppServiceSpecEditable
        {...(customStepProps as AzureWebAppServiceSpecFormProps)}
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
