/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import { omit } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import type { UseStringsReturn } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ErrorType, Strategy } from '@pipeline/utils/FailureStrategyUtils'

const MAX_RETRIES = 10000

function updateErrorPaths(e: Yup.ValidationError, prefix = ''): void {
  e.inner.forEach(e2 => {
    e2.path = `${prefix}${e2.path}`

    updateErrorPaths(e2, prefix)
  })
}

export function getRetryActionBaseFields(
  getString: UseStringsReturn['getString']
): Record<string, Yup.Schema<unknown>> {
  return {
    retryCount: Yup.mixed().test({
      name: 'failureStrategies-retryCount',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      test(value: any) {
        if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED) {
          return true
        }

        const schema = Yup.number()
          .typeError(getString('pipeline.failureStrategies.validation.retryCountInteger'))
          .integer(getString('pipeline.failureStrategies.validation.retryCountInteger'))
          .min(1, getString('pipeline.failureStrategies.validation.retryCountMinimum'))
          .max(
            MAX_RETRIES,
            getString('pipeline.failureStrategies.validation.retryCountMaximum', { count: MAX_RETRIES })
          )
          .required(getString('pipeline.failureStrategies.validation.retryCountRequired'))

        try {
          schema.validateSync(value)
          return true
        } catch (e) {
          return this.createError({ message: e.message })
        }
      }
    }),
    retryIntervals: Yup.array().when(
      'retryCount',
      (retryCount: string | number, schema: Yup.NotRequiredArraySchema<unknown>) => {
        if (typeof retryCount === 'string' && getMultiTypeFromValue(retryCount) !== MultiTypeInputType.FIXED) {
          return schema
            .of(
              getDurationValidationSchema().required(
                getString('pipeline.failureStrategies.validation.retryIntervalRequired')
              )
            )
            .min(1, getString('pipeline.failureStrategies.validation.retryIntervalMinimum'))
            .required(getString('pipeline.failureStrategies.validation.retryIntervalRequired'))
        }

        if (typeof retryCount === 'number') {
          return schema
            .of(
              getDurationValidationSchema().required(
                getString('pipeline.failureStrategies.validation.retryIntervalRequired')
              )
            )
            .min(1, getString('pipeline.failureStrategies.validation.retryIntervalMinimum'))
            .max(retryCount, getString('pipeline.failureStrategies.validation.retryIntervalMaxmimum'))
            .required(getString('pipeline.failureStrategies.validation.retryIntervalRequired'))
        }

        return schema
          .of(
            getDurationValidationSchema().required(
              getString('pipeline.failureStrategies.validation.retryIntervalRequired')
            )
          )
          .min(1, getString('pipeline.failureStrategies.validation.retryIntervalMinimum'))
          .required(getString('pipeline.failureStrategies.validation.retryIntervalRequired'))
      }
    )
  }
}

export function getManualInterventionBaseFields(
  getString: UseStringsReturn['getString']
): Record<string, Yup.Schema<unknown>> {
  return {
    timeout: getDurationValidationSchema().required(getString('pipeline.failureStrategies.validation.timeoutRequired'))
  }
}

export interface GetFailureStrategiesValidationSchemaOptions {
  required?: boolean
  minLength?: number
}

