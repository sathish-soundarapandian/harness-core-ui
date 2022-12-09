import { Button, ButtonVariation, Layout } from '@harness/uicore'
import React from 'react'
import { useStrings } from 'framework/strings'
import type { ModuleOverviewBaseProps } from '../Grid/ModuleOverviewGrid'
import EmptyStateExpandedView from './EmptyStateExpandedView'
import EmptyStateCollapsedView from './EmptyStateCollapsedView'

const SLOEmptyState: React.FC<ModuleOverviewBaseProps> = ({ isExpanded }) => {
  const { getString } = useStrings()
  if (isExpanded) {
    return (
      <EmptyStateExpandedView
        title={'common.moduleDetails.slo.expanded.title'}
        description={'common.moduleDetails.slo.expanded.description'}
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

  return <EmptyStateCollapsedView description={'common.moduleDetails.cd.collapsed.title'} />
}

export default SLOEmptyState
