/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Text,
  Layout,
  FormInput,
  SelectOption,
  Formik,
  FormikForm,
  IconName,
  Icon,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@wings-software/uicore'
import type { FormikProps, FormikErrors } from 'formik'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { debounce, noop, get, defaultTo, set, isEmpty } from 'lodash-es'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import {
  AzureSubscriptionDTO,
  getAzureClustersPromise,
  getAzureResourceGroupsBySubscriptionPromise,
  getAzureSubscriptionsPromise,
  getConnectorListV2Promise,
  K8sAzureWebAppInfrastructure,
  useGetAzureResourceGroupsBySubscription,
  useGetAzureSubscriptions,
  useGetAzureWebAppNames
} from 'services/cd-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { Connectors } from '@connectors/constants'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { getConnectorName, getConnectorValue } from '@pipeline/components/PipelineSteps/Steps/StepsHelper'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import {
  ConnectorReferenceDTO,
  FormMultiTypeConnectorField
} from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { Scope } from '@common/interfaces/SecretsInterface'
import {
  AzureWebAppInfrastructureSpecEditableProps,
  AzureWebAppInfrastructureTemplate,
  getValue,
  getValidationSchema,
  subscriptionLabel,
  resourceGroupLabel
} from './AzureWebAppInfrastructureInterface'
import css from './AzureWebAppInfrastructureSpec.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const logger = loggerFor(ModuleName.CD)

const yamlErrorMessage = 'cd.parsingYamlError'

const errorMessage = 'data.message'

interface AzureWebAppInfrastructureUI
  extends Omit<K8sAzureWebAppInfrastructure, 'subscriptionId' | 'webApp' | 'resourceGroup' | 'deploymentSlot'> {
  subscriptionId?: any
  webApp?: any
  deploymentSlot?: any
  resourceGroup?: any
}

