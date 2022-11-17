/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'

const IPSetup: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical
      spacing="medium"
      padding="medium"
      style={{ backgroundColor: 'var(--grey-200)', maxWidth: '755px' }}
    >
      <Text>{getString('ce.co.ipAddressSetup')}</Text>
    </Layout.Vertical>
  )
}

export default IPSetup
