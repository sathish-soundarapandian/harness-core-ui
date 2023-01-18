/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  AllowedTypes,
  Container,
  getMultiTypeFromValue,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption,
  Text
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { connect, Formik, FormikProps } from 'formik'
import { defaultTo, noop, set, unset } from 'lodash-es'
import produce from 'immer'

import { useStrings } from 'framework/strings'
import type { DeployStageConfig } from '@pipeline/utils/DeployStageInterface'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'

import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ExecutionWrapperInputSetForm } from '@pipeline/components/PipelineInputSetForm/ExecutionWrapperInputSetForm'
import { isValueRuntimeInput } from '@common/utils/utils'
import DeployEnvironment from './DeployEnvironment/DeployEnvironment'
import DeployInfrastructures from './DeployInfrastructures/DeployInfrastructures'
import DeployClusters from './DeployClusters/DeployClusters'
import DeployEnvironmentGroup from './DeployEnvironmentGroup/DeployEnvironmentGroup'
import type { CustomStepProps, DeployInfrastructureProps } from './utils'
import { GenericServiceSpecInputSetMode } from '../Common/GenericServiceSpec/GenericServiceSpecInputSetMode'
import css from './DeployInfrastructureStep.module.scss'

function DeployInfrastructureInputStepInternal({
  inputSetData,
  initialValues,
  allowableTypes,
  customStepProps,
  stepViewType,
  readonly,
  onUpdate,
  factory
}: DeployInfrastructureProps & {
  formik?: FormikProps<DeployStageConfig>
  customStepProps: CustomStepProps
  factory?: AbstractStepFactory
}): JSX.Element {
  const { getString } = useStrings()
  const {
    gitOpsEnabled,
    serviceRef,
    environmentRef,
    infrastructureRef,
    clusterRef,
    deploymentType,
    customDeploymentData,
    stageIdentifier
  } = customStepProps
  const { serviceOverrideInputs } = inputSetData?.template?.environment || {}

  // render Infra when Env is Fixed
  const isEnvRuntime = isValueRuntimeInput(initialValues?.environment?.environmentRef)

  const shouldRenderInfrastructure =
    getMultiTypeFromValue(inputSetData?.template?.environment?.environmentRef) !== MultiTypeInputType.RUNTIME

  const [environmentRefType, setEnvironmentRefType] = useState<MultiTypeInputType>(
    getMultiTypeFromValue(initialValues.environment?.environmentRef)
  )

  const { CD_NG_DYNAMIC_PROVISIONING_ENV_V2 } = useFeatureFlags()

  return (
    <>
      {/* Environment Group Section */}
      {getMultiTypeFromValue(inputSetData?.template?.environmentGroup?.envGroupRef) === MultiTypeInputType.RUNTIME && (
        <Container margin={{ bottom: 'medium' }}>
          <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
            {getString('common.environmentGroup.label')}
          </Text>
          <DeployEnvironmentGroup
            initialValues={initialValues}
            allowableTypes={
              (allowableTypes as MultiTypeInputType[])?.filter(
                item => item !== MultiTypeInputType.EXPRESSION && item !== MultiTypeInputType.EXECUTION_TIME
              ) as AllowedTypes
            }
            path={inputSetData?.path}
            readonly={readonly}
          />
        </Container>
      )}
      <Formik
        initialValues={initialValues}
        onSubmit={noop}
        validate={values => {
          onUpdate?.(
            produce(values, draft => {
              if (draft.infrastructureRef) {
                if (getMultiTypeFromValue(draft.infrastructureRef) !== MultiTypeInputType.RUNTIME) {
                  set(draft, 'environment.infrastructureDefinitions[0].identifier', draft.infrastructureRef)
                } else {
                  set(draft, 'environment.infrastructureDefinitions', RUNTIME_INPUT_VALUE)
                }
                delete draft.infrastructureRef
              }

              if (draft.clusterRef) {
                const allClustersSelected = (draft.clusterRef as SelectOption[])?.[0]?.value === getString('all')

                if (allClustersSelected) {
                  set(draft, 'environment.deployToAll', true)
                  unset(draft, 'environment.gitOpsClusters')
                } else {
                  set(draft, 'environment.deployToAll', false)
                  set(
                    draft,
                    'environment.gitOpsClusters',
                    (draft.clusterRef as SelectOption[])?.map(cluster => ({ identifier: cluster.value }))
                  )
                }

                delete draft.clusterRef
              }
            })
          )
        }}
      >
        {formik => (
          <>
            {/* Environments Section */}
            {getMultiTypeFromValue(inputSetData?.template?.environment?.environmentRef) ===
              MultiTypeInputType.RUNTIME && (
              <Container margin={{ bottom: 'medium' }}>
                {/* This loads the environment input field when environment is marked as runtime input */}
                <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                  {getString('environment')}
                </Text>
                <DeployEnvironment
                  initialValues={initialValues}
                  allowableTypes={
                    (allowableTypes as MultiTypeInputType[])?.filter(
                      item => item !== MultiTypeInputType.EXPRESSION && item !== MultiTypeInputType.EXECUTION_TIME
                    ) as AllowedTypes
                  }
                  path={inputSetData?.path}
                  serviceRef={defaultTo(initialValues.service?.serviceRef, serviceRef)}
                  gitOpsEnabled={gitOpsEnabled}
                  stepViewType={stepViewType}
                  readonly={readonly}
                  environmentRefType={environmentRefType}
                  setEnvironmentRefType={setEnvironmentRefType}
                />
              </Container>
            )}
            {inputSetData?.template?.environment?.environmentInputs?.variables && (
              <>
                {/* This loads the environment runtime inputs when environment is selected at runtime */}
                <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                  {getString('environmentVariables')}
                </Text>
                <GenericServiceSpecInputSetMode
                  {...customStepProps}
                  serviceIdentifier={customStepProps.serviceRef}
                  initialValues={initialValues?.environment?.environmentInputs || {}}
                  allValues={inputSetData?.allValues?.environment?.environmentInputs || {}}
                  stepViewType={stepViewType}
                  template={inputSetData?.template?.environment?.environmentInputs}
                  path={`environment.environmentInputs`}
                  readonly={inputSetData?.readonly || readonly}
                  factory={factory}
                  allowableTypes={allowableTypes}
                />
              </>
            )}

            {inputSetData?.template?.environment?.environmentInputs?.overrides && (
              <>
                <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                  {getString('common.environmentOverrides')}
                </Text>
                <GenericServiceSpecInputSetMode
                  {...customStepProps}
                  serviceIdentifier={customStepProps.serviceRef}
                  initialValues={initialValues?.environment?.environmentInputs?.overrides || {}}
                  allValues={inputSetData?.allValues?.environment?.environmentInputs?.overrides || {}}
                  stepViewType={stepViewType}
                  template={inputSetData?.template?.environment?.environmentInputs?.overrides}
                  path={`environment.environmentInputs.overrides`}
                  readonly={inputSetData?.readonly || readonly}
                  factory={factory}
                  allowableTypes={allowableTypes}
                />
              </>
            )}

            {(serviceOverrideInputs?.variables?.length ||
              serviceOverrideInputs?.manifests?.length ||
              serviceOverrideInputs?.configFiles?.length) && (
              <>
                <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                  {getString('common.serviceOverrides')}
                </Text>
                <GenericServiceSpecInputSetMode
                  {...customStepProps}
                  serviceIdentifier={customStepProps.serviceRef}
                  initialValues={initialValues?.environment?.serviceOverrideInputs || {}}
                  allValues={inputSetData?.allValues?.environment?.serviceOverrideInputs || {}}
                  stepViewType={stepViewType}
                  template={inputSetData?.template?.environment?.serviceOverrideInputs}
                  path={`environment.serviceOverrideInputs`}
                  readonly={inputSetData?.readonly || readonly}
                  factory={factory}
                  allowableTypes={allowableTypes}
                />
              </>
            )}

            {(inputSetData?.template as DeployStageConfig)?.environment?.provisioner &&
              CD_NG_DYNAMIC_PROVISIONING_ENV_V2 && (
                <div>
                  <div className={css.inputheader} style={{ paddingBottom: '4px' }}>
                    {getString('pipeline.provisionerSteps')}
                  </div>
                  <div className={css.nestedAccordions}>
                    {inputSetData?.template?.environment?.provisioner?.steps && (
                      <>
                        <ExecutionWrapperInputSetForm
                          stepsTemplate={inputSetData?.template.environment?.provisioner?.steps}
                          path={`environment.provisioner.steps`}
                          allValues={inputSetData?.allValues?.environment?.provisioner?.steps}
                          values={initialValues?.environment?.provisioner?.steps}
                          formik={formik}
                          readonly={readonly}
                          viewType={stepViewType as StepViewType}
                          allowableTypes={allowableTypes}
                          customStepProps={{
                            stageIdentifier: stageIdentifier as string,
                            selectedStage: inputSetData?.allValues as any
                          }}
                        />
                      </>
                    )}
                    {inputSetData?.template?.environment?.provisioner?.rollbackSteps && (
                      <ExecutionWrapperInputSetForm
                        stepsTemplate={inputSetData?.template.environment?.provisioner?.rollbackSteps}
                        path={`environment.provisioner.rollbackSteps`}
                        allValues={inputSetData?.allValues?.environment?.provisioner?.rollbackSteps}
                        values={initialValues?.environment?.provisioner?.rollbackSteps}
                        formik={formik}
                        readonly={readonly}
                        viewType={stepViewType as StepViewType}
                        allowableTypes={allowableTypes}
                        customStepProps={{
                          stageIdentifier: stageIdentifier as string,
                          selectedStage: inputSetData?.allValues as any
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

            {/* This loads the infrastructure input */}
            {!gitOpsEnabled &&
              !infrastructureRef &&
              (initialValues.infrastructureRef ||
                inputSetData?.allValues ||
                (inputSetData?.template?.environment?.infrastructureDefinitions as unknown as string) ===
                  RUNTIME_INPUT_VALUE) &&
              !isEnvRuntime &&
              (formik.values.isEnvInputLoaded || shouldRenderInfrastructure) && (
                <Container margin={{ bottom: 'medium' }}>
                  <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                    {getString('infrastructureText')}
                  </Text>
                  <DeployInfrastructures
                    initialValues={initialValues || inputSetData?.allValues}
                    allowableTypes={
                      (allowableTypes as MultiTypeInputType[])?.filter(
                        item => item !== MultiTypeInputType.EXPRESSION && item !== MultiTypeInputType.EXECUTION_TIME
                      ) as AllowedTypes
                    }
                    environmentRef={initialValues.environment?.environmentRef || environmentRef}
                    path={inputSetData?.path}
                    readonly={readonly}
                    deploymentType={deploymentType}
                    customDeploymentData={customDeploymentData}
                    environmentRefType={environmentRefType}
                  />
                </Container>
              )}

            {/* This loads the clusters input */}
            {gitOpsEnabled &&
              !clusterRef &&
              (initialValues.clusterRef ||
                (inputSetData?.template?.environment?.gitOpsClusters as unknown as string) === RUNTIME_INPUT_VALUE) && (
                <Container margin={{ bottom: 'medium' }}>
                  <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                    {getString('common.clusters')}
                  </Text>
                  <DeployClusters
                    allowableTypes={
                      (allowableTypes as MultiTypeInputType[])?.filter(
                        item => item !== MultiTypeInputType.EXPRESSION && item !== MultiTypeInputType.EXECUTION_TIME
                      ) as AllowedTypes
                    }
                    environmentIdentifier={defaultTo(initialValues.environment?.environmentRef || environmentRef, '')}
                    readonly={readonly}
                  />
                </Container>
              )}
          </>
        )}
      </Formik>
    </>
  )
}
const DeployInfrastructureInputStep = connect(DeployInfrastructureInputStepInternal)

export default DeployInfrastructureInputStep
