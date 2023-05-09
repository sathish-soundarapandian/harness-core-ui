/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IpAllowlistConfigResponse, IpAllowlistConfigValidateResponse } from '@harnessio/react-ng-manager-client'

export const mockIPAllowlistConfigs: IpAllowlistConfigResponse[] = [
  {
    created: 123,
    ip_allowlist_config: {
      identifier: 'Ip_Range_1',
      name: 'Ip Range 1',
      ip_address: '192.168.1.1/24',
      allowed_source_type: ['UI', 'API'],
      description: 'description 1',
      tags: { a: 'a', b: 'b' },
      enabled: false
    },
    updated: 123
  },
  {
    created: 123,
    ip_allowlist_config: {
      identifier: 'Ip_Range_2',
      name: 'Ip Range 2',
      ip_address: '192.168.1.1/24',
      allowed_source_type: ['UI', 'API'],
      description: 'description 1',
      tags: { a: 'a', b: 'b' },
      enabled: true
    },
    updated: 123
  }
]

export const mockValidateIpAddressAllowlistedOrNotSuccess: IpAllowlistConfigValidateResponse = {
  allowed_for_api: true,
  allowed_for_ui: true,
  allowlisted_configs: mockIPAllowlistConfigs
}

export const mockValidateIpAddressAllowlistedOrNotFailure: IpAllowlistConfigValidateResponse = {
  allowed_for_api: false,
  allowed_for_ui: false,
  allowlisted_configs: undefined
}
