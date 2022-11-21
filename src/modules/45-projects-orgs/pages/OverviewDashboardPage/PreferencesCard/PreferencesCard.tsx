import React from 'react'
import { Container, Tabs, TableV2, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import type { CellProps, Renderer } from 'react-table'
import { Link, useParams } from 'react-router-dom'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import type { SavedProjectDetails } from 'framework/AppStore/AppStoreContext'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import css from './PreferencesCard.module.scss'

const RenderProject: Renderer<CellProps<SavedProjectDetails>> = ({ row }): JSX.Element => {
  const { orgIdentifier, projectIdentifier, name } = row.original
  const { accountId } = useParams<AccountPathProps>()

  return (
    <Link to={routes.toProjectDetails({ projectIdentifier: projectIdentifier, orgIdentifier, accountId })}>
      <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.SMALL_SEMI }}>
        {name}
      </Text>
    </Link>
  )
}

const RecentProjects: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()

  const { preference: recentProjects = [] } = usePreferenceStore<SavedProjectDetails[]>(
    PreferenceScope.USER,
    'recentProjects'
  )

  const columns = React.useMemo(
    () => [
      {
        accessor: 'projects',
        width: '50%',
        Header: (
          <Text
            color={Color.GREY_600}
            font={{ variation: FontVariation.SMALL_SEMI }}
            className={css.tableProjectsHeader}
          >
            {getString('projectsText')}
          </Text>
        ),
        Cell: RenderProject,
        disableSortBy: true
      },
      {
        accessor: 'desc',
        width: '50%',
        Cell: () => null,
        Header: (
          <Link className={css.viewAllText} to={routes.toAllProjects({ accountId })}>
            <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.SMALL_SEMI }}>
              {getString('common.viewAll')}
            </Text>
          </Link>
        ),
        disableSortBy: true
      }
    ],
    []
  )

  return <TableV2<SavedProjectDetails> className={css.table} minimal columns={columns} data={recentProjects} />
}

export const PreferencesCard = () => {
  return (
    <Container className={css.container}>
      <Tabs
        id="preferenceCardTabs"
        tabList={[
          { id: 'tab1', title: 'Recents', panel: <RecentProjects /> },
          { id: 'tab2', title: 'Favorites', panel: <div>Coming soon</div> }
        ]}
      />
    </Container>
  )
}

export default PreferencesCard
