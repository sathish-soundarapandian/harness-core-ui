import React from 'react'
import { Container, Text, IconName, CardSelect, Layout, Icon } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { StoreType } from '@common/constants/GitSyncTypes'
import { SVGComponent } from '@pipeline/components/PipelineDiagram/PipelineGraph/PipelineGraph'

export function LabelComponent() {
    return (
        <Layout.Horizontal id="text-styled-props" spacing="small" style={{ position: 'relative', top: '-10px', left: '10px' }}>
            <Text
              padding="small"
              font={{ size: 'small', align: 'right' }}
              border={{ color: 'green500' }}
              background="grey100"
              style={{ display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '18px',
              padding: 'var(--spacing-2) var(--spacing-3)',
              backgroundColor: '#E7F6E3',
              color: '#559449',
              fontWeight: 'bold',
              letterSpacing: '.2px',
              lineHeight: 'var(--font-size-normal)',
              whiteSpace: 'nowrap',
              border: 'none' }}
              >
              CHATGPT
            </Text>
            <Text
              padding="small"
              font={{ size: 'small', align: 'right' }}
              border={{ color: 'green500' }}
              background="grey100"
              style={{ display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '18px',
              padding: 'var(--spacing-2) var(--spacing-3)',
              backgroundColor: '#D4F3FC',
              color: '#337CD0',
              fontWeight: 'bold',
              letterSpacing: '.2px',
              lineHeight: 'var(--font-size-normal)',
              whiteSpace: 'nowrap',
              border: 'none' }}
              >
              RECOMMENDED
            </Text>
            </Layout.Horizontal>
    )
}