/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { defaultTo, set } from 'lodash-es'
import type { EnvironmentYamlV2, FilterYaml } from 'services/cd-ng'
import { getIdentifierFromScopedRef, isValueRuntimeInput } from '@common/utils/utils'
import type {
  DeployEnvironmentEntityConfig,
  DeployEnvironmentEntityCustomStepProps,
  DeployEnvironmentEntityFormState
} from '../types'

export function processFiltersInitialValues(
  filters?: FilterYaml[]
): NonNullable<DeployEnvironmentEntityFormState['environmentGroupFilters']> {
  return defaultTo(filters, [])
}

export function processSingleEnvironmentInitialValues(
  environment: DeployEnvironmentEntityConfig['environment'],
  customStepProps: DeployEnvironmentEntityCustomStepProps
): DeployEnvironmentEntityFormState {
  const formState: DeployEnvironmentEntityFormState = {}
  const { gitOpsEnabled, serviceIdentifiers } = customStepProps

  if (environment) {
    if (getMultiTypeFromValue(environment.environmentRef) === MultiTypeInputType.RUNTIME) {
      set(formState, 'environment', RUNTIME_INPUT_VALUE)
      set(formState, 'provisioner', environment.provisioner)
    } else {
      set(formState, 'environment', environment.environmentRef)
      set(formState, 'provisioner', environment.provisioner)
      // if environmentRef is a FIXED value and contains selected environment
      set(
        formState,
        'environmentInputs',
        getMultiTypeFromValue(environment.environmentRef) === MultiTypeInputType.FIXED
          ? { [environment.environmentRef]: environment?.environmentInputs }
          : {}
      )

      set(
        formState,
        'serviceOverrideInputs',
        getMultiTypeFromValue(environment.environmentRef) === MultiTypeInputType.FIXED && serviceIdentifiers?.length
          ? {
              [environment.environmentRef]: {
                [serviceIdentifiers?.[0] as string]: environment?.serviceOverrideInputs
              }
            }
          : {}
      )

      // This is clusters specific handling
      if (gitOpsEnabled) {
        const gitOpsClusters = environment.gitOpsClusters

        // infrastructure is 1st identifier if gitOpsClusters is an array
        const cluster = Array.isArray(gitOpsClusters) ? gitOpsClusters[0]?.identifier : gitOpsClusters

        set(formState, 'cluster', cluster)
      } else {
        const infrastructureDefinitions = environment.infrastructureDefinitions

        // infrastructure is 1st identifier if infrastructureDefinitions is an array
        const infrastructure = Array.isArray(infrastructureDefinitions)
          ? infrastructureDefinitions[0]?.identifier
          : infrastructureDefinitions

        set(formState, 'infrastructure', infrastructure)
        // if infrastructureDefinitions is an array and contains selected infrastructure
        set(
          formState,
          'infrastructureInputs',
          Array.isArray(infrastructureDefinitions) && infrastructure
            ? {
                [environment.environmentRef]: {
                  [infrastructure]: infrastructureDefinitions?.[0]?.inputs
                }
              }
            : {}
        )
      }
    }
  }

  formState.category = 'single'
  return formState
}

export function processSingleEnvironmentGitOpsInitialValues(
  environment: DeployEnvironmentEntityConfig['environment']
): DeployEnvironmentEntityFormState {
  const formState: DeployEnvironmentEntityFormState = {}

  if (environment) {
    if (getMultiTypeFromValue(environment.environmentRef) === MultiTypeInputType.RUNTIME) {
      set(formState, 'environment', RUNTIME_INPUT_VALUE)
      set(formState, 'provisioner', environment.provisioner)
      const filters = processFiltersInitialValues((environment as any).filters)
      if (filters.length) {
        set(formState, 'environmentFilters.runtime', filters)
      }
    } else {
      set(formState, 'environment', environment.environmentRef)
      // if environmentRef is a FIXED value and contains selected environment
      set(
        formState,
        'environmentInputs',
        getMultiTypeFromValue(environment.environmentRef) === MultiTypeInputType.FIXED
          ? { [environment.environmentRef]: environment?.environmentInputs }
          : {}
      )
      set(formState, 'provisioner', environment.provisioner)
      if (environment.deployToAll !== true) {
        set(
          formState,
          `clusters.${environment.environmentRef}`,
          Array.isArray(environment.gitOpsClusters)
            ? environment.gitOpsClusters?.map(gitOpsCluster => ({
                label: gitOpsCluster.identifier,
                value: gitOpsCluster.identifier
              }))
            : environment.gitOpsClusters
        )
      }
    }
  }

  formState.category = 'single'
  return formState
}

