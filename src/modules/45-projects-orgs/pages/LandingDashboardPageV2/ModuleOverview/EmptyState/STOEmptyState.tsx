import { Button, ButtonVariation, Layout } from '@harness/uicore'
import React from 'react'
import { useStrings } from 'framework/strings'
import type { ModuleOverviewBaseProps } from '../Grid/ModuleOverviewGrid'
import EmptyStateExpandedView from './EmptyStateExpandedView'
import EmptyStateCollapsedView from './EmptyStateCollapsedView'

const STOEmptyState: React.FC<ModuleOverviewBaseProps> = ({ isExpanded }) => {
  const { getString } = useStrings()
  if (isExpanded) {
    return (
      <EmptyStateExpandedView
        title={'common.moduleDetails.sto.expanded.title'}
        description={[
          'common.moduleDetails.sto.expanded.list.one',
          'common.moduleDetails.sto.expanded.list.two',
          'common.moduleDetails.sto.expanded.list.three',
          'common.moduleDetails.sto.expanded.list.four',
          'common.moduleDetails.sto.expanded.list.five'
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

  return <EmptyStateCollapsedView description={'common.moduleDetails.sto.collapsed.title'} />
}

export default STOEmptyState
