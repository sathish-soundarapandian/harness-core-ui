/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName, AllowedTypes } from '@harness/uicore';
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import * as Yup from 'yup'
import { isEmpty, get, defaultTo } from 'lodash-es'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import type { FormikErrors} from 'formik';
import { yupToFormErrors } from 'formik'
import type { StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step';
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import type { K8sAwsInfrastructure} from 'services/cd-ng';
import { getConnectorListV2Promise, getEKSClusterNamesPromise } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import { getConnectorName, getConnectorValue } from '@pipeline/components/PipelineSteps/Steps/StepsHelper'
import { getNameSpaceSchema, getReleaseNameSchema } from '../PipelineStepsUtil'
import { K8sAwsInfrastructureSpecEditable } from './K8sAwsInfrastructureSpecEditable'
import { K8sAwsInfrastructureSpecInputForm } from './K8sAwsInfrastructureSpecInputForm'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

const logger = loggerFor(ModuleName.CD)
export type K8sAwsInfrastructureTemplate = { [key in keyof K8sAwsInfrastructure]: string }

export interface K8sAwsInfrastructureSpecEditableProps {
  initialValues: K8sAwsInfrastructure
  allValues?: K8sAwsInfrastructure
  onUpdate?: (data: K8sAwsInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: K8sAwsInfrastructureTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8sAwsInfrastructure
  allowableTypes: AllowedTypes
}

const K8sAwsInfrastructureSpecVariablesForm: React.FC<K8sAwsInfrastructureSpecEditableProps> = ({
  metadataMap,
  variablesData,
  initialValues
}) => {
  /* istanbul ignore next */
  const infraVariables = variablesData?.infrastructureDefinition?.spec
  return infraVariables ? (
    /* istanbul ignore next */ <VariablesListTable
      data={infraVariables}
      originalData={initialValues?.infrastructureDefinition?.spec || initialValues}
      metadataMap={metadataMap}
      className={pipelineVariableCss.variablePaddingL1}
    />
  ) : null
}

interface K8sAwsInfrastructureSpecStep extends K8sAwsInfrastructure {
  name?: string
  identifier?: string
}

const KubernetesAwsConnectorRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.connectorRef$/
const KubernetesAwsClusterRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.cluster$/
const KubernetesAwsType = 'KubernetesAws'
export class K8sAwsInfrastructureSpec extends PipelineStep<K8sAwsInfrastructureSpecStep> {
  lastFetched: number
  protected type = StepType.KubernetesAws
  protected defaultValues: K8sAwsInfrastructure = { cluster: '', connectorRef: '', namespace: '', releaseName: '' }

  protected stepIcon: IconName = 'cog' //TODO:: icon name
  protected stepName = 'Specify your Aws Connector'
  protected stepPaletteVisible = false
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.lastFetched = new Date().getTime()
    this.invocationMap.set(KubernetesAwsConnectorRegex, this.getConnectorsListForYaml.bind(this))
    this.invocationMap.set(KubernetesAwsClusterRegex, this.getClusterListForYaml.bind(this))

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
      /* istanbul ignore next */ logger.error('Error while parsing the yaml', err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (obj?.type === KubernetesAwsType) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: ['Aws'], filterType: 'Connector' }
        }).then(response => {
          const data = defaultTo(response?.data?.content, []).map(connector => ({
            label: getConnectorName(connector),
            insertText: getConnectorValue(connector),
            kind: CompletionItemKind.Field
          }))
          return data
        })
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
  }

  protected getClusterListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      /* istanbul ignore next */ logger.error('Error while parsing the yaml', err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.cluster', ''))
      if (
        obj?.type === KubernetesAwsType &&
        obj?.spec?.connectorRef &&
        getMultiTypeFromValue(obj.spec?.connectorRef) === MultiTypeInputType.FIXED
      ) {
        return getEKSClusterNamesPromise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            awsConnectorRef: obj.spec?.connectorRef
          }
        }).then(response => {
          const data = defaultTo(response?.data, []).map(clusterName => ({
            label: clusterName,
            insertText: clusterName,
            kind: CompletionItemKind.Field
          }))
          return data
        })
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
  }: ValidateInputSetProps<K8sAwsInfrastructure>): FormikErrors<K8sAwsInfrastructure> {
    const errors: Partial<K8sAwsInfrastructureTemplate> = {}
    const isRequired =
      viewType === StepViewType.DeploymentForm || /* istanbul ignore next */ viewType === StepViewType.TriggerForm
    if (
      isEmpty(data.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.connectorRef = getString?.('fieldRequired', { field: getString('connector') })
    }
    if (
      isEmpty(data.cluster) &&
      isRequired &&
      getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME
    ) {
      errors.cluster = getString?.('fieldRequired', { field: getString('common.cluster') })
    }
    /* istanbul ignore else */ if (
      getString &&
      getMultiTypeFromValue(template?.namespace) === MultiTypeInputType.RUNTIME
    ) {
      const namespace = Yup.object().shape({
        namespace: getNameSpaceSchema(getString, isRequired)
      })

      try {
        namespace.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore else */ if (
      getString &&
      getMultiTypeFromValue(template?.releaseName) === MultiTypeInputType.RUNTIME
    ) {
      const releaseName = Yup.object().shape({
        releaseName: getReleaseNameSchema(getString, isRequired)
      })

      try {
        releaseName.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    return errors
  }

  renderStep(props: StepProps<K8sAwsInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, customStepProps, readonly, allowableTypes } = props
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <K8sAwsInfrastructureSpecInputForm
          {...(customStepProps as K8sAwsInfrastructureSpecEditableProps)}
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
        <K8sAwsInfrastructureSpecVariablesForm
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          {...(customStepProps as K8sAwsInfrastructureSpecEditableProps)}
          initialValues={initialValues}
        />
      )
    }

    return (
      <K8sAwsInfrastructureSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        stepViewType={stepViewType}
        {...(customStepProps as K8sAwsInfrastructureSpecEditableProps)}
        initialValues={initialValues}
        allowableTypes={allowableTypes}
      />
    )
  }
}
