/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useState, useRef } from 'react'
import { useToaster } from '@harness/uicore'
import { useGetConnector } from 'services/cd-ng'
import {
  getScopeFromValue,
  getIdentifierFromValue,
  getScopeBasedProjectPathParams
} from '@common/components/EntityReference/EntityReference'
import { useStrings } from 'framework/strings'
import type { Error } from 'services/cv'

const RESOURCE_NOT_FOUND_ERROR_CODE = 'RESOURCE_NOT_FOUND_EXCEPTION' as Error['code']

export const useValidConnector = ({
  connectorRef,
  orgIdentifier,
  projectIdentifier,
  accountId,
  resetConnectorRef
}: {
  connectorRef: string
  orgIdentifier: string
  projectIdentifier: string
  accountId: string
  resetConnectorRef?: () => void
}): { isConnectorEnabled: boolean } => {
  const isConnectorAPICalled = useRef(false)
  const { showError, clear } = useToaster()
  const { getString } = useStrings()
  const [isConnectorEnabled, setIsConnectorEnabled] = useState(true)
  const connectorScope = getScopeFromValue(connectorRef)
  const queryParams = getScopeBasedProjectPathParams({ accountId, orgIdentifier, projectIdentifier }, connectorScope)
  const { error: connectorError, refetch } = useGetConnector({
    identifier: getIdentifierFromValue(connectorRef) as string,
    queryParams,
    lazy: true
  })

  useEffect(() => {
    if (!isConnectorAPICalled.current && connectorRef) {
      refetch()
      isConnectorAPICalled.current = true
    } else {
      if (connectorError && (connectorError?.data as Error)?.code === RESOURCE_NOT_FOUND_ERROR_CODE) {
        setIsConnectorEnabled(false)
        resetConnectorRef?.()
        clear()
        showError(getString('cv.connectorNotFound'), 5000)
      }
    }
  }, [connectorRef, connectorError])

  return { isConnectorEnabled }
}
