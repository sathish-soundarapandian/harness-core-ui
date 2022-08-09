/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { HTMLTable, Popover, Position } from '@blueprintjs/core'
import { Icon, Layout, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
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
enum ServiceArtifacts {
  SERVICEARTIFACT = 'serviceArtifact'
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
  service: string[]
}

interface ServicesProps {
  services: ServiceDeploymentInfo[]
}

interface ServiceTableProps {
  services: string[][]
  serviceMap: Map<string, string>
}

export interface ServicesListProps {
  services: ServiceDeploymentInfo[]
  className?: string
  limit?: number
}

export function ServicePopoverCard(props: ServicePopoveCardProps): React.ReactElement {
  const { service } = props

  return (
    <div className={css.mainPopover}>
      <String tagName="div" className={css.titlePopover} stringID="pipeline.artifactImageTag" />
      {service && service.length ? (
        <Layout.Vertical>
          {service.map(item => (
            <Text color="grey800" font={'small'} key={item[1]}>
              {item[0]}
            </Text>
          ))}
        </Layout.Vertical>
      ) : (
        <String tagName="div" stringID="noArtifact" />
      )}
    </div>
  )
}

/* istanbul ignore next */
function ServicesTable({ services, serviceMap }: ServiceTableProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <HTMLTable small className={css.table}>
      <thead>
        <tr>
          <th>{getString('service')}</th>
          <th>{getString('pipeline.artifactTriggerConfigPanel.artifact')}</th>
        </tr>
      </thead>
      <tbody>
        {services?.map(service => (
          <tr key={service[1]}>
            <td>{service[0]}</td>
            <td>{defaultTo(serviceMap.get(service[1])?.[0][0], '')}</td>
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  )
}

//sonar recommendation
const ImageTagString = (image?: string, tag?: string) => {
  const serviceImage = image ? image : ' - '
  const serviceTag = tag ? tag : ' - '
  return `${serviceImage}: ${serviceTag}`
}

function ServicesList({ services, limit = 2, className }: ServicesListProps): React.ReactElement {
  const serviceMap = new Map()
  services.forEach(
    item =>
      item.serviceId &&
      !(!item.image && !item.serviceTag) &&
      (serviceMap.has(item.serviceId)
        ? serviceMap.get(item.serviceId).push([ImageTagString(item.image, item.serviceTag), item.serviceId])
        : serviceMap.set(item.serviceId, [[ImageTagString(item.image, item.serviceTag), item.serviceId]]))
  )

  const uniqList = uniqBy(services, item => item.serviceId)
  const keyList = uniqList.map(item => [item.serviceName, item.serviceId])

  return (
    <div className={css.main}>
      <Icon name="services" className={css.icon} size={18} />
      <div className={className}>
        {keyList.slice(0, limit).map(item => {
          const service = serviceMap.get(item[1]) as string[]
          return (
            <Popover
              key={item[1]}
              wrapperTagName="div"
              targetTagName="div"
              interactionKind="hover"
              position={Position.BOTTOM_RIGHT}
              className={css.serviceWrapper}
            >
              <div className={css.serviceName}>{item[0]}</div>
              <ServicePopoverCard service={service} />
            </Popover>
          )
        })}
        {keyList && keyList.length > limit ? (
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
              vars={{ number: Math.abs(keyList.length - limit) }}
            />
            <ServicesTable services={keyList.slice(limit) as string[][]} serviceMap={serviceMap} />
          </Popover>
        ) : null}
      </div>
    </div>
  )
}

function ServiceArtifact({ services }: ServicesProps): React.ReactElement {
  const serviceArtifactList: string[] = []
  const serviceName = services[0].serviceName
  services.forEach(
    item =>
      item.serviceName &&
      !(!item.image && !item.serviceTag) &&
      serviceArtifactList.push(ImageTagString(item.image, item.serviceTag))
  )

  //here we will only have one serviceName and all the image/tags will be mapped to it
  const values = [...new Set(serviceArtifactList)]
  if (services.length === 0) return <></>

  return (
    <Layout.Horizontal>
      <Icon name={'services'} className={css.icon} size={18} />
      <Text
        color={Color.PRIMARY_7}
        font={{ size: 'small', weight: 'semi-bold' }}
        margin={{ left: 'xsmall' }}
        style={{ maxWidth: values.length ? 'var(--spacing-13)' : 'var(--spacing-14)' }}
        lineClamp={1}
      >
        {serviceName}
      </Text>
      {values.length ? (
        <>
          <Text color={Color.PRIMARY_7} font={{ size: 'small', weight: 'semi-bold' }} margin={{ left: 'xsmall' }}>
            &nbsp;{'('}
          </Text>
          <InfraList
            className={css.environments}
            listName={values}
            limit={1}
            caller={ServiceArtifacts.SERVICEARTIFACT}
          />
          <Text
            color={Color.PRIMARY_7}
            font={{ size: 'small', weight: 'semi-bold' }}
            margin={{ left: 'xsmall' }}
          >{`)`}</Text>
        </>
      ) : null}
    </Layout.Horizontal>
  )
}

function InfraList({ listName, limit = 2, className, caller }: ListProps): React.ReactElement {
  const visibleList = listName.slice(0, limit)
  const lenListName = visibleList.length
  return (
    <div className={css.main}>
      {listName.length > 0 ? (
        <>
          <div className={className}>
            {caller == DashboardSelected.OVERVIEW && <Icon name={'environments'} className={css.icon} size={14} />}
            {visibleList.map((cur, idx) => (
              <Layout.Horizontal key={cur}>
                <Text lineClamp={1} style={{ maxWidth: caller !== ServiceArtifacts.SERVICEARTIFACT ? 90 : '' }}>
                  {cur}
                </Text>
                {idx < lenListName - 1 ? <Text>{`,`}&nbsp;</Text> : null}
              </Layout.Horizontal>
            ))}
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
                    <Text color={Color.GREY_800} font={{ size: 'small' }} key={index}>
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
    const filteredInfra = uniqBy(infra, infras => infras.infrastructureIdentifier)
    const listName = defaultTo(filteredInfra?.map(infras => infras.infrastructureName) as string[], [])
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

  const visibleEnv = envIdentifiers.slice(0, limit)

  const curCount = countOfEnv - limit > 0
  return (
    <Layout.Horizontal>
      {visibleEnv.map((item, idx) =>
        item.envName ? (
          <Layout.Horizontal
            key={item.envId}
            onClick={e => {
              e.stopPropagation()
              goToEnvDetail(defaultTo(item.envId, ''))
            }}
          >
            <Text
              color={Color.PRIMARY_7}
              font={{ size: 'small', weight: 'semi-bold' }}
              margin={{ left: 'xsmall' }}
              style={{ maxWidth: 'var(--spacing-13)' }}
              key={item.envId}
              lineClamp={1}
            >
              {item.envName}
            </Text>
            {checkInfraNotNull(defaultTo(item.infrastructureDetails, [])) ? (
              <>
                <Text color={Color.PRIMARY_7} font={{ size: 'small', weight: 'semi-bold' }} margin={{ left: 'xsmall' }}>
                  &nbsp;{'('}
                </Text>
                <InfraList
                  key={item.envId}
                  className={css.environments}
                  listName={filterInfra(defaultTo(item.infrastructureDetails, []))}
                  limit={limit}
                  caller={DashboardSelected.SERVICEDETAIL}
                />
                <Text
                  color={Color.PRIMARY_7}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  margin={{ left: 'xsmall' }}
                >{`)`}</Text>
              </>
            ) : null}
            <Text color={Color.PRIMARY_7} font={{ size: 'small', weight: 'semi-bold' }} margin={{ left: 'xsmall' }}>
              {idx !== countOfEnv - 1 ? ',' : ''}
            </Text>
          </Layout.Horizontal>
        ) : null
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
            {envIdentifiers.slice(limit).map(name => (
              <Layout.Vertical key={name.envId}>
                {checkInfraNotNull(defaultTo(name.infrastructureDetails, [])) ? (
                  <Text color={Color.GREY_800} font={{ size: 'small' }} key={name.envId}>{`${
                    name.envName
                  } (${infraOnPopover(name)})`}</Text>
                ) : (
                  <Text color={Color.GREY_800} font={{ size: 'small' }} key={name.envId}>
                    {name.envName}
                  </Text>
                )}
              </Layout.Vertical>
            ))}
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
        <String tagName="div" className={css.heading} stringID={'pipeline.executionList.servicesDeployed'} />
        {data.caller === DashboardSelected.OVERVIEW ? (
          <ServicesList className={css.services} services={serviceIdentifiers} limit={limit} />
        ) : (
          <ServiceArtifact services={serviceIdentifiers} />
        )}
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