export function getEnvironmentsFormStateFromInitialValues(
  environments?: EnvironmentYamlV2[],
  deployToAll?: boolean,
  customStepProps: DeployEnvironmentEntityCustomStepProps = {}
): DeployEnvironmentEntityFormState {
  const formState = {}
  const { gitOpsEnabled } = customStepProps

  if (getMultiTypeFromValue(environments as unknown as string) !== MultiTypeInputType.FIXED) {
    if (deployToAll !== true) {
      set(formState, 'environments', environments)
    }
    set(formState, 'environmentInputs', {})
    if (gitOpsEnabled) {
      set(formState, 'clusters', {})
    } else {
      set(formState, 'infrastructures', {})
      set(formState, 'infrastructureInputs', {})
    }
  } else {
    defaultTo(environments, []).map((environment: EnvironmentYamlV2, index: number) => {
      set(formState, `environments.${index}`, {
        label: getIdentifierFromScopedRef(environment.environmentRef),
        value: environment.environmentRef
      })

      set(formState, `environmentInputs.['${environment.environmentRef}']`, environment.environmentInputs)

      const environmentFilters = processFiltersInitialValues((environment as any).filters)
      if (environmentFilters.length) {
        set(formState, `environmentFilters.['${environment.environmentRef}']`, environmentFilters)
      } else {
        if (gitOpsEnabled) {
          if (Array.isArray(environment.gitOpsClusters)) {
            environment.gitOpsClusters.map((gitOpsCluster, clusterIndex) => {
              set(formState, `clusters.['${environment.environmentRef}'].${clusterIndex}`, {
                label: gitOpsCluster.identifier,
                value: gitOpsCluster.identifier
              })
            })
          } else {
            set(formState, `clusters.['${environment.environmentRef}']`, environment.gitOpsClusters)
          }
        } else {
          if (environment.deployToAll !== true) {
            if (Array.isArray(environment.infrastructureDefinitions)) {
              environment.infrastructureDefinitions.map((infrastructure, infrastructureIndex) => {
                set(formState, `infrastructures.['${environment.environmentRef}'].${infrastructureIndex}`, {
                  label: infrastructure.identifier,
                  value: infrastructure.identifier
                })

                set(
                  formState,
                  `infrastructureInputs.['${environment.environmentRef}'].${infrastructure.identifier}`,
                  infrastructure.inputs
                )
              })
            } else {
              set(formState, `infrastructures.['${environment.environmentRef}']`, environment.infrastructureDefinitions)
            }
          }
        }
      }
    })
  }

  return formState
}

export function processMultiEnvironmentInitialValues(
  initialValues: DeployEnvironmentEntityConfig,
  customStepProps: DeployEnvironmentEntityCustomStepProps
): DeployEnvironmentEntityFormState {
  const environmentValues = getEnvironmentsFormStateFromInitialValues(
    initialValues.environments?.values,
    false,
    customStepProps
  )
  const environmentFilters = processFiltersInitialValues((initialValues.environments as any)?.filters)

  return {
    parallel: defaultTo(initialValues.environments?.metadata?.parallel, true),
    category: 'multi',
    ...getEnvironmentsFormStateFromInitialValues(initialValues.environments?.values, false, customStepProps),
    ...(environmentFilters.length &&
      (isValueRuntimeInput(environmentValues.environments) || !initialValues.environments?.values) && {
        environmentFilters: {
          [`${initialValues.environments?.values ? 'runtime' : 'fixedScenario'}`]: environmentFilters
        }
      })
  }
}

export function processEnvironmentGroupInitialValues(
  initialValues: DeployEnvironmentEntityConfig,
  customStepProps: DeployEnvironmentEntityCustomStepProps
): DeployEnvironmentEntityFormState {
  let formState: DeployEnvironmentEntityFormState = {}

  if (initialValues.environmentGroup && initialValues.environmentGroup.envGroupRef) {
    set(formState, `environmentGroup`, initialValues.environmentGroup.envGroupRef)

    if (
      getMultiTypeFromValue(initialValues.environmentGroup?.envGroupRef as unknown as string) ===
      MultiTypeInputType.FIXED
    ) {
      formState = {
        ...formState,
        ...getEnvironmentsFormStateFromInitialValues(
          initialValues.environmentGroup.environments,
          initialValues.environmentGroup.deployToAll,
          customStepProps
        )
      }
    }

    const isEnvironmentGroupRuntime = isValueRuntimeInput(initialValues.environmentGroup.envGroupRef)
    const areEnvironmentsRuntime = isValueRuntimeInput(initialValues.environmentGroup.environments as unknown as string)

    const filters = processFiltersInitialValues((initialValues.environmentGroup as any).filters)
    if (filters.length) {
      set(
        formState,
        areEnvironmentsRuntime
          ? isEnvironmentGroupRuntime
            ? 'infraClusterFilters'
            : 'environmentFilters.runtime'
          : 'environmentGroupFilters',
        filters
      )
    }
  }

  formState.category = 'group'
  formState.parallel = defaultTo(initialValues.environmentGroup?.metadata?.parallel, true)
  return formState
}
