/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Icon, Text } from '@harness/uicore'
import type { TextProps } from '@harness/uicore/dist/components/Text/Text'

export interface CollapseFormProps {
  header: string
  children: React.ReactNode
  headerProps?: TextProps
  headerColor?: string
  open?: boolean
}

export function CollapseForm({
  header,
  children,
  headerProps = { font: { size: 'medium' } },
  headerColor = 'var(--pipeline-form-blue)',
  open = true
}: CollapseFormProps): React.ReactElement {
  const [isOpen, setOpen] = React.useState(open)
  return (
    <div style={{ width: '100%' }}>
      <Layout.Horizontal
        flex={{ distribution: 'space-between' }}
        style={{ cursor: 'pointer' }}
        onClick={() => setOpen(prev => !prev)}
      >
        <Text {...headerProps} style={{ color: headerColor }}>
          {header}
        </Text>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} style={{ color: 'var(--pipeline-form-blue)' }} />
      </Layout.Horizontal>
      {isOpen && <Layout.Vertical padding={{ top: 'medium', bottom: 'medium' }}> {children}</Layout.Vertical>}
    </div>
  )
}
