/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { defaultTo, get } from 'lodash-es'
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
import type { ListValue, MultiTypeListType } from '@common/components/MultiTypeList/MultiTypeList'
import { Connectors } from '@connectors/constants'
import { ConnectorConfigureOptions } from '@connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { AwsSamBuildStepInitialValues } from '@pipeline/utils/types'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ConnectorRef } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { ConnectorRefFormValueType, getConnectorRefValue } from '@cd/utils/connectorUtils'
import { NameTimeoutField } from '../../Common/GenericExecutionStep/NameTimeoutField'
import {
  AwsSamBuildDeployStepOptionalFields,
  AwsSamBuildDeployStepFormikVaues
} from '../AwsSamBuildDeployStepOptionalFields'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../AwsSamBuildDeployStep.module.scss'

export interface AwsSamBuildStepFormikValues extends StepElementConfig {
  spec: {
    connectorRef: ConnectorRef
    samBuildDockerRegistryConnectorRef: ConnectorRef
    image?: string
    buildCommandOptions?: MultiTypeListType
    stackName?: string
    privileged?: boolean
    imagePullPolicy?: string
    runAsUser?: string
    resources?: {
      limits?: {
        memory?: string
        cpu?: string
      }
    }
    envVariables?: { key: string; value: string }[]
  }
}
export interface AwsSamBuildStepProps {
  initialValues: AwsSamBuildStepInitialValues
  onUpdate?: (data: AwsSamBuildStepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: AwsSamBuildStepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
}

const AwsSamBuildStepEdit = (
  props: AwsSamBuildStepProps,
  formikRef: StepFormikFowardRef<AwsSamBuildStepFormikValues>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep = true, readonly, allowableTypes, stepViewType } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, repoName, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const validationSchema = Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      connectorRef: Yup.string().required(
        getString('common.validation.fieldIsRequired', { name: getString('pipelineSteps.connectorLabel') })
      ),
      samBuildDockerRegistryConnectorRef: Yup.string().required(
        getString('common.validation.fieldIsRequired', {
          name: getString('cd.steps.awsSamBuildStep.samBuildDockerRegistryConnectorRef')
        })
      )
    })
  })

  const getInitialValues = (): AwsSamBuildStepFormikValues => {
    return {
      ...initialValues,
      spec: {
        ...initialValues.spec,
        buildCommandOptions:
          typeof initialValues.spec.buildCommandOptions === 'string'
            ? initialValues.spec.buildCommandOptions
            : initialValues.spec.buildCommandOptions?.map(buildCommandOption => ({
                id: uuid('', nameSpace()),
                value: buildCommandOption
              })),
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

  const onSubmit = (values: AwsSamBuildStepFormikValues): void => {
    const modifiedValues: AwsSamBuildStepInitialValues = {
      ...values,
      spec: {
        ...values.spec,
        connectorRef: getConnectorRefValue(values.spec.connectorRef as ConnectorRefFormValueType),
        samBuildDockerRegistryConnectorRef: getConnectorRefValue(
          values.spec.samBuildDockerRegistryConnectorRef as ConnectorRefFormValueType
        ),
        buildCommandOptions:
          typeof values.spec.buildCommandOptions === 'string'
            ? values.spec.buildCommandOptions
            : (values.spec.buildCommandOptions as ListValue)?.map(
                (buildCommandOption: { id: string; value: string }) => buildCommandOption.value
              ),
        envVariables: values.spec?.envVariables?.map(envVar => ({ [envVar.key]: envVar.value }))
      }
    }
    onUpdate?.(modifiedValues)
  }

  const renderConnectorField = (
    formik: FormikProps<AwsSamBuildStepFormikValues>,
    fieldName: string,
    fieldLabel: string
  ) => {
    return (
      <Container className={stepCss.formGroup}>
        <FormMultiTypeConnectorField
          width={510}
          name={fieldName}
          label={fieldLabel}
          placeholder={getString('select')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ expressions, allowableTypes }}
          type={[Connectors.GCP, Connectors.AWS, Connectors.DOCKER]}
          enableConfigureOptions={false}
          selected={get(formik?.values, fieldName) as string}
          setRefValue
          disabled={readonly}
          gitScope={{ repo: defaultTo(repoIdentifier, repoName), branch, getDefaultFromOtherRepo: true }}
        />
        {getMultiTypeFromValue(get(formik.values, fieldName)) === MultiTypeInputType.RUNTIME && (
          <ConnectorConfigureOptions
            style={{ marginTop: 6 }}
            value={get(formik.values, fieldName) as string}
            type="String"
            variableName={fieldName}
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => formik.setFieldValue(fieldName, value)}
            isReadonly={readonly}
            connectorReferenceFieldProps={{
              accountIdentifier: accountId,
              projectIdentifier,
              orgIdentifier,
              type: [Connectors.GCP, Connectors.AWS, Connectors.DOCKER],
              label: fieldLabel,
              disabled: readonly,
              gitScope: { repo: defaultTo(repoIdentifier, repoName), branch, getDefaultFromOtherRepo: true }
            }}
          />
        )}
      </Container>
    )
  }

  return (
    <>
      <Formik<AwsSamBuildStepFormikValues>
        onSubmit={onSubmit}
        formName="AwsSamBuildStepEdit"
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
      >
        {(formik: FormikProps<AwsSamBuildStepFormikValues>) => {
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

              {renderConnectorField(formik, 'spec.connectorRef', getString('pipelineSteps.connectorLabel'))}

              {renderConnectorField(
                formik,
                'spec.samBuildDockerRegistryConnectorRef',
                getString('cd.steps.awsSamBuildStep.samBuildDockerRegistryConnectorRef')
              )}

              <Container className={stepCss.formGroup}>
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
                    value={formik.values.spec?.image as string}
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
              </Container>

              <Accordion className={stepCss.accordion}>
                <Accordion.Panel
                  id="aws-sam-deploy-optional-accordion"
                  data-testid={'aws-sam-deploy-optional-accordion'}
                  summary={getString('common.optionalConfig')}
                  details={
                    <Container margin={{ top: 'medium' }}>
                      <AwsSamBuildDeployStepOptionalFields
                        readonly={readonly}
                        stepViewType={stepViewType}
                        allowableTypes={allowableTypes}
                        formik={formik as FormikProps<AwsSamBuildDeployStepFormikVaues>}
                        isAwsSamBuildStep={true}
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

export const AwsSamBuildStepEditRef = React.forwardRef(AwsSamBuildStepEdit)
