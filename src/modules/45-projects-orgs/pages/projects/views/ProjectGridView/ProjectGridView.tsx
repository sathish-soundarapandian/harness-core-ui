/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Pagination } from '@harness/uicore'
import type { Project, ProjectAggregateDTO, ResponsePageProjectAggregateDTO } from 'services/cd-ng'
import ProjectCard from '@projects-orgs/components/ProjectCard/ProjectCard'
import css from './ProjectGridView.module.scss'

interface ProjectGridViewProps {
  data: ResponsePageProjectAggregateDTO | null
  showEditProject?: (project: Project) => void
  collaborators?: (project: Project) => void
  reloadPage: () => Promise<void>
  gotoPage: (index: number) => void
}

const ProjectGridView: React.FC<ProjectGridViewProps> = props => {
  const { data, showEditProject, collaborators, reloadPage, gotoPage } = props

  return (
    <>
      <Container className={css.masonry}>
        <Layout.Masonry
          center
          gutter={25}
          items={data?.data?.content || []}
          renderItem={(projectDTO: ProjectAggregateDTO) => (
            <ProjectCard
              data={projectDTO}
              reloadProjects={reloadPage}
              editProject={showEditProject}
              handleInviteCollaborators={collaborators}
            />
          )}
          keyOf={(projectDTO: ProjectAggregateDTO) =>
            projectDTO.projectResponse.project.identifier + projectDTO.projectResponse.project.orgIdentifier
          }
        />
      </Container>
      <Container className={css.pagination}>
        <Pagination
          itemCount={data?.data?.totalItems || 0}
          pageSize={data?.data?.pageSize || 10}
          pageCount={data?.data?.totalPages || 0}
          pageIndex={data?.data?.pageIndex || 0}
          gotoPage={gotoPage}
        />
      </Container>
    </>
  )
}

export default ProjectGridView
