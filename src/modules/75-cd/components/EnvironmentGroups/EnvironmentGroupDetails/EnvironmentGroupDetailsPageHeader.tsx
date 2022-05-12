/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty } from 'lodash-es'
import { Position } from '@blueprintjs/core'
import moment from 'moment'

import { Container, Heading, Layout, TagsPopover, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { EnvironmentGroupResponseDTO } from 'services/cd-ng'

import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import type { EnvironmentGroupPathProps, ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import css from '../EnvironmentGroups.module.scss'

export function PageHeaderTitle({ name, identifier, description, tags }: Partial<EnvironmentGroupResponseDTO>) {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<
    ProjectPathProps & ModulePathParams & EnvironmentGroupPathProps
  >()
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing={'small'}>
      <Layout.Horizontal margin={{ bottom: 'xsmall' }}>
        <NGBreadcrumbs
          links={[
            {
              url: routes.toEnvironmentGroups({ accountId, orgIdentifier, projectIdentifier, module }),
              label: getString('common.environmentGroups.label')
            }
          ]}
        />
      </Layout.Horizontal>
      <Container>
        <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'small'}>
          <Heading level={2} margin={{ bottom: 'xsmall' }}>
            {name}
          </Heading>
          {!isEmpty(tags) && (
            <TagsPopover
              className={css.tagsPopover}
              iconProps={{ size: 14, color: Color.GREY_600 }}
              tags={defaultTo(tags, {})}
              popoverProps={{
                position: Position.RIGHT
              }}
            />
          )}
        </Layout.Horizontal>
        <Text font={{ size: 'small' }} inline>
          {getString('common.ID')}: {identifier}
        </Text>
      </Container>
      {description && (
        <Text font={{ size: 'small' }} margin={{ top: 'large' }}>
          {description}
        </Text>
      )}
    </Layout.Vertical>
  )
}

export function PageHeaderToolbar({ createdAt, lastModifiedAt }: { createdAt?: number; lastModifiedAt?: number }) {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing={'medium'}>
      <Text font={{ size: 'xsmall' }}>
        {getString('created').toUpperCase()}:{' '}
        <Text font={{ size: 'small' }} color={Color.BLACK} inline>
          {moment(createdAt).format('MMM DD, YYYY hh:mm a')}
        </Text>
      </Text>
      <Text font={{ size: 'xsmall' }}>|</Text>
      <Text font={{ size: 'xsmall' }}>
        {getString('common.lastModifiedTime').toUpperCase()}:{' '}
        <Text font={{ size: 'small' }} color={Color.BLACK} inline>
          {moment(lastModifiedAt).format('MMM DD, YYYY hh:mm a')}
        </Text>
      </Text>
    </Layout.Horizontal>
  )
}
