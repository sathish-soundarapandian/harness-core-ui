/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { HTMLTable, Popover, Position } from '@blueprintjs/core'
import { Icon, Layout, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { defaultTo, uniqBy } from 'lodash-es'
import { String, useStrings } from 'framework/strings'
import type { EnvironmentDeploymentsInfo, InfrastructureInfo, ServiceDeploymentInfo } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from './ServiceExecutionsCard.module.scss'

export enum DashboardSelected {
  OVERVIEW = 'overviewPage',
  SERVICEDETAIL = 'serviceDetail'
}

enum EnvironmentDetailsTab {
  CONFIGURATION = 'CONFIGURATION'
}

interface ListProps {
  listName: string[]
  className?: string
  limit?: number
  caller: string
}

interface EnvListProp {
  envIdentifiers: EnvironmentDeploymentsInfo[]
  limit: number
}

export interface ServiceExecutionsCardProps {
  envIdentifiers?: EnvironmentDeploymentsInfo[]
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
      <Icon name="services" className={css.icon} size={18} />
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

function InfraList({ listName, limit = 2, className, caller }: ListProps): React.ReactElement {
  const visibleList = listName.slice(0, limit).join(', ')
  return (
    <div className={css.main}>
      {listName.length > 0 ? (
        <>
          <div className={className}>
            {caller == DashboardSelected.OVERVIEW && <Icon name={'environments'} className={css.icon} size={14} />}
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
                    <Text className={css.envTextPopover} key={index}>
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

function EnvList({ envIdentifiers, limit = 2 }: EnvListProp): React.ReactElement {
  const countOfEnv = envIdentifiers.length

  const filterInfra = (infra: InfrastructureInfo[]): string[] => {
    infra = uniqBy(infra, infras => infras.infrastructureIdentifier)
    const listName = defaultTo(infra?.map(infras => infras.infrastructureName) as string[], [])
    return listName
  }

  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()

  function goToEnvDetail(envId: string): void {
    if (envId) {
      const route = routes.toEnvironmentDetails({
        accountId,
        orgIdentifier,
        projectIdentifier,
        module,
        environmentIdentifier: envId,
        sectionId: EnvironmentDetailsTab.CONFIGURATION
      })
      window.open(`#${route}`)
    }
  }

  const infraOnPopover = (list: EnvironmentDeploymentsInfo): string => {
    const listName = filterInfra(defaultTo(list.infrastructureDetails, []))
    const countOfInfra = listName.length
    const limitInfra = 5
    const remainCount = countOfInfra - limitInfra
    const remainString = remainCount > 0 ? `, +${remainCount}` : ''
    const visibleList = listName.slice(0, limitInfra).join(', ')
    return remainCount ? visibleList.concat(remainString) : visibleList
  }

  const checkInfraNotNull = (infraList: InfrastructureInfo[]): boolean => {
    return infraList.filter(infra => infra.infrastructureName !== null).length !== 0
  }

  let curCount = false
  return (
    <Layout.Horizontal>
      {envIdentifiers.map((item, idx) =>
        item.envName && idx < limit ? (
          <Layout.Horizontal
            key={item.envId}
            onClick={e => {
              e.stopPropagation()
              goToEnvDetail(defaultTo(item.envId, ''))
            }}
          >
            <Text className={css.envNameText} key={item.envId}>
              {item.envName}
            </Text>
            {checkInfraNotNull(defaultTo(item.infrastructureDetails, [])) ? (
              <>
                <Text className={css.envNameText}>&nbsp;{'('}</Text>
                <InfraList
                  key={item.envId}
                  className={css.environments}
                  listName={filterInfra(defaultTo(item.infrastructureDetails, []))}
                  limit={limit}
                  caller={DashboardSelected.SERVICEDETAIL}
                />
                <Text className={css.envNameText}>{`)`}</Text>
              </>
            ) : null}
            <Text className={css.envNameText}>{idx !== countOfEnv - 1 ? ',' : ''}</Text>
          </Layout.Horizontal>
        ) : (
          (curCount = true)
        )
      )}
      {curCount && (
        <Popover
          wrapperTagName="div"
          targetTagName="div"
          interactionKind="hover"
          position={Position.RIGHT}
          className={css.serviceWrapper}
        >
          <String
            tagName="div"
            className={css.envListPlus}
            stringID={'common.plusNumberNoSpace'}
            vars={{ number: Math.abs(countOfEnv - limit) }}
          />
          <Layout.Vertical padding="small">
            {envIdentifiers.map(
              (name, index) =>
                index >= limit && (
                  <Layout.Vertical key={name.envId}>
                    {checkInfraNotNull(defaultTo(name.infrastructureDetails, [])) ? (
                      <Text className={css.envTextPopover} key={name.envId}>{`${name.envName} (${infraOnPopover(
                        name
                      )})`}</Text>
                    ) : (
                      <Text className={css.envTextPopover} key={name.envId}>
                        {name.envName}
                      </Text>
                    )}
                  </Layout.Vertical>
                )
            )}
          </Layout.Vertical>
        </Popover>
      )}
    </Layout.Horizontal>
  )
}

export function ServiceExecutionsCard(data: ServiceExecutionsCardProps): React.ReactElement {
  let serviceIdentifiers: ServiceDeploymentInfo[] = defaultTo(data?.serviceIdentifiers as ServiceDeploymentInfo[], [])
  let envIdentifiers: EnvironmentDeploymentsInfo[] = defaultTo(data?.envIdentifiers as EnvironmentDeploymentsInfo[], [])

  serviceIdentifiers = [...new Set(serviceIdentifiers.filter(item => !!item))]
  envIdentifiers = envIdentifiers.filter(item => !!item.envId)
  envIdentifiers = uniqBy(envIdentifiers, env => env.envId)

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
        {data.caller === DashboardSelected.OVERVIEW ? (
          <InfraList
            className={css.envListOverview}
            listName={defaultTo(envIdentifiers.map(item => item.envName) as string[], [])}
            limit={limit}
            caller={data.caller}
          />
        ) : (
          <Layout.Horizontal>
            {envIdentifiers.length ? <Icon name={'environments'} className={css.icon} size={14} /> : null}
            <EnvList envIdentifiers={envIdentifiers} limit={limit - 1} />
          </Layout.Horizontal>
        )}
      </div>
    </Layout.Horizontal>
  )
}