const AzureWebAppInfrastructureSpecInputForm: React.FC<AzureWebAppInfrastructureSpecEditableProps & { path: string }> =
  ({ template, initialValues, readonly = false, path, onUpdate, allowableTypes, allValues }) => {
    const { accountId, projectIdentifier, orgIdentifier } = useParams<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    }>()
    const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
    const [subscriptions, setSubscriptions] = useState<SelectOption[]>([])
    const [resourceGroups, setResourceGroups] = useState<SelectOption[]>([])
    //   const [clusters, setClusters] = useState<SelectOption[]>([])
    const [webApps, setWebApps] = useState<SelectOption[]>([])
    const [deploymentSlots, setDeploymentSlots] = useState<SelectOption[]>([])
    const [connector, setConnector] = useState<string | undefined>(
      defaultTo(initialValues.connectorRef, allValues?.connectorRef)
    )
    const [subscriptionId, setSubscriptionId] = useState<string | undefined>(
      defaultTo(initialValues.subscriptionId, allValues?.subscriptionId)
    )
    const { expressions } = useVariablesExpression()

    const { getString } = useStrings()

    React.useEffect(() => {
      setSubscriptions([])
      setResourceGroups([])
      setWebApps([])
      setDeploymentSlots([])
    }, [])

    const {
      data: subscriptionsData,
      loading: loadingSubscriptions,
      refetch: refetchSubscriptions,
      error: subscriptionsError
    } = useGetAzureSubscriptions({
      queryParams: {
        connectorRef: connector as string,
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      lazy: true,
      debounce: 300
    })

    useEffect(() => {
      setSubscriptions(
        defaultTo(subscriptionsData?.data?.subscriptions, []).reduce(
          (subscriptionValues: SelectOption[], subscription: AzureSubscriptionDTO) => {
            subscriptionValues.push({
              label: `${subscription.subscriptionName}: ${subscription.subscriptionId}`,
              value: subscription.subscriptionId
            })
            return subscriptionValues
          },
          []
        )
      )
    }, [subscriptionsData])

    useEffect(() => {
      if (connector && getMultiTypeFromValue(connector) === MultiTypeInputType.FIXED) {
        refetchSubscriptions({
          queryParams: {
            accountIdentifier: accountId,
            projectIdentifier,
            orgIdentifier,
            connectorRef: connector
          }
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValues.connectorRef, allValues?.connectorRef])

    const {
      data: resourceGroupData,
      refetch: refetchResourceGroups,
      loading: loadingResourceGroups,
      error: resourceGroupsError
    } = useGetAzureResourceGroupsBySubscription({
      queryParams: {
        connectorRef: connector as string,
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      subscriptionId: subscriptionId as string,
      lazy: true,
      debounce: 300
    })

    useEffect(() => {
      const options =
        resourceGroupData?.data?.resourceGroups?.map(rg => ({ label: rg.resourceGroup, value: rg.resourceGroup })) ||
        /* istanbul ignore next */ []
      setResourceGroups(options)
    }, [resourceGroupData])

    useEffect(() => {
      if (
        connector &&
        getMultiTypeFromValue(connector) === MultiTypeInputType.FIXED &&
        subscriptionId &&
        getMultiTypeFromValue(subscriptionId) === MultiTypeInputType.FIXED
      ) {
        refetchResourceGroups({
          queryParams: {
            connectorRef: connector,
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier
          },
          pathParams: {
            subscriptionId: subscriptionId
          }
        })
        /* istanbul ignore else */
        if (
          getMultiTypeFromValue(template?.resourceGroup) === MultiTypeInputType.RUNTIME &&
          getMultiTypeFromValue(initialValues?.resourceGroup) !== MultiTypeInputType.RUNTIME
        ) {
          set(initialValues, 'resourceGroup', '')
          onUpdate?.(initialValues)
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValues.connectorRef, initialValues.subscriptionId, allValues?.connectorRef, allValues?.subscriptionId])

    const {
      data: webAppsData,
      refetch: refetchWebApps,
      loading: loadingWebApps,
      error: webAppsError
    } = useGetAzureWebAppNames({
      queryParams: {
        connectorRef: connector as string,
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      subscriptionId: subscriptionId as string,
      resourceGroup: defaultTo(initialValues.resourceGroup, allValues?.resourceGroup) as string,
      lazy: true,
      debounce: 300
    })

    useEffect(() => {
      const options =
        webAppsData?.data?.webAppNames?.map(name => ({ label: name, value: name })) || /* istanbul ignore next */ []
      setWebApps(options)
    }, [webAppsData])

    useEffect(() => {
      const resourceGroup = defaultTo(initialValues.resourceGroup, allValues?.resourceGroup)

      /* istanbul ignore else */
      if (
        connector &&
        getMultiTypeFromValue(connector) === MultiTypeInputType.FIXED &&
        subscriptionId &&
        getMultiTypeFromValue(subscriptionId) === MultiTypeInputType.FIXED &&
        resourceGroup &&
        getMultiTypeFromValue(resourceGroup) === MultiTypeInputType.FIXED
      ) {
        refetchWebApps({
          queryParams: {
            accountIdentifier: accountId,
            projectIdentifier,
            orgIdentifier,
            connectorRef: connector
          },
          pathParams: {
            subscriptionId,
            resourceGroup
          }
        })

        /* istanbul ignore else */
        if (
          getMultiTypeFromValue(template?.webApp) === MultiTypeInputType.RUNTIME &&
          getMultiTypeFromValue(initialValues?.webApp) !== MultiTypeInputType.RUNTIME
        ) {
          set(initialValues, 'webApp', '')
          onUpdate?.(initialValues)
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      initialValues.connectorRef,
      initialValues.subscriptionId,
      allValues?.connectorRef,
      allValues?.subscriptionId,
      initialValues.resourceGroup,
      allValues?.resourceGroup
    ])

    return (
      <Layout.Vertical spacing="small">
        {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
            <FormMultiTypeConnectorField
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              name={`${path}.connectorRef`}
              tooltipProps={{
                dataTooltipId: 'azureInfraConnector'
              }}
              label={getString('connector')}
              enableConfigureOptions={false}
              placeholder={getString('connectors.selectConnector')}
              disabled={readonly}
              multiTypeProps={{ allowableTypes, expressions }}
              type={Connectors.AZURE}
              setRefValue
              onChange={
                /* istanbul ignore next */ (selected, _typeValue, type) => {
                  const item = selected as unknown as { record?: ConnectorReferenceDTO; scope: Scope }
                  if (type === MultiTypeInputType.FIXED) {
                    const connectorRef =
                      item.scope === Scope.ORG || item.scope === Scope.ACCOUNT
                        ? `${item.scope}.${item?.record?.identifier}`
                        : item.record?.identifier
                    setConnector(connectorRef)
                    if (connectorRef) {
                      refetchSubscriptions({
                        queryParams: {
                          accountIdentifier: accountId,
                          projectIdentifier,
                          orgIdentifier,
                          connectorRef
                        }
                      })
                    }
                  } else {
                    setSubscriptions([])
                    setResourceGroups([])
                    setWebApps([])
                  }
                }
              }
              gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
            />
          </div>
        )}
        {getMultiTypeFromValue(template?.subscriptionId) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
            <FormInput.MultiTypeInput
              name={`${path}.subscriptionId`}
              tooltipProps={{
                dataTooltipId: 'azureInfraSubscription'
              }}
              disabled={loadingSubscriptions || readonly}
              placeholder={
                loadingSubscriptions
                  ? /* istanbul ignore next */ getString('loading')
                  : getString('cd.steps.azureInfraStep.subscriptionPlaceholder')
              }
              useValue
              selectItems={subscriptions}
              label={getString(subscriptionLabel)}
              multiTypeInputProps={{
                onChange: /* istanbul ignore next */ (value, _typeValue, type) => {
                  if (value && type === MultiTypeInputType.FIXED) {
                    setSubscriptionId(getValue(value))
                    refetchResourceGroups({
                      queryParams: {
                        accountIdentifier: accountId,
                        projectIdentifier,
                        orgIdentifier,
                        connectorRef: connector as string
                      },
                      pathParams: {
                        subscriptionId: getValue(value)
                      }
                    })
                  } else {
                    setResourceGroups([])
                    setWebApps([])
                  }
                },
                selectProps: {
                  items: subscriptions,
                  allowCreatingNewItems: true,
                  addClearBtn: !(loadingSubscriptions || readonly),
                  noResults: (
                    <Text padding={'small'}>
                      {defaultTo(
                        get(subscriptionsError, errorMessage, subscriptionsError?.message),
                        getString('pipeline.ACR.subscriptionError')
                      )}
                    </Text>
                  )
                },
                expressions,
                allowableTypes
              }}
            />
          </div>
        )}
        {getMultiTypeFromValue(template?.resourceGroup) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
            <FormInput.MultiTypeInput
              name={`${path}.resourceGroup`}
              tooltipProps={{
                dataTooltipId: 'azureInfraResourceGroup'
              }}
              disabled={loadingResourceGroups || readonly}
              placeholder={
                loadingResourceGroups
                  ? /* istanbul ignore next */ getString('loading')
                  : getString('cd.steps.azureInfraStep.resourceGroupPlaceholder')
              }
              useValue
              selectItems={resourceGroups}
              label={getString(resourceGroupLabel)}
              multiTypeInputProps={{
                onChange: /* istanbul ignore next */ (value, _typeValue, type) => {
                  if (value && type === MultiTypeInputType.FIXED) {
                    refetchWebApps({
                      queryParams: {
                        accountIdentifier: accountId,
                        projectIdentifier,
                        orgIdentifier,
                        connectorRef: connector as string
                      },
                      pathParams: {
                        subscriptionId,
                        resourceGroup: getValue(value)
                      }
                    })
                  } else {
                    setWebApps([])
                  }
                },

                selectProps: {
                  items: resourceGroups,
                  allowCreatingNewItems: true,
                  addClearBtn: !(loadingResourceGroups || readonly),
                  noResults: (
                    <Text padding={'small'}>
                      {defaultTo(
                        get(resourceGroupsError, errorMessage, resourceGroupsError?.message),
                        getString('cd.steps.azureInfraStep.resourceGroupError')
                      )}
                    </Text>
                  )
                },
                expressions,
                allowableTypes
              }}
            />
          </div>
        )}
        {getMultiTypeFromValue(template?.webApp) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
            <FormInput.MultiTypeInput
              name={`${path}.webApp`}
              tooltipProps={{
                dataTooltipId: 'azureInfraCluster'
              }}
              disabled={loadingWebApps || readonly}
              placeholder={loadingWebApps ? /* istanbul ignore next */ getString('loading') : 'WebApp Names'}
              useValue
              selectItems={webApps}
              label="Web App "
              multiTypeInputProps={{
                selectProps: {
                  items: webApps,
                  allowCreatingNewItems: true,
                  addClearBtn: !(loadingWebApps || readonly),
                  noResults: (
                    <Text padding={'small'}>
                      {defaultTo(
                        get(webAppsError, errorMessage, webAppsError?.message),
                        getString('cd.steps.azureInfraStep.clusterError')
                      )}
                    </Text>
                  )
                },
                expressions,
                allowableTypes
              }}
            />
          </div>
        )}
      </Layout.Vertical>
    )
  }

const AzureWebAppInfrastructureSpecEditable: React.FC<AzureWebAppInfrastructureSpecEditableProps> = ({
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
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()

  const formikRef = React.useRef<FormikProps<AzureWebAppInfrastructureUI> | null>(null)

  const {
    data: subscriptionsData,
    loading: loadingSubscriptions,
    refetch: refetchSubscriptions,
    error: subscriptionsError
  } = useGetAzureSubscriptions({
    queryParams: {
      connectorRef: initialValues?.connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true,
    debounce: 300
  })

  React.useEffect(() => {
    const subscriptionValues = [] as SelectOption[]
    defaultTo(subscriptionsData?.data?.subscriptions, []).map(sub =>
      subscriptionValues.push({ label: `${sub.subscriptionName}: ${sub.subscriptionId}`, value: sub.subscriptionId })
    )

    setSubscriptions(subscriptionValues as SelectOption[])
  }, [subscriptionsData])

  useEffect(() => {
    formikRef?.current?.setFieldValue('subscriptionId', getSubscription(initialValues))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptions])

  React.useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.connectorRef])

  const {
    data: resourceGroupData,
    refetch: refetchResourceGroups,
    loading: loadingResourceGroups,
    error: resourceGroupsError
  } = useGetAzureResourceGroupsBySubscription({
    queryParams: {
      connectorRef: initialValues?.connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    subscriptionId: initialValues?.subscriptionId,
    lazy: true,
    debounce: 300
  })

  React.useEffect(() => {
    const options =
      resourceGroupData?.data?.resourceGroups?.map(rg => ({ label: rg.resourceGroup, value: rg.resourceGroup })) ||
      /* istanbul ignore next */ []
    setResourceGroups(options)
  }, [resourceGroupData])

  React.useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.connectorRef, initialValues.subscriptionId])

  const {
    data: webAppsData,
    refetch: refetchWebApps,
    loading: loadingWebApps,
    error: webAppsError
  } = useGetAzureWebAppNames({
    queryParams: {
      connectorRef: initialValues?.connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    subscriptionId: initialValues?.subscriptionId,
    resourceGroup: initialValues?.resourceGroup,
    lazy: true,
    debounce: 300
  })

  React.useEffect(() => {
    const options =
      webAppsData?.data?.webAppNames?.map(name => ({ label: name, value: name })) || /* istanbul ignore next */ []
    setWebApps(options)
  }, [webAppsData])

  React.useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.connectorRef, initialValues.subscriptionId, initialValues.resourceGroup])

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
    return () =>
      unSubscribeForm({
        tab: DeployTabs.INFRASTRUCTURE,
        form: formikRef as React.MutableRefObject<FormikProps<unknown> | null>
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Layout.Vertical spacing="medium">
      <Formik<AzureWebAppInfrastructureUI>
        formName="azureWebAppInfra"
        initialValues={getInitialValues()}
        validate={value => {
          const data: Partial<K8sAzureWebAppInfrastructure> = {
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
                  onChange={
                    /* istanbul ignore next */ (value: any, _valueType, type) => {
                      /* istanbul ignore next */
                      if (type === MultiTypeInputType.FIXED && value.record) {
                        const { record, scope } = value as unknown as { record: ConnectorReferenceDTO; scope: Scope }
                        const connectorRef =
                          scope === Scope.ORG || scope === Scope.ACCOUNT
                            ? `${scope}.${record.identifier}`
                            : record.identifier
                        refetchSubscriptions({
                          queryParams: {
                            accountIdentifier: accountId,
                            projectIdentifier,
                            orgIdentifier,
                            connectorRef
                          }
                        })

                        getMultiTypeFromValue(getValue(formik?.values?.subscriptionId)) === MultiTypeInputType.FIXED &&
                          formik.setFieldValue('subscriptionId', '')
                        getMultiTypeFromValue(getValue(formik?.values?.resourceGroup)) === MultiTypeInputType.FIXED &&
                          formik.setFieldValue('resourceGroup', '')
                        getMultiTypeFromValue(getValue(formik?.values?.webApp)) === MultiTypeInputType.FIXED &&
                          formik.setFieldValue('webApp', '')
                      } else {
                        setSubscriptions([])
                        setResourceGroups([])
                        setWebApps([])
                      }
                    }
                  }
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
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
                  disabled={loadingSubscriptions || readonly}
                  placeholder={
                    loadingSubscriptions
                      ? /* istanbul ignore next */ getString('loading')
                      : getString('cd.steps.azureInfraStep.subscriptionPlaceholder')
                  }
                  multiTypeInputProps={{
                    onChange: /* istanbul ignore next */ (value, _typeValue, type) => {
                      if (value && type === MultiTypeInputType.FIXED) {
                        refetchResourceGroups({
                          queryParams: {
                            accountIdentifier: accountId,
                            projectIdentifier,
                            orgIdentifier,
                            connectorRef: getValue(formik.values?.connectorRef)
                          },
                          pathParams: {
                            subscriptionId: getValue(value)
                          }
                        })

                        getMultiTypeFromValue(getValue(formik?.values?.resourceGroup)) === MultiTypeInputType.FIXED &&
                          formik.setFieldValue('resourceGroup', '')
                        getMultiTypeFromValue(getValue(formik?.values?.webApp)) === MultiTypeInputType.FIXED &&
                          formik.setFieldValue('webApp', '')
                      } else {
                        setResourceGroups([])
                        setWebApps([])
                      }
                    },
                    expressions,
                    disabled: readonly,
                    selectProps: {
                      items: subscriptions,
                      allowCreatingNewItems: true,
                      addClearBtn: !(loadingSubscriptions || readonly),
                      noResults: (
                        <Text padding={'small'}>
                          {get(subscriptionsError, errorMessage, null) || getString('pipeline.ACR.subscriptionError')}
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
                  disabled={loadingResourceGroups || readonly}
                  placeholder={
                    loadingResourceGroups
                      ? /* istanbul ignore next */ getString('loading')
                      : getString('cd.steps.azureInfraStep.resourceGroupPlaceholder')
                  }
                  multiTypeInputProps={{
                    onChange: /* istanbul ignore next */ (value, _typeValue, type) => {
                      if (value && type === MultiTypeInputType.FIXED) {
                        refetchWebApps({
                          queryParams: {
                            accountIdentifier: accountId,
                            projectIdentifier,
                            orgIdentifier,
                            connectorRef: getValue(formik.values?.connectorRef)
                          },
                          pathParams: {
                            subscriptionId: getValue(formik.values?.subscriptionId),
                            resourceGroup: getValue(value)
                          }
                        })

                        getMultiTypeFromValue(getValue(formik?.values?.webApp)) === MultiTypeInputType.FIXED &&
                          formik.setFieldValue('webApp', '')
                      } else {
                        setWebApps([])
                      }
                    },
                    expressions,
                    disabled: readonly,
                    selectProps: {
                      items: resourceGroups,
                      allowCreatingNewItems: true,
                      addClearBtn: !(loadingResourceGroups || readonly),
                      noResults: (
                        <Text padding={'small'}>
                          {get(resourceGroupsError, errorMessage, null) ||
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
                  disabled={loadingWebApps || readonly}
                  placeholder={
                    loadingWebApps ? /* istanbul ignore next */ getString('loading') : 'Select or Enter WebApp Name'
                  }
                  multiTypeInputProps={{
                    onChange: value => {
                      /* istanbul ignore next */
                      formik.setFieldValue('webApp', value)
                    },
                    expressions,
                    disabled: readonly,
                    selectProps: {
                      items: webApps,
                      allowCreatingNewItems: true,
                      addClearBtn: !(loadingWebApps || readonly),
                      noResults: (
                        <Text padding={'small'}>
                          {get(webAppsError, errorMessage, null) || getString('cd.steps.azureInfraStep.clusterError')}
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

const AzureWebAppInfrastructureSpecVariablesForm: React.FC<AzureWebAppInfrastructureSpecEditableProps> = ({
  metadataMap,
  variablesData,
  initialValues
}) => {
  const infraVariables = variablesData?.infrastructureDefinition?.spec
  return infraVariables ? (
    /* istanbul ignore next */ <VariablesListTable
      data={infraVariables}
      originalData={initialValues?.infrastructureDefinition?.spec || initialValues}
      metadataMap={metadataMap}
    />
  ) : null
}

interface AzureWebAppInfrastructureSpecStep extends K8sAzureWebAppInfrastructure {
  name?: string
  identifier?: string
}

const AzureWebAppConnectorRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.connectorRef$/
const AzureWebAppSubscriptionRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.subscriptionId$/
const AzureWebAppResourceGroupRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.resourceGroup$/
const AzureWebAppWebAppRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.webApp$/
const AzureWebAppType = 'KubernetesAzureWebApp'

export class AzureWebAppInfrastructureSpec extends PipelineStep<AzureWebAppInfrastructureSpecStep> {
  lastFetched: number
  protected type = StepType.KubernetesAzure
  protected defaultValues: K8sAzureWebAppInfrastructure = {
    connectorRef: '',
    subscriptionId: '',
    webApp: '',
    resourceGroup: ''
  }

  protected stepIcon: IconName = 'microsoft-azure'
  protected stepName = 'Specify your Azure Web App Connector'
  protected stepPaletteVisible = false
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.lastFetched = new Date().getTime()
    this.invocationMap.set(AzureWebAppConnectorRegex, this.getConnectorsListForYaml.bind(this))
    this.invocationMap.set(AzureWebAppSubscriptionRegex, this.getSubscriptionListForYaml.bind(this))
    this.invocationMap.set(AzureWebAppResourceGroupRegex, this.getResourceGroupListForYaml.bind(this))
    this.invocationMap.set(AzureWebAppWebAppRegex, this.getClusterListForYaml.bind(this))

    this._hasStepVariables = true
  }

  protected getConnectorsListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err: any) {
      /* istanbul ignore next */ logger.error(yamlErrorMessage, err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    /* istanbul ignore else */
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (obj?.type === AzureWebAppType) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: [Connectors.AZURE], filterType: 'Connector' }
        }).then(
          response =>
            response?.data?.content?.map(connector => ({
              label: getConnectorName(connector),
              insertText: getConnectorValue(connector),
              kind: CompletionItemKind.Field
            })) || /* istanbul ignore next */ []
        )
      }
    }

    return Promise.resolve([])
  }

  protected getSubscriptionListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err: any) {
      /* istanbul ignore next */ logger.error(yamlErrorMessage, err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    /* istanbul ignore else */
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.subscriptionId', ''))
      if (
        obj?.type === AzureWebAppType &&
        obj?.spec?.connectorRef &&
        getMultiTypeFromValue(obj.spec?.connectorRef) === MultiTypeInputType.FIXED
      ) {
        return getAzureSubscriptionsPromise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            connectorRef: obj.spec?.connectorRef
          }
        }).then(response => {
          const values: CompletionItemInterface[] = []
          defaultTo(response?.data?.subscriptions, []).map(sub =>
            values.push({ label: sub.subscriptionId, insertText: sub.subscriptionId, kind: CompletionItemKind.Field })
          )
          return values
        })
      }
    }

    return Promise.resolve([])
  }

  protected getResourceGroupListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err: any) {
      /* istanbul ignore next */ logger.error(yamlErrorMessage, err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    // /* istanbul ignore else */
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.resourceGroup', ''))
      if (
        obj?.type === AzureWebAppType &&
        obj?.spec?.connectorRef &&
        getMultiTypeFromValue(obj.spec?.connectorRef) === MultiTypeInputType.FIXED &&
        obj?.spec?.subscriptionId &&
        getMultiTypeFromValue(obj.spec?.subscriptionId) === MultiTypeInputType.FIXED
      ) {
        return getAzureResourceGroupsBySubscriptionPromise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            connectorRef: obj.spec?.connectorRef
          },
          subscriptionId: obj.spec?.subscriptionId
        }).then(
          response =>
            response?.data?.resourceGroups?.map(rg => ({
              label: rg.resourceGroup,
              insertText: rg.resourceGroup,
              kind: CompletionItemKind.Field
            })) || /* istanbul ignore next */ []
        )
      }
    }

    return Promise.resolve([])
  }

  protected getClusterListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err: any) {
      /* istanbul ignore next */ logger.error(yamlErrorMessage, err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    // /* istanbul ignore else */
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.cluster', ''))
      if (
        obj?.type === AzureWebAppType &&
        obj?.spec?.connectorRef &&
        getMultiTypeFromValue(obj.spec?.connectorRef) === MultiTypeInputType.FIXED &&
        obj?.spec?.subscriptionId &&
        getMultiTypeFromValue(obj.spec?.subscriptionId) === MultiTypeInputType.FIXED &&
        obj?.spec?.resourceGroup &&
        getMultiTypeFromValue(obj.spec?.resourceGroup) === MultiTypeInputType.FIXED
      ) {
        return getAzureClustersPromise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            connectorRef: obj.spec?.connectorRef
          },
          subscriptionId: obj.spec?.subscriptionId,
          resourceGroup: obj.spec?.resourceGroup
        }).then(
          response =>
            response?.data?.clusters?.map(cl => ({
              label: cl.cluster,
              insertText: cl.cluster,
              kind: CompletionItemKind.Field
            })) || /* istanbul ignore next */ []
        )
      }
    }

    return Promise.resolve([])
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<K8sAzureWebAppInfrastructure>): FormikErrors<K8sAzureWebAppInfrastructure> {
    const errors: Partial<AzureWebAppInfrastructureTemplate> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      isEmpty(data.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.connectorRef = getString?.('common.validation.fieldIsRequired', { name: getString('connector') })
    }
    if (
      isEmpty(data.subscriptionId) &&
      isRequired &&
      getMultiTypeFromValue(template?.subscriptionId) === MultiTypeInputType.RUNTIME
    ) {
      errors.subscriptionId = getString?.('common.validation.fieldIsRequired', { name: getString(subscriptionLabel) })
    }
    if (
      isEmpty(data.resourceGroup) &&
      isRequired &&
      getMultiTypeFromValue(template?.resourceGroup) === MultiTypeInputType.RUNTIME
    ) {
      errors.resourceGroup = getString?.('common.validation.fieldIsRequired', { name: getString(resourceGroupLabel) })
    }
    if (isEmpty(data.webApp) && isRequired && getMultiTypeFromValue(template?.webApp) === MultiTypeInputType.RUNTIME) {
      errors.webApp = getString?.('common.validation.fieldIsRequired', { name: 'Web App' })
    }
    return errors
  }

  renderStep(props: StepProps<K8sAzureWebAppInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, customStepProps, readonly, allowableTypes } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <AzureWebAppInfrastructureSpecInputForm
          {...(customStepProps as AzureWebAppInfrastructureSpecEditableProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          template={inputSetData?.template}
          allValues={inputSetData?.allValues}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <AzureWebAppInfrastructureSpecVariablesForm
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          {...(customStepProps as AzureWebAppInfrastructureSpecEditableProps)}
          initialValues={initialValues}
        />
      )
    }

    return (
      <AzureWebAppInfrastructureSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        stepViewType={stepViewType}
        {...(customStepProps as AzureWebAppInfrastructureSpecEditableProps)}
        initialValues={initialValues}
        allowableTypes={allowableTypes}
      />
    )
  }
}
