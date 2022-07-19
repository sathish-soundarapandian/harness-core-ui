/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { HTMLTable, Popover, Position } from '@blueprintjs/core'
import { Icon, IconName, Layout, Text } from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { String, useStrings } from 'framework/strings'
import type { ServiceDeploymentInfo } from 'services/cd-ng'
import css from './ServiceExecutionsCard.module.scss'

export enum DashboardSelected {
  OVERVIEW = 'overviewPage',
  SERVICEDETAIL = 'serviceDetail'
}
interface ListProps {
  listName: string[]
  className?: string
  limit?: number
  iconName: IconName
  iconClass?: string
}

export interface ServiceExecutionsCardProps {
  envIdentifiers?: string[]
  serviceIdentifiers?: ServiceDeploymentInfo[]
  caller: string
}
export interface ServicePopoveCardProps {
  service: ServiceDeploymentInfo
}

interface ServicesTableProps {
  services: ServiceDeploymentInfo[]
}

export interface ServicesListProps {
  services: ServiceDeploymentInfo[]
  className?: string
  limit?: number
}

export function ServicePopoverCard(props: ServicePopoveCardProps): React.ReactElement {
  const { service } = props
  const { getString } = useStrings()

  return (
    <div className={css.mainPopover}>
      <String tagName="div" className={css.titlePopover} stringID="pipeline.artifactTriggerConfigPanel.artifact" />
      {service.serviceTag ? (
        <>
          {!!service.image && (
            <Text color="grey800" font={'small'}>
              {getString('imageLabel')}: {service.image}
            </Text>
          )}
          {!!service.serviceTag && (
            <Text color="grey800" font={'small'}>
              {getString('common.artifactTag')}: {service.serviceTag}
            </Text>
          )}
        </>
      ) : (
        <String tagName="div" stringID="noArtifact" />
      )}
    </div>
  )
}

/* istanbul ignore next */
function ServicesTable({ services }: ServicesTableProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <HTMLTable small className={css.table}>
      <thead>
        <tr>
          <th>{getString('service')}</th>
          <th>{getString('pipeline.artifactTriggerConfigPanel.artifact')}</th>
          <th>{getString('imageLabel')}</th>
        </tr>
      </thead>
      <tbody>
        {services?.map((service, i) => (
          <tr key={`${service.serviceName}-${i}`}>
            <td>{service.serviceName}</td>
            <td>{service.serviceTag ? getString('artifactDisplay', { tag: service.serviceTag }) : '-'} </td>
            <td>{service.image ? getString('pipeline.imageTag', { image: service.image }) : '-'}</td>
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  )
}

function ServicesList({ services, limit = 2, className }: ServicesListProps): React.ReactElement {
  return (
    <div className={css.main}>
      <Icon name="services" className={css.servicesIcon} size={18} />
      <div className={className}>
        {services.slice(0, limit).map(service => {
          const { serviceName } = service
          return (
            <Popover
              key={serviceName}
              wrapperTagName="div"
              targetTagName="div"
              interactionKind="hover"
              position={Position.BOTTOM_RIGHT}
              className={css.serviceWrapper}
            >
              <div className={css.serviceName}>{serviceName}</div>
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
            modifiers={{ preventOverflow: { escapeWithReference: true } }}
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

function EnvList({ listName, limit = 2, className, iconName, iconClass }: ListProps): React.ReactElement {
  const visibleList = listName.slice(0, limit).join(', ')
  return (
    <div className={css.main}>
      {listName.length > 0 ? (
        <>
          <div className={className}>
            <Icon name={iconName} className={iconClass} size={14} />
            <Text>{visibleList}</Text>
          </div>
          {listName.length > limit ? (
            <>
              ,&nbsp;
              <Popover
                wrapperTagName="div"
                targetTagName="div"
                interactionKind="hover"
                position={Position.RIGHT}
                className={css.serviceWrapper}
              >
                <String
                  tagName="div"
                  className={cx(css.serviceName, css.count)}
                  stringID={'common.plusNumberNoSpace'}
                  vars={{ number: Math.abs(listName.length - limit) }}
                />
                <Layout.Vertical padding="small">
                  {listName.slice(limit).map((name, index) => (
                    <Text font={{ variation: FontVariation.FORM_LABEL }} key={index}>
                      {name}
                    </Text>
                  ))}
                </Layout.Vertical>
              </Popover>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export function ServiceExecutionsCard(data: ServiceExecutionsCardProps): React.ReactElement {
  let serviceIdentifiers: ServiceDeploymentInfo[] = defaultTo(data?.serviceIdentifiers as ServiceDeploymentInfo[], [])
  let envIdentifiers: string[] = defaultTo(data?.envIdentifiers as string[], [])

  serviceIdentifiers = [...new Set(serviceIdentifiers.filter(item => !!item))]
  envIdentifiers = [...new Set(envIdentifiers.filter(item => !!item))]

  const limit = data.caller === DashboardSelected.OVERVIEW ? 2 : 3
  return (
    <Layout.Horizontal spacing="medium" className={css.moduleData}>
      <Icon name="cd-main" size={20} className={css.moduleIcon} />
      <div className={css.cardSummary}>
        <String
          tagName="div"
          className={css.heading}
          stringID={'pipeline.executionList.servicesDeployedText'}
          vars={{ size: serviceIdentifiers.length }}
        />
        <ServicesList className={css.services} services={serviceIdentifiers} limit={limit} />
      </div>
      <div className={css.cardSummary}>
        <String
          tagName="div"
          className={css.heading}
          stringID="pipeline.executionList.EnvironmentsText"
          vars={{ size: envIdentifiers.length }}
        />
        <EnvList
          className={css.environments}
          listName={envIdentifiers}
          limit={limit}
          iconClass={css.envIcon}
          iconName={'environments'}
        />
      </div>
    </Layout.Horizontal>
  )
}
