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
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import type { FormikProps } from 'formik'
import {
  Accordion,
  AllowedTypes,
  Container,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text
} from '@harness/uicore'

import type { StepElementConfig } from 'services/cd-ng'
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
import type { AwsSamDeployStepInitialValues } from '@pipeline/utils/types'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { NameTimeoutField } from '../../Common/GenericExecutionStep/NameTimeoutField'
import { AwsSamDeployStepOptionalFields } from './AwsSamDeployStepOptionalFields'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './AwsSamDeployStep.module.scss'

interface AwsSamDeployStepFormikValues extends StepElementConfig {
  spec: {
    connectorRef: string
    image: string
    deployCommandOptions?: string[]
    stackName?: string
    privileged?: boolean
    imagePullPolicy?: string
    runAsUser?: string
    envVariables?: { key: string; value: string }[]
  }
}
export interface AwsSamDeployStepProps {
  initialValues: AwsSamDeployStepInitialValues
  onUpdate?: (data: AwsSamDeployStepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: AwsSamDeployStepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
}

const AwsSamDeployStepEdit = (
  props: AwsSamDeployStepProps,
  formikRef: StepFormikFowardRef<AwsSamDeployStepFormikValues>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep = true, readonly, onChange, allowableTypes, stepViewType } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, repoName, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const getInitialValues = (): AwsSamDeployStepFormikValues => {
    return {
      ...initialValues,
      spec: {
        ...initialValues.spec,
        envVariables: initialValues.spec?.envVariables?.map(envVar => {
          const objKey = Object.keys(envVar)[0]
          return {
            id: uuid('', nameSpace()),
            key: objKey,
            value: envVar[objKey]
          }
        })
      }
    }
  }

  const onSubmit = (values: AwsSamDeployStepFormikValues): void => {
    const modifiedValues: AwsSamDeployStepInitialValues = {
      ...values,
      spec: {
        ...values.spec,
        envVariables: values.spec?.envVariables?.map(envVar => ({ [envVar.key]: envVar.value }))
      }
    }
    onUpdate?.(modifiedValues)
  }

  return (
    <>
      <Formik<AwsSamDeployStepFormikValues>
        onSubmit={onSubmit}
        formName="AwsSamDeployStepEdit"
        initialValues={getInitialValues()}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<AwsSamDeployStepInitialValues>) => {
          setFormikRef(formikRef, formik)

          return (
            <FormikForm>
              <NameTimeoutField
                allowableTypes={allowableTypes}
                isNewStep={isNewStep}
                readonly={readonly}
                stepViewType={stepViewType}
              />

              <Text className={css.containerConfiguration} tooltipProps={{ dataTooltipId: 'containerConfiguration' }}>
                {getString('cd.steps.awsSamDeployStep.containerConfigurationText')}
              </Text>

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

              <Accordion className={stepCss.accordion}>
                <Accordion.Panel
                  id="aws-sam-deploy-optional-accordion"
                  data-testid={'aws-sam-deploy-optional-accordion'}
                  summary={getString('common.optionalConfig')}
                  details={
                    <Container margin={{ top: 'medium' }}>
                      <AwsSamDeployStepOptionalFields
                        readonly={readonly}
                        stepViewType={stepViewType}
                        allowableTypes={allowableTypes}
                        formik={formik}
                      />
                    </Container>
                  }
                />
              </Accordion>
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const AwsSamDeployStepEditRef = React.forwardRef(AwsSamDeployStepEdit)
