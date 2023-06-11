/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Classes, Drawer, Menu, MenuItem, Position } from '@blueprintjs/core'
import {
  Button,
  ButtonVariation,
  Container,
  DropDown,
  ExpandingSearchInput,
  Icon,
  Layout,
  Page,
  Popover,
  SelectOption,
  TableV2,
  Text
} from '@harness/uicore'
import React from 'react'
import { Color } from '@harness/design-system'
import type { CellProps, Renderer } from 'react-table'
import { useHistory, useParams } from 'react-router-dom'
import { noop } from 'lodash-es'
import {
  ApiCustomServiceConnection,
  DatabaseK8SCustomServiceCollection,
  useListK8SCustomService,
  useListK8sCustomServiceConnection,
  useListNamespace
} from 'services/servicediscovery'
import type { DiscoveryPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import ServiceDetails from '@discovery/components/ServiceDetails/ServiceDetails'
import routes from '@common/RouteDefinitions'
import css from './DiscoveryServices.module.scss'
interface ServiceDetailsProps {
  infraID: string
  serviceID: string
  serviceName: string
}

export interface ConnectionMap {
  [sourceID: string]: ApiCustomServiceConnection[]
}

export interface K8SCustomService extends DatabaseK8SCustomServiceCollection {
  relatedServices?: ApiCustomServiceConnection[]
}

const Name: Renderer<CellProps<K8SCustomService>> = ({ row }) => {
  const [isOpen, setDrawerOpen] = React.useState(false)
  return (
    <>
      <Text
        font={{ size: 'normal', weight: 'semi-bold' }}
        margin={{ left: 'medium' }}
        color={Color.PRIMARY_7}
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setDrawerOpen(true)
        }}
      >
        {row.original.name}
      </Text>
      <Drawer position={Position.RIGHT} isOpen={isOpen} isCloseButtonShown={true} size={'86%'}>
        <ServiceDetails
          serviceName={row.original.name ?? ''}
          serviceId={row.original.id ?? ''}
          infraId={row.original.infraID ?? ''}
          closeModal={() => {
            setDrawerOpen(false)
          }}
        />
      </Drawer>
    </>
  )
}

const Namepspace: Renderer<CellProps<K8SCustomService>> = ({ row }) => (
  <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
    <Icon name="app-kubernetes" size={24} margin={{ right: 'small' }} />
    <Text>{row.original.namespace}</Text>
  </Layout.Horizontal>
)
const NetworkDetails: Renderer<CellProps<K8SCustomService>> = ({ row }) => (
  <Layout.Vertical>
    <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_500}>
      IP Address: {row.original.service?.clusterIP}
    </Text>
    <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_500}>
      Port Number:{' '}
      {row.original.service &&
        row.original.service?.ports &&
        row.original.service?.ports.map((value, index) => {
          if (index + 1 == row.original.service?.ports?.length) {
            return `${value.port} `
          }
          return `${value.port}, `
        })}
    </Text>
  </Layout.Vertical>
)
const LastModified: Renderer<CellProps<K8SCustomService>> = ({ row }) => {
  const relatedServices = row.original
  return (
    <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
      <Text lineClamp={1}>
        {relatedServices.relatedServices?.map(services => {
          return `${services.destinationName} `
        })}
      </Text>
    </Layout.Horizontal>
  )
}

const ThreeDotMenu: Renderer<CellProps<K8SCustomService>> = () => {
  const history = useHistory()
  const { dAgentId, accountId, orgIdentifier, projectIdentifier } = useParams<DiscoveryPathProps & ModulePathParams>()
  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
      <Button
        minimal
        tooltip="Create Network Map"
        icon="plus"
        onClick={() => {
          history.push({
            pathname: routes.toCreateNetworkMap({
              dAgentId: dAgentId,
              accountId,
              orgIdentifier,
              projectIdentifier
            })
          })
        }}
      />
    </Layout.Horizontal>
  )
}

const DiscoveredServices: React.FC = () => {
  const { dAgentId, accountId, orgIdentifier, projectIdentifier } = useParams<DiscoveryPathProps & ModulePathParams>()
  const { getString } = useStrings()

  const [namespace, selectedNamespace] = React.useState<string>()
  const connectionMap: ConnectionMap = {}

  const { data: namespaceList, loading: namespaceListLoading } = useListNamespace({
    infraID: dAgentId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      page: 1,
      limit: 25
    }
  })

  const { data: serviceList, loading: serviceListLoader } = useListK8SCustomService({
    infraID: dAgentId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      namespace
    }
  })

  const { data: connectionList, loading: connectionListLoading } = useListK8sCustomServiceConnection({
    infraID: dAgentId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  if (connectionList?.items?.length && !connectionListLoading) {
    connectionList.items.map(connections => {
      if (connections.sourceID && connections.destinationName) {
        let destinations = connectionMap[connections.sourceID]
        if (destinations === undefined) {
          destinations = [connections]
        } else {
          destinations?.push(connections)
        }
        connectionMap[connections.sourceID] = destinations
      }
    })
  }

  const filteredServices: K8SCustomService[] | undefined = serviceList?.items?.map(services => {
    const relatedServices = connectionMap[services?.id ?? '']
    return {
      ...services,
      relatedServices: relatedServices
    }
  })

  const dropdownNamespaceOptions: SelectOption[] = [
    { value: '', label: 'All' },
    ...(namespaceList?.items
      ? namespaceList.items.map(value => {
          return {
            value: value.name ?? '',
            label: value.name ?? ''
          }
        })
      : [])
  ]

  return (
    <>
      <Page.SubHeader>
        <Layout.Horizontal width="100%" flex={{ justifyContent: 'space-between' }}>
          <DropDown
            width={160}
            items={dropdownNamespaceOptions ?? []}
            onChange={option => {
              selectedNamespace(option.value as string)
            }}
            placeholder="Namespace"
            value={namespace}
          />
          <ExpandingSearchInput
            alwaysExpanded
            width={232}
            placeholder="Search for a service"
            throttle={200}
            onChange={() => noop}
          />
        </Layout.Horizontal>
      </Page.SubHeader>
      {serviceListLoader ? (
        <Container width={'100%'} flex={{ align: 'center-center' }}>
          <Layout.Vertical spacing={'medium'} style={{ alignItems: 'center' }}>
            <Icon name="steps-spinner" size={32} color={Color.GREY_600} />
            <Text font={{ size: 'medium', align: 'center' }} color={Color.GREY_600}>
              {getString('loading')}
            </Text>
          </Layout.Vertical>
        </Container>
      ) : (
        <Container>
          <TableV2<K8SCustomService>
            className={css.tableBody}
            columns={[
              {
                Header: 'Service Name',
                width: '25%',
                Cell: Name
              },
              {
                Header: 'Namespace',
                width: '25%',
                Cell: Namepspace
              },
              {
                Header: 'Network Details',
                width: '20%',
                Cell: NetworkDetails
              },
              {
                Header: 'Related Services',
                width: '15%',
                Cell: LastModified
              },
              {
                Header: '',
                id: 'threeDotMenu',
                Cell: ThreeDotMenu
              }
            ]}
            data={filteredServices ?? []}
          />
        </Container>
      )}
    </>
  )
}

export default DiscoveredServices
