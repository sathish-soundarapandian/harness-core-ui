/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { defaultTo, get, isEmpty, isNil, set } from 'lodash-es'
import type { EnvironmentYamlV2, FilterYaml } from 'services/cd-ng'
import { isValueRuntimeInput } from '@common/utils/utils'
import type {
  DeployEnvironmentEntityConfig,
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState
} from '../types'

export function processFiltersFormValues(
  filters?: DeployEnvironmentEntityFormState['environmentGroupFilters']
): FilterYaml[] {
  return defaultTo(filters, [])
}

export function processSingleEnvironmentFormValues(
  data: DeployEnvironmentEntityFormState,
  customStepProps: DeployEnvironmentEntityCustomStepProps
): DeployEnvironmentEntityConfig {
  const { gitOpsEnabled, serviceIdentifiers } = customStepProps
  if (!isNil(data.environment)) {
    // ! Do not merge this with the other returns even if they look similar. It makes it confusing to read
    if (getMultiTypeFromValue(data.environment) === MultiTypeInputType.RUNTIME) {
      return {
        environment: {
          environmentRef: RUNTIME_INPUT_VALUE,
          deployToAll: false,
          ...(!isEmpty(data.provisioner) && { provisioner: data.provisioner }),
          environmentInputs: RUNTIME_INPUT_VALUE as any,
          serviceOverrideInputs: RUNTIME_INPUT_VALUE as any,
          ...(gitOpsEnabled
            ? { gitOpsClusters: RUNTIME_INPUT_VALUE as any }
            : { infrastructureDefinitions: RUNTIME_INPUT_VALUE as any })
        }
      }
    } else {
      return {
        environment: {
          environmentRef: data.environment,
          ...(!!data.environmentInputs?.[data.environment] && {
            environmentInputs: data.environmentInputs[data.environment]
          }),
          ...(!!data.serviceOverrideInputs?.[data.environment]?.[serviceIdentifiers?.[0] as string] && {
            serviceOverrideInputs: data.serviceOverrideInputs?.[data.environment]?.[serviceIdentifiers?.[0] as string]
          }),
          deployToAll: false,
          ...(!isEmpty(data.provisioner) && { provisioner: data.provisioner }),
          ...(data.environment &&
            !!data.infrastructure && {
              infrastructureDefinitions:
                getMultiTypeFromValue(data.infrastructure) === MultiTypeInputType.RUNTIME
                  ? (data.infrastructure as any)
                  : [
                      {
                        identifier: data.infrastructure,
                        inputs: get(data, `infrastructureInputs.['${data.environment}'].${data.infrastructure}`)
                      }
                    ]
            }),
          ...(data.environment &&
            !!data.cluster && {
              gitOpsClusters:
                getMultiTypeFromValue(data.cluster) === MultiTypeInputType.RUNTIME
                  ? (data.cluster as any)
                  : [
                      {
                        identifier: data.cluster
                      }
                    ]
            })
        }
      }
    }
  }

  return {}
}

export function processSingleEnvironmentGitOpsFormValues(
  data: DeployEnvironmentEntityFormState
): DeployEnvironmentEntityConfig {
  if (!isNil(data.environment)) {
    // ! Do not merge this with the other returns even if they look similar. It makes it confusing to read
    if (getMultiTypeFromValue(data.environment) === MultiTypeInputType.RUNTIME) {
      const filters = processFiltersFormValues(data.environmentFilters?.runtime)
      return {
        environment: {
          environmentRef: RUNTIME_INPUT_VALUE,
          ...(filters.length
            ? { filters }
            : {
                deployToAll: RUNTIME_INPUT_VALUE as any,
                environmentInputs: RUNTIME_INPUT_VALUE as any,
                gitOpsClusters: RUNTIME_INPUT_VALUE as any
              })
        }
      }
    } else {
      const selectedClusters = data.clusters?.[data.environment as string]

      const deployToAll =
        getMultiTypeFromValue(selectedClusters) === MultiTypeInputType.RUNTIME
          ? (RUNTIME_INPUT_VALUE as any)
          : isEmpty(selectedClusters)

      return {
        environment: {
          environmentRef: data.environment,
          ...(!!data.environmentInputs?.[data.environment] && {
            environmentInputs: data.environmentInputs[data.environment]
          }),
          ...(!isEmpty(data.provisioner) && { provisioner: data.provisioner }),
          deployToAll,
          ...(!isEmpty(data.clusters) && {
            gitOpsClusters: Array.isArray(selectedClusters)
              ? selectedClusters?.map(cluster => ({
                  identifier: cluster.value as string
                }))
              : selectedClusters
          })
        }
      }
    }
  }

  return {}
}

