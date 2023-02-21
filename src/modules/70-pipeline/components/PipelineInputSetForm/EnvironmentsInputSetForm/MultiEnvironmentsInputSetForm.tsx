/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { useFormikContext } from 'formik'
import { defaultTo, get, isBoolean, isEmpty, isNil, omit, pick, set } from 'lodash-es'

import { Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import type { DeploymentStageConfig, EnvironmentYamlV2, Infrastructure, ServiceSpec } from 'services/cd-ng'

import { isValueRuntimeInput } from '@common/utils/utils'

import {
  getCustomStepProps,
  getStepTypeByDeploymentType,
  infraDefinitionTypeMapping
} from '@pipeline/utils/stageHelpers'

import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { StepWidget } from '../../AbstractSteps/StepWidget'
import factory from '../../PipelineSteps/PipelineStepFactory'
import { StepType } from '../../PipelineSteps/PipelineStepInterface'
import type { StageInputSetFormProps } from '../StageInputSetForm'

// This form is used for loading multi environments under environmentGroup.environments or environments.values
export function MultiEnvironmentsInputSetForm({
  // This is the resolved pipeline yaml
  deploymentStage,
  // This is the resolved/updated template yaml
  deploymentStageTemplate,
  path,
  readonly,
  viewType,
  stageIdentifier,
  allowableTypes,
  entityType,
  pathToEnvironments,
  envGroupRef
}: Omit<StageInputSetFormProps, 'formik' | 'executionIdentifier' | 'stageType'> & {
  entityType: 'environments' | 'environmentGroup'
  pathToEnvironments: 'environments.values' | 'environmentGroup.environments'
  envGroupRef?: string
}): React.ReactElement {
  const { getString } = useStrings()
  const formik = useFormikContext<DeploymentStageConfig>()
  // This is the value of AllValues
  const deploymentStageInputSet = get(formik?.values, path, {})

  const areEnvironmentsPreSelectedInStudio = Array.isArray(get(deploymentStage, pathToEnvironments))
    ? get(deploymentStage, pathToEnvironments).some(
        (environment: EnvironmentYamlV2) => !isValueRuntimeInput(environment.environmentRef)
      )
    : false

  const isEnvGroupRuntime = isValueRuntimeInput(deploymentStageInputSet?.environmentGroup?.envGroupRef)

  /** If environments are pre selected in studio, then hide the input field. Else, show the environments selection field in the following scenarios
   * 1. pathToEnvironments is a runtime value - condition 1
   * 2. When 1 is true and the user selects the environments, we need to still continue to show it - condition 2
   *    a. The check for deployToAll of false in 'deploymentStage' is required to show the field in case of 1 and 2,
   *      as then the values of deployToAll in the above scenarios is either <input> or true, and not false */
  const showEnvironmentsSelectionInputField =
    !isEnvGroupRuntime &&
    !areEnvironmentsPreSelectedInStudio &&
    (isValueRuntimeInput(get(deploymentStageTemplate, pathToEnvironments) as unknown as string) ||
      (Array.isArray(get(deploymentStageTemplate, pathToEnvironments)) &&
        deploymentStage?.environmentGroup?.deployToAll !== false))

  // This condition is required to prevent the selection of the child entities if filters are added
  const areFiltersAdded = !isEmpty(get(deploymentStage, `${entityType}.filters`))
  // This condition is to display the runtime fields inside any filter
  const areFiltersRuntime = !isEmpty(get(deploymentStageTemplate, `${entityType}.filters`))

  return (
    <>
      {showEnvironmentsSelectionInputField && (
        <StepWidget
          factory={factory}
          initialValues={pick(deploymentStageInputSet, entityType)}
          template={pick(deploymentStageTemplate, entityType)}
          type={StepType.DeployEnvironmentEntity}
          stepViewType={viewType}
          path={path}
          allowableTypes={allowableTypes}
          readonly={readonly}
          customStepProps={{
            gitOpsEnabled: deploymentStage?.gitOpsEnabled,
            pathToEnvironments,
            // If this is passed, the environments list is fetched based on this query param
            envGroupIdentifier: envGroupRef,
            isMultiEnvironment: true,
            /** This takes care of hiding the field in case deployToAll is true
             * If the question arises why another condition for this scenario?
             * Because we need to repeat the same selection steps without the field*/
            deployToAllEnvironments: deploymentStage?.environmentGroup?.deployToAll,
            areFiltersAdded,
            serviceIdentifiers: []
          }}
          onUpdate={data => {
            unstable_batchedUpdates(() => {
              formik.setFieldValue(`${path}.${pathToEnvironments}`, get(data, pathToEnvironments))

              const deployToAll = get(data, 'environmentGroup.deployToAll')
              if (isBoolean(deployToAll) || isValueRuntimeInput(deployToAll)) {
                formik.setFieldValue(`${path}.environmentGroup.deployToAll`, deployToAll)
              }
            })
          }}
        />
      )}

      {areFiltersRuntime && (
        <StepWidget
          factory={factory}
          initialValues={get(deploymentStageInputSet, `${entityType}.filters`) as Partial<DeploymentStageConfig>}
          template={get(deploymentStageTemplate, `${entityType}.filters`)}
          type={StepType.InlineEntityFilters}
          stepViewType={viewType}
          path={`${path}.${entityType}.filters`}
          allowableTypes={allowableTypes}
          readonly={readonly}
          allValues={get(deploymentStage, `${entityType}.filters`)}
        />
      )}

      {/** If environments are selected in the pipeline or in the input view, list the inputs under them
       * This can be environment Inputs, service override inputs, infrastructureDefinitions */}
      {Array.isArray(get(deploymentStageTemplate, pathToEnvironments)) ? (
        <>
          {(get(deploymentStageTemplate, pathToEnvironments) as EnvironmentYamlV2[]).map(
            (environmentTemplate, index) => {
              const deploymentType = deploymentStage?.deploymentType
              // ! This is an environment object. Not to be confused with any path prop
              const environment: EnvironmentYamlV2 = get(deploymentStageInputSet, `${pathToEnvironments}[${index}]`, {})

              // The deploymentStageTemplate does not always contain all the stages, but deploymentStage does.
              // Hence, we need to get the right environment info while using deploymentStage. Index matching does not work
              const environmentInDeploymentStage: EnvironmentYamlV2 = Array.isArray(
                get(deploymentStage, `${pathToEnvironments}`)
              )
                ? get(deploymentStage, `${pathToEnvironments}`)?.find(
                    (env: EnvironmentYamlV2) => env.environmentRef === environmentTemplate.environmentRef
                  )
                : {}

              const showEnvironmentVariables = Array.isArray(environmentTemplate?.environmentInputs?.variables)
              const showEnvironmentOverrides = !isEmpty(environmentTemplate?.environmentInputs?.overrides)
              /** Show the infrastructures selection field in the following scenarios
               * 1. environmentTemplate.infrastructureDefinitions is a runtime value - condition 1
               * 2. When 1 is true and the user selects the environments, we need to still continue to show it - condition 2
               *    a. The check for deployToAll of false in 'deploymentStage' is required to show the field in case of 1 and 2,
               *      as then the values of deployToAll in the above scenarios is either <input> or true, and not false */
              const showInfrastructuresSelectionInputField =
                isValueRuntimeInput(environmentTemplate.infrastructureDefinitions as unknown as string) ||
                (Array.isArray(environmentTemplate.infrastructureDefinitions) &&
                  environmentInDeploymentStage?.deployToAll !== false)

              /** Show the clusters selection field in the following scenarios
               * 1. pathToEnvironments is a runtime value - condition 1
               * 2. When 1 is true and the user selects the environments, we need to still continue to show it - condition 2
               *    a. The check for deployToAll of false in 'deploymentStage' is required to show the field in case of 1 and 2,
               *      as then the values of deployToAll in the above scenarios is either <input> or true, and not false */
              const showClustersSelectionInputField =
                isValueRuntimeInput(environmentTemplate.gitOpsClusters as unknown as string) ||
                (Array.isArray(environmentTemplate.gitOpsClusters) &&
                  environmentInDeploymentStage?.deployToAll !== false)

              /* If infrastructureDefinitions are selected in the pipeline or in the input view, list the inputs under them */
              const showInfrastructuresInputSetForm =
                Array.isArray(environmentTemplate.infrastructureDefinitions) &&
                environmentTemplate?.infrastructureDefinitions?.some(infraTemplate => !isNil(infraTemplate.inputs))

              const showEnvironmentPrefix =
                showEnvironmentVariables ||
                showEnvironmentOverrides ||
                showClustersSelectionInputField ||
                showInfrastructuresSelectionInputField ||
                showInfrastructuresInputSetForm

              const areEnvironmentFiltersAdded = !isEmpty(environmentInDeploymentStage.filters)
              const areEnvironmentFiltersRuntime = !isEmpty(environmentTemplate.filters)

              return (
                deploymentType &&
                environment.environmentRef && (
                  <React.Fragment key={`${path}_${environment.environmentRef}_${index}`}>
                    {showEnvironmentPrefix && (
                      <Text
                        font={{ size: 'normal', weight: 'bold' }}
                        padding={{ bottom: 'medium' }}
                        color={Color.GREY_700}
                      >
                        {getString('common.environmentPrefix', { name: environment.environmentRef })}
                      </Text>
                    )}
                    <Container padding={{ left: 'medium' }}>
                      {areEnvironmentFiltersRuntime && (
                        <StepWidget
                          factory={factory}
                          initialValues={get(environment, 'filters')}
                          template={get(environmentTemplate, 'filters')}
                          type={StepType.InlineEntityFilters}
                          stepViewType={viewType}
                          path={`${path}.${pathToEnvironments}[${index}].filters`}
                          allowableTypes={allowableTypes}
                          readonly={readonly}
                          allValues={get(environmentInDeploymentStage, 'filters')}
                        />
                      )}
                      {/* If there are runtime environment inputs */}
                      {showEnvironmentVariables && (
                        <>
                          <Text
                            font={{ size: 'normal', weight: 'bold' }}
                            padding={{ bottom: 'medium' }}
                            color={Color.GREY_600}
                          >
                            {getString('environmentVariables')}
                          </Text>
                          <Container padding={{ left: 'medium' }}>
                            <StepWidget<ServiceSpec>
                              factory={factory}
                              initialValues={get(
                                deploymentStageInputSet,
                                `${pathToEnvironments}[${index}].environmentInputs`,
                                {
                                  variables: []
                                }
                              )}
                              allowableTypes={allowableTypes}
                              template={get(
                                deploymentStageTemplate,
                                `${pathToEnvironments}[${index}].environmentInputs`,
                                {}
                              )}
                              type={getStepTypeByDeploymentType(deploymentType)}
                              stepViewType={viewType}
                              path={`${path}.${pathToEnvironments}[${index}].environmentInputs`}
                              readonly={readonly}
                              customStepProps={{
                                stageIdentifier,
                                allValues: get(environmentInDeploymentStage, `environmentInputs`, {
                                  variables: []
                                })
                              }}
                            />
                          </Container>
                        </>
                      )}

                      {showEnvironmentOverrides && (
                        <>
                          <Text
                            font={{ size: 'normal', weight: 'bold' }}
                            padding={{ bottom: 'medium' }}
                            color={Color.GREY_600}
                          >
                            {getString('common.environmentOverrides')}
                          </Text>
                          <Container padding={{ left: 'medium' }}>
                            <StepWidget<ServiceSpec>
                              factory={factory}
                              initialValues={get(
                                deploymentStageInputSet,
                                `${pathToEnvironments}[${index}].environmentInputs.overrides`,
                                {
                                  variables: []
                                }
                              )}
                              allowableTypes={allowableTypes}
                              template={get(
                                deploymentStageTemplate,
                                `${pathToEnvironments}[${index}].environmentInputs.overrides`,
                                {}
                              )}
                              type={getStepTypeByDeploymentType(deploymentType)}
                              stepViewType={viewType}
                              path={`${path}.${pathToEnvironments}[${index}].environmentInputs.overrides`}
                              readonly={readonly}
                              customStepProps={{
                                stageIdentifier
                              }}
                            />
                          </Container>
                        </>
                      )}

                      {showClustersSelectionInputField && (
                        <StepWidget
                          factory={factory}
                          initialValues={environment}
                          template={environmentTemplate}
                          type={StepType.DeployClusterEntity}
                          stepViewType={viewType}
                          path={`${path}.${pathToEnvironments}[${index}]`}
                          allowableTypes={allowableTypes}
                          readonly={readonly}
                          customStepProps={{
                            environmentIdentifier: environment.environmentRef,
                            isMultipleCluster: true,
                            deployToAllClusters: environmentInDeploymentStage?.deployToAll,
                            showEnvironmentsSelectionInputField
                          }}
                          onUpdate={data => {
                            const environmentAtIndex = get(formik.values, `${path}.${pathToEnvironments}[${index}]`)

                            formik.setFieldValue(`${path}.${pathToEnvironments}[${index}]`, {
                              ...omit(environmentAtIndex, ['deployToAll', 'gitOpsClusters']),
                              ...pick(data, ['deployToAll', ...(data.deployToAll !== true ? ['gitOpsClusters'] : [])])
                            })
                          }}
                        />
                      )}

                      {showInfrastructuresSelectionInputField && (
                        <StepWidget
                          factory={factory}
                          initialValues={environment}
                          template={environmentTemplate}
                          type={StepType.DeployInfrastructureEntity}
                          stepViewType={viewType}
                          path={`${path}.${pathToEnvironments}[${index}]`}
                          allowableTypes={allowableTypes}
                          readonly={readonly}
                          customStepProps={{
                            deploymentType,
                            environmentIdentifier: environment.environmentRef,
                            scopePrefix: getScopeFromValue(defaultTo(envGroupRef, '')),
                            isMultipleInfrastructure: true,
                            customDeploymentRef: deploymentStage?.customDeploymentRef,
                            deployToAllInfrastructures: environmentInDeploymentStage?.deployToAll,
                            showEnvironmentsSelectionInputField: deploymentStage?.environmentGroup?.deployToAll
                              ? false
                              : showEnvironmentsSelectionInputField,
                            areEnvironmentFiltersAdded
                          }}
                          onUpdate={data => {
                            const environmentAtIndex = get(formik.values, `${path}.${pathToEnvironments}[${index}]`)

                            formik.setFieldValue(`${path}.${pathToEnvironments}[${index}]`, {
                              ...omit(environmentAtIndex, ['deployToAll', 'infrastructureDefinitions']),
                              ...pick(data, ['deployToAll', 'infrastructureDefinitions'])
                            })
                          }}
                        />
                      )}

                      {showInfrastructuresInputSetForm
                        ? environmentTemplate?.infrastructureDefinitions?.map(
                            (infrastructureDefinitionTemplate, infraIndex) => {
                              const infraInputs = infrastructureDefinitionTemplate.inputs

                              return infraInputs?.identifier ? (
                                <>
                                  <Text font={{ size: 'normal', weight: 'bold' }} color={Color.GREY_700}>
                                    {getString('common.infrastructurePrefix', {
                                      name: infraInputs.identifier
                                    })}
                                  </Text>
                                  <Container padding={{ left: 'medium' }}>
                                    <StepWidget<Infrastructure>
                                      key={infraInputs.identifier}
                                      factory={factory}
                                      template={infraInputs?.spec}
                                      initialValues={{
                                        ...deploymentStageInputSet?.infrastructureDefinitions?.[infraIndex]?.inputs
                                          ?.spec,
                                        environmentRef: environment.environmentRef,
                                        infrastructureRef: infraInputs.identifier
                                      }}
                                      allowableTypes={allowableTypes}
                                      allValues={{
                                        environmentRef: environment.environmentRef,
                                        infrastructureRef: infraInputs.identifier
                                      }}
                                      type={
                                        (infraDefinitionTypeMapping[infraInputs.type as StepType] ||
                                          infraInputs?.type) as StepType
                                      }
                                      path={`${path}.${pathToEnvironments}[${index}].infrastructureDefinitions.${infraIndex}.inputs.spec`}
                                      readonly={readonly}
                                      stepViewType={viewType}
                                      customStepProps={{
                                        ...getCustomStepProps(
                                          (deploymentStage?.deploymentType as StepType) || '',
                                          getString
                                        ),
                                        environmentRef: environment.environmentRef,
                                        infrastructureRef: infraInputs.identifier
                                      }}
                                      onUpdate={data => {
                                        /* istanbul ignore next */
                                        if (
                                          get(
                                            deploymentStageInputSet,
                                            `${path}.${pathToEnvironments}[${index}].infrastructureDefinitions.[${infraIndex}].inputs.spec`
                                          )
                                        ) {
                                          set(
                                            deploymentStageInputSet,
                                            `${path}.${pathToEnvironments}[${index}].infrastructureDefinitions.[${infraIndex}].inputs.spec`,
                                            data
                                          )
                                          formik?.setValues(
                                            set(
                                              formik?.values,
                                              `${path}.${pathToEnvironments}[${infraIndex}]`,
                                              deploymentStageInputSet
                                            )
                                          )
                                        }
                                      }}
                                    />
                                  </Container>
                                </>
                              ) : null
                            }
                          )
                        : null}
                    </Container>
                  </React.Fragment>
                )
              )
            }
          )}
        </>
      ) : null}
    </>
  )
}
