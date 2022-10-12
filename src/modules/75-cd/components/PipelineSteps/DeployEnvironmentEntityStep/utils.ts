/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { defaultTo, get, isEmpty, isNil, set } from 'lodash-es'
import type { EnvironmentYamlV2 } from 'services/cd-ng'
import type { DeployEnvironmentEntityConfig, DeployEnvironmentEntityFormState } from './types'

// TODO: Add type check to optionally extends keys
export type ChangeTypeOfKeys<T, N, K extends keyof T> = Pick<T, K> &
  {
    [key in keyof T]: T[key] | N
  }

export function processInitialValues(initialValues: DeployEnvironmentEntityConfig): DeployEnvironmentEntityFormState {
  if (initialValues.environment && initialValues.environment.environmentRef) {
    return processSingleEnvironmentInitialValues(initialValues.environment)
  } else if (initialValues.environments) {
    return processMultiEnvironmentInitialValues(initialValues)
  } else if (initialValues.environmentGroup && initialValues.environmentGroup.envGroupRef) {
    return processEnvironmentGroupInitialValues(initialValues)
  }

  return {}
}

export function processFormValues(data: DeployEnvironmentEntityFormState): DeployEnvironmentEntityConfig {
  if (!isNil(data.environment)) {
    return processSingleEnvironmentFormValues(data)
  } else if (!isNil(data.environmentGroup)) {
    return processEnvironmentGroupFormValues(data)
  } else if (!isNil(data.environments)) {
    return processMultiEnvironmentFormValues(data)
  }
  return {}
}

function processSingleEnvironmentInitialValues(
  environment: DeployEnvironmentEntityConfig['environment']
): DeployEnvironmentEntityFormState {
  if (environment) {
    if (getMultiTypeFromValue(environment.environmentRef) === MultiTypeInputType.RUNTIME) {
      return {
        environment: RUNTIME_INPUT_VALUE
      }
    } else {
      const infrastructureDefinitions = environment.infrastructureDefinitions

      // infrastructure is 1st identifier if infrastructureDefinitions is an array
      const infrastructure = Array.isArray(infrastructureDefinitions)
        ? infrastructureDefinitions[0]?.identifier
        : infrastructureDefinitions

      return {
        environment: environment.environmentRef,
        // if environemntRef is a FIXED value and contains selected environment
        environmentInputs:
          getMultiTypeFromValue(environment.environmentRef) === MultiTypeInputType.FIXED
            ? { [environment.environmentRef]: environment?.environmentInputs }
            : {},
        infrastructure,
        infrastructureInputs:
          // if infrastructureDefinitions is an array and contains selected infrastructure
          Array.isArray(infrastructureDefinitions) && infrastructure
            ? {
                [environment.environmentRef]: {
                  [infrastructure]: infrastructureDefinitions?.[0]?.inputs
                }
              }
            : {}
      }
    }
  }

  return {}
}

function processSingleEnvironmentFormValues(data: DeployEnvironmentEntityFormState): DeployEnvironmentEntityConfig {
  if (!isNil(data.environment)) {
    // ! Do not merge this with the other returns even if they look similar. It makes it confusing to read
    if (getMultiTypeFromValue(data.environment) === MultiTypeInputType.RUNTIME) {
      return {
        environment: {
          environmentRef: RUNTIME_INPUT_VALUE,
          deployToAll: false,
          environmentInputs: RUNTIME_INPUT_VALUE as any,
          serviceOverrideInputs: RUNTIME_INPUT_VALUE as any,
          infrastructureDefinitions: RUNTIME_INPUT_VALUE as any
        }
      }
    } else {
      return {
        environment: {
          environmentRef: data.environment,
          ...(!!data.environmentInputs?.[data.environment] && {
            environmentInputs: data.environmentInputs[data.environment]
          }),
          deployToAll: false,
          ...(data.environment &&
            !!data.infrastructure && {
              infrastructureDefinitions:
                getMultiTypeFromValue(data.infrastructure) === MultiTypeInputType.RUNTIME
                  ? (data.infrastructure as any)
                  : [
                      {
                        identifier: data.infrastructure,
                        inputs: get(data, `infrastructureInputs.${data.environment}.${data.infrastructure}`)
                      }
                    ]
            })
        }
      }
    }
  }

  return {}
}

