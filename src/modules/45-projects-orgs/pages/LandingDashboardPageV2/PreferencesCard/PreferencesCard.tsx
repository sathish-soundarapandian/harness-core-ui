import React from 'react'
import { Container, Tabs, TableV2, Text, Icon, Layout } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import type { CellProps, Column, Renderer } from 'react-table'
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

  const columns: Column<SavedProjectDetails>[] = React.useMemo(
    () => [
      {
        width: '50%',
        accessor: 'name',
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
        width: '50%',
        Cell: () => null,
        accessor: 'projectIdentifier',
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

  if (recentProjects.length === 0) {
    return (
      <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }} padding="small">
        {getString('common.noRecentProjects')}
      </Text>
    )
  }

  return <TableV2<SavedProjectDetails> className={css.table} minimal columns={columns} data={recentProjects} />
}

export const Favorites = () => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical flex className={css.favorites} margin={{ bottom: 'xsmall' }}>
      <Icon color={Color.YELLOW_600} name="stars" size={80} />
      <Text font={{ variation: FontVariation.TINY }} className={css.comingSoonText} color={Color.PURPLE_600}>
        {getString('common.comingSoon')}
      </Text>
    </Layout.Vertical>
  )
}

export const PreferencesCard = () => {
  const { getString } = useStrings()
  return (
    <Container className={css.container}>
      <Tabs
        className={css.tabs}
        id="preferenceCardTabs"
        tabList={[
          { id: 'recents', title: getString('common.recents'), panel: <RecentProjects /> },
          { id: 'favorites', title: getString('common.favorites'), panel: <Favorites /> }
        ]}
      />
    </Container>
  )
}

export default PreferencesCard
