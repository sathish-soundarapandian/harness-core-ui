/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IpAllowlistConfigResponse, IpAllowlistConfigValidateResponse } from '@harnessio/react-ng-manager-client'

export const mockResponseCreateOrUpdateIPAllowlist: IpAllowlistConfigResponse = {
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
}

export const mockResponseValidateIpAddressCustomBlockSuccess: IpAllowlistConfigValidateResponse = {
  allowed_for_custom_block: true
}

export const mockResponseValidateIpAddressCustomBlockFailure: IpAllowlistConfigValidateResponse = {
  allowed_for_custom_block: false
}

export const mockDataForEdit: IpAllowlistConfigResponse = {
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
}

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
      enabled: false
    },
    updated: 123
  },
  {
    created: 123,
    ip_allowlist_config: {
      identifier: 'Ip_Range_3',
      name: 'Ip Range 3',
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
      identifier: 'Ip_Range_4',
      name: 'Ip Range 4',
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
      identifier: 'Ip_Range_5',
      name: 'Ip Range 5',
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
      identifier: 'Ip_Range_6',
      name: 'Ip Range 6',
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
      identifier: 'Ip_Range_7',
      name: 'Ip Range 7',
      ip_address: '234.55.0.1/32',
      allowed_source_type: ['UI'],
      description: 'description 2',
      tags: { a: 'a' },
      enabled: true
    },
    updated: 123
  }
]