function getEnvironmentsStateFromFormValues(environments?: EnvironmentYamlV2[]): DeployEnvironmentEntityFormState {
  const formState = {}

  if (getMultiTypeFromValue(environments as unknown as string) !== MultiTypeInputType.FIXED) {
    set(formState, 'environments', environments)
    set(formState, 'environmentInputs', {})
    set(formState, 'infrastructures', [])
    set(formState, 'infrastructureInputs', {})
  } else {
    defaultTo(environments, []).map((environment: EnvironmentYamlV2, index: number) => {
      set(formState, `environments.${index}`, {
        label: environment.environmentRef,
        value: environment.environmentRef
      })

      set(formState, `environmentInputs.${environment.environmentRef}`, environment.environmentInputs)
      set(formState, `serviceOverrideInputs.${environment.environmentRef}`, environment.serviceOverrideInputs)

      if (Array.isArray(environment.infrastructureDefinitions)) {
        environment.infrastructureDefinitions.map((infrastructure, infrastructureIndex) => {
          set(formState, `infrastructures.${environment.environmentRef}.${infrastructureIndex}`, {
            label: infrastructure.identifier,
            value: infrastructure.identifier
          })

          set(
            formState,
            `infrastructureInputs.${environment.environmentRef}.${infrastructure.identifier}`,
            infrastructure.inputs
          )
        })
      } else {
        set(formState, `infrastructures.${environment.environmentRef}`, environment.infrastructureDefinitions)
      }
    })
  }

  return formState
}

function processMultiEnvironmentInitialValues(
  initialValues: DeployEnvironmentEntityConfig
): DeployEnvironmentEntityFormState {
  return {
    parallel: defaultTo(initialValues.environments?.metadata?.parallel, true),
    ...getEnvironmentsStateFromFormValues(initialValues.environments?.values)
  }
}

function getEnvironmentsFormValuesFromState(data: DeployEnvironmentEntityFormState): EnvironmentYamlV2[] {
  return Array.isArray(data.environments)
    ? data.environments?.map(environment => {
        const selectedInfrastructures = data.infrastructures?.[environment.value as string]
        const isInfrastructureRuntime = (selectedInfrastructures as unknown as string) === RUNTIME_INPUT_VALUE

        return {
          environmentRef: environment.value as string,
          ...(!!data.environmentInputs?.[environment.value as string] && {
            environmentInputs: data.environmentInputs[environment.value as string]
          }),
          deployToAll: isInfrastructureRuntime ? (RUNTIME_INPUT_VALUE as any) : !selectedInfrastructures,
          ...(!!selectedInfrastructures && {
            infrastructureDefinitions: Array.isArray(selectedInfrastructures)
              ? selectedInfrastructures.map(infrastructure => ({
                  identifier: infrastructure.value as string,
                  inputs: data.infrastructureInputs?.[environment.value as string]?.[infrastructure.value as string]
                }))
              : selectedInfrastructures
          })
        }
      })
    : data.environments || []
}

function processMultiEnvironmentFormValues(data: DeployEnvironmentEntityFormState): DeployEnvironmentEntityConfig {
  if (!isNil(data.environments)) {
    return {
      environments: {
        metadata: {
          parallel: data.parallel
        },
        values: getEnvironmentsFormValuesFromState(data)
      }
    }
  }
  return {}
}

function processEnvironmentGroupInitialValues(
  initialValues: DeployEnvironmentEntityConfig
): DeployEnvironmentEntityFormState {
  let formState = {}

  if (initialValues.environmentGroup && initialValues.environmentGroup.envGroupRef) {
    set(formState, `environmentGroup`, initialValues.environmentGroup.envGroupRef)

    if (
      getMultiTypeFromValue(initialValues.environmentGroup?.envGroupRef as unknown as string) ===
      MultiTypeInputType.FIXED
    ) {
      formState = { ...formState, ...getEnvironmentsStateFromFormValues(initialValues.environmentGroup.environments) }
    }
  }

  return formState
}

function processEnvironmentGroupFormValues(data: DeployEnvironmentEntityFormState): DeployEnvironmentEntityConfig {
  if (!isNil(data.environmentGroup)) {
    if (getMultiTypeFromValue(data.environmentGroup) === MultiTypeInputType.RUNTIME) {
      return {
        environmentGroup: {
          envGroupRef: RUNTIME_INPUT_VALUE,
          deployToAll: RUNTIME_INPUT_VALUE as any,
          environments: RUNTIME_INPUT_VALUE as any
        }
      }
    }

    return {
      environmentGroup: {
        envGroupRef: data.environmentGroup,
        deployToAll:
          getMultiTypeFromValue(data.environments) === MultiTypeInputType.RUNTIME
            ? (RUNTIME_INPUT_VALUE as any)
            : isEmpty(data.environments),
        environments: getEnvironmentsFormValuesFromState(data)
      }
    }
  }

  return {}
}
