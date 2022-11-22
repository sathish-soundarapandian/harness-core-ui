/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { FormikErrors } from 'formik'

import { get, defaultTo, isEmpty } from 'lodash-es'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import {
  getAzureResourceGroupsBySubscriptionPromise,
  getAzureSubscriptionsPromise,
  getConnectorListV2Promise,
  TanzuApplicationServiceInfrastructure
} from 'services/cd-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { Connectors } from '@connectors/constants'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { getConnectorName, getConnectorValue } from '@pipeline/components/PipelineSteps/Steps/StepsHelper'

import {
  TASInfrastructureSpecEditableProps,
  TASInfrastructureTemplate,
  organizationLabel,
  spaceGroupLabel,
  TASFieldTypes
} from './TASInfrastructureInterface'
import { TASInfrastructureSpecInputForm } from './TASInfrastructureSpecInputForm'
import { TASInfrastructureSpecEditable } from './TASInfrastructureSpecEditable'

const logger = loggerFor(ModuleName.CD)

const yamlErrorMessage = 'cd.parsingYamlError'

export interface TASInfrastructureUI extends Omit<TanzuApplicationServiceInfrastructure, 'organization' | 'space'> {
  organization: TASFieldTypes
  space: TASFieldTypes
}

const TASInfrastructureSpecVariablesForm: React.FC<TASInfrastructureSpecEditableProps> = ({
  metadataMap,
  variablesData,
  initialValues
}) => {
  const infraVariables = variablesData?.infrastructureDefinition?.spec
  return infraVariables ? (
    /* istanbul ignore next */ <VariablesListTable
      data={infraVariables}
      originalData={initialValues?.infrastructureDefinition?.spec || initialValues}
      metadataMap={metadataMap}
    />
  ) : null
}

interface TASInfrastructureSpecStep extends TanzuApplicationServiceInfrastructure {
  name?: string
  identifier?: string
}

const TASConnectorRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.connectorRef$/
const TASOrganisationRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.organization$/
const TASSpaceRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.space$/
const TASType = 'TAS'

export class TASInfrastructureSpec extends PipelineStep<TASInfrastructureSpecStep> {
  lastFetched: number
  protected type = StepType.TasInfra
  protected defaultValues: TanzuApplicationServiceInfrastructure = {
    connectorRef: '',
    organization: '',
    space: ''
  }

  protected stepIcon: IconName = 'tas'
  protected stepName = 'Specify your Tanzu Application Services Connector'
  protected stepPaletteVisible = false
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.lastFetched = new Date().getTime()
    this.invocationMap.set(TASConnectorRegex, this.getConnectorsListForYaml.bind(this))
    this.invocationMap.set(TASOrganisationRegex, this.getOrganisationListForYaml.bind(this)) //
    this.invocationMap.set(TASSpaceRegex, this.getSpaceGroupListForYaml.bind(this)) //

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
      if (obj?.type === TASType) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: [Connectors.TAS], filterType: 'Connector' }
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

  protected getOrganisationListForYaml(
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
      const obj = get(pipelineObj, path.replace('.spec.organization', ''))
      if (
        obj?.type === TASType &&
        obj?.spec?.connectorRef &&
        getMultiTypeFromValue(obj.spec?.connectorRef) === MultiTypeInputType.FIXED
      ) {
        return getAzureSubscriptionsPromise({
          //API CALL
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            connectorRef: obj.spec?.connectorRef
          }
        }).then(response => {
          const values: CompletionItemInterface[] = [] //cjheck
          defaultTo(response?.data?.subscriptions, []).map(sub =>
            values.push({ label: sub.subscriptionId, insertText: sub.subscriptionId, kind: CompletionItemKind.Field })
          )
          return values
        })
      }
    }

    return Promise.resolve([])
  }

  protected getSpaceGroupListForYaml(
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
    // /* istanbul ignore else */
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.space', ''))
      if (
        obj?.type === TASType &&
        obj?.spec?.connectorRef &&
        getMultiTypeFromValue(obj.spec?.connectorRef) === MultiTypeInputType.FIXED &&
        obj?.spec?.organization &&
        getMultiTypeFromValue(obj.spec?.organization) === MultiTypeInputType.FIXED
      ) {
        return getAzureResourceGroupsBySubscriptionPromise({
          //API CHECK
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            connectorRef: obj.spec?.connectorRef
          },
          subscriptionId: obj.spec?.subscriptionId
          // organization: obj.spec?.organization -- > TODO::// cehck
        }).then(
          response =>
            response?.data?.resourceGroups?.map(rg => ({
              //check
              label: rg.resourceGroup,
              insertText: rg.resourceGroup,
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
  }: ValidateInputSetProps<TanzuApplicationServiceInfrastructure>): FormikErrors<TanzuApplicationServiceInfrastructure> {
    const errors: Partial<TASInfrastructureTemplate> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      isEmpty(data.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.connectorRef = getString?.('common.validation.fieldIsRequired', { name: getString('connector') })
    }
    if (
      isEmpty(data.organization) &&
      isRequired &&
      getMultiTypeFromValue(template?.organization) === MultiTypeInputType.RUNTIME
    ) {
      errors.organization = getString?.('common.validation.fieldIsRequired', { name: getString(organizationLabel) })
    }
    if (isEmpty(data.space) && isRequired && getMultiTypeFromValue(template?.space) === MultiTypeInputType.RUNTIME) {
      errors.space = getString?.('common.validation.fieldIsRequired', { name: getString(spaceGroupLabel) })
    }
    return errors
  }

  renderStep(props: StepProps<TanzuApplicationServiceInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, customStepProps, readonly, allowableTypes } = props
    if (this.isTemplatizedView(stepViewType)) {
      if (initialValues?.deploymentType) {
        delete initialValues.deploymentType
      }

      return (
        <TASInfrastructureSpecInputForm
          {...(customStepProps as TASInfrastructureSpecEditableProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          template={inputSetData?.template}
          allValues={inputSetData?.allValues}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <TASInfrastructureSpecVariablesForm
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          {...(customStepProps as TASInfrastructureSpecEditableProps)}
          initialValues={initialValues}
        />
      )
    }

    return (
      <TASInfrastructureSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        stepViewType={stepViewType}
        {...(customStepProps as TASInfrastructureSpecEditableProps)}
        initialValues={initialValues}
        allowableTypes={allowableTypes}
      />
    )
  }
}
