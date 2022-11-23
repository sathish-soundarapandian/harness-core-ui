/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Position, PopoverInteractionKind, Classes } from '@blueprintjs/core'
import { useParams, useHistory } from 'react-router-dom'
import cx from 'classnames'
import {
  Text,
  Layout,
  Container,
  Popover,
  Pagination,
  Button,
  ButtonVariation,
  ExpandingSearchInput,
  NoDataCard,
  GridListToggle,
  Views,
  TableV2
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { Column } from 'react-table'
import {
  RenderColumnProject,
  RenderColumnOrganization
} from '@projects-orgs/pages/projects/views/ProjectListView/ProjectListView'
import routes from '@common/RouteDefinitions'
import { Project, ProjectAggregateDTO, useGetProjectAggregateDTOList } from 'services/cd-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import ProjectCard from '@projects-orgs/components/ProjectCard/ProjectCard'
import { PageSpinner } from '@common/components'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import pointerImage from './pointer.svg'
import css from './ProjectSelector.module.scss'

export interface ProjectSelectorProps {
  onSelect: (project: Project) => void
  moduleFilter?: Required<Project>['modules'][0]
}

const ProjectSelect: React.FC<ProjectSelectorProps> = ({ onSelect }) => {
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  const { selectedProject } = useAppStore()
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState<string>()
  const { preference: savedProjectView, setPreference: setSavedProjectView } = usePreferenceStore<Views | undefined>(
    PreferenceScope.MACHINE,
    'projectSelectorViewType'
  )
  const [projectView, setProjectView] = useState<Views>(savedProjectView || Views.GRID)
  const { getString } = useStrings()

  const { data, loading } = useGetProjectAggregateDTOList({
    queryParams: {
      accountIdentifier: accountId,
      searchTerm,
      pageIndex: page,
      pageSize: 50
    },
    debounce: 300
  })

  const columns: Column<ProjectAggregateDTO>[] = useMemo(
    () => [
      {
        Header: getString('projectLabel'),
        id: 'name',
        accessor: row => row.projectResponse.project.name,
        width: '60%',
        Cell: RenderColumnProject
      },
      {
        Header: getString('orgLabel'),
        id: 'orgName',
        accessor: row => row.projectResponse.project.orgIdentifier,
        width: '40%',
        Cell: RenderColumnOrganization
      }
    ],
    []
  )

  return (
    <Popover
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.RIGHT}
      modifiers={{ offset: { offset: -50 } }}
      hasBackdrop={true}
      lazy={true}
      minimal
      fill={true}
      popoverClassName={css.popover}
    >
      {selectedProject ? (
        <Button
          minimal
          withoutBoxShadow={true}
          icon="double-chevron-right"
          tooltipProps={{
            isDark: true,
            usePortal: true,
            fill: true
          }}
          tooltip={
            <Text padding="small" color={Color.WHITE}>
              {getString('selectProject')}
            </Text>
          }
          data-testid="project-select-dropdown"
          className={css.popoverTarget}
          aria-label={getString('selectProject')}
        />
      ) : (
        <Button
          minimal
          text={
            <Text color={Color.GREY_400} font={{ size: 'normal' }} padding="xsmall">
              {getString('selectProject')}
            </Text>
          }
          rightIcon="chevron-right"
          data-testid="project-select-button"
          className={cx(css.popoverTarget, css.selectButton)}
        />
      )}

      <Container width={600} padding="xlarge" className={css.selectContainer}>
        <Layout.Horizontal flex padding={{ bottom: 'large' }}>
          <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
            {getString('selectProject')}
          </Text>
          <Button
            variation={ButtonVariation.LINK}
            text={getString('projectsOrgs.viewAllProjects')}
            onClick={() => history.push(routes.toProjects({ accountId }))}
          />
        </Layout.Horizontal>
        <Layout.Horizontal>
          <ExpandingSearchInput
            defaultValue={searchTerm}
            placeholder={getString('projectsOrgs.searchProjectPlaceHolder')}
            alwaysExpanded
            autoFocus={true}
            className={css.projectSearch}
            onChange={text => {
              setSearchTerm(text.trim())
              setPage(0)
            }}
          />
          <GridListToggle
            initialSelectedView={projectView}
            onViewToggle={view => {
              setProjectView(view)
              setSavedProjectView(view)
            }}
          />
        </Layout.Horizontal>
        {loading && <PageSpinner />}
        {data?.data?.content?.length ? (
          <>
            {projectView === Views.GRID ? (
              <Layout.Vertical className={css.projectContainerWrapper}>
                <div className={css.projectContainer}>
                  {data.data.content.map(projectAggregate => (
                    <ProjectCard
                      key={projectAggregate.projectResponse.project.identifier}
                      data={projectAggregate}
                      minimal={true}
                      selected={projectAggregate.projectResponse.project.identifier === selectedProject?.identifier}
                      className={cx(css.projectCard, Classes.POPOVER_DISMISS)}
                      onClick={() => {
                        onSelect(projectAggregate.projectResponse.project)
                      }}
                    />
                  ))}
                </div>
                <Pagination
                  className={css.pagination}
                  itemCount={data?.data?.totalItems || 0}
                  pageSize={data?.data?.pageSize || 10}
                  pageCount={data?.data?.totalPages || 0}
                  pageIndex={data?.data?.pageIndex || 0}
                  gotoPage={pageNumber => setPage(pageNumber)}
                  hidePageNumbers
                />
              </Layout.Vertical>
            ) : null}
            {projectView === Views.LIST ? (
              <div className={css.projectContainerWrapper}>
                <TableV2<ProjectAggregateDTO>
                  columns={columns}
                  name="ProjectListView"
                  getRowClassName={_row => Classes.POPOVER_DISMISS}
                  data={data?.data?.content || []}
                  onRowClick={projectAggregate => {
                    onSelect(projectAggregate.projectResponse.project)
                  }}
                  pagination={{
                    itemCount: data?.data?.totalItems || 0,
                    pageSize: data?.data?.pageSize || 10,
                    pageCount: data?.data?.totalPages || 0,
                    pageIndex: data?.data?.pageIndex || 0,
                    gotoPage: pageNumber => setPage(pageNumber),
                    hidePageNumbers: true
                  }}
                />
              </div>
            ) : null}
          </>
        ) : !loading ? (
          <NoDataCard icon="nav-project" message={getString('noProjects')} />
        ) : null}
      </Container>
    </Popover>
  )
}
export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ onSelect, moduleFilter }) => {
  const { selectedProject, updateAppStore } = useAppStore()
  const { getString } = useStrings()

  useEffect(() => {
    // deselect current project if user switches module
    // and the new module isn't added on selected project
    if (moduleFilter && !selectedProject?.modules?.includes(moduleFilter)) {
      updateAppStore({ selectedProject: undefined })
    }
  }, [moduleFilter])

  return (
    <>
      <Layout.Vertical padding={{ left: 'large', right: 'large', top: 'large', bottom: 'small' }}>
        <Text margin={{ bottom: 'xsmall' }} font={{ size: 'small' }} color={Color.GREY_500}>
          {getString('projectLabel')}
        </Text>
        <div className={cx(css.projectSelector, { [css.selectProjectDisplay]: !selectedProject })}>
          {selectedProject && (
            <Text color={Color.WHITE} padding="xsmall" className={css.projectText}>
              {selectedProject.name}
            </Text>
          )}
          <ProjectSelect onSelect={onSelect} />
        </div>
      </Layout.Vertical>

      {selectedProject ? null : (
        <div style={{ backgroundImage: `url(${pointerImage})` }} className={css.pickProjectHelp}>
          <Text color={Color.GREY_200} padding="small">
            {getString('pickProject')}
          </Text>
        </div>
      )}
    </>
  )
}
