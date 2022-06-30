/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ResponseSetupStatus, useGetDelegateInstallStatus, useProvisionResourcesForCI } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { Status } from '@common/utils/Constants'
import {
  DELEGATE_INSTALLATION_REFETCH_DELAY,
  MAX_TIMEOUT_DELEGATE_INSTALLATION,
  ProvisioningStatus
} from '@ci/pages/get-started-with-ci/InfraProvisioningWizard/Constants'

interface ProvisionDelegateForHostedBuildsReturns {
  initiateProvisioning: () => void
  delegateProvisioningStatus: ProvisioningStatus
}

export function useProvisionDelegateForHostedBuilds(): ProvisionDelegateForHostedBuildsReturns {
  const [initProvisioning, setInitProvisioning] = useState<boolean>()
  const [startPolling, setStartPolling] = useState<boolean>(false)
  const [delegateProvisioningStatus, setDelegateProvisioningStatus] = useState<ProvisioningStatus>(
    ProvisioningStatus.TO_DO
  )
  const { accountId } = useParams<AccountPathProps>()

  const { refetch: fetchProvisioningStatus, data: provisioningStatus } = useGetDelegateInstallStatus({
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  const { mutate: startProvisioning } = useProvisionResourcesForCI({
    queryParams: {
      accountIdentifier: accountId
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  useEffect(() => {
    const { status, data } = provisioningStatus || {}
    if (status === Status.SUCCESS && data === ProvisioningStatus[ProvisioningStatus.SUCCESS]) {
      setDelegateProvisioningStatus(ProvisioningStatus.SUCCESS)
      setStartPolling(false)
    }
  }, [provisioningStatus])

  useEffect(() => {
    if (startPolling) {
      const timerId = setInterval(fetchProvisioningStatus, DELEGATE_INSTALLATION_REFETCH_DELAY)
      return () => clearInterval(timerId)
    }
  })

  useEffect(() => {
    /* This is to mark delegate provisioning force failed since user doesn't have an option of closing modal if delegate provisioning keeps continuing */
    if (delegateProvisioningStatus === ProvisioningStatus.IN_PROGRESS) {
      const timerId = setInterval(
        () => setDelegateProvisioningStatus(ProvisioningStatus.FAILURE),
        MAX_TIMEOUT_DELEGATE_INSTALLATION
      )
      return () => clearInterval(timerId)
    }
  }, [delegateProvisioningStatus])

  useEffect((): void => {
    if (initProvisioning) {
      setDelegateProvisioningStatus(ProvisioningStatus.IN_PROGRESS)
      startProvisioning()
        .then((startProvisioningResponse: ResponseSetupStatus) => {
          setInitProvisioning(false)
          const { status: startProvisioningStatus, data: startProvisioningData } = startProvisioningResponse
          if (
            startProvisioningStatus === ProvisioningStatus[ProvisioningStatus.SUCCESS] &&
            startProvisioningData === ProvisioningStatus[ProvisioningStatus.SUCCESS]
          ) {
            /* ?. added here for test cases */
            fetchProvisioningStatus?.()
            setStartPolling(true)
          } else {
            setDelegateProvisioningStatus(ProvisioningStatus.FAILURE)
          }
        })
        .catch(() => {
          setInitProvisioning(false)
          setDelegateProvisioningStatus(ProvisioningStatus.FAILURE)
        })
    }
  }, [initProvisioning])

  return { initiateProvisioning: () => setInitProvisioning(true), delegateProvisioningStatus }
}
