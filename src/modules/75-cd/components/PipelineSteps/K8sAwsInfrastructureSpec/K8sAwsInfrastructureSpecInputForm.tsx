/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { set, defaultTo, isEmpty } from 'lodash-es'
import { useGetEKSClusterNames } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { CommonKuberetesInfraInputForm } from '../Common/CommonKuberetesInfraSpec/CommonKuberetesInfraInputForm'
import type { K8sAwsInfrastructureSpecEditableProps } from './K8sAwsInfrastructureSpec'

export const K8sAwsInfrastructureSpecInputForm: React.FC<K8sAwsInfrastructureSpecEditableProps & { path: string }> = ({
  template,
  initialValues,
  readonly = false,
  path,
  onUpdate,
  allowableTypes,
  allValues,
  stepViewType
}) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { getString } = useStrings()
  const [clusterOptions, setClusterOptions] = useState<SelectOption[]>([])

  const connectorRef = useMemo(
    () => defaultTo(initialValues.connectorRef, allValues?.connectorRef),
    [initialValues.connectorRef, allValues?.connectorRef]
  )

  const environmentRef = useMemo(
    () => defaultTo(initialValues.environmentRef, allValues?.environmentRef),
    [initialValues.environmentRef, allValues?.environmentRef]
  )

  const infrastructureRef = useMemo(
    () => defaultTo(initialValues.infrastructureRef, allValues?.infrastructureRef),
    [initialValues.infrastructureRef, allValues?.infrastructureRef]
  )

  const {
    data: clusterNamesData,
    refetch: refetchClusterNames,
    loading: loadingClusterNames,
    error: clusterError
  } = useGetEKSClusterNames({
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    if (loadingClusterNames) {
      setClusterOptions([{ label: getString('loading'), value: getString('loading') }])
    } else {
      const options = defaultTo(clusterNamesData, {})?.data?.map(name => ({
        label: name,
        value: name
      }))
      setClusterOptions(defaultTo(options, []))
    }
  }, [clusterNamesData, connectorRef, getString, loadingClusterNames])

  const fetchClusterNames = (connectorRefValue: string): void => {
    if (connectorRefValue && getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.FIXED) {
      refetchClusterNames({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          awsConnectorRef: connectorRefValue
        }
      })

      // reset cluster on connectorRefValue change
      if (
        getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME &&
        getMultiTypeFromValue(initialValues?.cluster) !== MultiTypeInputType.RUNTIME
      ) {
        set(initialValues, 'cluster', '')
        onUpdate?.(initialValues)
      }
    } else if (
      getMultiTypeFromValue(connectorRefValue) !== MultiTypeInputType.RUNTIME &&
      ((environmentRef && getMultiTypeFromValue(environmentRef) === MultiTypeInputType.FIXED) ||
        (infrastructureRef && getMultiTypeFromValue(infrastructureRef) === MultiTypeInputType.FIXED))
    ) {
      refetchClusterNames({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          envId: environmentRef,
          infraDefinitionId: infrastructureRef,
          ...(!isEmpty(connectorRefValue) && { awsConnectorRef: connectorRefValue as string })
        }
      })

      // reset cluster on connectorRefValue change
      if (
        getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME &&
        getMultiTypeFromValue(initialValues?.cluster) !== MultiTypeInputType.RUNTIME
      ) {
        set(initialValues, 'cluster', '')
        onUpdate && onUpdate(initialValues)
      }
    } else {
      setClusterOptions([])
    }
  }

  return (
    <CommonKuberetesInfraInputForm
      template={template}
      allowableTypes={allowableTypes}
      clusterError={clusterError}
      clusterLoading={loadingClusterNames}
      clusterOptions={clusterOptions}
      setClusterOptions={setClusterOptions}
      path={path}
      readonly={readonly}
      stepViewType={stepViewType}
      fetchClusters={fetchClusterNames}
      connectorType={'Aws'}
      connectorRef={connectorRef}
    />
  )
}
