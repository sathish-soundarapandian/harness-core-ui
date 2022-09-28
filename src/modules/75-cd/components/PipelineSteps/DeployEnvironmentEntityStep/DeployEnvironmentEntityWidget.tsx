/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useRef } from 'react'
import { noop } from 'lodash-es'
import type { FormikProps } from 'formik'

import { AllowedTypes, Formik, Layout } from '@harness/uicore'

import { useStrings } from 'framework/strings'

import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'

import type { DeployStageConfig } from '@pipeline/utils/DeployStageInterface'
import { getEnvironmentTabSchema } from '../PipelineStepsUtil'
import DeployEnvironment from './DeployEnvironment/DeployEnvironment'
import DeployEnvironmentOrEnvGroup from '../DeployInfrastructureStep/DeployEnvironmentOrEnvGroup/DeployEnvironmentOrEnvGroup'

export interface DeployEnvironmentEntityWidgetProps {
  initialValues: DeployStageConfig
  onUpdate?: (data: DeployStageConfig) => void
  readonly: boolean
  allowableTypes: AllowedTypes
  serviceRef?: string
  inputSetData?: {
    template?: DeployStageConfig
    path?: string
    readonly?: boolean
    allValues?: DeployStageConfig
  }
}

export default function DeployEnvironmentEntityWidget({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes,
  serviceRef
}: DeployEnvironmentEntityWidgetProps): JSX.Element {
  const { getString } = useStrings()

  const formikRef = useRef<FormikProps<DeployStageConfig> | null>(null)

  const { subscribeForm, unSubscribeForm } = useContext(StageErrorContext)
  useEffect(() => {
    subscribeForm({
      tab: DeployTabs.ENVIRONMENT,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form: formikRef as React.MutableRefObject<FormikProps<any> | null>
    })
    return () =>
      unSubscribeForm({
        tab: DeployTabs.ENVIRONMENT,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form: formikRef as React.MutableRefObject<FormikProps<any> | null>
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Formik<DeployStageConfig>
      formName="deployEnvironmentEntityWidgetForm"
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
          <Layout.Vertical spacing="medium">
            {!initialValues.gitOpsEnabled ? (
              <DeployEnvironment
                initialValues={initialValues}
                readonly={readonly}
                allowableTypes={allowableTypes}
                serviceRef={serviceRef}
              />
            ) : (
              <DeployEnvironmentOrEnvGroup
                initialValues={initialValues}
                allowableTypes={allowableTypes}
                readonly={readonly}
              />
            )}
          </Layout.Vertical>
        )
      }}
    </Formik>
  )
}
