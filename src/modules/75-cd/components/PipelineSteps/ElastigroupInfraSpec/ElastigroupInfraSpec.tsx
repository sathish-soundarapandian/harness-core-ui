/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { FormikErrors } from 'formik'
import { get, isEmpty, set } from 'lodash-es'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { getConnectorListV2Promise, ElastigroupInfrastructure } from 'services/cd-ng'
import { Connectors } from '@connectors/constants'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { getConnectorName, getConnectorValue } from '@pipeline/components/PipelineSteps/Steps/StepsHelper'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { ElastigroupInfraSpecEditableProps, ElastigroupInfrastructureTemplate } from './ElastigroupInfraTypes'
import { ElastigroupInfrastructureSpecEditable } from './ElastigroupInfrastructureSpecEditable'
import { ElastigroupInfraSpecInputSetMode } from './ElastigroupInfraSpecInputForm'

const logger = loggerFor(ModuleName.CD)

const yamlErrorMessage = 'cd.parsingYamlError'

interface ElastigroupInfrastructureSpecStep extends ElastigroupInfrastructure {
  name?: string
  identifier?: string
}

const ElastigroupConnectorRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.connectorRef$/
const ElastigroupType = 'Elastigroup'

export class ElastigroupInfrastructureSpec extends PipelineStep<ElastigroupInfrastructureSpecStep> {
  lastFetched: number
  protected type = StepType.Elastigroup
  protected defaultValues: ElastigroupInfrastructure = {
    connectorRef: '',
    configuration: {
      store: {
        type: 'Harness',
        spec: {}
      }
    }
  }

  protected stepIcon: IconName = 'elastigroup'
  protected stepName = 'Specify Spot Elastigroup'
  protected stepPaletteVisible = false
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.lastFetched = new Date().getTime()
    this.invocationMap.set(ElastigroupConnectorRegex, this.getConnectorsListForYaml.bind(this))

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      /* istanbul ignore next */ logger.error(yamlErrorMessage, err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }

    /* istanbul ignore else */
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (obj?.type === ElastigroupType) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: [Connectors.SPOT], filterType: 'Connector' }
        }).then(
          response =>
            response?.data?.content?.map(connector => ({
              label: getConnectorName(connector),
              insertText: getConnectorValue(connector),
              kind: CompletionItemKind.Field
            })) || /* istanbul ignore next */ []
        )
      }
    }

    return Promise.resolve([])
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<ElastigroupInfrastructure>): FormikErrors<ElastigroupInfrastructure> {
    const errors: Partial<ElastigroupInfrastructureTemplate> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      isEmpty(data.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.connectorRef = getString?.('common.validation.fieldIsRequired', { name: getString('connector') })
    }

    if (
      isEmpty(data.configuration.store.spec.files) &&
      isRequired &&
      getMultiTypeFromValue(template?.configuration.store.spec.files) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'configuration.store.spec.files', getString?.('cd.steps.elastigroup.elastigroupConfigReq'))
    }

    if (
      isEmpty(data.configuration.store.spec.secretFiles) &&
      isRequired &&
      getMultiTypeFromValue(template?.configuration.store.spec.secretFiles) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'configuration.store.spec.secretFiles', getString?.('cd.steps.elastigroup.elastigroupConfigReq'))
    }
    return errors
  }

  renderStep(props: StepProps<ElastigroupInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, customStepProps, readonly, allowableTypes } = props
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <ElastigroupInfraSpecInputSetMode
          initialValues={initialValues}
          onUpdate={onUpdate}
          readonly={inputSetData?.readonly}
          template={inputSetData?.template}
          allValues={inputSetData?.allValues}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <VariablesListTable
          data={(customStepProps as ElastigroupInfraSpecEditableProps)?.variablesData?.infrastructureDefinition?.spec}
          originalData={initialValues.infrastructureDefinition?.spec || initialValues}
          metadataMap={(customStepProps as ElastigroupInfraSpecEditableProps)?.metadataMap}
        />
      )
    }

    return (
      <ElastigroupInfrastructureSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        stepViewType={stepViewType}
        {...(customStepProps as ElastigroupInfraSpecEditableProps)}
        initialValues={initialValues}
        allowableTypes={allowableTypes}
      />
    )
  }
}
