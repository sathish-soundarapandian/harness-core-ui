/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import cx from 'classnames'
import {
  Accordion,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption,
  Text
} from '@harness/uicore'
import type { IOptionProps } from '@blueprintjs/core'
import type { FormikProps } from 'formik'
import { defaultTo, get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import {
  OrganizationDTO,
  useGetTerraformCloudOrganizations,
  useGetTerraformCloudWorkspaces,
  WorkspaceDTO
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import { setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConnectorConfigureOptions } from '@connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { Connectors } from '@connectors/constants'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { FormMultiTypeCheckboxField, FormMultiTypeTextAreaField } from '@common/components'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import OptionalConfiguration from './OptionalConfiguration'
import { CommandTypes } from '../Common/Terraform/TerraformInterfaces'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import type { TerraformCloudRunEditProps, TerraformCloudRunFormData } from './types'
import { errorMessage, getValidationSchema, organizationLabel, runTypeLabel, RunTypes, workspaceLabel } from './helper'
import { getValue, shouldFetchFieldData } from '../PipelineStepsUtil'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './TerraformCloudRunStep.module.scss'

export function TerraformCloudRunEdit(
  {
    initialValues,
    onUpdate,
    onChange,
    allowableTypes,
    isNewStep,
    readonly,
    stepViewType,
    formik
  }: TerraformCloudRunEditProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const terraformConnectorRef = get(formik, 'values.spec.spec.connectorRef', '')
  const terraformOrganization =
    typeof get(formik, 'values.spec.spec.organization') === 'object'
      ? (get(formik, 'values.spec.spec.organization') as SelectOption).value?.toString()
      : ''

  const queryParams = {
    connectorRef: terraformConnectorRef,
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  }

  const {
    data: organizationsData,
    loading: loadingOrganizations,
    refetch: refetchOrganizations,
    error: organizationsError
  } = useGetTerraformCloudOrganizations({
    queryParams: {
      ...queryParams
    },
    lazy: !shouldFetchFieldData([terraformConnectorRef])
  })

  const organizations: SelectOption[] = useMemo(() => {
    /* istanbul ignore next */
    if (loadingOrganizations) {
      return [{ label: getString('loading'), value: getString('loading') }]
    }
    return (get(organizationsData, 'data.organizations', []) as OrganizationDTO[]).map(organization => ({
      value: organization?.organizationName,
      label: organization?.organizationName
    }))
  }, [getString, loadingOrganizations, organizationsData])

  const {
    data: workspacesData,
    loading: loadingWorkspaces,
    refetch: refetchWorkspaces,
    error: workspacesError
  } = useGetTerraformCloudWorkspaces({
    queryParams: {
      ...queryParams,
      organization: terraformOrganization
    },
    lazy: !shouldFetchFieldData([terraformConnectorRef, terraformOrganization])
  })

  const workspaces: SelectOption[] = useMemo(() => {
    /* istanbul ignore next */
    if (loadingWorkspaces) {
      return [{ label: getString('loading'), value: getString('loading') }]
    }
    return (get(workspacesData, 'data.workspaces', []) as WorkspaceDTO[]).map(workspace => ({
      value: workspace?.workspaceId,
      label: `${workspace?.workspaceName}: ${workspace?.workspaceId}`
    }))
  }, [loadingWorkspaces, workspacesData, getString])

  const runTypeOptions = useMemo(
    () => [
      { label: 'Plan', value: RunTypes.Plan },
      { label: 'Apply', value: RunTypes.Apply },
      { label: 'Refresh', value: RunTypes.RefreshState },
      { label: 'Plan Only', value: RunTypes.PlanOnly },
      { label: 'Plan and Apply', value: RunTypes.PlanAndApply },
      { label: 'Plan and Destroy', value: RunTypes.PlanAndDestroy }
    ],
    []
  )

  const planTypeOptions: IOptionProps[] = [
    { label: getString('filters.apply'), value: CommandTypes.Apply },
    { label: getString('pipelineSteps.destroy'), value: CommandTypes.Destroy }
  ]

  return (
    <Formik<TerraformCloudRunFormData>
      onSubmit={submit => {
        onUpdate?.(submit)
      }}
      validate={formValues => {
        onChange?.(formValues)
      }}
      formName="TerraformCloudRunForm"
      initialValues={initialValues}
      validationSchema={getValidationSchema(getString, stepViewType)}
    >
      {(formikValues: FormikProps<TerraformCloudRunFormData>) => {
        const { values, setFieldValue } = formikValues
        setFormikRef(formikRef, formikValues)
        const runTypeValue = get(values.spec, 'runType')
        const specValues = values.spec?.spec
        const { discardPendingRuns, connectorRef, organization, workspace, terraformVersion, provisionerIdentifier } =
          defaultTo(specValues, {})
        return (
          <FormikForm>
            <NameTimeoutField
              allowableTypes={allowableTypes}
              isNewStep={isNewStep}
              readonly={readonly}
              stepViewType={stepViewType}
            />
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.Select
                label={getString(runTypeLabel)}
                name="spec.runType"
                items={runTypeOptions}
                placeholder={getString('pipeline.terraformStep.runTypePlaceholder')}
              />
            </div>
            {runTypeValue !== RunTypes.Apply && (
              <>
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormMultiTypeCheckboxField
                    formik={formikValues}
                    name={'spec.spec.discardPendingRuns'}
                    label={getString('pipeline.terraformStep.discardPendingRuns')}
                    multiTypeTextbox={{ expressions, allowableTypes }}
                    disabled={readonly}
                  />
                  {getMultiTypeFromValue(discardPendingRuns) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={defaultTo(discardPendingRuns, '') as string}
                      type="String"
                      variableName="spec.spec.discardPenidngRuns"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={
                        /* istanbul ignore next */ value => setFieldValue('spec.spec.discardPenidngRuns', value)
                      }
                      style={{ alignSelf: 'center' }}
                      isReadonly={readonly}
                    />
                  )}
                </div>
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormMultiTypeTextAreaField
                    placeholder={getString('pipeline.terraformStep.messagePlaceholder')}
                    name="spec.runMessage"
                    label={getString('pipeline.terraformStep.messageLabel')}
                    className={css.message}
                    multiTypeTextArea={{
                      enableConfigureOptions: false,
                      expressions,
                      disabled: readonly,
                      allowableTypes,
                      textAreaProps: { growVertically: true }
                    }}
                  />
                  {getMultiTypeFromValue(get(values.spec, 'runMessage')) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={get(values.spec, 'runMessage')}
                      type="String"
                      variableName="spec.runMessage"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={/* istanbul ignore next */ value => setFieldValue('spec.runMessage', value)}
                      isReadonly={readonly}
                    />
                  )}
                </div>
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormMultiTypeConnectorField
                    name="spec.spec.connectorRef"
                    label={getString('connectors.selectConnector')}
                    type={[Connectors.TERRAFORM_CLOUD]}
                    placeholder={getString('select')}
                    disabled={readonly}
                    accountIdentifier={accountId}
                    multiTypeProps={{ expressions, allowableTypes, disabled: readonly }}
                    projectIdentifier={projectIdentifier}
                    orgIdentifier={orgIdentifier}
                    enableConfigureOptions={false}
                    gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                    width={372}
                    setRefValue
                    onChange={
                      /* istanbul ignore next */ type => {
                        if (type !== MultiTypeInputType.FIXED) {
                          getMultiTypeFromValue(organization) !== MultiTypeInputType.RUNTIME &&
                            setFieldValue('spec.spec.organization', '')
                          getMultiTypeFromValue(workspace) !== MultiTypeInputType.RUNTIME &&
                            setFieldValue('spec.spec.workspace', '')
                        }
                      }
                    }
                  />
                  {getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
                    <ConnectorConfigureOptions
                      style={{ marginTop: 10 }}
                      value={connectorRef as string}
                      type="String"
                      variableName="spec.spec.connectorRef"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        setFieldValue('spec.spec.connectorRef', value)
                      }}
                      isReadonly={readonly}
                      connectorReferenceFieldProps={{
                        accountIdentifier: accountId,
                        projectIdentifier,
                        orgIdentifier,
                        label: getString('connector'),
                        disabled: readonly,
                        gitScope: { repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }
                      }}
                    />
                  )}
                </div>
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.MultiTypeInput
                    name="spec.spec.organization"
                    selectItems={organizations}
                    disabled={readonly}
                    placeholder={
                      loadingOrganizations
                        ? /* istanbul ignore next */ getString('loading')
                        : getString('cd.steps.tasInfra.organizationPlaceholder')
                    }
                    multiTypeInputProps={{
                      onChange: /* istanbul ignore next */ () => {
                        getMultiTypeFromValue(workspace) !== MultiTypeInputType.RUNTIME &&
                          setFieldValue('spec.spec.workspace', '')
                      },
                      expressions,
                      disabled: readonly,
                      onFocus: /* istanbul ignore next */ () => {
                        if (getMultiTypeFromValue(organization) === MultiTypeInputType.FIXED) {
                          refetchOrganizations({
                            queryParams: {
                              accountIdentifier: accountId,
                              projectIdentifier,
                              orgIdentifier,
                              connectorRef: getValue(connectorRef)
                            }
                          })
                        }
                      },
                      selectProps: {
                        items: organizations,
                        allowCreatingNewItems: true,
                        addClearBtn: !(loadingOrganizations || readonly),
                        noResults: (
                          <Text padding={'small'}>
                            {loadingOrganizations
                              ? /* istanbul ignore next */ getString('loading')
                              : defaultTo(
                                  get(organizationsError, errorMessage, null),
                                  getString('cd.steps.tasInfra.organizationError')
                                )}
                          </Text>
                        )
                      },
                      allowableTypes
                    }}
                    label={getString(organizationLabel)}
                  />
                  {getMultiTypeFromValue(getValue(organization)) === MultiTypeInputType.RUNTIME && !readonly && (
                    <SelectConfigureOptions
                      value={getValue(organization)}
                      type="String"
                      variableName="spec.spec.organization"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        setFieldValue('spec.spec.organization', value)
                      }}
                      isReadonly={readonly}
                      loading={loadingOrganizations}
                      options={organizations}
                    />
                  )}
                </div>
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.MultiTypeInput
                    name="spec.spec.workspace"
                    selectItems={workspaces}
                    disabled={readonly}
                    placeholder={
                      loadingWorkspaces
                        ? /* istanbul ignore next */ getString('loading')
                        : getString('pipeline.terraformStep.workspacePlaceholder')
                    }
                    multiTypeInputProps={{
                      expressions,
                      disabled: readonly,
                      onFocus: /* istanbul ignore next */ () => {
                        if (getMultiTypeFromValue(specValues.workspace) === MultiTypeInputType.FIXED) {
                          refetchWorkspaces({
                            queryParams: {
                              accountIdentifier: accountId,
                              projectIdentifier,
                              orgIdentifier,
                              connectorRef: getValue(specValues.connectorRef),
                              organization: getValue(specValues.organization)
                            }
                          })
                        }
                      },
                      selectProps: {
                        items: workspaces,
                        allowCreatingNewItems: true,
                        addClearBtn: !(loadingWorkspaces || readonly),
                        noResults: (
                          <Text padding={'small'}>
                            {loadingWorkspaces
                              ? /* istanbul ignore next */ getString('loading')
                              : get(workspacesError, errorMessage, null) ||
                                getString('pipeline.terraformStep.workspaceError')}
                          </Text>
                        )
                      },
                      allowableTypes
                    }}
                    label={getString(workspaceLabel)}
                  />
                  {getMultiTypeFromValue(getValue(specValues.workspace)) === MultiTypeInputType.RUNTIME && !readonly && (
                    <SelectConfigureOptions
                      value={getValue(specValues.workspace)}
                      type="String"
                      variableName="spec.spec.workspace"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={
                        /* istanbul ignore next */ value => {
                          setFieldValue('spec.spec.workspace', value)
                        }
                      }
                      isReadonly={readonly}
                      loading={loadingWorkspaces}
                      options={workspaces}
                    />
                  )}
                </div>
              </>
            )}
            {(runTypeValue === RunTypes.Plan || runTypeValue === RunTypes.PlanOnly) && (
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.RadioGroup
                  name="spec.spec.planType"
                  label={getString('commandLabel')}
                  radioGroup={{ inline: true }}
                  items={planTypeOptions}
                  className={css.radioBtns}
                  disabled={readonly}
                />
              </div>
            )}
            {runTypeValue === RunTypes.PlanOnly && (
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTextInput
                  name="spec.spec.terraformVersion"
                  placeholder={getString('pipeline.terraformStep.terraformVersionPlaceholder')}
                  label={getString('pipeline.terraformStep.terraformVersion')}
                  multiTextInputProps={{ expressions, allowableTypes }}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(terraformVersion) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={terraformVersion as string}
                    type="String"
                    variableName="spec.spec.terraformVersion"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => {
                      setFieldValue('spec.spec.terraformVersion', value)
                    }}
                    isReadonly={readonly}
                    allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                  />
                )}
              </div>
            )}
            {runTypeValue !== RunTypes.RefreshState && (
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTextInput
                  name="spec.spec.provisionerIdentifier"
                  placeholder={getString('pipeline.terraformStep.provisionerIdentifier')}
                  label={getString('pipelineSteps.provisionerIdentifier')}
                  multiTextInputProps={{ expressions, allowableTypes }}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={provisionerIdentifier as string}
                    type="String"
                    variableName="spec.spec.provisionerIdentifier"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => {
                      setFieldValue('spec.spec.provisionerIdentifier', value)
                    }}
                    isReadonly={readonly}
                    allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                  />
                )}
              </div>
            )}
            {runTypeValue !== RunTypes.Apply && (
              <Accordion className={stepCss.accordion}>
                <Accordion.Panel
                  id="optional-config"
                  summary={getString('common.optionalConfig')}
                  details={
                    <OptionalConfiguration formik={formikValues} readonly={readonly} allowableTypes={allowableTypes} />
                  }
                />
              </Accordion>
            )}
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const TerraformCloudRunEditRef = React.forwardRef(TerraformCloudRunEdit)
