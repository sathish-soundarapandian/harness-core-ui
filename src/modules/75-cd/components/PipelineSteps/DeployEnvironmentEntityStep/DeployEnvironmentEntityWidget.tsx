/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import { isEmpty, noop } from 'lodash-es'
import type { FormikProps } from 'formik'
import { Divider } from '@blueprintjs/core'
import produce from 'immer'

import { AllowedTypes, Container, Formik, FormikForm, Layout, Toggle } from '@harness/uicore'

import { useStrings } from 'framework/strings'

import { useStageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { getEnvironmentTabV2Schema } from '../PipelineStepsUtil'
import DeployEnvironment from './DeployEnvironment/DeployEnvironment'
import DeploySingleInfrastructure from './DeploySingleInfrastructure/DeploySingleInfrastructure'
import type { DeployEnvironmentEntityFormState } from './utils'

import css from './DeployEnvironmentEntityWidget.module.scss'

export interface DeployEnvironmentEntityWidgetProps {
  initialValues: DeployEnvironmentEntityFormState
  readonly: boolean
  allowableTypes: AllowedTypes
  onUpdate?: (data: DeployEnvironmentEntityFormState) => void
  stepViewType?: StepViewType
  serviceRef?: string
}

export default function DeployEnvironmentEntityWidget({
  initialValues,
  readonly,
  allowableTypes,
  onUpdate,
  stepViewType,
  serviceRef
}: DeployEnvironmentEntityWidgetProps): JSX.Element {
  const { getString } = useStrings()

  const formikRef = useRef<FormikProps<DeployEnvironmentEntityFormState> | null>(null)
  // TODO: uncomment below line
  // const [isMultiEnvInfra, setIsMultiEnvInfra] = useState(!!initialValues.environments)
  const [isMultiEnvInfra, setIsMultiEnvInfra] = useState(true)

  const { subscribeForm, unSubscribeForm } = useStageErrorContext<DeployEnvironmentEntityFormState>()
  useEffect(() => {
    subscribeForm({ tab: DeployTabs.ENVIRONMENT, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.ENVIRONMENT, form: formikRef })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMultiEnvInfraToggle = (values: DeployEnvironmentEntityFormState) => {
    return (checked: boolean) => {
      if (formikRef.current?.values) {
        setIsMultiEnvInfra(checked)
        let newValues = {}
        if (checked) {
          if (values.environment) {
            // TODO: show dialog here
            newValues = produce(formikRef.current.values, draft => {
              draft.environments = {
                values: []
              }
              delete draft.environment
            })
          } else {
            newValues = produce(formikRef.current.values, draft => {
              draft.environments = {
                values: []
              }
              delete draft.environment
            })
          }
        } else {
          // TODO: Add env group condition here
          if (!isEmpty(values.environments)) {
            newValues = produce(formikRef.current.values, draft => {
              draft.environment = {
                environmentRef: ''
              }
              delete draft.environments
            })
          } else {
            // move to confirmation directly
            newValues = produce(formikRef.current.values, draft => {
              draft.environment = {
                environmentRef: ''
              }
              delete draft.environments
            })
          }
        }

        formikRef.current.setTouched({ environment: true })
        formikRef.current.setValues(newValues)
      }
    }
  }

  return (
    <Formik<DeployEnvironmentEntityFormState>
      formName="deployEnvironmentEntityWidgetForm"
      onSubmit={noop}
      validate={(values: DeployEnvironmentEntityFormState) => {
        onUpdate?.({ ...values })
      }}
      initialValues={initialValues}
      validationSchema={getEnvironmentTabV2Schema(getString)}
    >
      {formik => {
        window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.ENVIRONMENT }))
        formikRef.current = formik

        return (
          <FormikForm>
            <Layout.Vertical spacing="medium" width={'1000px'}>
              <Container className={css.toggle} flex={{ justifyContent: 'flex-end' }}>
                <Toggle
                  checked={isMultiEnvInfra}
                  onToggle={handleMultiEnvInfraToggle(formik.values)}
                  label={getString('cd.pipelineSteps.environmentTab.multiEnvInfraToggleText')}
                />
              </Container>
              <>
                <DeployEnvironment
                  initialValues={initialValues}
                  readonly={readonly}
                  allowableTypes={allowableTypes}
                  stepViewType={stepViewType}
                  serviceRef={serviceRef}
                  isMultiEnv={!formik.values.environments}
                />
                {formik.values.environment?.environmentRef && (
                  <>
                    <Divider />
                    <DeploySingleInfrastructure
                      initialValues={initialValues}
                      readonly={readonly}
                      allowableTypes={allowableTypes}
                      environmentRef={formik.values.environment?.environmentRef}
                      stepViewType={stepViewType}
                    />
                  </>
                )}
              </>
            </Layout.Vertical>
          </FormikForm>
        )
      }}
    </Formik>
  )
}
