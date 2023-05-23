/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import {
  useGetAccountNG,
  useGetModuleLicensesByAccountAndModuleType,
  useExtendTrialLicense,
  useSaveFeedback,
  getOrganizationListPromise,
  getProjectListPromise,
  getAllServicesPromise,
  useDownloadActiveServiceCSVReport,
  useGetCreditsByAccount
} from 'services/cd-ng'
import { listActiveDevelopersPromise } from 'services/ci'
import { CDLicenseType, Editions } from '@common/constants/SubscriptionTypes'
import { ModuleName } from 'framework/types/ModuleName'
import SubscriptionsPage from '../SubscriptionsPage'
import activeServices from './mocks/activeServices.json'
import projMockData from './mocks/projMockData.json'
import serviceMockData from './mocks/serviceMockData.json'
jest.mock('services/cd-ng')
jest.mock('services/ci')
const getOrganizationListPromiseMock = getOrganizationListPromise as jest.MockedFunction<any>
const useGetCreditsByAccountMock = useGetCreditsByAccount as jest.MockedFunction<any>
const getListActiveDevelopersPromiseMock = listActiveDevelopersPromise as jest.MockedFunction<any>
const getProjectListPromiseMock = getProjectListPromise as jest.MockedFunction<any>
const getServiceListPromiseMock = getAllServicesPromise as jest.MockedFunction<any>
const useGetModuleLicenseInfoMock = useGetModuleLicensesByAccountAndModuleType as jest.MockedFunction<any>
const useDownloadActiveServiceCSVReportMock = useDownloadActiveServiceCSVReport as jest.MockedFunction<any>
const useGetAccountMock = useGetAccountNG as jest.MockedFunction<any>
const useExtendTrialLicenseMock = useExtendTrialLicense as jest.MockedFunction<any>
const orgListPromiseMock = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    data: {
      pageCount: 1,
      itemCount: 3,
      pageSize: 50,
      content: [
        {
          organization: {
            accountIdentifier: 'testAcc',
            identifier: 'testOrg',
            name: 'Org Name',
            description: 'Description',
            tags: { tag1: '', tag2: 'tag3' }
          }
        },
        {
          organization: {
            accountIdentifier: 'testAcc',
            identifier: 'default',
            name: 'default',
            description: 'default',
            tags: { tag1: '', tag2: 'tag3' }
          },
          harnessManaged: true
        }
      ],
      pageIndex: 0,
      empty: false
    }
  })
})
const devListPromiseMock = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    data: ['abc', 'def']
  })
})
jest.mock('highcharts-react-official', () => () => <div />)
const projListPromiseMock = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    projMockData
  })
})
const serviceListPromiseMock = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    serviceMockData
  })
})

useExtendTrialLicenseMock.mockImplementation(() => {
  return {
    mutate: jest.fn()
  }
})
getOrganizationListPromiseMock.mockImplementation(() => {
  return orgListPromiseMock()
})
getListActiveDevelopersPromiseMock.mockImplementation(() => {
  return devListPromiseMock()
})
getProjectListPromiseMock.mockImplementation(() => {
  return projListPromiseMock()
})
getServiceListPromiseMock.mockImplementation(() => {
  return serviceListPromiseMock()
})
useGetCreditsByAccountMock.mockImplementation(() => {
  return {
    creditsData: {
      data: [
        { qunatity: 1000, expiryTime: 1682341973607, purchaseTime: 1682341973200 },
        { qunatity: 2000, expiryTime: 1682341973607, purchaseTime: 1682341972000 }
      ]
    }
  }
})
const useSaveFeedbackMock = useSaveFeedback as jest.MockedFunction<any>
useSaveFeedbackMock.mockImplementation(() => {
  return {
    mutate: jest.fn()
  }
})

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: activeServices, refetch: jest.fn(), error: null, loading: false }
  })
}))
moment.now = jest.fn(() => 1482363367071)

const featureFlags = {
  BUILD_CREDITS_VIEW: true,
  CVNG_ENABLED: true,
  CING_ENABLED: true,
  CENG_ENABLED: true,
  CET_ENABLED: true
}

