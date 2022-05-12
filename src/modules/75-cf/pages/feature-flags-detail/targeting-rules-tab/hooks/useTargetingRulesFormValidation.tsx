/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as yup from 'yup'
import { FormikErrors, validateYupSchema, yupToFormErrors } from 'formik'
import { useStrings } from 'framework/strings'
import type { WeightedVariation } from 'services/cf'
import {
  FormVariationMap,
  TargetingRuleItemStatus,
  TargetingRulesFormValues,
  VariationPercentageRollout
} from '../types'

interface UseTargetingRulesFormValidationReturn {
  validate: (values: TargetingRulesFormValues) => FormikErrors<unknown>
}

const useTargetingRulesFormValidation = (): UseTargetingRulesFormValidationReturn => {
  const { getString } = useStrings()
  const validate = (values: TargetingRulesFormValues): FormikErrors<unknown> => {
    try {
      validateYupSchema(
        values,
        yup.object({
          targetingRuleItems: yup.array().of(
            yup.lazy(v => {
              if ((v as FormVariationMap | VariationPercentageRollout).status === TargetingRuleItemStatus.DELETED) {
                return yup.object({})
              }
              return yup.object({
                clauses: yup.array().of(
                  yup.object({
                    values: yup
                      .array()
                      .of(yup.string().required(getString('cf.featureFlags.rules.validation.selectTargetGroup')))
                  })
                ),
                variations: yup.lazy(value => {
                  return yup.array().of(
                    yup.object({
                      weight: yup
                        .number()
                        .typeError(getString('cf.creationModal.mustBeNumber'))
                        .required(getString('cf.featureFlags.rules.validation.valueRequired'))
                        .test(
                          'weight-sum-test',
                          getString('cf.featureFlags.rules.validation.valueMustAddTo100'),
                          () => {
                            const totalWeight = (value as WeightedVariation[])
                              .map(x => x.weight)
                              .reduce((previous, current) => previous + current, 0)

                            return totalWeight === 100
                          }
                        )
                    })
                  )
                })
              })
            })
          )
        }),
        true,
        values
      )
    } catch (err) {
      return yupToFormErrors(err) //for rendering validation errors
    }

    return {}
  }
  return {
    validate
  }
}

export default useTargetingRulesFormValidation
