/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Heading } from '@harness/uicore'
import React from 'react'

export const DetailHeading: React.FC<React.ComponentProps<typeof Heading>> = ({ children, style, ...props }) => (
  <Heading
    level={3}
    style={{ fontSize: '14px', color: '#22272D', fontWeight: 600, ...style }}
    padding="xxlarge"
    {...props}
  >
    {children}
  </Heading>
)
