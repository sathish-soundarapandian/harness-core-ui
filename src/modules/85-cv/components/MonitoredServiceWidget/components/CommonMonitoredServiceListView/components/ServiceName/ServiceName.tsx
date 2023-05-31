/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Row } from 'react-table'
import { Text, Layout, TagsPopover } from '@harness/uicore'
import { Classes } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import routes from '@common/RouteDefinitions'
import type { Module, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { MonitoredServiceListItemDTO } from 'services/cv'
import { EnvironmentToolTipDisplay } from '@cv/components/HarnessServiceAndEnvironment/components/EnvironmentToolTipDisplay'
import css from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.module.scss'

interface ServiceNameProps {
  row: Row<MonitoredServiceListItemDTO>
  module?: Module
}
export default function ServiceName(props: ServiceNameProps): JSX.Element {
  const { row, module } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { identifier, serviceName, tags = {}, environmentRefList, type, environmentRef } = row.original || {}
  const envRefList = environmentRefList

  const moduleLevelProjectParams = {
    orgIdentifier,
    projectIdentifier,
    accountId,
    ...(module && { module })
  }
  return (
    <Layout.Vertical>
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-start', justifyContent: 'start' }}>
        <Link
          to={routes.toMonitoredServicesConfigurations({
            ...moduleLevelProjectParams,
            identifier
          })}
          className={css.monitoredServiceLink}
        >
          <Text
            color={Color.PRIMARY_7}
            className={css.monitoredServiceName}
            title={serviceName}
            font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
            tooltip={serviceName}
          >
            {serviceName}
          </Text>
        </Link>
        {!isEmpty(tags) ? (
          <TagsPopover
            tags={tags}
            iconProps={{ size: 12, color: Color.GREY_600 }}
            popoverProps={{ className: Classes.DARK }}
            className={css.tags}
          />
        ) : null}
      </Layout.Horizontal>
      <Link
        to={routes.toMonitoredServicesConfigurations({
          ...moduleLevelProjectParams,
          identifier
        })}
      >
        <EnvironmentToolTipDisplay
          type={type}
          color={Color.PRIMARY_7}
          font={{ align: 'left', size: 'xsmall' }}
          envRefList={envRefList}
          environmentRef={environmentRef}
        />
      </Link>
    </Layout.Vertical>
  )
}