export function getEnvironmentsFormValuesFromFormState(
  data: DeployEnvironmentEntityFormState,
  customStepProps: DeployEnvironmentEntityCustomStepProps
): EnvironmentYamlV2[] {
  const { gitOpsEnabled } = customStepProps

  return Array.isArray(data.environments)
    ? data.environments?.map(environment => {
        const environmentsFormState: EnvironmentYamlV2 = {
          environmentRef: environment.value as string
        }

        if (data.environmentInputs?.[environment.value as string]) {
          set(environmentsFormState, 'environmentInputs', data.environmentInputs[environment.value as string])
        }

        const environmentFilters = processFiltersFormValues(data?.environmentFilters?.[environment.value as string])

        if (environmentFilters.length) {
          set(environmentsFormState, 'filters', environmentFilters)
        } else {
          if (gitOpsEnabled) {
            const selectedClusters = data.clusters?.[environment.value as string]
            const isClusterRuntime = (selectedClusters as unknown as string) === RUNTIME_INPUT_VALUE

            const deployToAll = isClusterRuntime ? (RUNTIME_INPUT_VALUE as any) : !selectedClusters

            set(environmentsFormState, 'deployToAll', deployToAll)

            if (selectedClusters) {
              set(
                environmentsFormState,
                'gitOpsClusters',
                Array.isArray(selectedClusters)
                  ? selectedClusters.map(cluster => ({
                      identifier: cluster.value as string
                    }))
                  : selectedClusters
              )
            }
          } else {
            const selectedInfrastructures = data.infrastructures?.[environment.value as string]
            const isInfrastructureRuntime = (selectedInfrastructures as unknown as string) === RUNTIME_INPUT_VALUE

            const deployToAll = isInfrastructureRuntime ? (RUNTIME_INPUT_VALUE as any) : !selectedInfrastructures

            set(environmentsFormState, 'deployToAll', deployToAll)

            if (deployToAll === true) {
              set(environmentsFormState, 'infrastructureDefinitions', RUNTIME_INPUT_VALUE)
            }

            if (selectedInfrastructures) {
              set(
                environmentsFormState,
                'infrastructureDefinitions',
                Array.isArray(selectedInfrastructures)
                  ? selectedInfrastructures.map(infrastructure => ({
                      identifier: infrastructure.value as string,
                      inputs: data.infrastructureInputs?.[environment.value as string]?.[infrastructure.value as string]
                    }))
                  : selectedInfrastructures
              )
            }
          }
        }

        return environmentsFormState
      })
    : data.environments || []
}

export function processMultiEnvironmentFormValues(
  data: DeployEnvironmentEntityFormState,
  customStepProps: DeployEnvironmentEntityCustomStepProps
): DeployEnvironmentEntityConfig {
  const filters = processFiltersFormValues(data?.environmentFilters?.runtime)
  const fixedEnvfilters = processFiltersFormValues(data?.environmentFilters?.fixedScenario)
  const environmentValues = getEnvironmentsFormValuesFromFormState(data, customStepProps)

  if (fixedEnvfilters.length) {
    return {
      environments: {
        metadata: {
          parallel: data.parallel
        },
        filters: fixedEnvfilters
        // TODO: remove this on BE swagger update
      } as any
    }
  }

  if (!isNil(data.environments)) {
    return {
      environments: {
        metadata: {
          parallel: data.parallel
        },
        values: environmentValues,
        ...(filters.length && isValueRuntimeInput(environmentValues as unknown as string) && { filters })
      }
    }
  }

  return {
    environments: {
      metadata: {
        parallel: data.parallel
      },
      values: []
    }
  }
}

export function processEnvironmentGroupFormValues(
  data: DeployEnvironmentEntityFormState,
  customStepProps: DeployEnvironmentEntityCustomStepProps
): DeployEnvironmentEntityConfig {
  if (!isNil(data.environmentGroup)) {
    const filters = processFiltersFormValues(data?.environmentGroupFilters)
    const environmentFilters = processFiltersFormValues(data?.environmentFilters?.runtime)
    const infraClusterFilters = processFiltersFormValues(data?.infraClusterFilters)

    if (getMultiTypeFromValue(data.environmentGroup) === MultiTypeInputType.RUNTIME) {
      return {
        environmentGroup: {
          envGroupRef: RUNTIME_INPUT_VALUE,
          metadata: {
            parallel: data.parallel
          },
          ...(filters.length
            ? { filters }
            : {
                deployToAll: RUNTIME_INPUT_VALUE as any,
                environments: RUNTIME_INPUT_VALUE as any
              }),
          ...(infraClusterFilters.length && { filters: infraClusterFilters })
        }
      }
    } else {
      const deployToAll =
        getMultiTypeFromValue(data.environments) === MultiTypeInputType.RUNTIME
          ? (RUNTIME_INPUT_VALUE as any)
          : isEmpty(data.environments)

      return {
        environmentGroup: {
          envGroupRef: data.environmentGroup,
          metadata: {
            parallel: data.parallel
          },
          ...(filters?.length
            ? { filters }
            : {
                deployToAll,
                // this an off condition that is used to handle deployToAll in environment groups
                ...(deployToAll === true && { environments: RUNTIME_INPUT_VALUE as any }),
                ...(!isEmpty(data.environments) && {
                  environments: getEnvironmentsFormValuesFromFormState(data, customStepProps)
                })
              }),
          ...(environmentFilters.length && { filters: environmentFilters })
        }
      }
    }
  }

  return {
    environmentGroup: {
      envGroupRef: ''
    }
  }
}
