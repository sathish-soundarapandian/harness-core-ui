/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { defaultTo, set } from 'lodash-es'
import type { EnvironmentYamlV2 } from 'services/cd-ng'
import { isValueRuntimeInput } from '@common/utils/utils'
import type { DeployEnvironmentEntityConfig, DeployEnvironmentEntityFormState, FilterYaml } from '../types'

export function processFiltersInitialValues(
  filters?: FilterYaml[]
): NonNullable<DeployEnvironmentEntityFormState['environmentGroupFilters']> {
  return defaultTo(filters, []).map((filter: FilterYaml) => ({
    ...filter,
    entities: filter?.entities?.map(entity => ({
      // ? Can we use getString here?
      label: entity === 'environments' ? 'Environments' : entity === 'gitOpsClusters' ? 'Clusters' : 'Infrastructures',
      value: entity
    }))
  }))
}

export function processSingleEnvironmentInitialValues(
  environment: DeployEnvironmentEntityConfig['environment'],
  gitOpsEnabled: boolean
): DeployEnvironmentEntityFormState {
  const formState: DeployEnvironmentEntityFormState = {}

  if (environment) {
    if (getMultiTypeFromValue(environment.environmentRef) === MultiTypeInputType.RUNTIME) {
      set(formState, 'environment', RUNTIME_INPUT_VALUE)
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
  gitOpsEnabled?: boolean
): DeployEnvironmentEntityFormState {
  const formState = {}

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
        label: environment.environmentRef,
        value: environment.environmentRef
      })

      set(formState, `environmentInputs.${environment.environmentRef}`, environment.environmentInputs)

      const environmentFilters = processFiltersInitialValues((environment as any).filters)
      if (environmentFilters.length) {
        set(formState, `environmentFilters.${environment.environmentRef}`, environmentFilters)
      } else {
        if (gitOpsEnabled) {
          if (Array.isArray(environment.gitOpsClusters)) {
            environment.gitOpsClusters.map((gitOpsCluster, clusterIndex) => {
              set(formState, `clusters.${environment.environmentRef}.${clusterIndex}`, {
                label: gitOpsCluster.identifier,
                value: gitOpsCluster.identifier
              })
            })
          } else {
            set(formState, `clusters.${environment.environmentRef}`, environment.gitOpsClusters)
          }
        } else {
          if (environment.deployToAll !== true) {
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
          }
        }
      }
    })
  }

  return formState
}

export function processMultiEnvironmentInitialValues(
  initialValues: DeployEnvironmentEntityConfig,
  gitOpsEnabled: boolean
): DeployEnvironmentEntityFormState {
  const environmentValues = getEnvironmentsFormStateFromInitialValues(
    initialValues.environments?.values,
    false,
    gitOpsEnabled
  )
  const environmentFilters = processFiltersInitialValues((initialValues.environments as any)?.filters)

  return {
    parallel: defaultTo(initialValues.environments?.metadata?.parallel, true),
    category: 'multi',
    ...getEnvironmentsFormStateFromInitialValues(initialValues.environments?.values, false, gitOpsEnabled),
    ...(environmentFilters.length &&
      isValueRuntimeInput(environmentValues.environments) && { environmentFilters: { runtime: environmentFilters } })
  }
}

export function processEnvironmentGroupInitialValues(
  initialValues: DeployEnvironmentEntityConfig,
  gitOpsEnabled: boolean
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
          gitOpsEnabled
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
  return formState
}
