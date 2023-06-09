import React from 'react'
import { Container, TableV2, Text, Icon, Layout } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import type { CellProps, Column, Renderer } from 'react-table'
import { Link, useParams } from 'react-router-dom'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import type { SavedProjectDetails } from 'framework/AppStore/AppStoreContext'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { String, useStrings } from 'framework/strings'
import css from './PreferencesCard.module.scss'

const renderTooltipForProjectLabel = (projectName: string, orgName: string): JSX.Element => {
  return (
    <Layout.Vertical padding="medium" spacing="small">
      <Text color={Color.WHITE}>{projectName ?? ''}</Text>
      {orgName ? (
        <Layout.Horizontal padding={{ top: 'small' }} flex={{ alignItems: 'center' }}>
          <Icon name="nav-organization" size={13} color={Color.GREY_300} margin={{ right: 'xsmall' }} />
          <Text inline color={Color.GREY_300} font={{ variation: FontVariation.SMALL_SEMI }}>
            <String stringID="common.org" />
          </Text>
          <Text color={Color.GREY_300} font={{ variation: FontVariation.SMALL_SEMI }}>
            :&nbsp;
          </Text>

          <Text color={Color.WHITE} font={{ variation: FontVariation.SMALL_SEMI }}>
            {orgName}
          </Text>
        </Layout.Horizontal>
      ) : undefined}
    </Layout.Vertical>
  )
}

const RenderProject: Renderer<CellProps<SavedProjectDetails>> = ({ row }): JSX.Element => {
  const { orgIdentifier, projectIdentifier, name } = row.original
  const { accountId } = useParams<AccountPathProps>()

  return (
    <Link to={routes.toProjectDetails({ projectIdentifier: projectIdentifier, orgIdentifier, accountId })}>
      <Text
        color={Color.PRIMARY_7}
        font={{ variation: FontVariation.SMALL_SEMI }}
        tooltip={renderTooltipForProjectLabel(name || projectIdentifier, orgIdentifier)}
        tooltipProps={{
          isDark: true,
          fill: true,
          position: 'left'
        }}
      >
        {name}
      </Text>
    </Link>
  )
}

const RecentProjects: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()

  const { preference: recentProjects = [] } = usePreferenceStore<SavedProjectDetails[]>(
    PreferenceScope.ACCOUNT,
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
    <Layout.Vertical className={css.container}>
      <Container className={css.header}>
        <Text color={Color.GREY_800} font={{ variation: FontVariation.CARD_TITLE }}>
          {getString('common.recents')}
        </Text>
      </Container>
      <Container padding={{ top: 'small' }}>
        <RecentProjects />
      </Container>

      {/* we will uncomment the below code along with favorites chanhges */}
      {/* <Tabs
        className={css.tabs}
        id="preferenceCardTabs"
        tabList={[
          { id: 'recents', title: getString('common.recents'), panel: <RecentProjects /> },
          { id: 'favorites', title: getString('common.favorites'), panel: <Favorites /> }
        ]}
      /> */}
    </Layout.Vertical>
  )
}

export default PreferencesCard
