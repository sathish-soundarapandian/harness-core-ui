/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FormikErrors, yupToFormErrors } from 'formik'
import { defaultTo, get, isArray, isEmpty, isNil } from 'lodash-es'
import * as Yup from 'yup'

import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption,
  MultiSelectWithSubmenuOption,
  AllowedTypes
} from '@harness/uicore'
import type { StringsMap } from 'stringTypes'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import type { UseStringsReturn } from 'framework/strings'

import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'

import type { DeployStageConfig } from '@pipeline/utils/DeployStageInterface'
import { StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'

export interface DeployInfrastructureProps {
  initialValues: DeployStageConfig
  onUpdate?: (data: DeployStageConfig) => void
  readonly: boolean
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  serviceRef?: string
  inputSetData?: {
    template?: DeployStageConfig
    path?: string
    readonly?: boolean
    allValues?: DeployStageConfig
  }
}

export interface CustomStepProps extends DeployStageConfig {
  getString: (key: keyof StringsMap) => string
  serviceRef?: string
  environmentRef?: string
  infrastructureRef?: string
  clusterRef?: string
}

export function isEditEnvironment(data?: EnvironmentResponseDTO): boolean {
  if (!isEmpty(data?.identifier)) {
    return true
  }
  return false
}

export function isEditEnvironmentOrEnvGroup(data?: EnvironmentResponseDTO): boolean {
  if (!isEmpty(data?.identifier)) {
    return true
  }
  return false
}

export function isEditInfrastructure(data?: string): boolean {
  if (!isEmpty(data)) {
    return true
  }
  return false
}

export function validateStepForm({
  data,
  template,
  getString,
  viewType
}: ValidateInputSetProps<any>): FormikErrors<any> {
  const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errors = {} as any
  // istanbul ignore next
  // istanbul ignore else
  if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
    // istanbul ignore next
    let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
    // istanbul ignore next
    if (isRequired) {
      // istanbul ignore next
      timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
    }
    const timeout = Yup.object().shape({
      timeout: timeoutSchema
    })

    try {
      timeout.validateSync(data)
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

export function processNonGitOpsInitialValues(initialValues: DeployStageConfig): DeployStageConfig {
  return {
    environment: {
      environmentRef: defaultTo(initialValues.environment?.environmentRef, ''),
      deployToAll: defaultTo(initialValues.environment?.deployToAll, false)
    },
    infrastructureRef: (initialValues.environment?.infrastructureDefinitions?.[0]?.identifier ||
      initialValues.environment?.infrastructureDefinitions ||
      '') as string
  }
}

export function processNonGitOpsFormValues(data: DeployStageConfig): DeployStageConfig {
  return {
    environment: {
      environmentRef: data.environment?.environmentRef,
      deployToAll: false,
      ...(data.environment?.environmentRef && data.environment?.environmentRef === RUNTIME_INPUT_VALUE
        ? {
            environmentInputs: RUNTIME_INPUT_VALUE,
            serviceOverrideInputs: RUNTIME_INPUT_VALUE,
            infrastructureDefinitions: RUNTIME_INPUT_VALUE
          }
        : {
            ...(data.environment?.environmentInputs && { environmentInputs: data.environment?.environmentInputs }),
            ...(data.environment?.serviceOverrideInputs && {
              serviceOverrideInputs: data.environment?.serviceOverrideInputs
            })
          }),
      ...(data.environment?.environmentRef &&
        data.environment?.environmentRef !== RUNTIME_INPUT_VALUE &&
        data.infrastructureRef && {
          ...(data.infrastructureRef === RUNTIME_INPUT_VALUE
            ? { infrastructureDefinitions: RUNTIME_INPUT_VALUE }
            : {
                ...(isEmpty(data.infrastructureInputs) && isNil(data.infrastructureInputs)
                  ? {
                      infrastructureDefinitions: [
                        {
                          identifier: data.infrastructureRef
                        }
                      ]
                    }
                  : data.infrastructureRef && { ...data?.infrastructureInputs })
              })
        })
    }
  }
}

export function processGitOpsEnvironmentInitialValues(
  initialValues: DeployStageConfig,
  getString: UseStringsReturn['getString']
): DeployStageConfig {
  return {
    isEnvGroup: false,
    environmentOrEnvGroupRef: defaultTo(initialValues.environment?.environmentRef, ''),
    environmentOrEnvGroupAsRuntime: 'Environment',
    deployToAll: defaultTo(initialValues.environment?.deployToAll, false),
    clusterRef:
      getMultiTypeFromValue(initialValues.environment?.gitOpsClusters as unknown as string) ===
      MultiTypeInputType.RUNTIME
        ? RUNTIME_INPUT_VALUE
        : initialValues.environment?.deployToAll
        ? [
            {
              label: getString('cd.pipelineSteps.environmentTab.allClustersSelected'),
              value: getString('all')
            }
          ]
        : defaultTo(initialValues.environment?.gitOpsClusters, [])?.map(cluster => {
            return {
              label: cluster.identifier,
              value: cluster.identifier
            }
          })
  }
}

export function processGitOpsEnvironmentFormValues(
  data: DeployStageConfig,
  getString: UseStringsReturn['getString']
): DeployStageConfig {
  const allClustersSelected = (data.clusterRef as SelectOption[])?.[0]?.value === getString('all')

  return {
    environment: {
      environmentRef:
        data.environmentOrEnvGroupRef === RUNTIME_INPUT_VALUE
          ? RUNTIME_INPUT_VALUE
          : defaultTo((data.environmentOrEnvGroupRef as SelectOption)?.value, ''),
      deployToAll:
        data.environmentOrEnvGroupRef === RUNTIME_INPUT_VALUE || data.clusterRef === RUNTIME_INPUT_VALUE
          ? RUNTIME_INPUT_VALUE
          : allClustersSelected,
      ...(data.environmentOrEnvGroupRef && data.environmentOrEnvGroupRef === RUNTIME_INPUT_VALUE
        ? {
            environmentInputs: RUNTIME_INPUT_VALUE,
            serviceOverrideInputs: RUNTIME_INPUT_VALUE,
            gitOpsClusters: RUNTIME_INPUT_VALUE
          }
        : {
            ...(data.environment?.environmentInputs && { environmentInputs: data.environment?.environmentInputs }),
            ...(data.environment?.serviceOverrideInputs && {
              serviceOverrideInputs: data.environment?.serviceOverrideInputs
            })
          }),
      ...(data.environmentOrEnvGroupRef &&
        data.environmentOrEnvGroupRef !== RUNTIME_INPUT_VALUE &&
        !allClustersSelected && {
          gitOpsClusters:
            data.clusterRef === RUNTIME_INPUT_VALUE
              ? RUNTIME_INPUT_VALUE
              : (data.clusterRef as SelectOption[])?.map(cluster => ({ identifier: cluster.value }))
        })
    }
  } as DeployStageConfig
}

export function processGitOpsEnvGroupInitialValues(
  initialValues: DeployStageConfig,
  getString: UseStringsReturn['getString']
): DeployStageConfig {
  return {
    isEnvGroup: true,
    environmentOrEnvGroupRef: defaultTo(initialValues.environmentGroup?.envGroupRef, ''),
    environmentOrEnvGroupAsRuntime: 'Environment Group',
    environmentsInEnvGroup:
      getMultiTypeFromValue(initialValues.environmentGroup?.envGroupRef) === MultiTypeInputType.RUNTIME
        ? RUNTIME_INPUT_VALUE
        : initialValues.environmentGroup?.deployToAll
        ? [
            {
              name: getString('all')
            }
          ]
        : defaultTo(initialValues.environmentGroup?.environments, [])?.map(environment => {
            return {
              name: environment.environmentRef,
              deployToAll: environment.deployToAll,
              ...(!environment.deployToAll && { clusters: defaultTo(environment.gitOpsClusters, []) })
            }
          }),
    deployToAll: defaultTo(initialValues.environmentGroup?.deployToAll, false),
    ...(getMultiTypeFromValue(initialValues.environmentGroup?.environments as unknown as string) !==
      MultiTypeInputType.RUNTIME && {
      clusterRef: initialValues.environmentGroup?.environments?.reduce((prev, environment) => {
        return [
          ...prev,
          ...(environment.deployToAll
            ? [
                {
                  label: getString('all'),
                  value: getString('all'),
                  parentLabel: environment.environmentRef,
                  parentValue: environment.environmentRef
                }
              ]
            : defaultTo(
                environment?.gitOpsClusters?.map(cluster => ({
                  label: cluster.identifier,
                  value: cluster.identifier,
                  parentLabel: environment.environmentRef,
                  parentValue: environment.environmentRef
                })),
                []
              ))
        ]
      }, [] as MultiSelectWithSubmenuOption[])
    })
  }
}

export function processGitOpsEnvGroupFormValues(
  data: DeployStageConfig,
  getString: UseStringsReturn['getString']
): DeployStageConfig {
  const environmentClusterMap: Record<string, (string | number | symbol)[]> = {}
  if (isArray(data.clusterRef)) {
    data.clusterRef?.forEach(cluster => {
      if (cluster.value !== getString('all')) {
        try {
          environmentClusterMap[get(cluster, 'parentValue', '')].push(cluster.value)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          environmentClusterMap[get(cluster, 'parentValue', '')] = [cluster.value]
        }
      }
    })
  }

  const allEnvironmentsSelected = (data.environmentInEnvGroupRef as SelectOption[])?.[0]?.value === getString('all')

  return {
    environmentGroup: {
      envGroupRef:
        data.environmentOrEnvGroupRef === RUNTIME_INPUT_VALUE
          ? RUNTIME_INPUT_VALUE
          : defaultTo((data.environmentOrEnvGroupRef as SelectOption)?.value, ''),
      deployToAll: data.environmentOrEnvGroupRef === RUNTIME_INPUT_VALUE || allEnvironmentsSelected,
      ...(!(data.environmentOrEnvGroupRef === RUNTIME_INPUT_VALUE || allEnvironmentsSelected) && {
        environments:
          data.environmentInEnvGroupRef === RUNTIME_INPUT_VALUE
            ? RUNTIME_INPUT_VALUE
            : (data?.environmentInEnvGroupRef as SelectOption[])?.map(environmentInEnvGroup => {
                const areClustersSelected = Boolean(environmentClusterMap[environmentInEnvGroup.value as string])
                return {
                  environmentRef: environmentInEnvGroup?.value,
                  deployToAll: !areClustersSelected,
                  ...(areClustersSelected && {
                    gitOpsClusters:
                      data.clusterRef === RUNTIME_INPUT_VALUE
                        ? RUNTIME_INPUT_VALUE
                        : environmentClusterMap[environmentInEnvGroup.value as string]?.map(cluster => ({
                            identifier: cluster
                          }))
                  })
                }
              })
      })
    }
  } as DeployStageConfig
}

export function processInputSetInitialValues(
  initialValues: DeployStageConfig,
  customStepProps: CustomStepProps
): DeployStageConfig {
  return {
    environment: {
      ...(initialValues.environment?.environmentRef && { environmentRef: initialValues.environment?.environmentRef }),
      ...(initialValues.environment?.environmentInputs && {
        environmentInputs: initialValues.environment?.environmentInputs
      }),
      ...(initialValues.environment?.serviceOverrideInputs && {
        serviceOverrideInputs: initialValues.environment?.serviceOverrideInputs
      }),
      ...(initialValues.environment?.infrastructureDefinitions?.[0]?.identifier && {
        infrastructureDefinitions: initialValues.environment?.infrastructureDefinitions
      }),
      ...(initialValues.environment?.gitOpsClusters?.[0]?.identifier && {
        gitOpsClusters: initialValues.environment?.gitOpsClusters
      })
    },
    ...(!customStepProps.gitOpsEnabled && {
      infrastructureRef: (initialValues.environment?.infrastructureDefinitions?.[0]?.identifier ||
        initialValues.environment?.infrastructureDefinitions ||
        '') as string
    }),

    ...(customStepProps.gitOpsEnabled && {
      clusterRef:
        getMultiTypeFromValue(initialValues.environment?.gitOpsClusters as unknown as string) ===
        MultiTypeInputType.RUNTIME
          ? RUNTIME_INPUT_VALUE
          : initialValues.environment?.deployToAll
          ? [
              {
                label: customStepProps.getString('cd.pipelineSteps.environmentTab.allClustersSelected'),
                value: customStepProps.getString('all')
              }
            ]
          : (initialValues.environment?.gitOpsClusters || [])?.map(cluster => {
              return {
                label: cluster.identifier,
                value: cluster.identifier
              }
            })
    })
  } as DeployStageConfig
}