describe('Subscriptions Page', () => {
  useDownloadActiveServiceCSVReportMock.mockImplementation(() => {
    return {
      data: '',
      refetch: jest.fn()
    }
  })
  jest.useFakeTimers('modern')
  jest.setSystemTime(new Date('2020-01-19'))

  test('it renders the subscriptions page', async () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [
            {
              edition: Editions.ENTERPRISE,
              cdLicenseType: CDLicenseType.SERVICES
            }
          ],
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { container, getByText } = render(
      <TestWrapper
        defaultAppStoreValues={{ featureFlags }}
        defaultLicenseStoreValues={{
          licenseInformation: {
            CD: { edition: 'FREE', status: 'ACTIVE' },
            CHAOS: { edition: 'FREE', status: 'ACTIVE' }
          }
        }}
      >
        <SubscriptionsPage />
      </TestWrapper>
    )
    expect(getByText('common.subscriptions.title')).toBeTruthy()
    expect(getByText('common.subscriptions.expiryCountdown')).toBeTruthy()
    expect(getByText('common.subscriptions.trial')).toBeTruthy()
    expect(container).toMatchSnapshot()
    expect(getByText('common.licensesConsumed')).toBeTruthy()
    userEvent.click(getByText('common.licensesConsumed'))
  })

  test('test for fetching active services by clicking the fetch button using filters', async () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [
            {
              edition: Editions.ENTERPRISE,
              cdLicenseType: CDLicenseType.SERVICES
            }
          ],
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { getByText } = render(
      <TestWrapper
        defaultAppStoreValues={{ featureFlags }}
        defaultLicenseStoreValues={{
          licenseInformation: {
            CD: { edition: 'FREE', status: 'ACTIVE' },
            CHAOS: { edition: 'FREE', status: 'ACTIVE' }
          }
        }}
      >
        <SubscriptionsPage />
      </TestWrapper>
    )
    expect(getByText('common.licensesConsumed')).toBeTruthy()
    userEvent.click(getByText('common.licensesConsumed'))
    const fetchButton = getByText('Update')
    expect(fetchButton).toBeDefined()
    userEvent.click(fetchButton)
  })

  test('it renders the correct card in the subscriptions page', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [
            {
              edition: Editions.ENTERPRISE,
              cdLicenseType: CDLicenseType.SERVICES
            }
          ],
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { container, getByText } = render(
      <TestWrapper
        defaultAppStoreValues={{ featureFlags }}
        pathParams={{ module: ModuleName.CI }}
        defaultLicenseStoreValues={{
          licenseInformation: {
            CD: { edition: 'FREE', status: 'ACTIVE' },
            CHAOS: { edition: 'FREE', status: 'ACTIVE' }
          }
        }}
      >
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(getByText('common.subscriptions.title')).toBeTruthy()
    expect(getByText('common.subscriptions.expiryCountdown')).toBeTruthy()
    expect(getByText('common.subscriptions.trial')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('it renders a page error when the account call fails', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [],
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        error: {
          message: 'hello'
        },
        refetch: jest.fn()
      }
    })

    const { container, queryByText } = render(
      <TestWrapper
        defaultAppStoreValues={{ featureFlags }}
        defaultLicenseStoreValues={{
          licenseInformation: {
            CD: { edition: 'FREE', status: 'ACTIVE' },
            CHAOS: { edition: 'FREE', status: 'ACTIVE' }
          }
        }}
      >
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(queryByText('common.subscriptions.title')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('it renders a page error when the license call fails', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [],
          status: 'SUCCESS'
        },
        error: {
          message: 'hello'
        },
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { container, queryByText } = render(
      <TestWrapper
        defaultAppStoreValues={{ featureFlags }}
        defaultLicenseStoreValues={{
          licenseInformation: {
            CD: { edition: 'FREE', status: 'ACTIVE' },
            CHAOS: { edition: 'FREE', status: 'ACTIVE' }
          }
        }}
      >
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(queryByText('common.subscriptions.title')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('it renders an expired banner when the trial is expired', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [
            {
              edition: Editions.ENTERPRISE,
              cdLicenseType: CDLicenseType.SERVICES,
              expiryTime: 0
            }
          ],
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { container, getByText } = render(
      <TestWrapper
        defaultAppStoreValues={{ featureFlags }}
        defaultLicenseStoreValues={{
          licenseInformation: {
            CD: { edition: 'FREE', status: 'ACTIVE' },
            CHAOS: { edition: 'FREE', status: 'ACTIVE' }
          }
        }}
      >
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(getByText('common.subscriptions.title')).toBeTruthy()
    expect(getByText('common.subscriptions.expired')).toBeTruthy()
    expect(getByText('common.subscriptions.trial')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('it renders trial not started information', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: [
          {
            status: 'SUCCESS'
          }
        ],
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { container, getByText } = render(
      <TestWrapper
        defaultAppStoreValues={{ featureFlags }}
        defaultLicenseStoreValues={{
          licenseInformation: {
            CD: { edition: 'FREE', status: 'ACTIVE' },
            CHAOS: { edition: 'FREE', status: 'ACTIVE' }
          }
        }}
      >
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(getByText('common.subscriptions.title')).toBeTruthy()
    expect(getByText('common.subscriptions.noActiveSubscription')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('it shows the header and a loading spinner while the account call is loading', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [],
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        loading: true,
        refetch: jest.fn()
      }
    })

    const { container, getByText, queryByText } = render(
      <TestWrapper
        defaultAppStoreValues={{ featureFlags }}
        defaultLicenseStoreValues={{
          licenseInformation: {
            CD: { edition: 'FREE', status: 'ACTIVE' },
            CHAOS: { edition: 'FREE', status: 'ACTIVE' }
          }
        }}
      >
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(getByText('common.subscriptions.title')).toBeTruthy()
    expect(queryByText('common.subscriptions.noActiveSubscription')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('it shows the header and a loading spinner while the license call is loading', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [],
          status: 'SUCCESS'
        },
        loading: true,
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { container, getByText, queryByText } = render(
      <TestWrapper
        defaultAppStoreValues={{ featureFlags }}
        defaultLicenseStoreValues={{
          licenseInformation: {
            CD: { edition: 'FREE', status: 'ACTIVE' },
            CHAOS: { edition: 'FREE', status: 'ACTIVE' }
          }
        }}
      >
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(getByText('common.subscriptions.title')).toBeTruthy()
    expect(queryByText('common.subscriptions.noActiveSubscription')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('it routes to the module trial home page when the trial hasn"t been started and the user clicks subscribe', async () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [],
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { container, getByText } = render(
      <TestWrapper
        defaultAppStoreValues={{ featureFlags }}
        defaultLicenseStoreValues={{
          licenseInformation: {
            CD: { edition: 'FREE', status: 'ACTIVE' },
            CHAOS: { edition: 'FREE', status: 'ACTIVE' }
          }
        }}
      >
        <SubscriptionsPage />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('common.subscriptions.overview.subscribe'))
    })

    await waitFor(() => expect(container).toMatchSnapshot())
  })

  test('it should update the license store', async () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [
            {
              edition: Editions.ENTERPRISE,
              cdLicenseType: CDLicenseType.SERVICES
            }
          ],
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const updateLicenseStoreSpy = jest.fn()

    const { container, getByText } = render(
      <TestWrapper
        defaultAppStoreValues={{ featureFlags }}
        defaultLicenseStoreValues={{
          licenseInformation: {
            CD: { edition: 'FREE', status: 'ACTIVE' },
            CHAOS: { edition: 'FREE', status: 'ACTIVE' }
          },
          updateLicenseStore: updateLicenseStoreSpy
        }}
      >
        <SubscriptionsPage />
      </TestWrapper>
    )

    expect(getByText('common.subscriptions.title')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  describe('Subscription Details Card', () => {
    useDownloadActiveServiceCSVReportMock.mockImplementation(() => {
      return {
        data: '',
        refetch: jest.fn()
      }
    })
    test('should render CD details', () => {
      useGetModuleLicenseInfoMock.mockImplementation(() => {
        return {
          data: {
            data: [
              {
                edition: Editions.ENTERPRISE,
                workloads: 100,
                moduleType: 'CD',
                cdLicenseType: CDLicenseType.SERVICES
              }
            ],
            status: 'SUCCESS'
          },
          refetch: jest.fn()
        }
      })

      useGetAccountMock.mockImplementation(() => {
        return {
          data: {
            data: {
              accountId: '123'
            },
            status: 'SUCCESS'
          },
          refetch: jest.fn()
        }
      })

      const { getByText } = render(
        <TestWrapper defaultAppStoreValues={{ featureFlags }} pathParams={{ module: ModuleName.CD }}>
          <SubscriptionsPage />
        </TestWrapper>
      )

      expect(getByText('common.subscriptions.cd.services')).toBeInTheDocument()
    })

    test('should render CD Service Instances', () => {
      useGetModuleLicenseInfoMock.mockImplementation(() => {
        return {
          data: {
            data: [
              {
                edition: Editions.ENTERPRISE,
                workloads: 100,
                moduleType: 'CD',
                cdLicenseType: CDLicenseType.SERVICE_INSTANCES
              }
            ],
            status: 'SUCCESS'
          },
          refetch: jest.fn()
        }
      })

      useGetAccountMock.mockImplementation(() => {
        return {
          data: {
            data: {
              accountId: '123'
            },
            status: 'SUCCESS'
          },
          refetch: jest.fn()
        }
      })

      const { getByText, queryByText } = render(
        <TestWrapper defaultAppStoreValues={{ featureFlags }} pathParams={{ module: ModuleName.CD }}>
          <SubscriptionsPage />
        </TestWrapper>
      )

      expect(queryByText('common.subscriptions.cd.services')).not.toBeInTheDocument()
      expect(getByText('common.subscriptions.cd.serviceInstances')).toBeInTheDocument()
    })

    test('should render CCM details', () => {
      useGetModuleLicenseInfoMock.mockImplementation(() => {
        return {
          data: {
            data: [
              {
                edition: Editions.ENTERPRISE,
                spendLimit: -1,
                moduleType: 'CE'
              }
            ],
            status: 'SUCCESS'
          },
          refetch: jest.fn()
        }
      })

      useGetAccountMock.mockImplementation(() => {
        return {
          data: {
            data: {
              accountId: '123'
            },
            status: 'SUCCESS'
          },
          refetch: jest.fn()
        }
      })

      const { getByText } = render(
        <TestWrapper defaultAppStoreValues={{ featureFlags }} pathParams={{ module: ModuleName.CE }}>
          <SubscriptionsPage />
        </TestWrapper>
      )

      expect(getByText('common.subscriptions.ccm.cloudSpend')).toBeInTheDocument()
    })

    test('should render BuildCreditTable', () => {
      useGetModuleLicenseInfoMock.mockImplementation(() => {
        return {
          data: {
            data: [
              {
                edition: Editions.ENTERPRISE,
                numberOfCommitters: 200,
                moduleType: 'CI'
              }
            ],
            status: 'SUCCESS'
          },
          refetch: jest.fn()
        }
      })

      useGetAccountMock.mockImplementation(() => {
        return {
          data: {
            data: {
              accountId: '123'
            },
            status: 'SUCCESS'
          },
          refetch: jest.fn()
        }
      })

      const { getByText } = render(
        <TestWrapper defaultAppStoreValues={{ featureFlags }} pathParams={{ module: ModuleName.CI }}>
          <SubscriptionsPage />
        </TestWrapper>
      )

      expect(getByText('common.subscriptions.ci.developers')).toBeInTheDocument()
    })

    test('should render CI details', async () => {
      useGetModuleLicenseInfoMock.mockImplementation(() => {
        return {
          data: {
            data: [
              {
                edition: Editions.ENTERPRISE,
                numberOfCommitters: 200,
                moduleType: 'CI'
              }
            ],
            status: 'SUCCESS'
          },
          refetch: jest.fn()
        }
      })

      useGetAccountMock.mockImplementation(() => {
        return {
          data: {
            data: {
              accountId: '123'
            },
            status: 'SUCCESS'
          },
          refetch: jest.fn()
        }
      })

      const { container, getByText, getAllByText } = render(
        <TestWrapper
          defaultAppStoreValues={{ featureFlags }}
          defaultLicenseStoreValues={{
            licenseInformation: {
              CHAOS: { edition: 'FREE', status: 'ACTIVE' }
            }
          }}
          pathParams={{ module: ModuleName.CI }}
          queryParams={{ moduleCard: ModuleName.CI }}
        >
          <SubscriptionsPage />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot('ci module ')
      expect(getByText('common.lastBuildDate')).toBeTruthy()
      userEvent.click(getByText('common.lastBuildDate'))
      expect(getByText('common.lastBuildDate')).toBeTruthy()

      // checking update filters for undefined
      const fetchButton0 = getAllByText('Update')[0]
      expect(fetchButton0).toBeDefined()
      userEvent.click(fetchButton0)

      // changing values in dropdowns
      expect(getByText('common.subscriptions.usage.developers')).toBeTruthy()
      act(() => {
        fireEvent.click(getByText('common.subscriptions.usage.developers'))
      })
      await waitFor(() => {
        getByText('abc')
      })
      act(() => {
        fireEvent.click(getByText('abc'))
      })
      const orgDropdown = getAllByText('orgsText')[0]
      act(() => {
        fireEvent.click(orgDropdown)
      })
      // calling the orgchange by selecting value from dropdown
      await waitFor(() => {
        getByText('Org Name')
      })
      act(() => {
        fireEvent.click(getByText('Org Name'))
      })

      const fetchButton = getAllByText('Update')[0]
      expect(fetchButton).toBeDefined()
      userEvent.click(fetchButton)
      // checking the trend tab for ci graphs
      await waitFor(() => {
        getByText('common.subscriptions.tabs.trend')
      })
      act(() => {
        fireEvent.click(getByText('common.subscriptions.tabs.trend'))
      })
    })

    test('should render FF details', () => {
      useGetModuleLicenseInfoMock.mockImplementation(() => {
        return {
          data: {
            data: [
              {
                edition: Editions.ENTERPRISE,
                numberOfUsers: 200,
                numberOfClientMAUs: 20000,
                moduleType: 'CF'
              }
            ],
            status: 'SUCCESS'
          },
          refetch: jest.fn()
        }
      })

      useGetAccountMock.mockImplementation(() => {
        return {
          data: {
            data: {
              accountId: '123'
            },
            status: 'SUCCESS'
          },
          refetch: jest.fn()
        }
      })

      const { getByText } = render(
        <TestWrapper defaultAppStoreValues={{ featureFlags }} pathParams={{ module: ModuleName.CE }}>
          <SubscriptionsPage />
        </TestWrapper>
      )

      expect(getByText('common.subscriptions.featureFlags.users')).toBeInTheDocument()
      expect(getByText('common.subscriptions.featureFlags.mau')).toBeInTheDocument()
    })

    test('should render CHAOS details', () => {
      useGetModuleLicenseInfoMock.mockImplementation(() => {
        return {
          data: {
            data: [
              {
                edition: Editions.ENTERPRISE,
                totalChaosExperimentRuns: 10000,
                moduleType: 'CHAOS'
              }
            ],
            status: 'SUCCESS'
          },
          refetch: jest.fn()
        }
      })

      useGetAccountMock.mockImplementation(() => {
        return {
          data: {
            data: {
              accountId: '123'
            },
            status: 'SUCCESS'
          },
          refetch: jest.fn()
        }
      })

      const { getByText } = render(
        <TestWrapper defaultAppStoreValues={{ featureFlags }} pathParams={{ module: ModuleName.CHAOS }}>
          <SubscriptionsPage />
        </TestWrapper>
      )

      expect(getByText('common.subscriptions.chaos.experiments')).toBeInTheDocument()
    })

    test('should render CET details', () => {
      useGetModuleLicenseInfoMock.mockImplementation(() => {
        return {
          data: {
            data: [
              {
                edition: Editions.ENTERPRISE,
                status: 'ACTIVE',
                numberOfAgents: 100,
                moduleType: 'CET'
              }
            ],
            status: 'SUCCESS'
          },
          refetch: jest.fn()
        }
      })

      useGetAccountMock.mockImplementation(() => {
        return {
          data: {
            data: {
              accountId: '123'
            },
            status: 'SUCCESS'
          },
          refetch: jest.fn()
        }
      })

      const { getByText } = render(
        <TestWrapper defaultAppStoreValues={{ featureFlags }} pathParams={{ module: ModuleName.CET }}>
          <SubscriptionsPage />
        </TestWrapper>
      )

      expect(getByText('common.subscriptions.cet.agents')).toBeInTheDocument()
    })
  })
})
