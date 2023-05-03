/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import * as Yup from 'yup'
import { defaultTo } from 'lodash-es'
import type { FormikProps } from 'formik'
import { AllowedTypes, Formik, FormikForm, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Connectors } from '@connectors/constants'
import { ConnectorConfigureOptions } from '@connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { AwsSAMDeployStepInitialValues } from '@pipeline/utils/types'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { NameTimeoutField } from '../../Common/GenericExecutionStep/NameTimeoutField'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface AwsSAMDeployStepProps {
  initialValues: AwsSAMDeployStepInitialValues
  onUpdate?: (data: AwsSAMDeployStepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: AwsSAMDeployStepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
}

const AwsSAMDeployStepEdit = (
  props: AwsSAMDeployStepProps,
  formikRef: StepFormikFowardRef<AwsSAMDeployStepInitialValues>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep = true, readonly, onChange, allowableTypes, stepViewType } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, repoName, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      <Formik<AwsSAMDeployStepInitialValues>
        onSubmit={(values: AwsSAMDeployStepInitialValues) => {
          onUpdate?.(values)
        }}
        formName="AwsSAMDeployStepEdit"
        initialValues={initialValues}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<AwsSAMDeployStepInitialValues>) => {
          setFormikRef(formikRef, formik)

          return (
            <FormikForm>
              <NameTimeoutField
                allowableTypes={allowableTypes}
                isNewStep={isNewStep}
                readonly={readonly}
                stepViewType={stepViewType}
              />

              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormMultiTypeConnectorField
                  name="spec.connectorRef"
                  label={getString('pipelineSteps.connectorLabel')}
                  width={390}
                  placeholder={getString('select')}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  multiTypeProps={{ expressions, allowableTypes }}
                  type={[Connectors.GCP, Connectors.AWS, Connectors.DOCKER]}
                  enableConfigureOptions={false}
                  selected={formik?.values?.spec.connectorRef as string}
                  setRefValue
                  disabled={readonly}
                  gitScope={{ repo: defaultTo(repoIdentifier, repoName), branch, getDefaultFromOtherRepo: true }}
                />
                {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
                  <ConnectorConfigureOptions
                    style={{ marginTop: 6 }}
                    value={formik.values.spec.connectorRef as string}
                    type="String"
                    variableName="spec.connectorRef"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => formik.setFieldValue('spec.connectorRef', value)}
                    isReadonly={readonly}
                    connectorReferenceFieldProps={{
                      accountIdentifier: accountId,
                      projectIdentifier,
                      orgIdentifier,
                      type: [Connectors.GCP, Connectors.AWS, Connectors.DOCKER],
                      label: getString('pipelineSteps.connectorLabel'),
                      disabled: readonly,
                      gitScope: { repo: defaultTo(repoIdentifier, repoName), branch, getDefaultFromOtherRepo: true }
                    }}
                  />
                )}
              </div>

              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTextInput
                  name="spec.image"
                  label={getString('imageLabel')}
                  placeholder={getString('pipeline.artifactsSelection.existingDocker.imageNamePlaceholder')}
                  disabled={readonly}
                  isOptional={true}
                  multiTextInputProps={{
                    expressions,
                    disabled: readonly,
                    allowableTypes
                  }}
                />
                {getMultiTypeFromValue(formik.values.spec?.image) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.spec?.image}
                    type="String"
                    variableName="spec.image"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => {
                      formik.setFieldValue('spec.image', value)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </div>
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const AwsSAMDeployStepEditRef = React.forwardRef(AwsSAMDeployStepEdit)
