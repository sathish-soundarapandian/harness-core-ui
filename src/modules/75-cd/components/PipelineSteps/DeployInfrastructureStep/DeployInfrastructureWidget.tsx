/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useRef } from 'react'
import { noop } from 'lodash-es'
import type { FormikProps } from 'formik'
import * as Yup from 'yup'

import { Formik, getMultiTypeFromValue, Layout, MultiTypeInputType } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { DeploymentStageConfig } from 'services/cd-ng'

import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'

import { getEnvironmentRefSchema } from '@cd/components/PipelineSteps/PipelineStepsUtil'

import DeployEnvironment from './DeployEnvironment/DeployEnvironment'
import type { DeployInfrastructureProps } from './utils'

import css from './DeployInfrastructureStep.module.scss'
import DeployInfrastructures from './DeployInfrastructures/DeployInfrastructures'

// SONAR recommendation
const flexStart = 'flex-start'

export function DeployInfrastructureWidget({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes
}: DeployInfrastructureProps): JSX.Element {
  const { getString } = useStrings()

  const formikRef = useRef<FormikProps<DeploymentStageConfig> | null>(null)

  const { subscribeForm, unSubscribeForm } = useContext(StageErrorContext)
  useEffect(() => {
    subscribeForm({ tab: DeployTabs.ENVIRONMENT, form: formikRef as any })
    return () => unSubscribeForm({ tab: DeployTabs.ENVIRONMENT, form: formikRef as any })
  }, [])

  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = usePipelineContext()
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')

  return (
    <Formik<DeploymentStageConfig>
      formName="deployInfrastructureStepForm"
      onSubmit={noop}
      validate={(values: DeploymentStageConfig) => {
        ;(onUpdate as any)?.({ ...values }, stage)
        // const commonConfig = {
        //   deployToAll: defaultTo(values.deployToAll, false),
        //   ...(!stage?.stage?.spec?.gitOpsEnabled && {
        //     infrastructureDefinitions:
        //       getMultiTypeFromValue(values.infrastructureRef) === MultiTypeInputType.RUNTIME
        //         ? values.infrastructureRef
        //         : values.infrastructureDefinitions?.map((infra: string) => ({
        //             ref: infra
        //           }))
        //   }),
        //   ...(stage?.stage?.spec?.gitOpsEnabled && {
        //     gitOpsClusters:
        //       getMultiTypeFromValue(values.clusterRef) === MultiTypeInputType.RUNTIME
        //         ? values.clusterRef
        //         : (values as any).gitOpsClusters?.map((infra: string) => ({
        //             ref: infra
        //           }))
        //   })
        // }
        // if (values.environmentRef2) {
        //   onUpdate?.({
        //     environmentGroup: {
        //       envGroupRef: values.environmentOrEnvGroupRef?.value,
        //       envGroupConfig: [
        //         {
        //           environmentRef: values.environmentRef2?.value,
        //           ...commonConfig
        //         }
        //       ]
        //     }
        //   })
        // } else {
        //   onUpdate?.({
        //     environment: {
        //       environmentRef: values.environmentOrEnvGroupRef?.value,
        //       ...commonConfig
        //     }
        //   } as any)
        // }
      }}
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        environmentOrEnvGroupRef: getEnvironmentRefSchema(getString)
      })}
    >
      {formik => {
        window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.ENVIRONMENT }))
        formikRef.current = formik
        return (
          <Layout.Horizontal
            className={css.formRow}
            spacing="medium"
            flex={{ alignItems: flexStart, justifyContent: flexStart }}
          >
            <DeployEnvironment
              initialValues={initialValues}
              allowableTypes={allowableTypes}
              readonly={readonly}
              formikRef={formikRef}
            />
            {formik.values.environment?.environmentRef &&
              getMultiTypeFromValue(formik.values.environment?.environmentRef) === MultiTypeInputType.FIXED && (
                <DeployInfrastructures
                  initialValues={initialValues}
                  allowableTypes={allowableTypes}
                  readonly={readonly}
                  formikRef={formikRef}
                />
              )}
            {/* {Boolean(values.environmentGroup?.envGroupRef) &&
              selectedEnvironmentGroup &&
              environmentOrEnvGroupRefType === MultiTypeInputType.FIXED && (
                <DeployEnvironmentInEnvGroup
                  selectedEnvironmentGroup={selectedEnvironmentGroup}
                  setSelectedEnvironment={setSelectedEnvironment}
                  formikRef={formikRef}
                  initialValues={initialValues}
                  allowableTypes={allowableTypes}
                  readonly={readonly}
                />
              )} */}
            {/* {(Boolean(values.environmentOrEnvGroupRef) || Boolean(values.environmentRef2)) &&
            environmentOrEnvGroupRefType === MultiTypeInputType.FIXED &&
            selectedEnvironment?.identifier ? (
              stage?.stage?.spec?.gitOpsEnabled ? (
                <DeployClusters
                  environmentIdentifier={selectedEnvironment?.identifier}
                  formikRef={formikRef}
                  allowableTypes={allowableTypes}
                />
              ) : ( 
                <DeployInfrastructures
                  formikRef={formikRef}
                  allowableTypes={allowableTypes}
                />
             )
            ) : null} */}
          </Layout.Horizontal>
        )
      }}
    </Formik>
  )
}
