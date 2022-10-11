/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { Editions, TimeType } from '@common/constants/SubscriptionTypes'
import * as useGetUsageAndLimit from '@common/hooks/useGetUsageAndLimit'
import { useSubscribeModal } from '../useSubscriptionModal'

const mockDetailResponse = {
  loading: false,
  refetch: jest.fn(),
  data: {
    correlationId: '2e4bc08d-9ffb-4d6f-8541-f1f82d27af8e',
    data: {
      edition: 'ENTERPRISE',
      licenseType: 'PAID',
      moduleType: 'CD',
      maxExpiryTime: 1766494425000,
      totalWorkload: 100,
      totalServiceInstances: 0
    },
    metaData: null,
    status: 'SUCCESS'
  }
}

const priceData = {
  data: {
    prices: [
      {
        priceId: 'price_1Kr5q6Iqk5P9Eha3D1tSUsgh',
        currency: 'usd',
        unitAmount: 9000,
        lookupKey: 'FF_ENTERPRISE_DEVELOPERS_MONTHLY',
        productId: 'prod_LYCEWCG8ktzYDz',
        metaData: {},
        active: true
      },
      {
        priceId: 'price_1Kr5q6Iqk5P9Eha3OAjIxtMT',
        currency: 'usd',
        unitAmount: 90000,
        lookupKey: 'FF_ENTERPRISE_DEVELOPERS_YEARLY',
        productId: 'prod_LYCEWCG8ktzYDz',
        metaData: {},
        active: true
      },
      {
        priceId: 'price_1Kr5rwIqk5P9Eha30PlTPbCz',
        currency: 'usd',
        unitAmount: 12000,
        lookupKey: 'FF_ENTERPRISE_MAU_MONTHLY',
        productId: 'prod_LYCGtHkNPO18pl',
        metaData: {},
        active: true
      },
      {
        priceId: 'price_1Kr5rwIqk5P9Eha3hhy0qeVW',
        currency: 'usd',
        unitAmount: 120000,
        lookupKey: 'FF_ENTERPRISE_MAU_YEARLY',
        productId: 'prod_LYCGtHkNPO18pl',
        metaData: {},
        active: true
      },
      {
        priceId: 'price_1Kr5mdIqk5P9Eha3fn1qSEmg',
        currency: 'usd',
        unitAmount: 5000,
        lookupKey: 'FF_TEAM_DEVELOPERS_MONTHLY',
        productId: 'prod_LYCAVe32XXzVlt',
        metaData: {
          type: 'DEVELOPERS'
        },
        active: true
      },
      {
        priceId: 'price_1Kr5mdIqk5P9Eha30wsoBxtZ',
        currency: 'usd',
        unitAmount: 50000,
        lookupKey: 'FF_TEAM_DEVELOPERS_YEARLY',
        productId: 'prod_LYCAVe32XXzVlt',
        metaData: {
          type: 'DEVELOPERS'
        },
        active: true
      },
      {
        priceId: 'price_1Kr5rQIqk5P9Eha3IB74lUSX',
        currency: 'usd',
        unitAmount: 9000,
        lookupKey: 'FF_TEAM_MAU_MONTHLY',
        productId: 'prod_LYCFgTjtkejp0K',
        metaData: {
          type: 'MAUS'
        },
        active: true
      },
      {
        priceId: 'price_1Kr5rQIqk5P9Eha3uzYZEPws',
        currency: 'usd',
        unitAmount: 90000,
        lookupKey: 'FF_TEAM_MAU_YEARLY',
        productId: 'prod_LYCFgTjtkejp0K',
        metaData: {
          type: 'MAUS'
        },
        active: true
      }
    ]
  }
}
const mockDetailResponseProductPrices = {
  refetch: jest.fn(),
  data: priceData,
  loading: false
}

const mockDetailResponseRecommendation = {
  refetch: jest.fn(),
  data: null,
  loading: false
}
const subscriptionData = {
  clientSecret: 'pi_3L9E7qIqk5P9Eha30B1Vpt0Z_secret_qXFya58HXLP0e3rIQEVzK3iyd'
}
const mutate = jest.fn(() => Promise.resolve({ data: subscriptionData }))
jest.mock('services/cd-ng/index', () => ({
  useRetrieveProductPrices: jest.fn(() => mockDetailResponseProductPrices),
  useRetrieveRecommendation: jest.fn(() => mockDetailResponseRecommendation),
  useGetLicensesAndSummary: jest.fn(() => mockDetailResponse),
  useCreateFfSubscription: jest.fn(() => {
    mutate
  })
}))

const useGetUsageAndLimitReturnMock = {
  limitData: {
    limit: {
      ff: {
        totalFeatureFlagUnits: 250,
        totalClientMAUs: 100000
      }
    }
  },
  usageData: {
    usage: {
      ff: {
        activeFeatureFlagUsers: {
          count: 20
        },
        activeClientMAUs: {
          count: 10000
        }
      }
    }
  }
}

jest.spyOn(useGetUsageAndLimit, 'useGetUsageAndLimit').mockReturnValue(useGetUsageAndLimitReturnMock)

const defaultLicenseStoreValues = {
  licenseInformation: {
    CF: {
      edition: Editions.FREE
    }
  }
}

const TestComponent = (): React.ReactElement => {
  const { openSubscribeModal } = useSubscribeModal({})
  return (
    <>
      <button
        className="open"
        onClick={() => openSubscribeModal({ _plan: Editions.TEAM, _module: 'cf', _time: TimeType.MONTHLY })}
      />
    </>
  )
}

describe('useSubscriptionModal', () => {
  test('render', async () => {
    const { container } = render(
      <TestWrapper defaultLicenseStoreValues={defaultLicenseStoreValues}>
        <TestComponent />
      </TestWrapper>
    )
    userEvent.click(container.querySelector('.open')!)

    const dialog = findDialogContainer() as HTMLElement
    expect(dialog).toMatchSnapshot()
  })
})