export function getFailureStrategiesValidationSchema(
  getString: UseStringsReturn['getString']
): Yup.MixedSchema<unknown> {
  const failureStrategySchema = Yup.object()
    .shape({
      onFailure: Yup.object()
        .shape({
          errors: Yup.array()
            .of(Yup.mixed().oneOf(Object.values(ErrorType)).required())
            .min(1, getString('pipeline.failureStrategies.validation.errorsMinimum'))
            .required(getString('pipeline.failureStrategies.validation.errorsRequired')),
          action: Yup.object()
            .shape({
              type: Yup.mixed()
                .oneOf(Object.values(Strategy))
                .required(getString('pipeline.failureStrategies.validation.actionRequired')),
              spec: Yup.mixed()
                .when('type', {
                  is: Strategy.Retry,
                  then: Yup.object()
                    .shape({
                      ...getRetryActionBaseFields(getString),
                      onRetryFailure: Yup.object()
                        .shape({
                          action: Yup.object().shape({
                            type: Yup.mixed()
                              .oneOf(Object.values(omit(Strategy, [Strategy.Retry])))
                              .required(getString('pipeline.failureStrategies.validation.onRetryFailureRequired')),
                            spec: Yup.mixed().when('type', {
                              is: Strategy.ManualIntervention,
                              then: Yup.object().shape({
                                ...getManualInterventionBaseFields(getString),
                                onTimeout: Yup.object().shape({
                                  action: Yup.object()
                                    .shape({
                                      type: Yup.mixed()
                                        .oneOf(
                                          Object.values(omit(Strategy, [Strategy.ManualIntervention, Strategy.Retry]))
                                        )
                                        .required(getString('pipeline.failureStrategies.validation.onTimeoutRequired'))
                                    })
                                    .required(getString('pipeline.failureStrategies.validation.onTimeoutRequired'))
                                    .required(getString('pipeline.failureStrategies.validation.onTimeoutRequired'))
                                })
                              })
                            })
                          })
                        })
                        .required(getString('pipeline.failureStrategies.validation.onRetryFailureRequired'))
                    })
                    .required()
                })
                .when('type', {
                  is: Strategy.ManualIntervention,
                  then: Yup.object()
                    .shape({
                      ...getManualInterventionBaseFields(getString),
                      onTimeout: Yup.object().shape({
                        action: Yup.object()
                          .shape({
                            type: Yup.mixed()
                              .oneOf(Object.values(omit(Strategy, [Strategy.ManualIntervention])))
                              .required(getString('pipeline.failureStrategies.validation.onTimeoutRequired')),
                            spec: Yup.mixed().when('type', {
                              is: Strategy.Retry,
                              then: Yup.object()
                                .shape({
                                  ...getRetryActionBaseFields(getString),
                                  onRetryFailure: Yup.object()
                                    .shape({
                                      action: Yup.object()
                                        .shape({
                                          type: Yup.mixed()
                                            .oneOf(
                                              Object.values(
                                                omit(Strategy, [Strategy.Retry, Strategy.ManualIntervention])
                                              )
                                            )
                                            .required(
                                              getString('pipeline.failureStrategies.validation.onRetryFailureRequired')
                                            )
                                        })
                                        .required(
                                          getString('pipeline.failureStrategies.validation.onRetryFailureRequired')
                                        )
                                    })
                                    .required(getString('pipeline.failureStrategies.validation.onRetryFailureRequired'))
                                })
                                .required(getString('pipeline.failureStrategies.validation.onRetryFailureRequired'))
                            })
                          })
                          .required(getString('pipeline.failureStrategies.validation.onTimeoutRequired'))
                      })
                    })
                    .required()
                })
            })
            .required(getString('pipeline.failureStrategies.validation.actionRequired'))
        })
        .required()
    })
    .required()

  return Yup.mixed().test({
    name: 'FailureStrategiesArray',
    // we need to implement custom logic due to bug in Yup v0.29.2,
    // where `array().required()` sets minimum required length of the array as 1
    // TODO: get rid of this custom logic once we upgrade Yup
    test(value: unknown): boolean | Yup.ValidationError {
      const isUndefined = typeof value === 'undefined'

      if (!isUndefined && !Array.isArray(value)) {
        return this.createError({
          message: getString('pipeline.failureStrategies.validation.arrayOrUndefined')
        })
      }

      if (Array.isArray(value)) {
        let validationError: boolean | Yup.ValidationError = true

        try {
          Yup.array().of(failureStrategySchema).validateSync(value, { abortEarly: false })
        } catch (e: unknown) {
          validationError = e as Yup.ValidationError
          validationError.path = this.path
          updateErrorPaths(validationError, this.path)
        }

        return validationError
      }

      return true
    }
  })
}

export function getVariablesValidationField(
  getString: UseStringsReturn['getString']
): Record<string, Yup.Schema<unknown>> {
  const requiredValueLabel = getString('common.validation.valueIsRequired')
  return {
    variables: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().trim().required(getString('common.validation.nameIsRequired')),
        value: Yup.lazy((value): Yup.Schema<unknown> => {
          if (typeof value === 'string') {
            return Yup.string().trim().required(requiredValueLabel)
          } else if (typeof value === 'number') {
            return Yup.number().required(requiredValueLabel)
          }
          return Yup.mixed().required(requiredValueLabel)
        })
      })
    )
  }
}
