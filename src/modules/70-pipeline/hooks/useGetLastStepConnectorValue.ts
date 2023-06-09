/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import { ConnectorResponse, useGetConnector } from 'services/cd-ng'
import { useQueryParams } from '@common/hooks'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'

interface LastStepConnectorValueProps {
  connectorList?: ConnectorResponse[]
  initialConnectorRef: any
  isEditMode: boolean
}

export function useGetLastStepConnectorValue(props: LastStepConnectorValueProps) {
  const { connectorList, initialConnectorRef, isEditMode } = props

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const [selectedConnector, setSelectedConnector] = React.useState<string | ConnectorSelectedValue>(initialConnectorRef)

  useEffect(() => {
    setSelectedConnector(initialConnectorRef)
  }, [initialConnectorRef])

  const selectedConnectorRef = React.useMemo(() => {
    return typeof initialConnectorRef === 'string'
      ? getIdentifierFromValue(initialConnectorRef || '')
      : (selectedConnector as ConnectorSelectedValue)?.connector?.identifier
  }, [initialConnectorRef, selectedConnector])

  const connectorData = React.useMemo(
    () => connectorList?.find(currConnector => currConnector.connector?.identifier === selectedConnectorRef),
    [selectedConnectorRef, connectorList]
  )

  const scopeFromSelected =
    typeof selectedConnector === 'string' && selectedConnector.length > 0
      ? getScopeFromValue(selectedConnector || '')
      : initialConnectorRef?.length > 0
      ? getScopeFromValue(initialConnectorRef || '')
      : (selectedConnector as ConnectorSelectedValue)?.scope

  const {
    data: connectorDataFromAPI,
    loading: fetchingConnector,
    refetch: refetchConnector
  } = useGetConnector({
    identifier: selectedConnectorRef,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: scopeFromSelected === Scope.ORG || scopeFromSelected === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: scopeFromSelected === Scope.PROJECT ? projectIdentifier : undefined,
      ...(!isEmpty(repoIdentifier) && !isEmpty(branch)
        ? {
            repoIdentifier,
            branch,
            getDefaultFromOtherRepo: true
          }
        : {})
    },
    lazy: true
  })

  React.useEffect(() => {
    if (getMultiTypeFromValue(initialConnectorRef) === MultiTypeInputType.FIXED && isEditMode) {
      if (typeof initialConnectorRef === 'string' && initialConnectorRef?.length > 0) {
        refetchConnector()
      }
    }
  }, [initialConnectorRef, isEditMode, refetchConnector])

  React.useEffect(() => {
    if (
      typeof initialConnectorRef === 'string' &&
      getMultiTypeFromValue(initialConnectorRef) === MultiTypeInputType.FIXED
    ) {
      if (connectorData && connectorData?.connector?.name) {
        const scope = getScopeFromValue(defaultTo(initialConnectorRef, ''))
        const value = {
          label: connectorData?.connector?.name,
          value:
            scope === Scope.ORG || scope === Scope.ACCOUNT
              ? `${scope}.${connectorData?.connector?.identifier}`
              : connectorData?.connector?.identifier,
          scope: scope,
          live: connectorData?.status?.status === 'SUCCESS',
          connector: connectorData?.connector
        }
        setSelectedConnector(value)
      }
    }
  }, [connectorData, initialConnectorRef])

  React.useEffect(() => {
    if (
      typeof initialConnectorRef === 'string' &&
      getMultiTypeFromValue(initialConnectorRef) === MultiTypeInputType.FIXED &&
      !fetchingConnector
    ) {
      if (connectorDataFromAPI && connectorDataFromAPI.data?.connector?.name) {
        const scope = getScopeFromValue(defaultTo(initialConnectorRef, ''))
        const value = {
          label: connectorDataFromAPI.data?.connector?.name,
          value:
            scope === Scope.ORG || scope === Scope.ACCOUNT
              ? `${scope}.${connectorDataFromAPI.data?.connector?.identifier}`
              : connectorDataFromAPI.data?.connector?.identifier,
          scope: scope,
          live: connectorDataFromAPI.data?.status?.status === 'SUCCESS',
          connector: connectorDataFromAPI.data?.connector
        }
        setSelectedConnector(value)
      }
    }
  }, [connectorDataFromAPI, initialConnectorRef, fetchingConnector])

  return {
    selectedConnector,
    fetchingConnector
  }
}
