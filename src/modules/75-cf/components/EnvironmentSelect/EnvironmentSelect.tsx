/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Select, SelectOption, Text } from '@harness/uicore'

export interface EnvironmentSelectProps {
  label: string
  selectedEnvironment?: SelectOption
  environments: SelectOption[]
  onChange: (opt: SelectOption) => void
}

export const EnvironmentSelect: React.FC<EnvironmentSelectProps> = ({
  label,
  selectedEnvironment,
  environments,
  onChange
}) => (
  <Layout.Horizontal flex={{ align: 'center-center' }}>
    <Text margin={{ right: 'small' }} font={{ weight: 'bold' }}>
      {label}
    </Text>
    <Select value={selectedEnvironment} items={environments} onChange={onChange} />
  </Layout.Horizontal>
)
