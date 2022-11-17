/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, Text } from '@harness/uicore'

interface AccessConfigBlockProps {
  title: string
}
const AccessConfigBlock: React.FC<AccessConfigBlockProps> = props => {
  return (
    <Container style={{ width: '706px', backgroundColor: '#FBFBFB', height: '42px', padding: '15px', margin: '15px' }}>
      <span>
        <Text>
          {props.title}
          <Icon name="plus" style={{ float: 'right', color: ' var(--color-blue)' }}></Icon>
        </Text>
      </span>
    </Container>
  )
}

export default AccessConfigBlock
