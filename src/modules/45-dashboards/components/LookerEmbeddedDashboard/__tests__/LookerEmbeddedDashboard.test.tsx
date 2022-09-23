/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import LookerEmbeddedDashboard from '../LookerEmbeddedDashboard'

describe('LookerEmbeddedDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('it should display iframe as default', async () => {
    render(<LookerEmbeddedDashboard embedUrl="test" onLookerAction={jest.fn()} />)

    await waitFor(() => expect(screen.getByTestId('dashboard-iframe')).toBeInTheDocument())
  })

  test('it should trigger callback when embedded event is triggered', async () => {
    const actionCallback = jest.fn()
    render(<LookerEmbeddedDashboard embedUrl="test" onLookerAction={actionCallback} />)

    const lookerEvent: any = {
      type: 'test',
      eventData: {
        dashboard: {
          dashboard_filters: 'test'
        }
      }
    }
    await act(async () => {
      fireEvent(
        window,
        new MessageEvent<string>('message', {
          data: JSON.stringify(lookerEvent),
          origin: 'https://dashboards.harness.io'
        })
      )
    })
    await waitFor(() => expect(actionCallback).toHaveBeenCalledWith(lookerEvent))
  })

  test('it should not trigger callback if embedded event is triggered from a different origin', async () => {
    const actionCallback = jest.fn()
    render(<LookerEmbeddedDashboard embedUrl="test" onLookerAction={actionCallback} />)

    const lookerEvent: any = {
      type: 'test',
      eventData: {
        dashboard: {
          dashboard_filters: 'test'
        }
      }
    }
    await act(async () => {
      fireEvent(
        window,
        new MessageEvent<string>('message', {
          data: JSON.stringify(lookerEvent),
          origin: 'www.RandomOrigin.com'
        })
      )
    })
    expect(actionCallback).not.toHaveBeenCalled()
  })
})
