/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { Container, PageError } from '@harness/uicore'
import { usePolling } from '@common/hooks/usePolling'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import type { SubscriptionProps } from '@common/constants/SubscriptionTypes'
import { InvoiceDetailDTO, ItemDTO, useRetrieveSubscription } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { getDollarAmount } from '@auth-settings/utils'

interface SubscriptionPollProps {
  subscriptionProps: SubscriptionProps
  setInvoiceData: (value: InvoiceDetailDTO) => void
  setSubscriptionProps: (props: SubscriptionProps) => void
}
const MAX_POLL_COUNT = 10
const getTaxItem = (items: ItemDTO[]): ItemDTO | undefined =>
  items.find((item: ItemDTO) => item.description?.includes('Sales Tax'))
function SubscriptionPoll({
  subscriptionProps,
  setInvoiceData,
  setSubscriptionProps
}: SubscriptionPollProps): JSX.Element {
  const { accountId } = useParams<AccountPathProps>()
  const [pollCount, setPollCount] = useState<number>(0)
  const {
    data,
    error,
    refetch: fetchSubscription
  } = useRetrieveSubscription({
    subscriptionId: defaultTo(subscriptionProps.subscriptionId, '') as string,
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  const fetchSubscriptionData = async (): Promise<void> => {
    fetchSubscription({ pathParams: { subscriptionId: defaultTo(subscriptionProps.subscriptionId, '') as string } })
    setPollCount(pollCount + 1)
  }

  useEffect(() => {
    fetchSubscriptionData().then(() => setPollCount(pollCount + 1))
  }, [])

  useEffect(() => {
    if (data?.data?.clientSecret) {
      setInvoiceData(data.data.latestInvoiceDetail as InvoiceDetailDTO)
      setPollCount(MAX_POLL_COUNT)
      const taxItem = getTaxItem(defaultTo(data.data.latestInvoiceDetail?.items, []))
      taxItem &&
        setSubscriptionProps({
          ...subscriptionProps,
          taxAmount: getDollarAmount(taxItem.amount)
        })
    }
  }, [data])

  usePolling(fetchSubscriptionData, {
    startPolling: pollCount > 0 && pollCount < MAX_POLL_COUNT,
    pollingInterval: 3000
  })
  if (error) {
    return (
      <Container>
        <PageError message={error} />
      </Container>
    )
  }
  return <ContainerSpinner />
}

export default SubscriptionPoll
