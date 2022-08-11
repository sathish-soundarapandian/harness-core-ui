/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useRef, useMemo } from 'react'
import {
  Layout,
  FormInput,
  SelectOption,
  Formik,
  FormikForm,
  MultiTypeInputType,
  getMultiTypeFromValue,
  ExpressionInput,
  Button,
  ButtonSize,
  ButtonVariation,
  Select,
  Text,
  Icon
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { debounce, noop, get, set } from 'lodash-es'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import {
  AzureTagDTO,
  SshWinRmAzureInfrastructure,
  useGetAzureResourceGroupsBySubscription,
  useGetAzureSubscriptions,
  useGetSubscriptionTags
} from 'services/cd-ng'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { Connectors } from '@connectors/constants'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { MultiTypeFieldSelector } from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import {
  ConnectorReferenceDTO,
  FormMultiTypeConnectorField
} from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useStrings } from 'framework/strings'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { Scope } from '@common/interfaces/SecretsInterface'
import {
  AzureInfrastructureSpecEditableProps,
  getValue,
  getValidationSchema,
  subscriptionLabel,
  resourceGroupLabel
} from './SshWinRmAzureInfrastructureInterface'
import css from './SshWinRmAzureInfrastructureSpec.module.scss'

const errorMessage = 'data.message'

interface AzureInfrastructureUI extends Omit<SshWinRmAzureInfrastructure, 'subscriptionId' | 'resourceGroup'> {
  subscriptionId?: any
  resourceGroup?: any
}

interface SelectedTagsType {
  key: string
  value: string
}

