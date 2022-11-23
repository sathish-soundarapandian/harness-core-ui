/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Text, Layout, Card, Icon, Container, Tag, PageError } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetUserProjectInfo } from 'services/cd-ng'
import css from './UserSummary.module.scss'

const MyProjectsList: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  const {
    data: projects,
    loading,
    error,
    refetch
  } = useGetUserProjectInfo({
    queryParams: {
      accountId,
      pageIndex: 0,
      pageSize: 6
    }
  })

  return (
    <Layout.Vertical spacing="large" margin={{ bottom: 'medium' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'start' }} spacing="medium">
        <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_900}>
          {getString('userProfile.myProjects')}
        </Text>
        {projects?.data?.totalItems ? <Tag className={css.tagClassName}>{projects.data.totalItems}</Tag> : null}
      </Layout.Horizontal>
      {loading ? (
        <Text color={Color.GREY_600}>{getString('common.loading')}</Text>
      ) : projects?.data?.content?.length ? (
        <Container className={css.cardContainer}>
          {projects.data.content.map(project => {
            return (
              <Card key={`${project.identifier}-${project.orgIdentifier}`} className={css.card}>
                <Layout.Vertical flex={{ align: 'center-center' }}>
                  <Icon
                    name="nav-project"
                    size={32}
                    style={{ color: project.color }}
                    color={project.color}
                    margin={{ top: 'xsmall', bottom: 'medium' }}
                  />
                  <Text
                    width={100}
                    lineClamp={3}
                    color={Color.GREY_800}
                    font={{ size: 'small', align: 'center', weight: 'semi-bold' }}
                    className={css.name}
                  >
                    {project.name}
                  </Text>
                </Layout.Vertical>
              </Card>
            )
          })}
          {Number(projects.data.totalItems) > Number(projects.data.content.length) && (
            <Text flex={{ alignItems: 'center' }}>
              {getString('more', {
                number: Number(projects.data.totalItems) - Number(projects.data.content.length)
              })}
            </Text>
          )}
        </Container>
      ) : projects?.data?.content ? (
        <Text color={Color.GREY_700}>{getString('noProjects')}</Text>
      ) : (
        <PageError message={(error?.data as Error)?.message || error?.message} onClick={() => refetch()} />
      )}
    </Layout.Vertical>
  )
}

export default MyProjectsList
