/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Container, Select, Text, SelectOption } from '@harness/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetNamespaces, useGetWorkloads } from 'services/cv'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { K8sNamespaceAndWorkloadProps } from './K8sNamespaceAndWorkload.types'
import { getSelectPlaceholder, getWorkloadNamespaceOptions } from './K8sNamespaceAndWorkload.utils'
import css from './K8sNamespaceAndWorkload.module.scss'

export default function K8sNamespaceAndWorkload(props: K8sNamespaceAndWorkloadProps): JSX.Element {
  const { connectorIdentifier, onChange, dependencyMetaData } = props
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [namespaceValue, setNamespaceValue] = useState<SelectOption | undefined>()
  const [workloadValue, setWorkloadValue] = useState<SelectOption | undefined>()
  const {
    error: namespaceError,
    loading: namespaceLoading,
    data: namespaceList,
    refetch: fetchNamespaces
  } = useGetNamespaces({ lazy: true })
  const {
    error: workloadError,
    loading: workloadLoading,
    data: workloadList,
    refetch: fetchWorkloads
  } = useGetWorkloads({ lazy: true })

  useEffect(() => {
    if (connectorIdentifier) {
      fetchNamespaces({
        queryParams: { orgIdentifier, projectIdentifier, accountId, connectorIdentifier, pageSize: 10000, offset: 0 }
      })
      setNamespaceValue(undefined)
      setWorkloadValue(undefined)
    }
  }, [connectorIdentifier, orgIdentifier, projectIdentifier])

  useEffect(() => {
    if (namespaceValue?.value && connectorIdentifier) {
      fetchWorkloads({
        queryParams: {
          orgIdentifier,
          projectIdentifier,
          accountId,
          connectorIdentifier,
          namespace: namespaceValue.value as string,
          pageSize: 10000,
          offset: 0
        }
      })
    }
  }, [namespaceValue, orgIdentifier, projectIdentifier])

  useEffect(() => {
    const { workload, namespace } = dependencyMetaData?.dependencyMetadata || {}
    if (namespace !== namespaceValue?.value) {
      setNamespaceValue(namespace ? { label: namespace, value: namespace } : undefined)
    }
    if (workload !== workloadValue?.value) {
      setWorkloadValue(workload ? { label: workload, value: workload } : undefined)
    }
  }, [dependencyMetaData])

  const namespaceOptions = useMemo(
    () =>
      getWorkloadNamespaceOptions({
        error: Boolean(namespaceError),
        loading: namespaceLoading,
        list: namespaceList?.data?.content
      }),
    [namespaceError, namespaceLoading, namespaceList]
  )

  const workloadOptions = useMemo(
    () =>
      getWorkloadNamespaceOptions({
        error: Boolean(workloadError),
        loading: workloadLoading,
        list: workloadList?.data?.content
      }),
    [workloadList, workloadLoading, workloadError]
  )

  return (
    <Container className={cx(css.main, connectorIdentifier ? css.expand : null)}>
      <hr />
      <Container className={css.infoContainer}>
        <Container className={css.selectContainer}>
          <Select
            inputProps={{
              placeholder: getSelectPlaceholder({
                error: Boolean(namespaceError),
                loading: namespaceLoading,
                getString,
                options: namespaceOptions,
                isNamespace: true
              }),
              name: 'namespace'
            }}
            value={namespaceValue}
            items={namespaceOptions}
            onChange={val => {
              setNamespaceValue(val)
              setWorkloadValue(undefined)
              onChange(val?.value as string, undefined)
            }}
          />
          <Text intent="danger" lineClamp={1} className={css.errorMsg}>
            {getErrorMessage(namespaceError)}
          </Text>
        </Container>
        <Container className={css.selectContainer}>
          <Select
            disabled={!namespaceValue}
            key={workloadValue?.label}
            inputProps={{
              placeholder: getSelectPlaceholder({
                error: Boolean(workloadError),
                loading: workloadLoading,
                getString,
                options: workloadOptions
              }),
              name: 'workload'
            }}
            items={workloadOptions}
            value={workloadValue}
            onChange={val => {
              setWorkloadValue(val)
              onChange(namespaceValue?.value as string, val?.value as string)
            }}
          />
          <Text intent="danger" lineClamp={1} className={css.errorMsg}>
            {getErrorMessage(workloadError)}
          </Text>
        </Container>
      </Container>
    </Container>
  )
}
