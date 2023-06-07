/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useMemo, useState } from 'react'
import { Button, ButtonVariation, Checkbox, Container, Icon, Layout, TableV2, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import type { CellProps, Column, Renderer, Row } from 'react-table'
import { useStrings } from 'framework/strings'
import { DatabaseServiceCollection, useListService } from 'services/servicediscovery'
import type { DiscoveryPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import css from './SelectService.module.scss'

const SelectService: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, dAgentId } = useParams<DiscoveryPathProps & ModulePathParams>()
  const [selectedServices, setSelectedServices] = useState<DatabaseServiceCollection[]>([])

  const { data: discoveredServices, loading } = useListService({
    infraID: dAgentId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const handleSelectChange = (isSelect: boolean, row: Row<DatabaseServiceCollection>): void => {
    if (isSelect) setSelectedServices(prevState => [...prevState, row.original])
    else {
      // TODO: Optimize this, currently a bug
      selectedServices.map((selectedService, i) => {
        discoveredServices?.items?.map(service => {
          if (service.id === selectedService.id) setSelectedServices(selectedServices.splice(i, 1))
        })
      })
    }
  }

  const RenderSelectServiceCheckbox: Renderer<CellProps<DatabaseServiceCollection>> = ({ row }) => (
    <Checkbox
      margin={{ left: 'medium' }}
      onChange={(event: React.FormEvent<HTMLInputElement>) => {
        handleSelectChange(event.currentTarget.checked, row)
      }}
    />
  )

  const RenderServiceName: Renderer<CellProps<DatabaseServiceCollection>> = ({ row }) => (
    <Layout.Vertical spacing={'small'} margin={{ left: 'medium' }}>
      <Text lineClamp={1} font={{ size: 'normal', weight: 'semi-bold' }} color={Color.PRIMARY_7}>
        {row.original.name}
      </Text>
      <Text lineClamp={1} font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_400}>
        ID: {row.original.id}
      </Text>
    </Layout.Vertical>
  )

  const RenderServiceNamespace: Renderer<CellProps<DatabaseServiceCollection>> = ({ row }) => (
    <Layout.Vertical spacing={'small'}>
      <Text lineClamp={1} font={{ size: 'normal', weight: 'semi-bold' }} color={Color.BLACK}>
        Namespace
      </Text>
      <Text
        lineClamp={1}
        font={{ size: 'small', weight: 'semi-bold' }}
        color={Color.GREY_600}
        icon="service-deployment"
      >
        {row.original.namespace}
      </Text>
    </Layout.Vertical>
  )

  const RenderServiceIPAddress: Renderer<CellProps<DatabaseServiceCollection>> = ({ row }) => (
    <Layout.Vertical spacing={'small'}>
      <Text lineClamp={1} font={{ size: 'normal', weight: 'semi-bold' }} color={Color.BLACK}>
        IP Address
      </Text>
      <Text lineClamp={1} font={{ size: 'small', weight: 'semi-bold' }} color={Color.PRIMARY_7}>
        {row.original.spec && row.original.spec?.clusterIP}
      </Text>
    </Layout.Vertical>
  )

  const RenderServicePort: Renderer<CellProps<DatabaseServiceCollection>> = ({ row }) => (
    <Layout.Vertical spacing={'small'}>
      <Text lineClamp={1} font={{ size: 'normal', weight: 'semi-bold' }} color={Color.BLACK}>
        Port
      </Text>
      <Text lineClamp={1} font={{ size: 'small', weight: 'semi-bold' }} color={Color.PRIMARY_7}>
        {row.original.spec && row.original.spec?.ports && row.original.spec?.ports[0]?.port}
      </Text>
    </Layout.Vertical>
  )

  const columns: Column<DatabaseServiceCollection>[] = useMemo(
    () => [
      {
        Header: '',
        width: '5%',
        id: 'action',
        Cell: RenderSelectServiceCheckbox,
        disableSortBy: true
      },
      {
        Header: '',
        id: 'name',
        width: '57%',
        Cell: RenderServiceName
      },
      {
        Header: '',
        id: 'namespace',
        width: '15%',
        Cell: RenderServiceNamespace
      },
      {
        Header: '',
        id: 'ipAddress',
        width: '15%',
        Cell: RenderServiceIPAddress
      },
      {
        Header: '',
        id: 'port',
        width: '8%',
        Cell: RenderServicePort
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [discoveredServices]
  )

  return (
    <Layout.Horizontal width="100%" height="100%">
      <Container background={Color.PRIMARY_BG} className={css.services}>
        <Text font={{ variation: FontVariation.H5, weight: 'semi-bold' }} margin={{ top: 'large', left: 'large' }}>
          {getString('discovery.allDiscoveredServices')} {`(${discoveredServices?.items?.length ?? '0'})`}
        </Text>
        <Container>
          {loading ? (
            <Container width={'100%'} flex={{ align: 'center-center' }}>
              <Layout.Vertical spacing={'medium'} style={{ alignItems: 'center' }}>
                <Icon name="steps-spinner" size={32} color={Color.GREY_600} />
                <Text font={{ size: 'medium', align: 'center' }} color={Color.GREY_600}>
                  {getString('loading')}
                </Text>
              </Layout.Vertical>
            </Container>
          ) : (
            <Container width="95%" height="75vh" style={{ margin: 'auto' }}>
              <TableV2<DatabaseServiceCollection>
                className={css.tableBody}
                columns={columns}
                data={discoveredServices?.items ?? []}
              />
            </Container>
          )}
        </Container>
        <Container className={css.bottomNav} padding={'medium'} height="8vh">
          <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'medium'}>
            <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={() => void 0} />
            <Button type="submit" variation={ButtonVariation.PRIMARY} text={'Submit'} onClick={() => void 0} />
          </Layout.Horizontal>
        </Container>
      </Container>

      <div className={css.visualization}>GRAPH HERE</div>
    </Layout.Horizontal>
  )
}

export default SelectService
