import { Button, ButtonVariation, Layout } from '@harness/uicore'
import React from 'react'
import { useStrings } from 'framework/strings'
import type { ModuleTileDetailsBaseProps } from '../types'
import EmptyStateExpandedView from './EmptyStateExpandedView'
import EmptyStateCollapsedView from './EmptyStateCollapsedView'

const CDEmptyState: React.FC<ModuleTileDetailsBaseProps> = ({ isExpanded }) => {
  const { getString } = useStrings()
  if (isExpanded) {
    return (
      <EmptyStateExpandedView
        title={getString('common.moduleTile.cd.expanded.title')}
        description={[
          getString('common.moduleTile.cd.expanded.list.one'),
          getString('common.moduleTile.cd.expanded.list.two'),
          getString('common.moduleTile.cd.expanded.list.three'),
          getString('common.moduleTile.cd.expanded.list.four')
        ]}
        footer={
          <Layout.Horizontal flex={{ justifyContent: 'space-between' }} padding={{ bottom: 'small' }}>
            <Button variation={ButtonVariation.PRIMARY}>Get Started</Button>
            <Button variation={ButtonVariation.LINK} rightIcon="launch">
              Learn more
            </Button>
          </Layout.Horizontal>
        }
      />
    )
  }

  return <EmptyStateCollapsedView description={getString('common.moduleTile.cd.collapsed.title')} />
}

export default CDEmptyState
