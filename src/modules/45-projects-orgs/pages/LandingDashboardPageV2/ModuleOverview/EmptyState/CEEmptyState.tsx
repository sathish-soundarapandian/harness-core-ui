import { Button, ButtonVariation, Layout } from '@harness/uicore'
import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { ModuleOverviewBaseProps } from '../Grid/ModuleOverviewGrid'
import EmptyStateExpandedView from './EmptyStateExpandedView'
import EmptyStateCollapsedView from './EmptyStateCollapsedView'

const CEEmptyState: React.FC<ModuleOverviewBaseProps> = ({ isExpanded }) => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<AccountPathProps>()

  if (isExpanded) {
    return (
      <EmptyStateExpandedView
        title={'common.moduleDetails.ce.expanded.title'}
        footer={
          <Layout.Horizontal flex={{ justifyContent: 'space-between' }} padding={{ bottom: 'small' }}>
            <Button
              variation={ButtonVariation.PRIMARY}
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                history.push(routes.toCE({ accountId }))
              }}
            >
              {getString('getStarted')}
            </Button>
            <Button variation={ButtonVariation.LINK} rightIcon="launch">
              {getString('common.learnMore')}
            </Button>
          </Layout.Horizontal>
        }
      />
    )
  }

  return <EmptyStateCollapsedView description={'common.moduleDetails.ce.collapsed.title'} />
}

export default CEEmptyState
