import { Button, ButtonVariation, Layout } from '@harness/uicore'
import React from 'react'
import { useStrings } from 'framework/strings'
import type { ModuleTileDetailsBaseProps } from '../types'
import EmptyStateExpandedView from './EmptyStateExpandedView'
import EmptyStateCollapsedView from './EmptyStateCollapsedView'

const STOEmptyState: React.FC<ModuleTileDetailsBaseProps> = ({ isExpanded }) => {
  const { getString } = useStrings()
  if (isExpanded) {
    return (
      <EmptyStateExpandedView
        title={getString('common.moduleDetails.sto.expanded.title')}
        description={[
          getString('common.moduleDetails.sto.expanded.list.one'),
          getString('common.moduleDetails.sto.expanded.list.two'),
          getString('common.moduleDetails.sto.expanded.list.three'),
          getString('common.moduleDetails.sto.expanded.list.four'),
          getString('common.moduleDetails.sto.expanded.list.five')
        ]}
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

  return <EmptyStateCollapsedView description={getString('common.moduleDetails.sto.collapsed.title')} />
}

export default STOEmptyState
