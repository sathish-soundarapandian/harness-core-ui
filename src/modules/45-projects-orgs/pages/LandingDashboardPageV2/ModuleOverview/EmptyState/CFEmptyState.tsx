import { Button, ButtonVariation, Layout } from '@harness/uicore'
import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { ModuleOverviewBaseProps } from '../Grid/ModuleOverviewGrid'
import EmptyStateExpandedView from './EmptyStateExpandedView'
import EmptyStateCollapsedView from './EmptyStateCollapsedView'

const CFEmptyState: React.FC<ModuleOverviewBaseProps> = ({ isExpanded }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  if (isExpanded) {
    return (
      <EmptyStateExpandedView
        title={'common.moduleDetails.ff.expanded.title'}
        description={[
          'common.moduleDetails.ff.expanded.list.one',
          'common.moduleDetails.ff.expanded.list.two',
          'common.moduleDetails.ff.expanded.list.three'
        ]}
        footer={
          <Layout.Horizontal flex={{ justifyContent: 'space-between' }} padding={{ bottom: 'small' }}>
            <Button
              variation={ButtonVariation.PRIMARY}
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                history.push(routes.toCF({ accountId }))
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

  return <EmptyStateCollapsedView description={'common.moduleDetails.ff.collapsed.title'} />
}

export default CFEmptyState
