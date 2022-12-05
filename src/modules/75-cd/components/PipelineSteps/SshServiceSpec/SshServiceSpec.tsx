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
import { ArtifactToConnectorMap, allowedArtifactTypes } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'

import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getConnectorName, getConnectorValue } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type { K8SDirectServiceStep } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
import { SshServiceSpecVariablesForm, SshServiceSpecVariablesFormProps } from './SshServiceSpecVariablesForm'
import { SshServiceSpecInputSetMode } from './SshServiceSpecInputSetMode'
import SshServiceSpecEditable from './SshServiceSpecForm/SshServiceSpecEditable'

const logger = loggerFor(ModuleName.CD)
const tagExists = (value: unknown): boolean => typeof value === 'number' || !isEmpty(value)

const ArtifactsPrimaryRegex = /^.+artifacts\.primary\.spec\.connectorRef$/
const ArtifactsPrimaryTagRegex = /^.+artifacts\.primary\.spec\.artifactPath$/

const sshAllowedArtifactTypes: Array<ArtifactType> = allowedArtifactTypes.Ssh

export class SshServiceSpec extends Step<ServiceSpec> {
  protected type = StepType.SshServiceSpec
  protected defaultValues: ServiceSpec = {}
  protected inputSetData: InputSetData<K8SDirectServiceStep> | undefined = undefined

  protected stepIcon: IconName = 'secret-ssh'
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
      if (sshAllowedArtifactTypes.includes(obj?.type)) {
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
      if (sshAllowedArtifactTypes.includes(obj?.type)) {
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

  validateInputSet({
    data,
    getString,
    viewType
  }: ValidateInputSetProps<K8SDirectServiceStep>): FormikErrors<K8SDirectServiceStep> {
    const errors: FormikErrors<K8SDirectServiceStep> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    const template = this.inputSetData?.template
    if (
      isEmpty(data?.artifacts?.primary?.spec?.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'artifacts.primary.spec.connectorRef', getString?.('fieldRequired', { field: 'Artifact Server' }))
    }
    if (
      isEmpty(data?.artifacts?.primary?.spec?.repository) &&
      isRequired &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.repository) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'artifacts.primary.spec.repository', getString?.('fieldRequired', { field: 'Repository' }))
    }
    if (
      isEmpty(data?.artifacts?.primary?.spec?.artifactDirectory) &&
      isRequired &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.artifactDirectory) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        'artifacts.primary.spec.artifactDirectory',
        getString?.('fieldRequired', { field: 'Artifact Directory' })
      )
    }
    if (
      !tagExists(data?.artifacts?.primary?.spec?.artifactPath) &&
      isRequired &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.artifactPath) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'artifacts.primary.spec.artifactPath', getString?.('fieldRequired', { field: 'Artifact Path' }))
    }
    if (
      isEmpty(data?.artifacts?.primary?.spec?.artifactPathFilter) &&
      isRequired &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.artifactPathFilter) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        'artifacts.primary.spec.artifactPathFilter',
        getString?.('fieldRequired', { field: 'Artifact Path Filter' })
      )
    }

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

  renderStep(props: StepProps<K8SDirectServiceStep>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, factory, customStepProps, readonly, allowableTypes } =
      props
    this.inputSetData = inputSetData
    if (stepViewType === StepViewType.InputVariable) {
      return (
        <SshServiceSpecVariablesForm
          {...(customStepProps as SshServiceSpecVariablesFormProps)}
          initialValues={initialValues}
          stepsFactory={factory}
          onUpdate={onUpdate}
          readonly={readonly}
        />
      )
    }

    if (isTemplatizedView(stepViewType)) {
      return (
        <SshServiceSpecInputSetMode
          {...(customStepProps as SshServiceSpecVariablesFormProps)}
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
      <SshServiceSpecEditable
        {...(customStepProps as SshServiceSpecVariablesFormProps)}
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
