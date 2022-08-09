/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Container,
  getMultiTypeFromValue,
  Layout,
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
import {
  CustomVariableInputSet,
  CustomVariablesData
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import type { DeployStageConfig } from '@pipeline/utils/DeployStageInterface'

import DeployEnvironment from './DeployEnvironment/DeployEnvironment'
import DeployInfrastructures from './DeployInfrastructures/DeployInfrastructures'
import DeployClusters from './DeployClusters/DeployClusters'
import DeployEnvironmentGroup from './DeployEnvironmentGroup/DeployEnvironmentGroup'
import type { CustomStepProps, DeployInfrastructureProps } from './utils'

import css from './DeployInfrastructureStep.module.scss'

function DeployInfrastructureInputStepInternal({
  inputSetData,
  initialValues,
  allowableTypes,
  customStepProps,
  stepViewType,
  readonly,
  onUpdate
}: DeployInfrastructureProps & {
  formik?: FormikProps<DeployStageConfig>
  customStepProps: CustomStepProps
}): JSX.Element {
  const { getString } = useStrings()
  const { gitOpsEnabled, serviceRef, environmentRef, infrastructureRef, clusterRef } = customStepProps

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
            allowableTypes={allowableTypes}
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
              if (
                draft.infrastructureRef &&
                getMultiTypeFromValue(draft.infrastructureRef) !== MultiTypeInputType.RUNTIME
              ) {
                set(draft, 'environment.infrastructureDefinitions[0].identifier', draft.infrastructureRef)
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
                allowableTypes={allowableTypes}
                path={inputSetData?.path}
                serviceRef={defaultTo(initialValues.service?.serviceRef, serviceRef)}
                gitOpsEnabled={gitOpsEnabled}
                stepViewType={stepViewType}
              />
            </Container>
          )}
          {inputSetData?.template?.environment?.environmentInputs?.variables && (
            <>
              {/* This loads the environment runtime inputs when environment is selected at runtime */}
              <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                {getString('environmentVariables')}
              </Text>
              <div className={css.sectionContent}>
                <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                  <CustomVariableInputSet
                    allowableTypes={allowableTypes}
                    initialValues={initialValues.environment?.environmentInputs as unknown as CustomVariablesData}
                    template={inputSetData.template.environment.environmentInputs as unknown as CustomVariablesData}
                    path={'environment.environmentInputs'}
                    className={css.fullWidth}
                  />
                </Layout.Horizontal>
              </div>
            </>
          )}
          {inputSetData?.template?.environment?.serviceOverrideInputs?.variables && (
            <>
              {/* This loads the service override runtime inputs when environment is selected at runtime */}
              <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                {getString('common.serviceOverrides')}
              </Text>
              <div className={css.sectionContent}>
                <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                  <CustomVariableInputSet
                    allowableTypes={allowableTypes}
                    initialValues={initialValues.environment?.serviceOverrideInputs as unknown as CustomVariablesData}
                    template={inputSetData.template.environment.serviceOverrideInputs as unknown as CustomVariablesData}
                    path={'environment.serviceOverrideInputs'}
                    className={css.fullWidth}
                  />
                </Layout.Horizontal>
              </div>
            </>
          )}

          {/* This loads the infrastructure input */}
          {!gitOpsEnabled &&
            !infrastructureRef &&
            (initialValues.infrastructureRef ||
              (inputSetData?.template?.environment?.infrastructureDefinitions as unknown as string) ===
                RUNTIME_INPUT_VALUE) && (
              <Container margin={{ bottom: 'medium' }}>
                <Text font={{ size: 'normal', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                  {getString('infrastructureText')}
                </Text>
                <DeployInfrastructures
                  initialValues={initialValues}
                  allowableTypes={allowableTypes}
                  environmentRef={initialValues.environment?.environmentRef || environmentRef}
                  path={inputSetData?.path}
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
                  allowableTypes={allowableTypes}
                  environmentIdentifier={defaultTo(initialValues.environment?.environmentRef || environmentRef, '')}
                />
              </Container>
            )}
        </>
      </Formik>
    </>
  )
}
const DeployInfrastructureInputStep = connect(DeployInfrastructureInputStepInternal)

export default DeployInfrastructureInputStep
