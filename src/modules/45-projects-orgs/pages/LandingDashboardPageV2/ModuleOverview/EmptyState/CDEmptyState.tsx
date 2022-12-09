import { Button, ButtonVariation, Layout } from '@harness/uicore'
import React from 'react'
import { useStrings } from 'framework/strings'
import type { ModuleOverviewBaseProps } from '../Grid/ModuleOverviewGrid'
import EmptyStateCollapsedView from './EmptyStateCollapsedView'
import EmptyStateExpandedView from './EmptyStateExpandedView'

const CDEmptyState: React.FC<ModuleOverviewBaseProps> = ({ isExpanded }) => {
  const { getString } = useStrings()
  if (!isExpanded) {
    return <EmptyStateCollapsedView description="common.moduleDetails.cd.collapsed.title" />
  }

  return (
    <EmptyStateExpandedView
      title={'common.moduleDetails.cd.expanded.title'}
      description={[
        'common.moduleDetails.cd.expanded.list.one',
        'common.moduleDetails.cd.expanded.list.two',
        'common.moduleDetails.cd.expanded.list.three',
        'common.moduleDetails.cd.expanded.list.four'
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

export default CDEmptyState
