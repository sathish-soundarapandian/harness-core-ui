/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { map, get, isEmpty, split, includes } from 'lodash-es'
import {
  FormInput,
  Layout,
  MultiSelectOption,
  useToaster,
  AllowedTypes,
  SelectOption,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useGetAzureSubscriptions,
  useGetAzureResourceGroupsBySubscription,
  useGetLocationsBySubscription,
  useGetManagementGroups
} from 'services/cd-ng'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { ResourceGroup, Subscription, ManagementGroup, Tenant, ScopeTypes, ScopeTypeLabels } from './AzureArm.types'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './AzureArm.module.scss'

const isFixed = (value: string): boolean => getMultiTypeFromValue(value) === MultiTypeInputType.FIXED
export const GetSubString = (id: string): string => (includes(id, '-') ? split(id, '-', 1)[0] : id.substring(0, 8))
enum Mode {
  Incremental = 'Incremental',
  Complete = 'Complete'
}

interface ScopesProps {
  formik: any
  scope: {
    type: string
    spec: ResourceGroup | Subscription | ManagementGroup | Tenant
  }
  readonly: boolean
  expressions: string[]
  allowableTypes: AllowedTypes
  connectorRef?: string
}

export const Scopes = ({ formik, readonly, expressions, allowableTypes, connectorRef }: ScopesProps): JSX.Element => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { setFieldValue, values } = formik
  const {
    spec: {
      configuration: { scope }
    }
  } = values
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const selectedScope = scope?.type
    ? { label: getString(ScopeTypeLabels(scope?.type)), value: scope?.type }
    : { label: '', value: '' }
  const [scopeType, setScopeType] = useState<SelectOption>(selectedScope)
  const [locations, setLocations] = useState<MultiSelectOption[]>([])
  const [subscriptions, setSubscriptions] = useState<MultiSelectOption[]>([])
  const [mgmtGroups, setMgmtGroups] = useState<MultiSelectOption[]>([])
  const [resourceGroups, setResourceGroups] = useState<MultiSelectOption[]>([])

  const {
    data: subscriptionsData,
    loading: loadingSubscriptions,
    error: subscriptionsError,
    refetch: getSubscriptions
  } = useGetAzureSubscriptions({
    queryParams: {
      connectorRef: connectorRef!,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  useEffect(() => {
    if (
      !isEmpty(connectorRef) &&
      isFixed(connectorRef!) &&
      scopeType?.value !== ScopeTypes.ManagementGroup &&
      scopeType?.value !== ScopeTypes.Tenant
    ) {
      getSubscriptions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorRef, scopeType])

  useEffect(() => {
    if (subscriptionsData) {
      const subs = map(get(subscriptionsData, 'data.subscriptions', []), sub => ({
        label: `${sub.subscriptionName} - ${GetSubString(sub.subscriptionId)}`,
        value: sub.subscriptionId
      }))
      setSubscriptions(subs)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionsData])

  const {
    data: locationData,
    refetch: getAzureLocations,
    loading: locationsLoading,
    error: locationsError
  } = useGetLocationsBySubscription({
    queryParams: {
      connectorRef: connectorRef!,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  useEffect(() => {
    if (
      scopeType?.value !== ScopeTypes.ResourceGroup &&
      !isEmpty(connectorRef) &&
      isFixed(connectorRef!) &&
      isEmpty(locations)
    ) {
      getAzureLocations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, connectorRef])

  useEffect(() => {
    if (locationData && locationData.data?.locations) {
      const locationValues = map(get(locationData, 'data.locations', []), location => ({
        label: location,
        value: location
      }))
      setLocations(locationValues as MultiSelectOption[])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationData])

  const {
    data: resourceGroupData,
    refetch: getResourceGroups,
    loading: loadingResourceGroups,
    error: resourceGroupsError
  } = useGetAzureResourceGroupsBySubscription({
    queryParams: {
      connectorRef: connectorRef!,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    subscriptionId: scope?.spec?.subscription,
    lazy: true
  })

  useEffect(() => {
    if (
      scopeType?.value === ScopeTypes.ResourceGroup &&
      !isEmpty(connectorRef) &&
      isFixed(connectorRef!) &&
      !isEmpty(scope?.spec?.subscription) &&
      isFixed(scope?.spec?.subscription)
    ) {
      getResourceGroups()
    }
  }, [scope?.spec?.subscription, connectorRef])

  useEffect(() => {
    if (!isEmpty(resourceGroupData)) {
      const rgs = map(get(resourceGroupData, 'data.resourceGroups', []), rg => ({
        label: rg.resourceGroup,
        value: rg.resourceGroup
      }))
      setResourceGroups(rgs)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceGroupData])

  const {
    data: managementGroupData,
    refetch: getManagementGroups,
    loading: loadingManagementGroups,
    error: managementGroupsError
  } = useGetManagementGroups({
    queryParams: {
      connectorRef: connectorRef!,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  useEffect(() => {
    if (scopeType?.value === ScopeTypes.ManagementGroup && !isEmpty(connectorRef) && isFixed(connectorRef!)) {
      getManagementGroups()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeType, connectorRef])

  useEffect(() => {
    if (!isEmpty(managementGroupData?.data?.managementGroups)) {
      const groups = map(get(managementGroupData, 'data.managementGroups', []), group => ({
        label: `${group.displayName!} - ${GetSubString(group?.name)}`,
        value: group.name!
      }))
      setMgmtGroups(groups)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managementGroupData])

  useEffect(() => {
    if (subscriptionsError) {
      showError(getRBACErrorMessage(subscriptionsError as any))
    }
    if (resourceGroupsError) {
      showError(getRBACErrorMessage(resourceGroupsError as any))
    }
    if (resourceGroupsError) {
      showError(getRBACErrorMessage(locationsError as any))
    }
    if (managementGroupsError) {
      showError(getRBACErrorMessage(locationsError as any))
    }
    /*  eslint-disable-next-line react-hooks/exhaustive-deps  */
  }, [subscriptionsError, resourceGroupsError, locationsError, managementGroupsError])

  /* istanbul ignore next */
  const onSelectChange = (e: SelectOption): void => {
    const fieldName = 'spec.configuration.scope'
    let scopeData
    setScopeType(e)
    switch (e?.value) {
      case ScopeTypes.ResourceGroup:
        scopeData = {
          type: ScopeTypes.ResourceGroup,
          spec: {
            subscription: '',
            resourceGroup: '',
            mode: ''
          }
        }
        break
      case ScopeTypes.Subscription:
        scopeData = {
          type: ScopeTypes.Subscription,
          spec: {
            subscription: '',
            location: ''
          }
        }
        break
      case ScopeTypes.Tenant:
        scopeData = {
          type: ScopeTypes.Tenant,
          spec: {
            location: ''
          }
        }
        break
      case ScopeTypes.ManagementGroup:
        scopeData = {
          type: ScopeTypes.ManagementGroup,
          spec: {
            managementGroupId: '',
            location: ''
          }
        }
        break
    }
    setFieldValue(fieldName, scopeData)
  }

  const dropDown = (name: string, label: keyof StringsMap, items: SelectOption[], loading: boolean): JSX.Element => (
    <Layout.Vertical>
      <Layout.Horizontal className={cx(stepCss.formGroup, stepCss.lg)}>
        <SelectInputSetView
          className={css.scopeDropdown}
          label={getString(label)}
          name={name}
          disabled={readonly}
          useValue
          multiTypeInputProps={{
            selectProps: {
              allowCreatingNewItems: true,
              items: items
            },
            expressions,
            allowableTypes
          }}
          selectItems={items}
          placeholder={loading ? getString('loading') : getString('select')}
          fieldPath={name}
          template={{}}
        />
        {getMultiTypeFromValue(get(formik?.values, name)) === MultiTypeInputType.RUNTIME && (
          <SelectConfigureOptions
            value={get(formik?.values, name)}
            type="String"
            variableName={name}
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => {
              setFieldValue(name, value)
            }}
            isReadonly={readonly}
            options={items}
            loading={loading}
          />
        )}
      </Layout.Horizontal>
    </Layout.Vertical>
  )

  return (
    <>
      <Layout.Horizontal
        className={cx(stepCss.formGroup, stepCss.lg)}
        flex={{ alignItems: 'flex-start' }}
        style={{ marginBottom: 10 }}
      >
        <FormInput.Select
          className={css.scopeDropdown}
          label="Scope"
          value={scopeType}
          items={[
            { label: getString(ScopeTypeLabels(ScopeTypes.ResourceGroup)), value: ScopeTypes.ResourceGroup },
            { label: getString(ScopeTypeLabels(ScopeTypes.Subscription)), value: ScopeTypes.Subscription },
            { label: getString(ScopeTypeLabels(ScopeTypes.ManagementGroup)), value: ScopeTypes.ManagementGroup },
            { label: getString(ScopeTypeLabels(ScopeTypes.Tenant)), value: ScopeTypes.Tenant }
          ]}
          name="scope"
          onChange={item => scopeType?.value !== item?.value && onSelectChange(item)}
          selectProps={{
            allowCreatingNewItems: false
          }}
        />
      </Layout.Horizontal>
      {scopeType?.value === ScopeTypes.ResourceGroup && (
        <>
          {dropDown(
            'spec.configuration.scope.spec.subscription',
            'common.plans.subscription',
            subscriptions,
            loadingSubscriptions
          )}
          {dropDown(
            'spec.configuration.scope.spec.resourceGroup',
            'common.resourceGroupLabel',
            resourceGroups,
            loadingResourceGroups
          )}
          <div className={cx(stepCss.formGroup, stepCss.lg)}>
            <FormInput.RadioGroup
              disabled={readonly}
              name="spec.configuration.scope.spec.mode"
              radioGroup={{ inline: true }}
              label="Mode"
              items={[
                { label: 'Incremental', value: Mode.Incremental },
                { label: 'Complete', value: Mode.Complete }
              ]}
            />
          </div>
        </>
      )}
      {scopeType?.value === ScopeTypes.Subscription && (
        <>
          {dropDown(
            'spec.configuration.scope.spec.subscription',
            'common.plans.subscription',
            subscriptions,
            loadingSubscriptions
          )}
          {dropDown('spec.configuration.scope.spec.location', 'cd.azureArm.location', locations, locationsLoading)}
        </>
      )}
      {scopeType?.value === ScopeTypes.ManagementGroup && (
        <>
          {dropDown(
            'spec.configuration.scope.spec.managementGroupId',
            'cd.azureArm.managementGroup',
            mgmtGroups,
            loadingManagementGroups
          )}
          {dropDown('spec.configuration.scope.spec.location', 'cd.azureArm.location', locations, locationsLoading)}
        </>
      )}
      {scopeType?.value === ScopeTypes.Tenant &&
        dropDown('spec.configuration.scope.spec.location', 'cd.azureArm.location', locations, locationsLoading)}
    </>
  )
}
