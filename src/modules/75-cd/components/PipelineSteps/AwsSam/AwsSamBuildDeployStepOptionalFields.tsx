/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { AllowedTypes, Container, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import { FormMultiTypeCheckboxField } from '@common/components'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { getImagePullPolicyOptions } from '@common/utils/ContainerRunStepUtils'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { Connectors } from '@connectors/constants'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { ConnectorConfigureOptions } from '@connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { AwsSamDeployStepFormikValues } from './AwsSamDeployStep/AwsSamDeployStepEdit'
import type { AwsSamBuildStepFormikValues } from './AwsSamBuildStep/AwsSamBuildStepEdit'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export type AwsSamBuildDeployStepFormikVaues = AwsSamDeployStepFormikValues | AwsSamBuildStepFormikValues

interface AwsSamDeployStepOptionalFieldsProps {
  stepViewType?: StepViewType
  allowableTypes: AllowedTypes
  readonly?: boolean
  formik: FormikProps<AwsSamBuildDeployStepFormikVaues>
  isAwsSamBuildStep?: boolean
}

export function AwsSamBuildDeployStepOptionalFields(props: AwsSamDeployStepOptionalFieldsProps): React.ReactElement {
  const { readonly, allowableTypes, formik, isAwsSamBuildStep } = props

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, repoName, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const renderConnectorField = (fieldName: string, fieldLabel: string): React.ReactElement => {
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
      <Container className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.samVersion"
          label={getString('optionalField', { name: getString('cd.samVersionLabel') })}
          placeholder={getString('common.enterPlaceholder', { name: getString('cd.samVersionLabel') })}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.spec?.samVersion) === MultiTypeInputType.RUNTIME && !readonly && (
          <ConfigureOptions
            value={formik.values.spec?.samVersion as string}
            type="String"
            variableName="spec.samVersion"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => {
              formik.setFieldValue('spec.samVersion', value)
            }}
            isReadonly={readonly}
          />
        )}
      </Container>

      <Container className={cx(stepCss.formGroup)}>
        <MultiTypeList
          name={isAwsSamBuildStep ? 'spec.buildCommandOptions' : 'spec.deployCommandOptions'}
          multiTextInputProps={{
            expressions,
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
          }}
          multiTypeFieldSelectorProps={{
            label: getString('optionalField', {
              name: isAwsSamBuildStep
                ? getString('cd.steps.awsSamBuildStep.awsSamBuildCommandOptions')
                : getString('cd.steps.awsSamDeployStep.awsSamDeployCommandOptions')
            }),
            allowedTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
          }}
          disabled={readonly}
          configureOptionsProps={{ hideExecutionTimeField: true }}
        />
      </Container>

      {isAwsSamBuildStep &&
        renderConnectorField(
          'spec.samBuildDockerRegistryConnectorRef',
          getString('cd.steps.awsSamBuildStep.samBuildDockerContainerRegistry')
        )}

      {!isAwsSamBuildStep && (
        <Container className={stepCss.formGroup}>
          <FormInput.MultiTextInput
            name="spec.stackName"
            label={getString('optionalField', { name: getString('cd.cloudFormation.stackName') })}
            placeholder={getString('pipeline.artifactsSelection.existingDocker.imageNamePlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              disabled: readonly,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue((formik.values as AwsSamDeployStepFormikValues).spec?.stackName) ===
            MultiTypeInputType.RUNTIME &&
            !readonly && (
              <ConfigureOptions
                value={(formik.values as AwsSamDeployStepFormikValues).spec?.stackName as string}
                type="String"
                variableName="spec.stackName"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => {
                  formik.setFieldValue('spec.stackName', value)
                }}
                isReadonly={readonly}
              />
            )}
        </Container>
      )}

      <Container className={cx(stepCss.formGroup, stepCss.md)}>
        <FormMultiTypeCheckboxField
          name={'spec.privileged'}
          label={getString('optionalField', { name: getString('pipeline.buildInfra.privileged') })}
          multiTypeTextbox={{
            expressions,
            allowableTypes,
            disabled: readonly
          }}
          tooltipProps={{ dataTooltipId: 'privileged' }}
          disabled={readonly}
          configureOptionsProps={{ hideExecutionTimeField: true }}
        />
      </Container>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTypeInput
          name="spec.imagePullPolicy"
          label={getString('optionalField', { name: getString('pipelineSteps.pullLabel') })}
          selectItems={getImagePullPolicyOptions(getString)}
          placeholder={getString('select')}
          disabled={readonly}
          useValue={true}
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: { addClearBtn: true, items: getImagePullPolicyOptions(getString) }
          }}
        />
        {getMultiTypeFromValue(formik.values.spec.imagePullPolicy) === MultiTypeInputType.RUNTIME && (
          <SelectConfigureOptions
            options={getImagePullPolicyOptions(getString)}
            value={formik.values.spec.imagePullPolicy as string}
            type={getString('string')}
            variableName={'spec.imagePullPolicy'}
            showRequiredField={false}
            showDefaultField={false}
            onChange={val => formik?.setFieldValue('formik.values.spec.imagePullPolicy', val)}
            isReadonly={readonly}
          />
        )}
      </Container>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.runAsUser"
          label={getString('optionalField', { name: getString('pipeline.stepCommonFields.runAsUser') })}
          placeholder="1000"
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.spec?.runAsUser) === MultiTypeInputType.RUNTIME && !readonly && (
          <ConfigureOptions
            value={formik.values.spec?.runAsUser as string}
            type="String"
            variableName="spec.runAsUser"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => {
              formik.setFieldValue('spec.runAsUser', value)
            }}
            isReadonly={readonly}
          />
        )}
      </Container>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.resources.limits.memory"
          label={getString('optionalField', { name: getString('pipelineSteps.limitMemoryLabel') })}
          placeholder={getString('common.enterPlaceholder', { name: getString('pipelineSteps.limitMemoryLabel') })}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.spec?.resources?.limits?.memory) === MultiTypeInputType.RUNTIME &&
          !readonly && (
            <ConfigureOptions
              value={formik.values.spec?.resources?.limits?.memory as string}
              type="String"
              variableName="spec.resources.limits.memory"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => {
                formik.setFieldValue('spec.resources.limits.memory', value)
              }}
              isReadonly={readonly}
            />
          )}
      </Container>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.resources.limits.cpu"
          label={getString('optionalField', { name: getString('pipelineSteps.limitCPULabel') })}
          placeholder={getString('common.enterPlaceholder', { name: getString('pipelineSteps.limitCPULabel') })}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.spec?.resources?.limits?.cpu) === MultiTypeInputType.RUNTIME && !readonly && (
          <ConfigureOptions
            value={formik.values.spec?.resources?.limits?.cpu as string}
            type="String"
            variableName="spec.resources.limits.cpu"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => {
              formik.setFieldValue('spec.resources.limits.cpu', value)
            }}
            isReadonly={readonly}
          />
        )}
      </Container>

      <Container className={stepCss.formGroup}>
        <MultiTypeMap
          appearance={'minimal'}
          name={'spec.envVariables'}
          valueMultiTextInputProps={{ expressions, allowableTypes }}
          multiTypeFieldSelectorProps={{
            label: getString('optionalField', { name: getString('environmentVariables') }),
            disableTypeSelection: true
          }}
          configureOptionsProps={{
            hideExecutionTimeField: true
          }}
          disabled={readonly}
        />
      </Container>
    </>
  )
}
