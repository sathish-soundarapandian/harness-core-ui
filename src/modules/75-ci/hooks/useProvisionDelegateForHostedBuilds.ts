/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ResponseSetupStatus, useProvisionResourcesForCI } from 'services/cd-ng'
import { useGetDelegateGroupByIdentifier } from 'services/portal'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  DELEGATE_INSTALLATION_REFETCH_DELAY,
  MAX_TIMEOUT_DELEGATE_INSTALLATION,
  ProvisionedByHarnessDelegateGroupIdentifier,
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

  const {
    data: delegateDetails,
    refetch: fetchDelegateDetails,
    loading: fetchingDelegateDetails
  } = useGetDelegateGroupByIdentifier({
    identifier: ProvisionedByHarnessDelegateGroupIdentifier,
    queryParams: { accountId },
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
    if (!fetchingDelegateDetails && delegateDetails?.resource?.activelyConnected) {
      setDelegateProvisioningStatus(ProvisioningStatus.SUCCESS)
      setStartPolling(false)
    }
  }, [fetchingDelegateDetails, delegateDetails])

  useEffect(() => {
    if (startPolling) {
      const timerId = setInterval(fetchDelegateDetails, DELEGATE_INSTALLATION_REFETCH_DELAY)
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
            fetchDelegateDetails()
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
