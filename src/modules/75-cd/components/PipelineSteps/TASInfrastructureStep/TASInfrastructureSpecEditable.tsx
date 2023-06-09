/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import {
  Text,
  Layout,
  FormInput,
  SelectOption,
  Formik,
  FormikForm,
  Icon,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@harness/uicore'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { debounce, noop, get, defaultTo } from 'lodash-es'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { ConnectorConfigureOptions } from '@connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { TanzuApplicationServiceInfrastructure, useGetTasOrganizations, useGetTasSpaces } from 'services/cd-ng'

import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { Connectors } from '@connectors/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import ProvisionerField from '@pipeline/components/Provisioner/ProvisionerField'
import type { TASInfrastructureUI } from './TASInfrastructureStep'
import {
  TASInfrastructureSpecEditableProps,
  getValidationSchema,
  organizationLabel,
  spaceGroupLabel
} from './TASInfrastructureInterface'
import { getValue } from '../PipelineStepsUtil'
import css from './TASInfrastructureSpec.module.scss'

const errorMessage = 'data.message'

const TASInfrastructureSpecEditableNew: React.FC<TASInfrastructureSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { expressions } = useVariablesExpression()
  const [renderCount, setRenderCount] = React.useState<boolean>(true)
  const { getString } = useStrings()

  const formikRef = React.useRef<FormikProps<TASInfrastructureUI> | null>(null)

  const queryParams = {
    connectorRef: initialValues?.connectorRef,
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  }
  const {
    data: organizationsData,
    loading: loadingOrganizations,
    refetch: refetchOrganizations,
    error: organizationsError
  } = useGetTasOrganizations({
    queryParams,
    lazy: true
  })

  const organizations: SelectOption[] = React.useMemo(() => {
    return defaultTo(organizationsData?.data, []).map(organization => ({
      value: organization,
      label: organization
    }))
  }, [organizationsData?.data])

  const {
    data: spacesData,
    refetch: refetchSpaces,
    loading: loadingSpaces,
    error: spacesError
  } = useGetTasSpaces({
    queryParams: {
      ...queryParams,
      organization: initialValues?.organization
    },
    lazy: true
  })

  const spaces: SelectOption[] = React.useMemo(() => {
    return defaultTo(spacesData?.data, []).map(space => ({
      value: space,
      label: space
    }))
  }, [spacesData?.data])

  const getOrganization = (values: TASInfrastructureUI): SelectOption | undefined => {
    const value = values.organization ? values.organization : formikRef?.current?.values?.organization?.value

    if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED) {
      return (
        organizations.find(organization => organization.value === value) || {
          label: value,
          value: value
        }
      )
    }

    return values?.organization
  }
  useEffect(() => {
    if (getMultiTypeFromValue(formikRef?.current?.values.organization) === MultiTypeInputType.FIXED) {
      if (initialValues?.organization) {
        if (renderCount) {
          formikRef?.current?.setFieldValue('organization', getOrganization(initialValues))
          organizations?.length && setRenderCount(false)
        }
      } else {
        setRenderCount(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizations])
  const getInitialValues = (): TASInfrastructureUI => {
    const currentValues: TASInfrastructureUI = {
      ...initialValues
    }

    /* istanbul ignore else */
    if (initialValues) {
      currentValues.organization = getOrganization(initialValues)

      if (getMultiTypeFromValue(initialValues?.space) === MultiTypeInputType.FIXED) {
        currentValues.space = { label: initialValues.space, value: initialValues.space }
      }
    }

    return currentValues
  }

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  React.useEffect(() => {
    subscribeForm({
      tab: DeployTabs.INFRASTRUCTURE,
      form: formikRef as React.MutableRefObject<FormikProps<unknown> | null>
    })
    if (initialValues.connectorRef && getMultiTypeFromValue(initialValues.connectorRef) === MultiTypeInputType.FIXED) {
      refetchOrganizations({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef: initialValues.connectorRef
        }
      })
    }
    if (
      initialValues.connectorRef &&
      getMultiTypeFromValue(initialValues.connectorRef) === MultiTypeInputType.FIXED &&
      initialValues.organization &&
      getMultiTypeFromValue(initialValues.organization) === MultiTypeInputType.FIXED
    ) {
      refetchSpaces({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef: initialValues.connectorRef,
          organization: initialValues.organization
        }
      })
    }
    return () =>
      unSubscribeForm({
        tab: DeployTabs.INFRASTRUCTURE,
        form: formikRef as React.MutableRefObject<FormikProps<unknown> | null>
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Layout.Vertical spacing="medium">
      <Formik<TASInfrastructureUI>
        formName="TASInfraEditForm"
        initialValues={getInitialValues()}
        validate={value => {
          const data: Partial<TanzuApplicationServiceInfrastructure> = {
            connectorRef: undefined,
            organization:
              getValue(value.organization) === '' ? /* istanbul ignore next */ undefined : getValue(value.organization),
            space: getValue(value.space) === '' ? /* istanbul ignore next */ undefined : getValue(value.space),
            allowSimultaneousDeployments: value.allowSimultaneousDeployments,
            provisioner: value?.provisioner || undefined
          }
          /* istanbul ignore else */ if (value.connectorRef) {
            data.connectorRef = value.connectorRef?.value || /* istanbul ignore next */ value.connectorRef
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
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <ProvisionerField name="provisioner" isReadonly />
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormMultiTypeConnectorField
                  name="connectorRef"
                  label={getString('connector')}
                  placeholder={getString('common.entityPlaceholderText')}
                  disabled={readonly}
                  accountIdentifier={accountId}
                  multiTypeProps={{ expressions, allowableTypes }}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={450}
                  connectorLabelClass={css.connectorRef}
                  enableConfigureOptions={false}
                  style={{ marginBottom: 'var(--spacing-large)' }}
                  type={Connectors.TAS}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                  onChange={type => {
                    /* istanbul ignore next */
                    if (type !== MultiTypeInputType.FIXED) {
                      getMultiTypeFromValue(formik.values?.organization) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('organization', '')
                      getMultiTypeFromValue(formik.values?.space) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('space', '')
                    }
                  }}
                />
                {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConnectorConfigureOptions
                    value={formik.values.connectorRef as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Icon name={getIconByType(Connectors.TAS)}></Icon>
                        <Text>{getString('connectors.title.tas')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="connectorRef"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={
                      /* istanbul ignore next */ value => {
                        formik.setFieldValue('connectorRef', value)
                      }
                    }
                    isReadonly={readonly}
                    className={css.marginTop}
                    connectorReferenceFieldProps={{
                      accountIdentifier: accountId,
                      projectIdentifier,
                      orgIdentifier,
                      type: Connectors.TAS,
                      label: getString('connectors.title.tas'),
                      disabled: readonly,
                      gitScope: { repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }
                    }}
                  />
                )}
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  name="organization"
                  className={css.inputWidth}
                  selectItems={organizations}
                  disabled={readonly}
                  placeholder={
                    loadingOrganizations
                      ? /* istanbul ignore next */ getString('loading')
                      : getString('cd.steps.tasInfra.organizationPlaceholder')
                  }
                  multiTypeInputProps={{
                    onChange: /* istanbul ignore next */ () => {
                      getMultiTypeFromValue(formik.values?.space) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('space', '')
                    },
                    expressions,
                    disabled: readonly,
                    onFocus: /* istanbul ignore next */ () => {
                      const connectorValue = getValue(formik.values?.connectorRef)
                      if (getMultiTypeFromValue(formik.values?.organization) === MultiTypeInputType.FIXED) {
                        refetchOrganizations({
                          queryParams: {
                            accountIdentifier: accountId,
                            projectIdentifier,
                            orgIdentifier,
                            connectorRef: connectorValue
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
                            ? getString('loading')
                            : get(organizationsError, errorMessage, null) ||
                              getString('cd.steps.tasInfra.organizationError')}
                        </Text>
                      )
                    },
                    allowableTypes
                  }}
                  label={getString(organizationLabel)}
                />
                {getMultiTypeFromValue(getValue(formik.values.organization)) === MultiTypeInputType.RUNTIME &&
                  !readonly && (
                    <SelectConfigureOptions
                      value={getValue(formik.values.organization)}
                      type="String"
                      variableName="organization"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        formik.setFieldValue('organization', value)
                      }}
                      isReadonly={readonly}
                      className={css.marginTop}
                      loading={loadingOrganizations}
                      options={organizations}
                    />
                  )}
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  name="space"
                  className={css.inputWidth}
                  selectItems={spaces}
                  disabled={readonly}
                  placeholder={loadingSpaces ? getString('loading') : getString('cd.steps.tasInfra.spacePlaceholder')}
                  multiTypeInputProps={{
                    expressions,
                    disabled: readonly,
                    onFocus: /* istanbul ignore next */ () => {
                      if (getMultiTypeFromValue(formik.values?.space) === MultiTypeInputType.FIXED) {
                        refetchSpaces({
                          queryParams: {
                            accountIdentifier: accountId,
                            projectIdentifier,
                            orgIdentifier,
                            connectorRef: getValue(formik.values?.connectorRef),
                            organization: getValue(formik.values?.organization)
                          }
                        })
                      }
                    },
                    selectProps: {
                      items: spaces,
                      allowCreatingNewItems: true,
                      addClearBtn: !(loadingSpaces || readonly),
                      noResults: (
                        <Text padding={'small'}>
                          {loadingSpaces
                            ? getString('loading')
                            : get(spacesError, errorMessage, null) || getString('cd.steps.tasInfra.spacesError')}
                        </Text>
                      )
                    },
                    allowableTypes
                  }}
                  label={getString(spaceGroupLabel)}
                />
                {getMultiTypeFromValue(getValue(formik.values.space)) === MultiTypeInputType.RUNTIME && !readonly && (
                  <SelectConfigureOptions
                    value={getValue(formik.values.space)}
                    type="String"
                    variableName="space"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={
                      /* istanbul ignore next */ value => {
                        formik.setFieldValue('space', value)
                      }
                    }
                    isReadonly={readonly}
                    className={css.marginTop}
                    loading={loadingSpaces}
                    options={spaces}
                  />
                )}
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }} className={css.lastRow}>
                <FormInput.CheckBox
                  className={css.simultaneousDeployment}
                  tooltipProps={{
                    dataTooltipId: 'tasAllowSimultaneousDeployments'
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

export const TASInfrastructureSpecEditable = React.memo(TASInfrastructureSpecEditableNew)
