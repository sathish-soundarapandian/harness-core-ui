import { Button, ButtonVariation, Layout } from '@harness/uicore'
import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ModuleOverviewBaseProps } from '../Grid/ModuleOverviewGrid'
import EmptyStateExpandedView from './EmptyStateExpandedView'
import EmptyStateCollapsedView from './EmptyStateCollapsedView'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

const ChaosEmptyState: React.FC<ModuleOverviewBaseProps> = ({ isExpanded }) => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<AccountPathProps>()

  if (isExpanded) {
    return (
      <EmptyStateExpandedView
        title={'common.moduleDetails.chaos.expanded.title'}
        description={[
          'common.moduleDetails.chaos.expanded.list.one',
          'common.moduleDetails.chaos.expanded.list.two',
          'common.moduleDetails.chaos.expanded.list.three'
        ]}
        footer={
          <Layout.Horizontal flex={{ justifyContent: 'space-between' }} padding={{ bottom: 'small' }}>
            <Button
              variation={ButtonVariation.PRIMARY}
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                history.push(routes.toChaos({ accountId }))
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

  return <EmptyStateCollapsedView description={'common.moduleDetails.chaos.collapsed.title'} />
}

export default ChaosEmptyState
