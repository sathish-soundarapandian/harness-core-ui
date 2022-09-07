/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Layout, FormInput, Formik, FormikForm } from '@wings-software/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { debounce, noop, defaultTo } from 'lodash-es'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import type { CustomDeploymentInfrastructure } from 'services/cd-ng'

import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'

import { useStrings } from 'framework/strings'
import type { AllNGVariables } from '@pipeline/utils/types'
import { VariableType } from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateForm/DeploymentInfraWrapper/DeploymentInfraSpecifications/DeploymentInfraSpecifications'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { CustomVariableEditableExtraProps } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import {
  CustomDeploymentInfrastructureSpecEditableProps,
  getValidationSchema
} from './CustomDeploymentInfrastructureInterface'
import css from './CustomDeploymentInfrastructureSpec.module.scss'

// const errorMessage = 'data.message'

const CustomDeploymentInfrastructureSpecEditableNew: React.FC<CustomDeploymentInfrastructureSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly,
  factory,
  allowableTypes
}): JSX.Element => {
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { getString } = useStrings()

  const formikRef = React.useRef<FormikProps<CustomDeploymentInfrastructure> | null>(null)

  const getInitialValues = (): CustomDeploymentInfrastructure => {
    return initialValues
  }

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  React.useEffect(() => {
    subscribeForm({
      tab: DeployTabs.INFRASTRUCTURE,
      form: formikRef as React.MutableRefObject<FormikProps<unknown> | null>
    })

    return () =>
      unSubscribeForm({
        tab: DeployTabs.INFRASTRUCTURE,
        form: formikRef as React.MutableRefObject<FormikProps<unknown> | null>
      })
  }, [subscribeForm, unSubscribeForm])

  const isSvcEnvEnabled = useFeatureFlag(FeatureFlag.NG_SVC_ENV_REDESIGN)

  return (
    <Layout.Vertical spacing="medium">
      <Formik<CustomDeploymentInfrastructure>
        formName="customDeploymentInfra"
        initialValues={getInitialValues()}
        validate={value => {
          const data: Partial<CustomDeploymentInfrastructure> = {
            variables: value?.variables
          }
          delayedOnUpdate(data)
        }}
        validationSchema={getValidationSchema(getString)}
        onSubmit={noop}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
          formikRef.current = formik
          return (
            <FormikForm>
              <Layout.Vertical flex={{ alignItems: 'flex-start' }} margin={{ bottom: 'medium' }} spacing="medium">
                <Text font={{ variation: FontVariation.H6 }}>
                  {isSvcEnvEnabled ? getString('common.variables') : ''}
                </Text>
                <Text font={{ variation: FontVariation.BODY2_SEMI }}>
                  {isSvcEnvEnabled ? getString('pipeline.customDeployment.infraVariablesTitle') : ''}
                </Text>
              </Layout.Vertical>

              {/* RESOURCE GROUP */}
              <Layout.Horizontal className={cx(css.formRow, css.infraSections)} spacing="medium">
                <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
                  factory={factory as unknown as AbstractStepFactory}
                  initialValues={{
                    variables: defaultTo(formik.values?.variables, []) as AllNGVariables[],
                    canAddVariable: true
                  }}
                  stepViewType={StepViewType.StageVariable}
                  type={StepType.CustomVariable}
                  allowableTypes={allowableTypes}
                  readonly={readonly}
                  onUpdate={({ variables }: CustomVariablesData) => {
                    formik.setFieldValue('variables', variables)
                  }}
                  customStepProps={{
                    allowedVarialblesTypes: [
                      VariableType.String,
                      VariableType.Secret,
                      VariableType.Number,
                      VariableType.Connector
                    ],
                    isDescriptionEnabled: true,
                    tabName: DeployTabs.INFRASTRUCTURE,
                    formName: 'addEditInfraVariableForm'
                  }}
                />
              </Layout.Horizontal>

              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }} className={css.lastRow}>
                <FormInput.CheckBox
                  className={css.simultaneousDeployment}
                  tooltipProps={{
                    dataTooltipId: 'customDeploymentAllowSimultaneousDeployments'
                  }}
                  name={'allowSimultaneousDeployments'}
                  label={getString('cd.allowSimultaneousDeployments')}
                  disabled={readonly}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export const CustomDeploymentInfrastructureSpecEditable = React.memo(CustomDeploymentInfrastructureSpecEditableNew)
