/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { FormikErrors, yupToFormErrors } from 'formik'
import { isEmpty, get, defaultTo } from 'lodash-es'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'

import { EcsInfrastructure, getConnectorListV2Promise } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { StringsMap } from 'framework/strings/StringsContext'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { getConnectorName, getConnectorValue } from '@pipeline/components/PipelineSteps/Steps/StepsHelper'
import { connectorTypes } from '@pipeline/utils/constants'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { ECSInfraSpecInputSetMode } from './ECSInfraSpecInputForm'
import { ECSInfraSpecEditable, ECSInfraSpecEditableProps } from './ECSInfraSpecEditable'

const logger = loggerFor(ModuleName.CD)
type EcsInfrastructureTemplate = { [key in keyof EcsInfrastructure]: string }

interface EcsInfrastructureStep extends EcsInfrastructure {
  name?: string
  identifier?: string
}
interface ValidateFieldArg {
  data: EcsInfrastructure
  template?: EcsInfrastructure
  getString: ((key: keyof StringsMap, vars?: Record<string, unknown> | undefined) => string) | undefined
  errors: Partial<EcsInfrastructureTemplate>
}

export interface ECSInfraSpecCustomStepProps {
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: EcsInfrastructure
  serviceRef?: string
  environmentRef?: string
  infrastructureRef?: string
}

const AwsConnectorRegex = /^.+stage\.spec\.infrastructure\.infrastructureDefinition\.spec\.connectorRef$/

export class ECSInfraSpec extends PipelineStep<EcsInfrastructureStep> {
  lastFetched: number
  protected type = StepType.EcsInfra
  protected defaultValues: EcsInfrastructure = { connectorRef: '', region: '', cluster: '' }

  protected stepIcon: IconName = 'service-aws'
  protected stepName = 'Specify your AWS connector'
  protected stepPaletteVisible = false
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.lastFetched = new Date().getTime()
    this.invocationMap.set(AwsConnectorRegex, this.getConnectorsListForYaml.bind(this))
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

  validateRegionField({ data, template, getString, errors }: ValidateFieldArg): void {
    if (getString && getMultiTypeFromValue(template?.region) === MultiTypeInputType.RUNTIME) {
      const region = Yup.object().shape({
        region: Yup.lazy((): Yup.Schema<unknown> => {
          return Yup.string().required(
            getString('common.validation.fieldIsRequired', { name: getString('regionLabel') })
          )
        })
      })
      try {
        region.validateSync(data)
      } catch (e) {
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
  }

  validateClusterField({ data, template, getString, errors }: ValidateFieldArg): void {
    if (getString && getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME) {
      const cluster = Yup.object().shape({
        cluster: Yup.lazy((): Yup.Schema<unknown> => {
          return Yup.string().required(
            getString('common.validation.fieldIsRequired', { name: getString('common.cluster') })
          )
        })
      })
      try {
        cluster.validateSync(data)
      } catch (e) {
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)
          Object.assign(errors, err)
        }
      }
    }
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<EcsInfrastructure>): FormikErrors<EcsInfrastructure> {
    const errors: Partial<EcsInfrastructureTemplate> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      isEmpty(data.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.connectorRef = getString?.('fieldRequired', { field: getString('connector') })
    }
    this.validateRegionField({ data, template, getString, errors })
    this.validateClusterField({ data, template, getString, errors })

    return errors
  }

  renderStep(props: StepProps<EcsInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, customStepProps, readonly, allowableTypes } = props
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <ECSInfraSpecInputSetMode
          initialValues={initialValues}
          allValues={defaultTo(inputSetData?.allValues, {}) as EcsInfrastructure}
          onUpdate={onUpdate}
          readonly={inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
          customStepProps={customStepProps as ECSInfraSpecCustomStepProps}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <VariablesListTable
          data={(customStepProps as ECSInfraSpecCustomStepProps)?.variablesData?.infrastructureDefinition?.spec}
          originalData={initialValues.infrastructureDefinition?.spec || initialValues}
          metadataMap={(customStepProps as ECSInfraSpecCustomStepProps)?.metadataMap}
        />
      )
    }
    return (
      <ECSInfraSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        {...(customStepProps as ECSInfraSpecEditableProps)}
        initialValues={initialValues}
        allowableTypes={allowableTypes}
      />
    )
  }
}
