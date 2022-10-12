/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty, map, get } from 'lodash-es'
import type { FormikContextType } from 'formik'
import { Text, Container, SelectOption, Layout, MultiSelectOption, useToaster } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import {
  useGetAzureSubscriptions,
  useGetAzureResourceGroupsBySubscription,
  useGetLocationsBySubscription,
  useGetManagementGroups
} from 'services/cd-ng'
import { isValueRuntimeInput } from '@common/utils/utils'
import { AzureArmProps, isFixed } from '../AzureArm.types'
import { GetSubString } from '../Scopes'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const ScopeInputStep = (
  props: AzureArmProps & {
    formik?: FormikContextType<any>
  }
): JSX.Element => {
  const { inputSetData, readonly, path, allowableTypes, azureRef, formik } = props
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [subscriptions, setSubscriptions] = useState<MultiSelectOption[]>([])
  const [resourceGroups, setResourceGroups] = useState<MultiSelectOption[]>([])
  const [locations, setLocations] = useState<MultiSelectOption[]>([])
  const [mgmtGroups, setMgmtGroups] = useState<MultiSelectOption[]>([])
  const selectedSub = get(formik?.values, `${path}.spec.configuration.scope.spec.subscription`, undefined)
  const needSubs = isValueRuntimeInput(
    get(inputSetData?.template, 'spec.configuration.scope.spec.subscription') as string
  )
  const needResourceGroup = isValueRuntimeInput(
    get(inputSetData?.template, 'spec.configuration.scope.spec.resourceGroup') as string
  )
  const needsLocation = isValueRuntimeInput(
    get(inputSetData?.template, 'spec.configuration.scope.spec.location') as string
  )
  const needsMgmtGroupId = isValueRuntimeInput(
    get(inputSetData?.template, 'spec.configuration.scope.spec.managementGroupId') as string
  )

  const {
    data: subscriptionsData,
    loading: loadingSubscriptions,
    error: subscriptionsError,
    refetch: getSubscriptions
  } = useGetAzureSubscriptions({
    queryParams: {
      connectorRef: azureRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  useEffect(() => {
    if (needSubs && !isEmpty(azureRef) && isFixed(azureRef)) {
      getSubscriptions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [azureRef])

  useEffect(() => {
    if (subscriptionsData && isEmpty(subscriptions.length)) {
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
      connectorRef: azureRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  useEffect(() => {
    if (needsLocation && !isEmpty(azureRef) && isFixed(azureRef)) {
      getAzureLocations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [azureRef])

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
      connectorRef: azureRef!,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    subscriptionId: selectedSub,
    lazy: true
  })

  useEffect(() => {
    if (needResourceGroup && !isEmpty(azureRef) && !isEmpty(selectedSub)) {
      getResourceGroups()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSub, azureRef, needResourceGroup])

  useEffect(() => {
    if (resourceGroupData && isEmpty(resourceGroups)) {
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
      connectorRef: azureRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  useEffect(() => {
    if (needsMgmtGroupId && !isEmpty(azureRef) && isFixed(azureRef)) {
      getManagementGroups()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [azureRef, needsMgmtGroupId])

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
    if (locationsError) {
      showError(getRBACErrorMessage(locationsError as any))
    }
    if (managementGroupsError) {
      showError(getRBACErrorMessage(managementGroupsError as any))
    }
    /*  eslint-disable-next-line react-hooks/exhaustive-deps  */
  }, [subscriptionsError, resourceGroupsError, locationsError, managementGroupsError])

  const dropDown = (name: string, label: keyof StringsMap, items: SelectOption[], loading: boolean): JSX.Element => (
    <Layout.Vertical>
      <Layout.Horizontal className={stepCss.formGroup}>
        <SelectInputSetView
          label={getString(label)}
          name={`${path}.${name}`}
          disabled={readonly}
          useValue
          multiTypeInputProps={{
            selectProps: {
              allowCreatingNewItems: true,
              items: items
            },
            expressions,
            allowableTypes,
            width: 300
          }}
          selectItems={items}
          placeholder={loading ? getString('loading') : getString('select')}
          fieldPath={name}
          template={{}}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )

  return (
    <>
      <Container flex width={120} padding={{ bottom: 'small' }}>
        <Text font={{ weight: 'bold' }}>{getString('common.scope')}</Text>
      </Container>

      {needSubs &&
        dropDown(
          'spec.configuration.scope.spec.subscription',
          'common.plans.subscription',
          subscriptions,
          loadingSubscriptions
        )}

      {needResourceGroup &&
        dropDown(
          'spec.configuration.scope.spec.resourceGroup',
          'common.resourceGroupLabel',
          resourceGroups,
          loadingResourceGroups
        )}

      {needsLocation &&
        isValueRuntimeInput(get(inputSetData?.template, 'spec.configuration.scope.spec.location') as string) &&
        dropDown('spec.configuration.scope.spec.location', 'cd.azureArm.location', locations, locationsLoading)}

      {needsMgmtGroupId &&
        isValueRuntimeInput(get(inputSetData?.template, 'spec.configuration.scope.spec.managementGroupId') as string) &&
        dropDown(
          'spec.configuration.scope.spec.managementGroupId',
          'cd.azureArm.managementGroup',
          mgmtGroups,
          loadingManagementGroups
        )}
    </>
  )
}
