/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { Service } from 'services/lw'
import RuleStatusToggleSwitch from '../RuleStatusToggleSwitch'

const mockService: Service = {
  id: 1,
  name: 'test rule',
  org_id: '',
  fulfilment: 'ondemand',
  kind: 'instance',
  cloud_account_id: 'Non_prod_old',
  idle_time_mins: 5,
  host_name: 'dummy',
  match_all_subdomains: false,
  disabled: false,
  created_by: '123',
  routing: {
    instance: {
      filter_text: "id = ['i-79asd698879']"
    }
  },
  health_check: {
    protocol: 'http',
    path: '/',
    port: 80,
    timeout: 30,
    id: '',
    status_code_from: 200,
    status_code_to: 299
  },
  opts: {
    preserve_private_ip: false,
    delete_cloud_resources: false,
    always_use_private_ip: false,
    access_details: {
      backgroundTasks: {
        selected: false
      },
      dnsLink: {
        selected: false
      },
      ipaddress: {
        selected: false
      },
      rdp: {
        selected: false
      },
      ssh: {
        selected: true
      }
    },
    hide_progress_page: false,
    dry_run: false
  },
  metadata: {
    cloud_provider_details: {
      name: 'Non prod old'
    },
    kubernetes_connector_id: ''
  },
  status: 'created',
  account_identifier: 'acc'
}

describe('rule status toggle switch', () => {
  test('clicking should render loader', () => {
    const { container } = render(
      <TestWrapper>
        <RuleStatusToggleSwitch serviceData={mockService} onSuccess={jest.fn()} />
      </TestWrapper>
    )
    const toggle = container.querySelector('[class="Toggle--toggleIcon"]')
    act(() => {
      fireEvent.click(toggle as HTMLElement)
      expect(container.querySelector('span[data-icon="spinner"]')).toBeDefined()
    })
  })
})
