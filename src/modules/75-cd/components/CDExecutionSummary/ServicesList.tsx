/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'

import { Popover, Position } from '@blueprintjs/core'
import { Icon, Text } from '@harness/uicore'

import cx from 'classnames'

import { String } from 'framework/strings'
import type { ServiceExecutionSummary } from 'services/cd-ng'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { getIdentifierFromScopedRef } from '@common/utils/utils'
import routes from '@common/RouteDefinitions'

import { Scope } from '@common/interfaces/SecretsInterface'
import type { ProjectPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'

import { ServicePopoverCard } from '../ServicePopoverCard/ServicePopoverCard'
import { ServicesTable } from './ServicesTable'
import css from './CDExecutionSummary.module.scss'

interface ServicesListProps {
  services: ServiceExecutionSummary[]
  className?: string
  limit: number
}

export function ServicesList({ services, limit = 2, className }: ServicesListProps): React.ReactElement {
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()

  return (
    <div className={cx(css.main, className)}>
      <Icon name="services" className={css.servicesIcon} size={18} />
      <div className={css.servicesList}>
        {services.slice(0, limit).map(service => {
          const { identifier } = service
          const serviceScope = getScopeFromValue(defaultTo(identifier, ''))

          return (
            <Popover
              key={identifier}
              wrapperTagName="div"
              targetTagName="div"
              interactionKind="hover"
              position={Position.BOTTOM_RIGHT}
              className={css.serviceWrapper}
            >
              <Text className={css.serviceName} lineClamp={1} color="grey800">
                <Link
                  to={`${routes.toServiceStudio({
                    accountId,
                    ...(serviceScope != Scope.ACCOUNT && { orgIdentifier: orgIdentifier }),
                    ...(serviceScope === Scope.PROJECT && { projectIdentifier: projectIdentifier }),
                    serviceId: getIdentifierFromScopedRef(defaultTo(identifier, '')),
                    module
                  })}`}
                >
                  {service.displayName}
                </Link>
              </Text>
              <ServicePopoverCard service={service} />
            </Popover>
          )
        })}
        {services.length > limit ? (
          <Popover
            wrapperTagName="div"
            targetTagName="div"
            interactionKind="hover"
            position={Position.BOTTOM_RIGHT}
            className={css.serviceWrapper}
          >
            <String
              tagName="div"
              className={cx(css.serviceName, css.count)}
              stringID={'common.plusNumberNoSpace'}
              vars={{ number: Math.abs(services.length - limit) }}
            />
            <ServicesTable services={services.slice(limit)} />
          </Popover>
        ) : null}
      </div>
    </div>
  )
}