export const AzureInfrastructureSpecForm: React.FC<AzureInfrastructureSpecEditableProps> = ({
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
  const { expressions } = useVariablesExpression()

  const [azureTags, setAzureTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([] as SelectedTagsType[])

  const delayedOnUpdate = useRef(debounce(onUpdate || noop, 300)).current
  const { getString } = useStrings()

  const formikRef = useRef<FormikProps<AzureInfrastructureUI> | null>(null)

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
    const subscriptionValues =
      subscriptionsData?.data?.subscriptions?.map(sub => ({ label: sub.subscriptionId, value: sub.subscriptionId })) ||
      []

    setSubscriptions(subscriptionValues)
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
  const {
    data: subscriptionTagsData,
    refetch: refetchSubscriptionTags,
    loading: loadingSubscriptionTags,
    error: subscriptionTagsError
  } = useGetSubscriptionTags({
    queryParams,
    subscriptionId: initialValues?.subscriptionId,
    lazy: true
  })

  React.useEffect(() => {
    setAzureTags(
      get(subscriptionTagsData, 'data.tags', []).map((azureTag: AzureTagDTO) => ({
        label: azureTag.tag,
        value: azureTag.tag
      }))
    )
  }, [subscriptionTagsData])

  React.useEffect(() => {
    const options =
      resourceGroupData?.data?.resourceGroups?.map(rg => ({ label: rg.resourceGroup, value: rg.resourceGroup })) ||
      /* istanbul ignore next */ []
    setResourceGroups(options)
  }, [resourceGroupData])

  const getInitialValues = (): AzureInfrastructureUI => {
    const currentValues: AzureInfrastructureUI = {
      ...initialValues
    }

    /* istanbul ignore else */
    if (initialValues) {
      if (getMultiTypeFromValue(initialValues?.resourceGroup) === MultiTypeInputType.FIXED) {
        currentValues.subscriptionId = { label: initialValues.subscriptionId, value: initialValues.subscriptionId }
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
    if (
      initialValues?.connectorRef &&
      getMultiTypeFromValue(initialValues?.connectorRef) === MultiTypeInputType.FIXED
    ) {
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
      initialValues?.connectorRef &&
      getMultiTypeFromValue(initialValues?.connectorRef) === MultiTypeInputType.FIXED &&
      initialValues.subscriptionId &&
      getMultiTypeFromValue(initialValues?.subscriptionId) === MultiTypeInputType.FIXED
    ) {
      refetchResourceGroups({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef: initialValues?.connectorRef
        },
        pathParams: {
          subscriptionId: initialValues?.subscriptionId
        }
      })
      refetchSubscriptionTags({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef: initialValues?.connectorRef
        },
        pathParams: {
          subscriptionId: initialValues?.subscriptionId
        }
      })
    }
    if (typeof initialValues?.tags === 'object') {
      const tags = Object.entries(initialValues?.tags || {}).map(entry => ({ key: entry[0], value: entry[1] }))
      tags.forEach(tag => {
        formikRef.current?.setFieldValue(`tags:${tag.key}`, tag.value)
      })
      setSelectedTags(tags)
    }
    return () =>
      unSubscribeForm({
        tab: DeployTabs.INFRASTRUCTURE,
        form: formikRef as React.MutableRefObject<FormikProps<unknown> | null>
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isSvcEnvEnabled = useFeatureFlag(FeatureFlag.NG_SVC_ENV_REDESIGN)

  const usedTagKeys = useMemo(
    () =>
      selectedTags.reduce((map, tag) => {
        tag.key && set(map, tag.key, true)
        return map
      }, {}),
    [selectedTags]
  )
  const availableTags = useMemo(
    () => azureTags.filter(tag => !get(usedTagKeys, get(tag, 'value', ''), false)),
    [azureTags, usedTagKeys]
  )

  return (
    <Layout.Vertical spacing="medium">
      <Formik<AzureInfrastructureUI>
        formName="sshWinRmAzureInfra"
        initialValues={getInitialValues()}
        validate={value => {
          const tags =
            getMultiTypeFromValue(value.tags) === MultiTypeInputType.FIXED
              ? selectedTags.reduce((map: object, tag: SelectedTagsType) => {
                  set(map, tag.key, tag.value)
                  return map
                }, {})
              : value.tags
          const data: Partial<SshWinRmAzureInfrastructure> = {
            credentialsRef: value.credentialsRef,
            connectorRef: undefined,
            subscriptionId:
              getValue(value.subscriptionId) === ''
                ? /* istanbul ignore next */ undefined
                : getValue(value.subscriptionId),
            resourceGroup:
              getValue(value.resourceGroup) === ''
                ? /* istanbul ignore next */ undefined
                : getValue(value.resourceGroup),
            tags,
            usePublicDns: value.usePublicDns,
            allowSimultaneousDeployments: value.allowSimultaneousDeployments
          }
          if (value.connectorRef) {
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
              <Layout.Vertical flex={{ alignItems: 'flex-start' }} margin={{ bottom: 'medium' }} spacing="medium">
                <Text font={{ variation: FontVariation.H6 }}>{isSvcEnvEnabled ? 'Cluster Details' : ''}</Text>
              </Layout.Vertical>
              <Layout.Vertical spacing="medium">
                <Layout.Vertical className={css.inputWidth}>
                  <MultiTypeSecretInput
                    name="credentialsRef"
                    type="SSHKey"
                    label={getString('cd.steps.common.specifyCredentials')}
                    onSuccess={secret => {
                      if (secret) {
                        formikRef.current?.setFieldValue('credentialsRef', secret.referenceString)
                      }
                    }}
                  />
                </Layout.Vertical>
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
                    width={400}
                    connectorLabelClass={css.connectorRef}
                    enableConfigureOptions={false}
                    style={{ marginBottom: 'var(--spacing-large)' }}
                    type={Connectors.AZURE}
                    gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                    onChange={
                      /* istanbul ignore next */ (selected, _typeValue, type) => {
                        const item = selected as unknown as { record?: ConnectorReferenceDTO; scope: Scope }
                        if (type === MultiTypeInputType.FIXED) {
                          const connectorRef =
                            item.scope === Scope.ORG || item.scope === Scope.ACCOUNT
                              ? `${item.scope}.${item?.record?.identifier}`
                              : item.record?.identifier

                          formik.setFieldValue('connectorRef', connectorRef)
                        }
                        getMultiTypeFromValue(formik.values?.subscriptionId) !== MultiTypeInputType.RUNTIME &&
                          formik.setFieldValue('subscriptionId', '')
                        getMultiTypeFromValue(formik.values?.resourceGroup) !== MultiTypeInputType.RUNTIME &&
                          formik.setFieldValue('resourceGroup', '')
                        getMultiTypeFromValue(formik.values?.tags) !== MultiTypeInputType.RUNTIME &&
                          formik.setFieldValue('tags', [])
                        setSubscriptions([])
                        setResourceGroups([])
                        setAzureTags([])
                        setSelectedTags([] as SelectedTagsType[])
                      }
                    }
                  />
                  {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
                    <ConfigureOptions
                      value={formik.values?.connectorRef as string}
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
                    disabled={readonly}
                    placeholder={
                      loadingSubscriptions
                        ? /* istanbul ignore next */ getString('loading')
                        : getString('cd.steps.azureInfraStep.subscriptionPlaceholder')
                    }
                    multiTypeInputProps={{
                      onChange: /* istanbul ignore next */ () => {
                        getMultiTypeFromValue(formik.values?.resourceGroup) !== MultiTypeInputType.RUNTIME &&
                          formik.setFieldValue('resourceGroup', '')
                        getMultiTypeFromValue(formik.values?.tags) !== MultiTypeInputType.RUNTIME &&
                          formik.setFieldValue('tags', [])

                        setResourceGroups([])
                        setAzureTags([])
                        setSelectedTags([] as SelectedTagsType[])
                      },
                      expressions,
                      disabled: readonly,
                      onFocus: /* istanbul ignore next */ () => {
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
                  {getMultiTypeFromValue(getValue(formik.values?.subscriptionId)) === MultiTypeInputType.RUNTIME &&
                    !readonly && (
                      <ConfigureOptions
                        value={!loadingSubscriptions && formik.values?.subscriptionId}
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
                    disabled={readonly}
                    placeholder={
                      loadingResourceGroups
                        ? /* istanbul ignore next */ getString('loading')
                        : getString('cd.steps.azureInfraStep.resourceGroupPlaceholder')
                    }
                    multiTypeInputProps={{
                      expressions,
                      disabled: readonly,
                      onFocus: /* istanbul ignore next */ () => {
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
                          refetchSubscriptionTags({
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
                  {getMultiTypeFromValue(getValue(formik.values?.resourceGroup)) === MultiTypeInputType.RUNTIME &&
                    !readonly && (
                      <ConfigureOptions
                        value={!loadingResourceGroups && formik.values?.resourceGroup}
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
                <Layout.Vertical className={`tags-select ${css.inputWidth}`} spacing={'large'}>
                  <MultiTypeFieldSelector
                    name={'tags'}
                    label={'Tags'}
                    defaultValueToReset={['']}
                    skipRenderValueInExpressionLabel
                    allowedTypes={allowableTypes}
                    supportListOfExpressions={true}
                    disableMultiSelectBtn={false}
                    formik={formik}
                    style={{ flexGrow: 1, marginBottom: 0 }}
                    expressionRender={() => (
                      <ExpressionInput
                        name="tags"
                        value={formik.values.tags}
                        onChange={express => formik.setFieldValue('tags', express)}
                        inputProps={{
                          placeholder: '<+expression>'
                        }}
                      />
                    )}
                  >
                    {selectedTags.map((tag, index) => (
                      <Layout.Horizontal spacing="small" key={index}>
                        <Layout.Vertical spacing="small">
                          <Text>{index === 0 ? getString('keyLabel') : null}</Text>
                          <Select
                            name={`tagslabel${index + 1}`}
                            value={{ label: tag.key, value: tag.key }}
                            items={availableTags}
                            className={css.tagsSelect}
                            allowCreatingNewItems={true}
                            noResults={
                              <Text padding={'small'}>
                                {loadingSubscriptionTags
                                  ? getString('loading')
                                  : get(subscriptionTagsError, errorMessage, null) ||
                                    getString('pipeline.ACR.subscriptionError')}
                              </Text>
                            }
                            onChange={option => {
                              const newSelTags = [...selectedTags]
                              newSelTags[index].key = option.value as string
                              setSelectedTags(newSelTags)
                            }}
                          />
                        </Layout.Vertical>
                        <Layout.Vertical spacing="small">
                          <Text>{index === 0 ? 'Value' : null}</Text>
                          <FormInput.Text
                            name={`tags:${tag.key}`}
                            onChange={event => {
                              const newSelTags = [...selectedTags]
                              newSelTags[index].value = get(event.target, 'value', '')
                              setSelectedTags(newSelTags)
                            }}
                          />
                        </Layout.Vertical>
                        <Layout.Horizontal className={css.removeTagBtn}>
                          <Button
                            intent="primary"
                            icon="delete"
                            iconProps={{ size: 12, margin: { right: 8 } }}
                            onClick={() => {
                              const newSelTags = [...selectedTags]
                              newSelTags.splice(index, 1)
                              formik.setFieldValue(`tags:${tag.key}`, undefined)
                              setSelectedTags(newSelTags)
                            }}
                            size={ButtonSize.SMALL}
                            variation={ButtonVariation.LINK}
                          >
                            {getString('common.remove')}
                          </Button>
                        </Layout.Horizontal>
                      </Layout.Horizontal>
                    ))}
                    <Button
                      intent="primary"
                      icon="add"
                      iconProps={{ size: 12, margin: { right: 8 } }}
                      onClick={() => {
                        const newTagPair: SelectedTagsType = { key: '', value: '' }
                        setSelectedTags(selTags => [...selTags, newTagPair])
                      }}
                      size={ButtonSize.SMALL}
                      variation={ButtonVariation.LINK}
                    >
                      {getString('add')}
                    </Button>
                  </MultiTypeFieldSelector>
                </Layout.Vertical>
                <FormInput.CheckBox
                  className={css.simultaneousDeployment}
                  tooltipProps={{
                    dataTooltipId: 'sshWinrmAzureUsePublicDns'
                  }}
                  name={'usePublicDns'}
                  label={getString('cd.infrastructure.sshWinRmAzure.usePublicDns')}
                  disabled={readonly}
                />
              </Layout.Vertical>
              <Layout.Vertical className={css.simultaneousDeployment}>
                <FormInput.CheckBox
                  tooltipProps={{
                    dataTooltipId: 'pdcInfraAllowSimultaneousDeployments'
                  }}
                  name={'allowSimultaneousDeployments'}
                  label={getString('cd.allowSimultaneousDeployments')}
                  disabled={readonly}
                />
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
