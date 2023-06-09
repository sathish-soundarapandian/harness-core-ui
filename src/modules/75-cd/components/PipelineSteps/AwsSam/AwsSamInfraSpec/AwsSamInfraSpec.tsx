/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikErrors } from 'formik'
import { isEmpty, get } from 'lodash-es'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import { AwsSamInfrastructure, getConnectorListV2Promise } from 'services/cd-ng'
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
import { AwsSamInfraSpecEditable, AwsSamInfraSpecEditableProps } from './AwsSamInfraSpecEditable'
import { AwsSamInfraSpecInputSetMode } from './AwsSamInfraSpecInputForm'

const logger = loggerFor(ModuleName.CD)

interface AwsSamInfrastructureStep extends AwsSamInfrastructure {
  name?: string
  identifier?: string
}

export interface AwsSamInfraSpecCustomStepProps {
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AwsSamInfrastructure
  serviceRef?: string
  environmentRef?: string
  infrastructureRef?: string
}

const connectorRegex = /^.+stage\.spec\.infrastructure\.infrastructureDefinition\.spec\.connectorRef$/

export class AwsSamInfraSpec extends PipelineStep<AwsSamInfrastructureStep> {
  lastFetched: number
  protected type = StepType.AwsSamInfra
  protected defaultValues: AwsSamInfrastructure = { connectorRef: '', region: '' }

  protected stepIcon: IconName = 'service-aws-sam'
  protected stepName = 'Specify your AWS connector'
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
      if (obj?.type === ServiceDeploymentType.AwsSam) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: [connectorTypes.Aws], filterType: 'Connector' }
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
  }: ValidateInputSetProps<AwsSamInfrastructure>): FormikErrors<AwsSamInfrastructure> {
    const errors: Partial<AwsSamInfrastructure> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    if (isEmpty(data.region) && isRequired && getMultiTypeFromValue(template?.region) === MultiTypeInputType.RUNTIME) {
      errors.region = getString?.('common.validation.fieldIsRequired', { name: getString('regionLabel') })
    }

    return errors
  }

  renderStep(props: StepProps<AwsSamInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, customStepProps, readonly, allowableTypes } = props
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <AwsSamInfraSpecInputSetMode
          readonly={inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <VariablesListTable
          data={(customStepProps as AwsSamInfraSpecCustomStepProps)?.variablesData?.infrastructureDefinition?.spec}
          originalData={initialValues.infrastructureDefinition?.spec || initialValues}
          metadataMap={(customStepProps as AwsSamInfraSpecCustomStepProps)?.metadataMap}
        />
      )
    }
    return (
      <AwsSamInfraSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        {...(customStepProps as AwsSamInfraSpecEditableProps)}
        initialValues={initialValues}
        allowableTypes={allowableTypes}
      />
    )
  }
}
