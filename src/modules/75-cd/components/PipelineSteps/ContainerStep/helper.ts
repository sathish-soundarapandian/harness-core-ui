/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import { get } from 'lodash-es'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import type { UseStringsReturn } from 'framework/strings'
import { cpuLimitRegex, memorLimityRegex } from '@common/utils/StringUtils'
import type { MapType, MultiTypeListUIType } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ContainerStepData } from './types'
import { getConnectorSchema, getNameSpaceSchema } from '../PipelineStepsUtil'

export const processInitialValues = (values: ContainerStepData): ContainerStepData => {
  return {
    ...values,
    spec: {
      ...values.spec,
      outputVariables:
        typeof values?.spec?.outputVariables === 'string'
          ? values?.spec?.outputVariables
          : values?.spec?.outputVariables?.map((_value: any) => ({
              id: uuid('', nameSpace()),
              value: _value.name
            })) || [],
      envVariables:
        typeof values.spec.envVariables === 'string'
          ? values.spec.envVariables
          : Object.keys(values.spec.envVariables || {})?.map(key => ({
              id: uuid('', nameSpace()),
              key: key,
              value: values?.spec?.envVariables?.[key]
            }))
    }
  }
}

export const processFormData = (_values: ContainerStepData): ContainerStepData => {
  const values = Object.assign({}, _values)
  const envVar = get(values, 'spec.envVariables')
  const map: MapType = {}
  if (Array.isArray(envVar)) {
    envVar.forEach(mapValue => {
      if (mapValue.key) {
        map[mapValue.key] = mapValue.value
      }
    })
  }
  const outputVar = get(values, 'spec.outputVariables') as MultiTypeListUIType
  const outputVarlist =
    typeof outputVar === 'string'
      ? outputVar
      : outputVar
          ?.filter(listValue => !!listValue.value)
          .map(listValue => ({
            name: listValue.value
          }))

  return {
    ...values,
    spec: {
      ...values.spec,
      connectorRef: values.spec.connectorRef,
      outputVariables: outputVarlist,
      envVariables: typeof envVar === 'string' ? envVar : map
    }
  }
}

export const getValidationSchema = (getString: UseStringsReturn['getString'], stepViewType: StepViewType) => {
  return Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      connectorRef: Yup.string().required(
        getString('common.validation.fieldIsRequired', { name: getString('pipelineSteps.connectorLabel') })
      ),
      image: Yup.string().required(getString('common.validation.fieldIsRequired', { name: getString('imageLabel') })),
      command: Yup.string().required(
        getString('common.validation.fieldIsRequired', { name: getString('commandLabel') })
      ),
      infrastructure: Yup.object().shape({
        spec: Yup.object().shape({
          connectorRef: getConnectorSchema(getString),
          namespace: getNameSpaceSchema(getString),
          resources: Yup.object().shape({
            limits: Yup.object().shape({
              cpu: Yup.string()
                .required(
                  getString('common.validation.fieldIsRequired', { name: getString('pipelineSteps.limitCPULabel') })
                )
                .matches(cpuLimitRegex, getString('pipeline.stepCommonFields.validation.invalidLimitCPU')),
              memory: Yup.string()
                .required(
                  getString('common.validation.fieldIsRequired', { name: getString('pipelineSteps.limitMemoryLabel') })
                )
                .matches(memorLimityRegex, getString('pipeline.stepCommonFields.validation.invalidLimitMemory'))
            })
          })
        })
      })
    })
  })
}
