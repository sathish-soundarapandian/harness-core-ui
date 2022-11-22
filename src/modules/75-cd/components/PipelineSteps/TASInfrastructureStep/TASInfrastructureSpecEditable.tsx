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
import {
  TanzuApplicationServiceInfrastructure,
  useGetAzureResourceGroupsBySubscription,
  useGetAzureSubscriptions
} from 'services/cd-ng'

import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { Connectors } from '@connectors/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import type { TASInfrastructureUI } from './TASInfrastructureStep'
import {
  TASInfrastructureSpecEditableProps,
  getValue,
  getValidationSchema,
  organizationLabel,
  spaceGroupLabel
} from './TASInfrastructureInterface'
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
  const [subscriptions, setSubscriptions] = React.useState<SelectOption[]>([])
  const [resourceGroups, setResourceGroups] = React.useState<SelectOption[]>([])
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
    data: subscriptionsData,
    loading: loadingSubscriptions,
    refetch: refetchSubscriptions,
    error: subscriptionsError
  } = useGetAzureSubscriptions({
    queryParams,
    lazy: true
  })
  React.useEffect(() => {
    const subscriptionValues = [] as SelectOption[]
    defaultTo(subscriptionsData?.data?.subscriptions, []).map(sub =>
      subscriptionValues.push({ label: `${sub.subscriptionName}: ${sub.subscriptionId}`, value: sub.subscriptionId })
    )

    setSubscriptions(subscriptionValues as SelectOption[])
  }, [subscriptionsData])

  const {
    data: resourceGroupData,
    refetch: refetchResourceGroups,
    loading: loadingResourceGroups,
    error: resourceGroupsError
  } = useGetAzureResourceGroupsBySubscription({
    queryParams,
    subscriptionId: initialValues?.subscriptionId,
    lazy: true
  })

  React.useEffect(() => {
    const options =
      resourceGroupData?.data?.resourceGroups?.map(rg => ({ label: rg.resourceGroup, value: rg.resourceGroup })) ||
      /* istanbul ignore next */ []
    setResourceGroups(options)
  }, [resourceGroupData])

  const getSubscription = (values: TASInfrastructureUI): SelectOption | undefined => {
    const value = values.subscriptionId ? values.subscriptionId : formikRef?.current?.values?.subscriptionId?.value

    if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED) {
      return (
        subscriptions.find(subscription => subscription.value === value) || {
          label: value,
          value: value
        }
      )
    }

    return values?.subscriptionId
  }
  useEffect(() => {
    if (getMultiTypeFromValue(formikRef?.current?.values.subscriptionId) === MultiTypeInputType.FIXED) {
      if (initialValues?.subscriptionId) {
        if (renderCount) {
          formikRef?.current?.setFieldValue('subscriptionId', getSubscription(initialValues))
          subscriptions?.length && setRenderCount(false)
        }
      } else {
        setRenderCount(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptions])
  const getInitialValues = (): TASInfrastructureUI => {
    const currentValues: TASInfrastructureUI = {
      ...initialValues
    }

    /* istanbul ignore else */
    if (initialValues) {
      currentValues.subscriptionId = getSubscription(initialValues)

      if (getMultiTypeFromValue(initialValues?.resourceGroup) === MultiTypeInputType.FIXED) {
        currentValues.resourceGroup = { label: initialValues.resourceGroup, value: initialValues.resourceGroup }
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
      refetchSubscriptions({
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
      initialValues.subscriptionId &&
      getMultiTypeFromValue(initialValues.subscriptionId) === MultiTypeInputType.FIXED
    ) {
      refetchResourceGroups({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef: initialValues.connectorRef
        },
        pathParams: {
          subscriptionId: initialValues.subscriptionId
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
        formName="TASWebAppInfra"
        initialValues={getInitialValues()}
        validate={value => {
          const data: Partial<TanzuApplicationServiceInfrastructure> = {
            connectorRef: undefined,
            organization:
              getValue(value.organization) === '' ? /* istanbul ignore next */ undefined : getValue(value.organization),
            space: getValue(value.space) === '' ? /* istanbul ignore next */ undefined : getValue(value.space)
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
                <FormMultiTypeConnectorField
                  name="connectorRef"
                  label={getString('connector')}
                  placeholder={getString('connectors.selectConnector')}
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
                    showAdvanced={true}
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
                  selectItems={subscriptions}
                  disabled={readonly}
                  placeholder={
                    loadingSubscriptions
                      ? /* istanbul ignore next */ getString('loading')
                      : getString('cd.steps.tasInfra.organizationPlaceholder')
                  }
                  multiTypeInputProps={{
                    onChange: /* istanbul ignore next */ () => {
                      getMultiTypeFromValue(formik.values?.space) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('space', '')

                      setResourceGroups([])
                    },
                    expressions,
                    disabled: readonly,
                    onFocus: /* istanbul ignore next */ () => {
                      const connectorValue = getValue(formik.values?.connectorRef)
                      if (getMultiTypeFromValue(formik.values?.organization) === MultiTypeInputType.FIXED) {
                        refetchSubscriptions({
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
                      items: subscriptions,
                      allowCreatingNewItems: true,
                      addClearBtn: !(loadingSubscriptions || readonly),
                      noResults: (
                        <Text padding={'small'}>
                          {loadingSubscriptions
                            ? getString('loading')
                            : get(subscriptionsError, errorMessage, null) ||
                              getString('pipeline.ACR.subscriptionError')}
                          {/* CHECK ERROR PATH */}
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
                      showAdvanced={true}
                      onChange={
                        /* istanbul ignore next */ value => {
                          formik.setFieldValue('organization', value)
                        }
                      }
                      isReadonly={readonly}
                      className={css.marginTop}
                      loading={loadingSubscriptions}
                      options={subscriptions}
                    />
                  )}
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  name="space"
                  className={css.inputWidth}
                  selectItems={resourceGroups}
                  disabled={readonly}
                  placeholder={
                    loadingResourceGroups
                      ? /* istanbul ignore next */ getString('loading')
                      : getString('cd.steps.tasInfra.spacePlaceholder')
                  }
                  multiTypeInputProps={{
                    expressions,
                    disabled: readonly,
                    onFocus: /* istanbul ignore next */ () => {
                      if (getMultiTypeFromValue(formik.values?.space) === MultiTypeInputType.FIXED) {
                        refetchResourceGroups({
                          queryParams: {
                            accountIdentifier: accountId,
                            projectIdentifier,
                            orgIdentifier,
                            connectorRef: getValue(formik.values?.connectorRef)
                          },
                          pathParams: {
                            organization: getValue(formik.values?.organization)
                          }
                        })
                      }
                    },
                    selectProps: {
                      items: resourceGroups,
                      allowCreatingNewItems: true,
                      addClearBtn: !(loadingResourceGroups || readonly),
                      noResults: (
                        <Text padding={'small'}>
                          {loadingResourceGroups
                            ? getString('loading')
                            : get(resourceGroupsError, errorMessage, null) ||
                              getString('cd.steps.azureInfraStep.resourceGroupError')}
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
                    showAdvanced={true}
                    onChange={
                      /* istanbul ignore next */ value => {
                        formik.setFieldValue('space', value)
                      }
                    }
                    isReadonly={readonly}
                    className={css.marginTop}
                    loading={loadingResourceGroups}
                    options={resourceGroups}
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
