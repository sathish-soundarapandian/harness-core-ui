/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { isEmpty, isEqual, isNil } from 'lodash-es'
import * as Yup from 'yup'
import type { UseStringsReturn } from 'framework/strings'
import { isValueRuntimeInput } from '@common/utils/utils'
import type {
  DeployEnvironmentEntityConfig,
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState
} from '../types'
import {
  processEnvironmentGroupInitialValues,
  processMultiEnvironmentInitialValues,
  processSingleEnvironmentGitOpsInitialValues,
  processSingleEnvironmentInitialValues
} from './processInitialValuesUtils'
import {
  processEnvironmentGroupFormValues,
  processMultiEnvironmentFormValues,
  processSingleEnvironmentFormValues,
  processSingleEnvironmentGitOpsFormValues
} from './processFormValuesUtils'

export function processInitialValues(
  initialValues: DeployEnvironmentEntityConfig,
  customStepProps: DeployEnvironmentEntityCustomStepProps,
  onUpdate?: (data: DeployEnvironmentEntityConfig) => void
): DeployEnvironmentEntityFormState {
  const gitOpsEnabled = !!customStepProps.gitOpsEnabled

  // istanbul ignore else
  if (initialValues.environment && initialValues.environment.environmentRef) {
    if (gitOpsEnabled) {
      return processSingleEnvironmentGitOpsInitialValues(initialValues.environment)
    } else {
      // this is backwards compatibility for single env multiple clusters in the older redesign setup
      if (
        Array.isArray(initialValues.environment.gitOpsClusters) &&
        initialValues.environment.gitOpsClusters.length > 1
      ) {
        return processMultiEnvironmentInitialValues(
          {
            environments: {
              metadata: {
                parallel: false
              },
              values: [{ ...initialValues.environment }]
            }
          },
          customStepProps
        )
      }
      return processSingleEnvironmentInitialValues(initialValues.environment, customStepProps)
    }
  } else if (initialValues.environments) {
    return processMultiEnvironmentInitialValues(initialValues, customStepProps)
  } else if (initialValues.environmentGroup) {
    // This handles the migration from runtime environment group of old pipeline to post multi infra handling
    if (
      isEqual(initialValues.environmentGroup, {
        envGroupRef: RUNTIME_INPUT_VALUE,
        deployToAll: true
      })
    ) {
      const updatedInitialValues = {
        environmentGroup: {
          envGroupRef: RUNTIME_INPUT_VALUE,
          deployToAll: RUNTIME_INPUT_VALUE as any,
          environments: RUNTIME_INPUT_VALUE as any
        }
      }

      onUpdate?.(updatedInitialValues)
      return processEnvironmentGroupInitialValues(updatedInitialValues, customStepProps)
    } else if (
      // This handles the migration from 'all' environments under environment group of old pipeline to post multi infra handling
      initialValues.environmentGroup.deployToAll === true &&
      !isValueRuntimeInput(initialValues.environmentGroup.envGroupRef) &&
      isNil(initialValues.environmentGroup.envGroupRef)
    ) {
      const updatedInitialValues = {
        environmentGroup: {
          envGroupRef: initialValues.environmentGroup.envGroupRef,
          deployToAll: true,
          environments: RUNTIME_INPUT_VALUE as any
        }
      }

      onUpdate?.(updatedInitialValues)
      return processEnvironmentGroupInitialValues(updatedInitialValues, customStepProps)
    }

    return processEnvironmentGroupInitialValues(initialValues, customStepProps)
  }

  return {
    category: 'single'
  }
}

export function processFormValues(
  data: DeployEnvironmentEntityFormState,
  customStepProps: DeployEnvironmentEntityCustomStepProps
): DeployEnvironmentEntityConfig {
  const gitOpsEnabled = !!customStepProps.gitOpsEnabled

  // istanbul ignore else
  if (data.category === 'single') {
    if (gitOpsEnabled) {
      return processSingleEnvironmentGitOpsFormValues(data)
    } else {
      return processSingleEnvironmentFormValues(data, customStepProps)
    }
  } else if (data.category === 'group') {
    return processEnvironmentGroupFormValues(data, customStepProps)
  } else if (data.category === 'multi') {
    return processMultiEnvironmentFormValues(data, customStepProps)
  }
  return {}
}

export function getValidationSchema(getString: UseStringsReturn['getString'], gitOpsEnabled: boolean): Yup.MixedSchema {
  return Yup.mixed()
    .required()
    .test({
      test(valueObj: DeployEnvironmentEntityFormState): boolean | Yup.ValidationError {
        if (valueObj.category === 'single') {
          if (!valueObj.environment) {
            return this.createError({
              path: 'environment',
              message: getString('cd.pipelineSteps.environmentTab.environmentIsRequired')
            })
          }

          if (!gitOpsEnabled && !valueObj.infrastructure && !isValueRuntimeInput(valueObj.environment)) {
            return this.createError({
              path: 'infrastructure',
              message: getString('cd.pipelineSteps.environmentTab.infrastructureIsRequired')
            })
          }

          // To be put back once BE supports multi environments
          // if (gitOpsEnabled && !valueObj.cluster && !isValueRuntimeInput(valueObj.environment)) {
          //   return this.createError({
          //     path: 'cluster',
          //     message: getString('cd.pipelineSteps.environmentTab.clusterIsRequired')
          //   })
          // }
        } else if (valueObj.category === 'multi') {
          if (
            !(Array.isArray(valueObj.environments) && valueObj.environments.length) &&
            !isValueRuntimeInput(valueObj.environments as unknown as string) &&
            isEmpty(valueObj.environmentFilters?.['fixedScenario'])
          ) {
            return this.createError({
              path: 'environments',
              message: getString('cd.pipelineSteps.environmentTab.environmentsAreRequired')
            })
          }
        } else if (valueObj.category === 'group') {
          if (!valueObj.environmentGroup) {
            return this.createError({
              path: 'environmentGroup',
              message: getString('cd.pipelineSteps.environmentTab.environmentGroupIsRequired')
            })
          }
        }

        return true
      }
    })
}
