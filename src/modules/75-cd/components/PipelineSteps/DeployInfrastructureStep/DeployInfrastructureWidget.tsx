/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useRef } from 'react'
import { noop } from 'lodash-es'
import type { FormikProps } from 'formik'

import { Formik, getMultiTypeFromValue, Layout, MultiTypeInputType } from '@harness/uicore'

import { useStrings } from 'framework/strings'

import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'

import type { DeployStageConfig } from '@pipeline/utils/DeployStageInterface'
import type { DeployInfrastructureProps } from './utils'
import DeployEnvironment from './DeployEnvironment/DeployEnvironment'
import DeployInfrastructures from './DeployInfrastructures/DeployInfrastructures'
import DeployEnvironmentOrEnvGroup from './DeployEnvironmentOrEnvGroup/DeployEnvironmentOrEnvGroup'
import { getEnvironmentTabSchema } from '../PipelineStepsUtil'

import css from './DeployInfrastructureStep.module.scss'

// SONAR recommendation
const flexStart = 'flex-start'

export function DeployInfrastructureWidget({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes,
  serviceRef
}: DeployInfrastructureProps): JSX.Element {
  const { getString } = useStrings()

  const formikRef = useRef<FormikProps<DeployStageConfig> | null>(null)

  const { subscribeForm, unSubscribeForm } = useContext(StageErrorContext)
  useEffect(() => {
    subscribeForm({ tab: DeployTabs.ENVIRONMENT, form: formikRef as any })
    return () => unSubscribeForm({ tab: DeployTabs.ENVIRONMENT, form: formikRef as any })
  }, [])

  return (
    <Formik<DeployStageConfig>
      formName="deployInfrastructureStepForm"
      onSubmit={noop}
      validate={(values: DeployStageConfig) => {
        onUpdate?.({ ...values })
      }}
      initialValues={initialValues}
      validationSchema={getEnvironmentTabSchema(getString)}
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
            {!initialValues.gitOpsEnabled ? (
              <>
                <DeployEnvironment
                  initialValues={initialValues}
                  readonly={readonly}
                  allowableTypes={allowableTypes}
                  serviceRef={serviceRef}
                />
                {formik.values.environment?.environmentRef &&
                  getMultiTypeFromValue(formik.values.environment?.environmentRef) === MultiTypeInputType.FIXED && (
                    <DeployInfrastructures
                      initialValues={initialValues}
                      allowableTypes={allowableTypes}
                      readonly={readonly}
                    />
                  )}
              </>
            ) : (
              <DeployEnvironmentOrEnvGroup
                initialValues={initialValues}
                allowableTypes={allowableTypes}
                readonly={readonly}
              />
            )}
          </Layout.Horizontal>
        )
      }}
    </Formik>
  )
}
