import { render } from '@testing-library/react'
import React from 'react'
import { CostCalculator } from '@common/components/CostCalculator/CostCalculator'
import { ReviewPage } from '@common/components/CostCalculator/ReviewAndBuyPlanUpgrades'
import { Editions } from '@common/constants/SubscriptionTypes'
import { PlanType } from '@common/components/CostCalculator/CostCalculatorUtils'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { useRetrieveProductPrices } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'

jest.mock('services/cd-ng')
jest.mock('@common/hooks/useGetUsageAndLimit')
const useGetUsageAndLimitMock = useGetUsageAndLimit as jest.MockedFunction<any>
const useRetrieveProductPricesMock = useRetrieveProductPrices as jest.MockedFunction<any>

useRetrieveProductPricesMock.mockImplementation(() => {
  return {
    data: {
      data: {
        prices: [
          { lookupKey: 'FF_TEAM_DEVELOPERS_MONTHLY', unitAmount: 50 },
          { lookupKey: 'FF_TEAM_DEVELOPERS_YEARLY', unitAmount: 500 },
          { lookupKey: 'FF_ENTERPRISE_DEVELOPERS_MONTHLY', unitAmount: 90 },
          { lookupKey: 'FF_ENTERPRISE_DEVELOPERS_YEARLY', unitAmount: 900 },
          { lookupKey: 'FF_TEAM_MAU_MONTHLY', unitAmount: 50 },
          { lookupKey: 'FF_TEAM_MAU_YEARLY', unitAmount: 500 },
          { lookupKey: 'FF_ENTERPRISE_MAU_MONTHLY', unitAmount: 90 },
          { lookupKey: 'FF_ENTERPRISE_MAU_YEARLY', unitAmount: 900 }
        ]
      }
    }
  }
})
useGetUsageAndLimitMock.mockImplementation(() => {
  return {
    limitData: {
      loadingLimit: false,
      limit: {
        ff: {
          totalClientMAUs: 50000,
          totalFeatureFlagUnits: 20
        }
      }
    },
    usageData: {
      loadingLimit: false,
      usage: {
        ff: {
          activeClientMAUs: { count: 25000 },
          activeFeatureFlagUsers: { count: 10 }
        }
      }
    }
  }
})

describe('Cost Calculator Test', () => {
  test('Check CostCalc', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/settings/subscriptions?moduleCard=cf" pathParams={{ accountId: 'dummy' }}>
        <CostCalculator />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Payment Page', async () => {
    const { container } = render(
      <ReviewPage
        previousEdition={Editions.TEAM}
        newEdition={Editions.ENTERPRISE}
        newPlan={PlanType.YEARLY}
        previousDevelopers={2}
        previousMau={2}
        newDevelopers={3}
        developerCost={400}
        newMau={232}
        mauCost={500}
        supportCost={100}
        total={2233}
        backButtonClick={() => {
          return 1
        }}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
