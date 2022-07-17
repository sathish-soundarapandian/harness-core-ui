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
  MultiTypeInputType,
  Accordion
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { debounce, noop, get, defaultTo, isEmpty } from 'lodash-es'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import {
  AzureWebAppInfrastructure,
  useGetAzureResourceGroupsBySubscription,
  useGetAzureSubscriptions,
  useGetAzureWebAppNames,
  useGetAzureWebAppDeploymentSlots
} from 'services/cd-ng'

import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { Connectors } from '@connectors/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { AzureWebAppInfrastructureUI } from './AzureWebAppInfrastructureStep'
import {
  AzureWebAppInfrastructureSpecEditableProps,
  getValue,
  getValidationSchema,
  subscriptionLabel,
  resourceGroupLabel,
  AzureFieldTypes
} from './AzureWebAppInfrastructureInterface'
import css from './AzureWebAppInfrastructureSpec.module.scss'

const errorMessage = 'data.message'

const AzureWebAppInfrastructureSpecEditableNew: React.FC<AzureWebAppInfrastructureSpecEditableProps> = ({
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
  const [webApps, setWebApps] = React.useState<SelectOption[]>([])
  const [resourceGroups, setResourceGroups] = React.useState<SelectOption[]>([])
  const [deploymentSlots, setDeploymentSlots] = React.useState<SelectOption[]>([])
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()

  const formikRef = React.useRef<FormikProps<AzureWebAppInfrastructureUI> | null>(null)

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

  const {
    data: webAppsData,
    refetch: refetchWebApps,
    loading: loadingWebApps,
    error: webAppsError
  } = useGetAzureWebAppNames({
    queryParams,
    subscriptionId: initialValues?.subscriptionId,
    resourceGroup: initialValues?.resourceGroup,
    lazy: true
  })

  React.useEffect(() => {
    const options =
      webAppsData?.data?.webAppNames?.map(name => ({ label: name, value: name })) || /* istanbul ignore next */ []
    setWebApps(options)
  }, [webAppsData])

  const {
    data: deploymentSlotsData,
    refetch: refetchDeploymentSlots,
    loading: loadingDeploymentSlots,
    error: deploymentSlotsError
  } = useGetAzureWebAppDeploymentSlots({
    queryParams,
    subscriptionId: initialValues?.subscriptionId,
    resourceGroup: initialValues?.resourceGroup,
    webAppName: initialValues?.webApp,
    lazy: true
  })

  useEffect(() => {
    const options =
      deploymentSlotsData?.data?.deploymentSlots?.map(slot => ({ label: slot.name, value: slot.name })) ||
      /* istanbul ignore next */ []
    setDeploymentSlots(options)
  }, [deploymentSlotsData])

  const getSubscription = (values: AzureWebAppInfrastructureUI): SelectOption | undefined => {
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
      formikRef?.current?.setFieldValue('subscriptionId', getSubscription(initialValues))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptions])
  const getInitialValues = (): AzureWebAppInfrastructureUI => {
    const currentValues: AzureWebAppInfrastructureUI = {
      ...initialValues
    }

    /* istanbul ignore else */
    if (initialValues) {
      currentValues.subscriptionId = getSubscription(initialValues)

      if (getMultiTypeFromValue(initialValues?.webApp) === MultiTypeInputType.FIXED) {
        currentValues.webApp = { label: initialValues.webApp, value: initialValues.webApp }
      }
      if (getMultiTypeFromValue(initialValues?.deploymentSlot) === MultiTypeInputType.FIXED) {
        currentValues.deploymentSlot = { label: initialValues.deploymentSlot, value: initialValues.deploymentSlot }
      }

      if (getMultiTypeFromValue(initialValues?.resourceGroup) === MultiTypeInputType.FIXED) {
        currentValues.resourceGroup = { label: initialValues.resourceGroup, value: initialValues.resourceGroup }
      }
      if (getMultiTypeFromValue(initialValues?.targetSlot) === MultiTypeInputType.FIXED) {
        currentValues.targetSlot = { label: initialValues.targetSlot, value: initialValues.targetSlot }
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
    if (
      initialValues.connectorRef &&
      getMultiTypeFromValue(initialValues.connectorRef) === MultiTypeInputType.FIXED &&
      initialValues.subscriptionId &&
      getMultiTypeFromValue(initialValues.subscriptionId) === MultiTypeInputType.FIXED &&
      initialValues.resourceGroup &&
      getMultiTypeFromValue(initialValues.resourceGroup) === MultiTypeInputType.FIXED
    ) {
      refetchWebApps({
        queryParams: {
          connectorRef: initialValues?.connectorRef,
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        },
        pathParams: {
          subscriptionId: initialValues?.subscriptionId,
          resourceGroup: initialValues?.resourceGroup
        }
      })
    }
    if (
      initialValues.connectorRef &&
      getMultiTypeFromValue(initialValues.connectorRef) === MultiTypeInputType.FIXED &&
      initialValues.subscriptionId &&
      getMultiTypeFromValue(initialValues.subscriptionId) === MultiTypeInputType.FIXED &&
      initialValues.resourceGroup &&
      getMultiTypeFromValue(initialValues.resourceGroup) === MultiTypeInputType.FIXED &&
      initialValues.webApp &&
      getMultiTypeFromValue(initialValues.webApp) === MultiTypeInputType.FIXED
    ) {
      refetchDeploymentSlots({
        queryParams: {
          connectorRef: initialValues?.connectorRef,
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        },
        pathParams: {
          subscriptionId: initialValues?.subscriptionId,
          resourceGroup: initialValues?.resourceGroup,
          webAppName: initialValues?.webApp
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
  const isSubscriptionDisabled = (connectorValue: AzureFieldTypes): boolean => {
    if (getValue(connectorValue)?.length) {
      return false
    }
    return true
  }
  const isResourceGroupDisabled = (subscriptionValue: AzureFieldTypes, connectorValue: AzureFieldTypes): boolean => {
    if (getValue(subscriptionValue)?.length && !isSubscriptionDisabled(connectorValue)) {
      return false
    }
    return true
  }
  const isWebAppDisabled = (
    resourceGroupValue: AzureFieldTypes,
    subscriptionValue: AzureFieldTypes,
    connectorValue: AzureFieldTypes
  ): boolean => {
    if (getValue(resourceGroupValue) && !isResourceGroupDisabled(subscriptionValue, connectorValue)) {
      return false
    }
    return true
  }
  const isDeploymentSlotDisabled = (
    webAppValue: AzureFieldTypes,
    resourceGroupValue: AzureFieldTypes,
    subscriptionValue: AzureFieldTypes,
    connectorValue: AzureFieldTypes
  ): boolean => {
    if (getValue(webAppValue) && !isWebAppDisabled(resourceGroupValue, subscriptionValue, connectorValue)) {
      return false
    }
    return true
  }

  return (
    <Layout.Vertical spacing="medium">
      <Formik<AzureWebAppInfrastructureUI>
        formName="azureWebAppInfra"
        initialValues={getInitialValues()}
        validate={value => {
          const data: Partial<AzureWebAppInfrastructure> = {
            connectorRef: undefined,
            subscriptionId:
              getValue(value.subscriptionId) === ''
                ? /* istanbul ignore next */ undefined
                : getValue(value.subscriptionId),
            resourceGroup:
              getValue(value.resourceGroup) === ''
                ? /* istanbul ignore next */ undefined
                : getValue(value.resourceGroup),
            webApp: getValue(value.webApp) === '' ? /* istanbul ignore next */ undefined : getValue(value.webApp),
            deploymentSlot:
              getValue(value.deploymentSlot) === ''
                ? /* istanbul ignore next */ undefined
                : getValue(value.deploymentSlot),
            targetSlot:
              getValue(value.targetSlot) === '' ? /* istanbul ignore next */ undefined : getValue(value.targetSlot),
            allowSimultaneousDeployments: value.allowSimultaneousDeployments
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
                  type={Connectors.AZURE}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                  onChange={type => {
                    if (type !== MultiTypeInputType.FIXED) {
                      getMultiTypeFromValue(formik.values?.subscriptionId) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('subscriptionId', '')
                      getMultiTypeFromValue(formik.values?.resourceGroup) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('resourceGroup', '')
                      getMultiTypeFromValue(formik.values?.webApp) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('webApp', '')
                      getMultiTypeFromValue(formik.values?.deploymentSlot) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('deploymentSlot', '')
                      getMultiTypeFromValue(formik.values?.targetSlot) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('targetSlot', '')
                    }
                  }}
                />
                {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.connectorRef as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Icon name={getIconByType(Connectors.AZURE)}></Icon>
                        <Text>{getString('common.azureConnector')}</Text>
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
                  />
                )}
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  name="subscriptionId"
                  className={css.inputWidth}
                  selectItems={subscriptions}
                  disabled={isSubscriptionDisabled(formik.values?.connectorRef) || readonly}
                  placeholder={
                    loadingSubscriptions
                      ? /* istanbul ignore next */ getString('loading')
                      : getString('cd.steps.azureInfraStep.subscriptionPlaceholder')
                  }
                  multiTypeInputProps={{
                    onChange: /* istanbul ignore next */ () => {
                      getMultiTypeFromValue(formik.values?.resourceGroup) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('resourceGroup', '')
                      getMultiTypeFromValue(formik.values?.webApp) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('webApp', '')
                      getMultiTypeFromValue(formik.values?.deploymentSlot) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('deploymentSlot', '')
                      getMultiTypeFromValue(formik.values?.targetSlot) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('targetSlot', '')

                      setResourceGroups([])
                      setWebApps([])
                      setDeploymentSlots([])
                    },
                    expressions,
                    disabled: readonly,
                    onFocus: () => {
                      const connectorValue = getValue(formik.values?.connectorRef)
                      if (getMultiTypeFromValue(formik.values?.subscriptionId) === MultiTypeInputType.FIXED) {
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
                        </Text>
                      )
                    },
                    allowableTypes
                  }}
                  label={getString(subscriptionLabel)}
                />
                {getMultiTypeFromValue(getValue(formik.values.subscriptionId)) === MultiTypeInputType.RUNTIME &&
                  !readonly && (
                    <ConfigureOptions
                      value={!loadingSubscriptions && formik.values.subscriptionId}
                      type="String"
                      variableName="subscriptionId"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={
                        /* istanbul ignore next */ value => {
                          formik.setFieldValue('subscriptionId', value)
                        }
                      }
                      isReadonly={readonly}
                      className={css.marginTop}
                    />
                  )}
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  name="resourceGroup"
                  className={css.inputWidth}
                  selectItems={resourceGroups}
                  disabled={
                    isResourceGroupDisabled(formik.values?.subscriptionId, formik.values?.connectorRef) || readonly
                  }
                  placeholder={
                    loadingResourceGroups
                      ? /* istanbul ignore next */ getString('loading')
                      : getString('cd.steps.azureInfraStep.resourceGroupPlaceholder')
                  }
                  multiTypeInputProps={{
                    onChange: /* istanbul ignore next */ () => {
                      getMultiTypeFromValue(formik.values?.webApp) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('webApp', '')
                      getMultiTypeFromValue(formik.values?.deploymentSlot) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('deploymentSlot', '')
                      getMultiTypeFromValue(formik.values?.targetSlot) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('targetSlot', '')

                      setWebApps([])
                      setDeploymentSlots([])
                    },
                    expressions,
                    disabled: readonly,
                    onFocus: () => {
                      if (getMultiTypeFromValue(formik.values?.resourceGroup) === MultiTypeInputType.FIXED) {
                        refetchResourceGroups({
                          queryParams: {
                            accountIdentifier: accountId,
                            projectIdentifier,
                            orgIdentifier,
                            connectorRef: getValue(formik.values?.connectorRef)
                          },
                          pathParams: {
                            subscriptionId: getValue(formik.values?.subscriptionId)
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
                  label={getString(resourceGroupLabel)}
                />
                {getMultiTypeFromValue(getValue(formik.values.resourceGroup)) === MultiTypeInputType.RUNTIME &&
                  !readonly && (
                    <ConfigureOptions
                      value={!loadingResourceGroups && formik.values.resourceGroup}
                      type="String"
                      variableName="resourceGroup"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={
                        /* istanbul ignore next */ value => {
                          formik.setFieldValue('resourceGroup', value)
                        }
                      }
                      isReadonly={readonly}
                      className={css.marginTop}
                    />
                  )}
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  name="webApp"
                  className={css.inputWidth}
                  selectItems={webApps}
                  disabled={
                    isWebAppDisabled(
                      formik.values?.resourceGroup,
                      formik.values?.subscriptionId,
                      formik.values?.connectorRef
                    ) || readonly
                  }
                  placeholder={
                    loadingWebApps
                      ? /* istanbul ignore next */ getString('loading')
                      : getString('cd.steps.azureWebAppInfra.webAppPlaceholder')
                  }
                  multiTypeInputProps={{
                    onChange: /* istanbul ignore next */ () => {
                      getMultiTypeFromValue(formik.values?.deploymentSlot) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('deploymentSlot', '')
                      getMultiTypeFromValue(formik.values?.targetSlot) !== MultiTypeInputType.RUNTIME &&
                        formik.setFieldValue('targetSlot', '')
                      setDeploymentSlots([])
                    },
                    expressions,
                    disabled: readonly,
                    onFocus: () => {
                      if (getMultiTypeFromValue(formik.values?.webApp) === MultiTypeInputType.FIXED) {
                        refetchWebApps({
                          queryParams: {
                            accountIdentifier: accountId,
                            projectIdentifier,
                            orgIdentifier,
                            connectorRef: getValue(formik.values?.connectorRef)
                          },
                          pathParams: {
                            subscriptionId: getValue(formik.values?.subscriptionId),
                            resourceGroup: getValue(formik.values?.resourceGroup)
                          }
                        })
                      }
                    },
                    selectProps: {
                      items: webApps,
                      allowCreatingNewItems: true,
                      addClearBtn: !(loadingWebApps || readonly),
                      noResults: (
                        <Text padding={'small'}>
                          {loadingWebApps
                            ? getString('loading')
                            : get(webAppsError, errorMessage, null) ||
                              getString('cd.steps.azureWebAppInfra.webAppNameError')}
                        </Text>
                      )
                    },
                    allowableTypes
                  }}
                  label="Web App"
                />
                {getMultiTypeFromValue(getValue(formik.values.webApp)) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={!loadingWebApps && formik.values.webApp}
                    type="String"
                    variableName="webApp"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={
                      /* istanbul ignore next */ value => {
                        formik.setFieldValue('webApp', value)
                      }
                    }
                    isReadonly={readonly}
                    className={css.marginTop}
                  />
                )}
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  name="deploymentSlot"
                  className={css.inputWidth}
                  selectItems={deploymentSlots}
                  disabled={
                    isDeploymentSlotDisabled(
                      formik.values?.webApp,
                      formik.values?.resourceGroup,
                      formik.values?.subscriptionId,
                      formik.values?.connectorRef
                    ) || readonly
                  }
                  placeholder={
                    loadingDeploymentSlots
                      ? /* istanbul ignore next */ getString('loading')
                      : getString('cd.steps.azureWebAppInfra.deploymentSlotPlaceHolder')
                  }
                  multiTypeInputProps={{
                    onChange: /* istanbul ignore next */ type => {
                      if (type !== MultiTypeInputType.FIXED) {
                        getMultiTypeFromValue(getValue(formik?.values?.targetSlot)) !== MultiTypeInputType.RUNTIME &&
                          formik.setFieldValue('targetSlot', '')
                      }
                    },
                    expressions,
                    disabled: readonly,
                    onFocus: () => {
                      refetchDeploymentSlots({
                        queryParams: {
                          accountIdentifier: accountId,
                          projectIdentifier,
                          orgIdentifier,
                          connectorRef: getValue(formik.values?.connectorRef)
                        },
                        pathParams: {
                          subscriptionId: getValue(formik.values?.subscriptionId),
                          resourceGroup: getValue(formik.values?.resourceGroup),
                          webAppName: getValue(formik.values?.webApp)
                        }
                      })
                    },
                    selectProps: {
                      items: deploymentSlots,
                      allowCreatingNewItems: true,
                      addClearBtn: !(loadingDeploymentSlots || readonly),
                      noResults: (
                        <Text padding={'small'}>
                          {loadingDeploymentSlots
                            ? getString('loading')
                            : get(deploymentSlotsError, errorMessage, null) ||
                              getString('cd.steps.azureWebAppInfra.deploymentSlotError')}
                        </Text>
                      )
                    },
                    allowableTypes
                  }}
                  label="Deployment Slot"
                />
                {getMultiTypeFromValue(getValue(formik.values.deploymentSlot)) === MultiTypeInputType.RUNTIME &&
                  !readonly && (
                    <ConfigureOptions
                      value={!loadingDeploymentSlots && formik.values.deploymentSlot}
                      type="String"
                      variableName="deploymentSlot"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={
                        /* istanbul ignore next */ value => {
                          formik.setFieldValue('deploymentSlot', value)
                        }
                      }
                      isReadonly={readonly}
                      className={css.marginTop}
                    />
                  )}
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  name="targetSlot"
                  className={css.inputWidth}
                  selectItems={deploymentSlots}
                  disabled={
                    isDeploymentSlotDisabled(
                      formik.values?.webApp,
                      formik.values?.resourceGroup,
                      formik.values?.subscriptionId,
                      formik.values?.connectorRef
                    ) || readonly
                  }
                  placeholder={
                    loadingDeploymentSlots
                      ? /* istanbul ignore next */ getString('loading')
                      : getString('cd.steps.azureWebAppInfra.targetSlotPlaceHolder')
                  }
                  multiTypeInputProps={{
                    expressions,
                    disabled: readonly,
                    selectProps: {
                      items: deploymentSlots,
                      allowCreatingNewItems: true,
                      addClearBtn: !(loadingDeploymentSlots || readonly),
                      noResults: (
                        <Text padding={'small'}>
                          {loadingDeploymentSlots
                            ? getString('loading')
                            : get(deploymentSlotsError, errorMessage, null) ||
                              getString('cd.steps.azureWebAppInfra.targetSlotError')}
                        </Text>
                      )
                    },
                    allowableTypes
                  }}
                  label="Target Slot"
                />
                {getMultiTypeFromValue(getValue(formik.values.targetSlot)) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={!loadingDeploymentSlots && formik.values.targetSlot}
                    type="String"
                    variableName="targetSlot"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={
                      /* istanbul ignore next */ value => {
                        formik.setFieldValue('targetSlot', value)
                      }
                    }
                    isReadonly={readonly}
                    className={css.marginTop}
                  />
                )}
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                <Text font={{ variation: FontVariation.FORM_LABEL }} className={css.infoText}>
                  {getString('cd.steps.azureWebAppInfra.targetSlotInfoText')}
                </Text>
              </Layout.Horizontal>
              <Accordion
                panelClassName={css.accordionPanel}
                detailsClassName={css.accordionDetails}
                activeId={!isEmpty(formik.errors.releaseName) ? /* istanbul ignore next */ 'advanced' : ''}
              >
                <Accordion.Panel
                  id="advanced"
                  addDomId={true}
                  summary={getString('common.advanced')}
                  details={
                    <Layout.Horizontal className={css.formRow} spacing="medium">
                      <FormInput.MultiTextInput
                        name="releaseName"
                        className={css.inputWidth}
                        label={getString('common.releaseName')}
                        placeholder={getString('cd.steps.common.releaseNamePlaceholder')}
                        multiTextInputProps={{ expressions, textProps: { disabled: readonly }, allowableTypes }}
                        disabled={readonly}
                      />
                      {getMultiTypeFromValue(formik.values.releaseName) === MultiTypeInputType.RUNTIME && !readonly && (
                        <ConfigureOptions
                          value={formik.values.releaseName as string}
                          type="String"
                          variableName="releaseName"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            /* istanbul ignore next */
                            formik.setFieldValue('releaseName', value)
                          }}
                          isReadonly={readonly}
                          className={css.marginTop}
                        />
                      )}
                    </Layout.Horizontal>
                  }
                />
              </Accordion>
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }} className={css.lastRow}>
                <FormInput.CheckBox
                  className={css.simultaneousDeployment}
                  tooltipProps={{
                    dataTooltipId: 'azureAllowSimultaneousDeployments'
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

export const AzureWebAppInfrastructureSpecEditable = React.memo(AzureWebAppInfrastructureSpecEditableNew)
