/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext } from 'react'
import { Button, Container, Text } from '@harness/uicore'
import { waitFor, render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import * as dbHook from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import { OnboardingEntites } from '../SetupSourceTabs.constants'
import {
  SetupSourceTabs,
  SetupSourceTabsContext,
  buildObjectToStore,
  typeToSetupSourceType,
  getSetupSourceRoutingIndex
} from '../SetupSourceTabs'

const TabTitles = ['Tab1', 'Tab2', 'Tab3', 'Tab4', 'Tab5']
const determineMaxTab = (data: any): number => {
  if (!data) {
    return 0
  }
  if (data.m) {
    return 4
  }
  if (data.auto) {
    return 3
  }
  if (data.semi) {
    return 2
  }
  if (data.dolo) {
    return 1
  }
  if (data.solo) {
    return 0
  }

  return 0
}

function MockComponentThatHitsSubmit(props: any): JSX.Element {
  const { onNext, sourceData } = useContext(SetupSourceTabsContext)
  return (
    <Container>
      {sourceData && Object.keys(sourceData).length && (
        <Text className="parsedJSONData">{JSON.stringify(sourceData)}</Text>
      )}
      <Button
        onClick={() => {
          onNext(props.switchData || { dolo: {} }, { tabStatus: 'SUCCESS' })
        }}
        className="next"
      >
        NEXT
      </Button>
    </Container>
  )
}

function MockComponentThatHitPrevious(): JSX.Element {
  const { sourceData, onPrevious } = useContext(SetupSourceTabsContext)
  return (
    <Container className="1">
      {sourceData && Object.keys(sourceData).length && (
        <Text className="parsedJSONData">{JSON.stringify(sourceData)}</Text>
      )}
      <Button
        onClick={() => {
          onPrevious()
        }}
        className="previous"
      >
        PREVIOUS
      </Button>
    </Container>
  )
}

describe('Unit tests for SetupSourceTabs ', () => {
  test('Ensure typeToSetupSourceType returns correct value', async () => {
    expect(typeToSetupSourceType('HARNESS_CD10')).toEqual(OnboardingEntites.CHANGE_SOURCE)
    expect(typeToSetupSourceType('KUBERNETES')).toEqual(OnboardingEntites.CHANGE_SOURCE)
    expect(typeToSetupSourceType('APP_DYNAMICS')).toEqual(OnboardingEntites.MONITORING_SOURCE)
    expect(typeToSetupSourceType('NEW_RELIC')).toEqual(OnboardingEntites.MONITORING_SOURCE)
    expect(typeToSetupSourceType('SPLUNK')).toEqual(OnboardingEntites.MONITORING_SOURCE)
    expect(typeToSetupSourceType('STACKDRIVER')).toEqual(OnboardingEntites.MONITORING_SOURCE)
  })

  test('Ensure getSetupSourceRoutingIndex returns correct value', async () => {
    expect(getSetupSourceRoutingIndex('HARNESS_CD10')).toEqual(1)
    expect(getSetupSourceRoutingIndex('KUBERNETES')).toEqual(1)
    expect(getSetupSourceRoutingIndex('APP_DYNAMICS')).toEqual(2)
    expect(getSetupSourceRoutingIndex('NEW_RELIC')).toEqual(2)
    expect(getSetupSourceRoutingIndex('SPLUNK')).toEqual(2)
    expect(getSetupSourceRoutingIndex('STACKDRIVER')).toEqual(2)
  })

  test('Ensure buildObjectToStore works correctly', () => {
    // change source case for replacing exisiting object in cache
    expect(
      buildObjectToStore(
        {
          type: OnboardingEntites.CHANGE_SOURCE,
          name: 'sdfs',
          identifier: 'sdfsfsdf'
        },
        {
          setupID: '123_accountId-134_org-1234_sdf',
          monitoringSources: [],
          changeSources: [
            {
              identifier: '97689656u7',
              name: 'sdrgfhfghfs',
              routeUrl: 'fghf',
              type: 'CHANGE_SOURCE'
            },
            {
              identifier: 'sdfsfsdf',
              name: 'sdfs',
              routeUrl:
                '/account/123_accountId/cv/orgs/134_org/projects/1234_sdf/admin/setup/activity-source-setup//activity-sourceId/sdfsfsdf',
              type: 'CHANGE_SOURCE'
            }
          ],
          verificationJobs: []
        },
        OnboardingEntites.CHANGE_SOURCE,
        { orgIdentifier: '134_org', projectIdentifier: '1234_sdf', accountId: '123_accountId' }
      )
    ).toEqual({
      changeSources: [
        {
          identifier: '97689656u7',
          name: 'sdrgfhfghfs',
          routeUrl: 'fghf',
          type: 'CHANGE_SOURCE'
        },
        {
          identifier: 'sdfsfsdf',
          name: 'sdfs',
          routeUrl:
            '/account/123_accountId/cv/orgs/134_org/projects/1234_sdf/admin/setup/activity-source-setup//activity-sourceId/sdfsfsdf',
          type: 'CHANGE_SOURCE'
        }
      ],
      monitoringSources: [],
      setupID: '123_accountId-134_org-1234_sdf',
      verificationJobs: []
    })

    // verification job case for appending a new object
    expect(
      buildObjectToStore(
        {
          type: OnboardingEntites.VERIFICATION_JOBS,
          name: 'sdfs',
          identifier: 'sdfsfsdf'
        },
        {
          setupID: '123_accountId-134_org-1234_sdf',
          monitoringSources: [],
          verificationJobs: [
            {
              identifier: '97689656u7',
              name: 'sdrgfhfghfs',
              routeUrl: 'fghf',
              type: OnboardingEntites.VERIFICATION_JOBS
            },
            {
              identifier: 'ioretureoitueoit',
              name: 'fgdfgdfg',
              routeUrl:
                '/account/123_accountId/cv/orgs/134_org/projects/1234_sdf/admin/setup/activity-source-setup//activity-sourceId/sdfsfsdf',
              type: OnboardingEntites.VERIFICATION_JOBS
            }
          ],
          changeSources: []
        },
        OnboardingEntites.VERIFICATION_JOBS,
        { orgIdentifier: '134_org', projectIdentifier: '1234_sdf', accountId: '123_accountId' }
      )
    ).toEqual({
      changeSources: [],
      monitoringSources: [],
      setupID: '123_accountId-134_org-1234_sdf',
      verificationJobs: [
        {
          identifier: '97689656u7',
          name: 'sdrgfhfghfs',
          routeUrl: 'fghf',
          type: OnboardingEntites.VERIFICATION_JOBS
        },
        {
          identifier: 'ioretureoitueoit',
          name: 'fgdfgdfg',
          routeUrl:
            '/account/123_accountId/cv/orgs/134_org/projects/1234_sdf/admin/setup/activity-source-setup//activity-sourceId/sdfsfsdf',
          type: OnboardingEntites.VERIFICATION_JOBS
        },
        {
          identifier: 'sdfsfsdf',
          name: 'sdfs',
          routeUrl: '',
          type: OnboardingEntites.VERIFICATION_JOBS
        }
      ]
    })
  })

  test('Ensure that when 5 tabs are rendered, correct tabs are disabled, and next works', async () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(undefined)
      } as any,
      isInitializingDB: false
    })
    const { container, getByText } = render(
      <TestWrapper>
        <SetupSourceTabs data={{}} tabTitles={TabTitles} determineMaxTab={determineMaxTab}>
          {[
            <MockComponentThatHitsSubmit key={1} />,
            <Container key={2} className="2" />,
            <Container key={3} className="3" />,
            <Container key={4} className="4" />,
            <Container key={5} className="5" />
          ]}
        </SetupSourceTabs>
      </TestWrapper>
    )

    // expect there to be 5 tabs
    await waitFor(() => expect(container.querySelectorAll('[role="tab"]').length).toBe(5))

    // ensure selected is the first one
    expect(container.querySelector('[aria-selected="true"]')?.getAttribute('data-tab-id')).toBe('0')

    // ensure all other tabs are disabled
    container.querySelectorAll('[aria-disabled="true"]').forEach((disabledTab, index) => {
      expect(disabledTab.getAttribute('id')).toContain(index + 1)
    })

    // hit next and make sure correct tabs are disabled
    fireEvent.click(getByText('NEXT'))
    await waitFor(() =>
      expect(container.querySelector('[aria-selected="true"]')?.getAttribute('data-tab-id')).toBe('1')
    )
    expect(
      container.querySelectorAll('[role="tab"]').forEach((tab, index) => {
        if (index <= 1) {
          expect(tab.getAttribute('aria-disabled')).toEqual('false')
        } else {
          expect(tab.getAttribute('aria-disabled')).toEqual('true')
        }
      })
    )
  })

  test('Ensure that when dbInstance returns cached data, the tabs are initialized correctly', async () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockResolvedValue({
          currentTabIndex: 3,
          sourceData: { solo: {}, dolo: {}, semi: {}, auto: {} },
          tabsInfo: [{ status: 'SUCCESS' }, { status: 'SUCCESS' }, { status: 'SUCCESS' }, { status: 'SUCCESS' }]
        })
      } as any,
      isInitializingDB: false
    })
    const { container } = render(
      <TestWrapper>
        <SetupSourceTabs data={{}} tabTitles={TabTitles} determineMaxTab={determineMaxTab}>
          {[
            <Container key={1} className="1" />,
            <Container key={2} className="2" />,
            <Container key={3} className="3" />,
            <MockComponentThatHitsSubmit key={4} />,
            <Container key={5} className="5" />
          ]}
        </SetupSourceTabs>
      </TestWrapper>
    )

    // expect there to be 5 tabs
    await waitFor(() => expect(container.querySelectorAll('[role="tab"]').length).toBe(5))

    // ensure selected is the 4th one
    expect(container.querySelector('[aria-selected="true"]')?.getAttribute('data-tab-id')).toBe('3')
    expect(
      container.querySelectorAll('[role="tab"]').forEach((tab, index) => {
        if (index <= 3) {
          expect(tab.getAttribute('aria-disabled')).toEqual('false')
        } else {
          expect(tab.getAttribute('aria-disabled')).toEqual('true')
        }
      })
    )

    // ensure data was passed to correct tab
    expect(container.querySelector('.parsedJSONData')?.innerHTML).toEqual(
      JSON.stringify({ solo: {}, dolo: {}, semi: {}, auto: {} })
    )
  })

  test('Ensure that when last tab is hit the, db clears tables and savees correct data', async () => {
    const mockPut = jest.fn().mockResolvedValue(undefined)
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: mockPut,
        get: jest.fn().mockResolvedValue({
          currentTabIndex: 4,
          sourceData: { solo: {}, dolo: {}, semi: {}, auto: {}, m: {} },
          tabsInfo: [
            { status: 'SUCCESS' },
            { status: 'SUCCESS' },
            { status: 'SUCCESS' },
            { status: 'SUCCESS' },
            { status: 'SUCCESS' }
          ]
        }),
        clear: jest.fn()
      } as any,
      isInitializingDB: false
    })
    const { container, getByText } = render(
      <TestWrapper
        path={routes.toCVAdminMonitoringSources({
          accountId: '1234_accountId',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_org'
        })}
      >
        <SetupSourceTabs data={{}} tabTitles={TabTitles} determineMaxTab={determineMaxTab}>
          {[
            <Container key={1} className="1" />,
            <Container key={2} className="2" />,
            <Container key={3} className="3" />,
            <Container key={4} className="4" />,
            <MockComponentThatHitsSubmit
              key={5}
              tab={4}
              switchData={{
                solo: {},
                dolo: {},
                semi: {},
                auto: {},
                m: {},
                type: OnboardingEntites.MONITORING_SOURCE,
                monitoringSources: [
                  {
                    type: OnboardingEntites.MONITORING_SOURCE,
                    name: 'some name',
                    identifier: 'ident',
                    routeUrl: 'dsfsf'
                  }
                ]
              }}
            />
          ]}
        </SetupSourceTabs>
      </TestWrapper>
    )

    // expect there to be 5 tabs
    await waitFor(() => expect(container.querySelectorAll('[role="tab"]').length).toBe(5))
    fireEvent.click(getByText('NEXT'))

    await waitFor(() =>
      expect(mockPut).toHaveBeenLastCalledWith('setup', {
        currentTabIndex: 4,
        monitoringSources: [
          {
            identifier: undefined,
            name: undefined,
            routeUrl:
              '/account/undefined/cv/orgs/undefined/projects/undefined/admin/setup/monitoring-source//undefined',
            type: 'MONITORING_SOURCE'
          }
        ],
        setupID: 'undefined-undefined-undefined',
        sourceData: {
          auto: {},
          dolo: {},
          m: {},
          semi: {},
          solo: {}
        },
        tabsInfo: [
          { status: 'SUCCESS' },
          { status: 'SUCCESS' },
          { status: 'SUCCESS' },
          { status: 'SUCCESS' },
          { status: 'SUCCESS' }
        ]
      })
    )
  })

  test('Ensure that when user clicks on a previous tab, that tab is then rendered', async () => {
    const mockPut = jest.fn().mockResolvedValue(undefined)
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: mockPut,
        get: jest.fn().mockResolvedValue({
          currentTabIndex: 4,
          sourceData: { solo: {}, dolo: {}, semi: {}, auto: {}, m: {} },
          tabsInfo: [
            { status: 'SUCCESS' },
            { status: 'SUCCESS' },
            { status: 'SUCCESS' },
            { status: 'SUCCESS' },
            { status: 'SUCCESS' }
          ]
        }),
        clear: jest.fn()
      } as any,
      isInitializingDB: false
    })
    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminMonitoringSources({
          accountId: '1234_accountId',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_org'
        })}
      >
        <SetupSourceTabs data={{}} tabTitles={TabTitles} determineMaxTab={determineMaxTab}>
          {[
            <Container key={1} className="1" />,
            <Container key={2} className="2" />,
            <Container key={3} className="3" />,
            <Container key={4} className="4" />,
            <MockComponentThatHitsSubmit
              key={5}
              tab={4}
              switchData={{
                solo: {},
                dolo: {},
                semi: {},
                auto: {},
                m: {},
                type: OnboardingEntites.MONITORING_SOURCE,
                monitoringSources: [
                  {
                    type: OnboardingEntites.MONITORING_SOURCE,
                    name: 'some name',
                    identifier: 'ident',
                    routeUrl: 'dsfsf'
                  }
                ]
              }}
            />
          ]}
        </SetupSourceTabs>
      </TestWrapper>
    )

    // expect there to be 5 tabs
    await waitFor(() => expect(container.querySelectorAll('[role="tab"]').length).toBe(5))
    expect(container.querySelectorAll('[aria-disabled="true"]')?.length).toBe(0)

    const tabs = container.querySelectorAll('[role="tab"]')
    fireEvent.click(tabs[1])

    await waitFor(() =>
      expect(container.querySelectorAll('[role="tab"]')[1].getAttribute('aria-selected')).toEqual('true')
    )
    expect(container.querySelector('[class*="2"]')).not.toBeNull()

    fireEvent.click(container.querySelectorAll('[role="tab"]')[3])
    await waitFor(() =>
      expect(container.querySelectorAll('[role="tab"]')[3].getAttribute('aria-selected')).toEqual('true')
    )
    expect(container.querySelector('[class*="4"]')).not.toBeNull()
  })

  test('Ensure that when user clicks previous on the first tab, they are taken to the previous screen', async () => {
    const mockPut = jest.fn().mockResolvedValue(undefined)
    const mockClear = jest.fn()
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: mockPut,
        get: jest.fn(),
        clear: mockClear
      } as any,
      isInitializingDB: false
    })

    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminMonitoringSources({
          accountId: '1234_accountId',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_org'
        })}
      >
        <SetupSourceTabs data={{}} tabTitles={TabTitles} determineMaxTab={determineMaxTab}>
          {[
            <MockComponentThatHitPrevious key={1} />,
            <Container key={2} className="2" />,
            <Container key={3} className="3" />,
            <Container key={4} className="4" />,
            <MockComponentThatHitsSubmit
              key={5}
              tab={4}
              switchData={{
                solo: {},
                dolo: {},
                semi: {},
                auto: {},
                m: {},
                type: OnboardingEntites.MONITORING_SOURCE,
                monitoringSources: [
                  {
                    type: OnboardingEntites.MONITORING_SOURCE,
                    name: 'some name',
                    identifier: 'ident',
                    routeUrl: 'dsfsf'
                  }
                ]
              }}
            />
          ]}
        </SetupSourceTabs>
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="1"]')))
    const previousButton = container.querySelector('[class*="previous"]')
    if (!previousButton) {
      throw Error('Previous button was not rendered')
    }

    fireEvent.click(previousButton)
    await waitFor(() => expect(mockClear).toHaveBeenCalled())
  })
})
