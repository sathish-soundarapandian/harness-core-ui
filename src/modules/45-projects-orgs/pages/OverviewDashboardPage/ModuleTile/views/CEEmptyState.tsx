import { Button, ButtonVariation, Layout } from '@harness/uicore'
import React from 'react'
import { useStrings } from 'framework/strings'
import type { ModuleTileDetailsBaseProps } from '../types'
import EmptyStateExpandedView from './EmptyStateExpandedView'
import EmptyStateCollapsedView from './EmptyStateCollapsedView'

const CEEmptyState: React.FC<ModuleTileDetailsBaseProps> = ({ isExpanded }) => {
  const { getString } = useStrings()
  if (isExpanded) {
    return (
      <EmptyStateExpandedView
        title={getString('common.moduleDetails.ce.expanded.title')}
        footer={
          <Layout.Horizontal flex={{ justifyContent: 'space-between' }} padding={{ bottom: 'small' }}>
            <Button variation={ButtonVariation.PRIMARY}>{getString('getStarted')}</Button>
            <Button variation={ButtonVariation.LINK} rightIcon="launch">
              {getString('common.learnMore')}
            </Button>
          </Layout.Horizontal>
        }
      />
    )
  }

  return <EmptyStateCollapsedView description={getString('common.moduleDetails.cd.collapsed.title')} />
}

export default CEEmptyState
