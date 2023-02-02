/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikErrors } from 'formik'
import { isEmpty, get, defaultTo } from 'lodash-es'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import { getConnectorListV2Promise, Infrastructure } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { getConnectorName, getConnectorValue } from '@pipeline/components/PipelineSteps/Steps/StepsHelper'
import { connectorTypes } from '@pipeline/utils/constants'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { GoogleCloudFunctionInfraSpecInputSetMode } from './GoogleCloudFunctionInfraSpecInputForm'
import {
  GoogleCloudFunctionInfraSpecEditable,
  GoogleCloudFunctionInfraSpecEditableProps
} from './GoogleCloudFunctionInfraSpecEditable'

const logger = loggerFor(ModuleName.CD)
export type GoogleCloudFunctionInfrastructure = Infrastructure & {
  connectorRef: string
  project: string
  region: string
}

interface GoogleCloudFunctionInfrastructureStep extends GoogleCloudFunctionInfrastructure {
  name?: string
  identifier?: string
}

export interface GoogleCloudFunctionInfraSpecCustomStepProps {
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: GoogleCloudFunctionInfrastructure
  serviceRef?: string
  environmentRef?: string
  infrastructureRef?: string
}

const connectorRegex = /^.+stage\.spec\.infrastructure\.infrastructureDefinition\.spec\.connectorRef$/

export class GoogleCloudFunctionInfraSpec extends PipelineStep<GoogleCloudFunctionInfrastructureStep> {
  lastFetched: number
  protected type = StepType.GoogleCloudFunctionsInfra
  protected defaultValues: GoogleCloudFunctionInfrastructure = { connectorRef: '', project: '', region: '' }

  protected stepIcon: IconName = 'service-google-functions'
  protected stepName = 'Specify your GCP connector'
  protected stepPaletteVisible = false
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.lastFetched = new Date().getTime()
    this.invocationMap.set(connectorRegex, this.getConnectorsListForYaml.bind(this))
    this._hasStepVariables = true
  }

  protected getConnectorsListForYaml(
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
      if (obj?.type === ServiceDeploymentType.ECS) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: [connectorTypes.Gcp], filterType: 'Connector' }
        }).then(response => {
          return (
            response?.data?.content?.map(connector => ({
              label: getConnectorName(connector),
              insertText: getConnectorValue(connector),
              kind: CompletionItemKind.Field
            })) || /* istanbul ignore next */ []
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
  }: ValidateInputSetProps<GoogleCloudFunctionInfrastructure>): FormikErrors<GoogleCloudFunctionInfrastructure> {
    const errors: Partial<GoogleCloudFunctionInfrastructure> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      isEmpty(data.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.connectorRef = getString?.('fieldRequired', { field: getString('connector') })
    }
    if (
      isEmpty(data.project) &&
      isRequired &&
      getMultiTypeFromValue(template?.project) === MultiTypeInputType.RUNTIME
    ) {
      errors.project = getString?.('fieldRequired', { field: getString('projectLabel') })
    }
    if (isEmpty(data.region) && isRequired && getMultiTypeFromValue(template?.region) === MultiTypeInputType.RUNTIME) {
      errors.region = getString?.('fieldRequired', { field: getString('regionLabel') })
    }

    return errors
  }

  renderStep(props: StepProps<GoogleCloudFunctionInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, customStepProps, readonly, allowableTypes } = props
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <GoogleCloudFunctionInfraSpecInputSetMode
          initialValues={initialValues}
          allValues={defaultTo(inputSetData?.allValues, {}) as GoogleCloudFunctionInfrastructure}
          onUpdate={onUpdate}
          readonly={inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
          customStepProps={customStepProps as GoogleCloudFunctionInfraSpecCustomStepProps}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <VariablesListTable
          data={
            (customStepProps as GoogleCloudFunctionInfraSpecCustomStepProps)?.variablesData?.infrastructureDefinition
              ?.spec
          }
          originalData={initialValues.infrastructureDefinition?.spec || initialValues}
          metadataMap={(customStepProps as GoogleCloudFunctionInfraSpecCustomStepProps)?.metadataMap}
        />
      )
    }
    return (
      <GoogleCloudFunctionInfraSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        {...(customStepProps as GoogleCloudFunctionInfraSpecEditableProps)}
        initialValues={initialValues}
        allowableTypes={allowableTypes}
      />
    )
  }
}
