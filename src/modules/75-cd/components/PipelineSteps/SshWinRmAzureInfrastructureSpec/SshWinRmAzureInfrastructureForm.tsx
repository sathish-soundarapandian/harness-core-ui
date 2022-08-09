/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
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
  Text
} from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { debounce, noop, get, set } from 'lodash-es'
import { useToaster } from '@common/exports'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import {
  getAzureResourceGroupsBySubscriptionPromise,
  getAzureSubscriptionsPromise,
  SshWinRmAzureInfrastructure,
  getSubscriptionTagsPromise,
  AzureResourceGroupDTO
} from 'services/cd-ng'
import type { AzureSubscriptionDTO, AzureTagDTO } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { Connectors } from '@connectors/constants'
import { Scope } from '@common/interfaces/SecretsInterface'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { MultiTypeFieldSelector } from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import {
  ConnectorReferenceDTO,
  FormMultiTypeConnectorField
} from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useStrings } from 'framework/strings'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import {
  AzureInfrastructureSpecEditableProps,
  getValue,
  getValidationSchema,
  subscriptionLabel,
  resourceGroupLabel
} from './SshWinRmAzureInfrastructureInterface'
import css from './SshWinRmAzureInfrastructureSpec.module.scss'

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
  const { showError } = useToaster()
  const { expressions } = useVariablesExpression()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const [subscriptions, setSubscriptions] = useState<SelectOption[]>([])
  const [isSubsLoading, setIsSubsLoading] = useState(false)

  const [resourceGroups, setResourceGroups] = useState<SelectOption[]>([])
  const [isResGroupLoading, setIsResGroupLoading] = useState(false)

  const [azureTags, setAzureTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([] as SelectedTagsType[])

  const delayedOnUpdate = useRef(debounce(onUpdate || noop, 300)).current
  const { getString } = useStrings()

  const formikRef = useRef<FormikProps<AzureInfrastructureUI> | null>(null)

  const fetchSubscriptions = async (connectorRef: string) => {
    setIsSubsLoading(true)
    try {
      const response = await getAzureSubscriptionsPromise({
        queryParams: {
          connectorRef: connectorRef,
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        }
      })
      if (response.status === 'SUCCESS') {
        const subs = get(response, 'data.subscriptions', []).map((sub: AzureSubscriptionDTO) => ({
          label: sub.subscriptionName,
          value: sub.subscriptionId
        }))
        setSubscriptions(subs)
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(e.message || e.responseMessage[0])
    } finally {
      setIsSubsLoading(false)
    }
  }

  const fetchSubscriptionTags = async (connectorRef: string, subscriptionId: string) => {
    try {
      const response = await getSubscriptionTagsPromise({
        subscriptionId,
        queryParams: {
          connectorRef,
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        }
      })
      if (response.status === 'SUCCESS') {
        setAzureTags(
          get(response, 'data.tags', []).map((azureTag: AzureTagDTO) => ({ label: azureTag.tag, value: azureTag.tag }))
        )
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(e.message || e.errorMessage)
    }
  }

  const fetchResourceGroups = async (connectorRef: string, subscriptionId: string) => {
    setIsResGroupLoading(true)
    try {
      const response = await getAzureResourceGroupsBySubscriptionPromise({
        queryParams: {
          connectorRef: connectorRef,
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        },
        subscriptionId: subscriptionId
      })
      if (response.status === 'SUCCESS') {
        const resGroups = get(response, 'data.resourceGroups', []).map((rg: AzureResourceGroupDTO) => ({
          label: rg.resourceGroup,
          value: rg.resourceGroup
        }))
        setResourceGroups(resGroups)
      } else {
        /* istanbul ignore next */
        showError(get(response, 'message', response))
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(e.message || e.errorMessage)
    } finally {
      setIsResGroupLoading(false)
    }
  }

  useEffect(() => {
    if (initialValues.connectorRef) {
      const { connectorRef } = initialValues
      const connectorRefValueType = getMultiTypeFromValue(connectorRef)
      if (connectorRefValueType === MultiTypeInputType.FIXED) {
        fetchSubscriptions(connectorRef)
      }
      if (initialValues.subscriptionId) {
        const { subscriptionId } = initialValues
        const subscriptionIdValueType = getMultiTypeFromValue(subscriptionId)
        if (subscriptionIdValueType === MultiTypeInputType.FIXED) {
          fetchResourceGroups(connectorRef, subscriptionId)
          fetchSubscriptionTags(connectorRef, subscriptionId)
        }
      }
    }
    if (initialValues.credentialsRef) {
      const { credentialsRef } = initialValues
      /* istanbul ignore next */
      formikRef.current?.setFieldValue('sshKey', credentialsRef)
    }
    if (typeof initialValues.tags === 'object') {
      const tags = Object.entries(initialValues.tags || {}).map(entry => ({ key: entry[0], value: entry[1] }))
      tags.forEach(tag => {
        formikRef.current?.setFieldValue(`tags:${tag.key}`, tag.value)
      })
      setSelectedTags(tags)
    }
  }, [])

  const getInitialValues = useCallback((): AzureInfrastructureUI => {
    const currentValues: AzureInfrastructureUI = {
      ...initialValues,
      tags: typeof initialValues.tags === 'string' ? initialValues.tags : '',
      sshKey: initialValues.credentialsRef
    }
    return currentValues
  }, [])

  const clearTags = () => {
    /* istanbul ignore next */
    formikRef.current?.setFieldValue('tags', [])
    setAzureTags([])
  }

  const clearResourceGroup = () => {
    /* istanbul ignore next */
    formikRef.current?.setFieldValue('resourceGroup', '')
    setResourceGroups([])
    clearTags()
  }

  const clearSubscriptionId = () => {
    /* istanbul ignore next */
    formikRef.current?.setFieldValue('subscriptionId', '')
    /* istanbul ignore next */
    setSubscriptions([])
    /* istanbul ignore next */
    clearResourceGroup()
  }

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
            connectorRef: typeof value.connectorRef === 'string' ? value.connectorRef : value.connectorRef.value,
            sshKey: value.sshKey,
            credentialsRef: value.credentialsRef || value.sshKey,
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
              <Layout.Vertical spacing="medium">
                <Layout.Vertical className={css.inputWidth}>
                  <MultiTypeSecretInput
                    name="sshKey"
                    type="SSHKey"
                    label={getString('cd.steps.common.specifyCredentials')}
                    onSuccess={secret => {
                      if (secret) {
                        formikRef.current?.setFieldValue('credentialsRef', secret.referenceString)
                      }
                    }}
                  />
                </Layout.Vertical>
                <Layout.Vertical className={css.inputWidth}>
                  <FormMultiTypeConnectorField
                    name="connectorRef"
                    label={getString('connector')}
                    placeholder={getString('connectors.selectConnector')}
                    disabled={readonly}
                    accountIdentifier={accountId}
                    projectIdentifier={projectIdentifier}
                    orgIdentifier={orgIdentifier}
                    type={Connectors.AZURE}
                    selected={formik.values.connectorRef}
                    multiTypeProps={{ allowableTypes, expressions }}
                    onChange={(selected, _typeValue, type) => {
                      if (type === MultiTypeInputType.FIXED) {
                        /* istanbul ignore next */
                        const item = selected as unknown as { record?: ConnectorReferenceDTO; scope: Scope }
                        const connectorValue =
                          item.scope === Scope.ORG || item.scope === Scope.ACCOUNT
                            ? `${item.scope}.${item?.record?.identifier}`
                            : item.record?.identifier
                        formik.setFieldValue('connectorRef', {
                          label: item.record?.identifier || '',
                          value: connectorValue,
                          scope: item.scope,
                          live: get(item.record, 'status.status', '') === 'SUCCESS',
                          connector: item.record?.identifier
                        })
                        fetchSubscriptions(connectorValue as string)
                      }
                      clearSubscriptionId()
                    }}
                    gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                  />
                </Layout.Vertical>
                <MultiTypeSelectField
                  label={getString(subscriptionLabel)}
                  name={'subscriptionId'}
                  className={`subscriptionId-select ${css.inputWidth}`}
                  useValue
                  multiTypeInputProps={{
                    placeholder: isSubsLoading ? getString('loading') : undefined,
                    selectItems: subscriptions,
                    multiTypeInputProps: {
                      value: formik.values.subscriptionId,
                      allowableTypes,
                      onChange: /* istanbul ignore next */ (value, _typeValue, type) => {
                        if (value) {
                          if (type === MultiTypeInputType.FIXED) {
                            clearResourceGroup()
                            const connectorRefIdentifier = getValue(get(formik, 'values.connectorRef', ''))
                            const subsId = getValue(value)
                            fetchResourceGroups(connectorRefIdentifier, subsId)
                            fetchSubscriptionTags(connectorRefIdentifier, subsId)
                          }
                        }
                      }
                    }
                  }}
                />
                <MultiTypeSelectField
                  label={getString(resourceGroupLabel)}
                  name={'resourceGroup'}
                  className={`resourceGroup-select ${css.inputWidth}`}
                  useValue
                  multiTypeInputProps={{
                    placeholder: isResGroupLoading ? getString('loading') : undefined,
                    selectItems: resourceGroups,
                    multiTypeInputProps: {
                      value: formik.values.resourceGroup,
                      allowableTypes
                    }
                  }}
                />
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
