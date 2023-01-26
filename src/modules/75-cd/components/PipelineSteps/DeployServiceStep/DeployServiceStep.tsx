/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getMultiTypeFromValue, IconName, MultiTypeInputType } from '@harness/uicore'
import { get, isEmpty } from 'lodash-es'
import { CompletionItemKind } from 'vscode-languageserver-types'
import type { FormikErrors } from 'formik'
import { parse } from '@common/utils/YamlHelperMethods'
import { getServiceListPromise } from 'services/cd-ng'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { Step, StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
import type { DeployServiceCustomStepPropType, DeployServiceData } from './DeployServiceInterface'
import { ServiceRegex } from './DeployServiceUtils'
import { DeployServiceInputStepFormik } from './DeployServiceInputStep'
import DeployServiceWidget from './DeployServiceWidget'

const logger = loggerFor(ModuleName.CD)

export class DeployServiceStep extends Step<DeployServiceData> {
  lastFetched: number
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()
  constructor() {
    super()
    this.lastFetched = new Date().getTime()
    this.invocationMap.set(ServiceRegex, this.getServiceListForYaml.bind(this))
  }

  protected getServiceListForYaml(
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
      const obj = get(pipelineObj, path.replace('.spec.serviceConfig.serviceRef', ''))
      if (obj.type === 'Deployment') {
        return getServiceListPromise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier
          }
        })
          .then(response => {
            const data =
              response?.data?.content?.map(service => ({
                label: service.service?.name || '',
                insertText: service.service?.identifier || '',
                kind: CompletionItemKind.Field
              })) || []
            return data
          })
          .catch(err => {
            return err?.message
          })
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
  }
  renderStep(props: StepProps<DeployServiceData, DeployServiceCustomStepPropType>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      readonly = false,
      allowableTypes,
      customStepProps
    } = props
    if (isTemplatizedView(stepViewType)) {
      return (
        <DeployServiceInputStepFormik
          initialValues={initialValues}
          readonly={readonly}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
          allowableTypes={allowableTypes}
          customStepProps={customStepProps as DeployServiceCustomStepPropType}
        />
      )
    }
    return (
      <DeployServiceWidget
        readonly={readonly}
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
      />
    )
  }
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<DeployServiceData>): FormikErrors<DeployServiceData> {
    const errors = {} as any
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      isEmpty(data?.serviceRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.serviceRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.serviceRef = getString?.('cd.pipelineSteps.serviceTab.serviceIsRequired')
    }
    return errors
  }
  protected stepPaletteVisible = false
  protected type = StepType.DeployService
  protected stepName = 'Deploy Service'
  protected stepIcon: IconName = 'service'

  protected defaultValues: DeployServiceData = {}
}
