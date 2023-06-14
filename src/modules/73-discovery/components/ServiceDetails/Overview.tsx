/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Icon, Layout, Text } from '@harness/uicore'
import { Divider } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import React from 'react'
import { useStrings } from 'framework/strings'
import { useGetServiceFromK8SCustomService, useGetK8SCustomService } from 'services/servicediscovery'
import type { DiscoveryPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import ListItems from './ListItems'

interface Overview {
  infraId: string
  serviceId: string
}

const Overview: React.FC<Overview> = props => {
  const { infraId, serviceId } = props

  const { accountId, orgIdentifier, projectIdentifier } = useParams<DiscoveryPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const { data: serviceData, loading: getServiceLoader } = useGetServiceFromK8SCustomService({
    infraID: infraId,
    kcs_id: serviceId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const { data: serviceWorkloadData, loading: getServiceWorkloadLoading } = useGetK8SCustomService({
    infraID: infraId,
    kcs_id: serviceId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  let totalReplicas = 0

  if (serviceWorkloadData) {
    serviceWorkloadData.workloads?.forEach(workload => {
      totalReplicas += workload?.replicas ? workload.replicas.length : 0
    })
  }

  return (
    <Layout.Horizontal spacing="medium" flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Layout.Vertical style={{ width: '48%' }}>
        <Text color={Color.GREY_700} font={{ variation: FontVariation.H5, weight: 'semi-bold' }}>
          {getString('discovery.serviceDrawer.serviceDetails')}
        </Text>
        {getServiceLoader ? (
          <Container height={'100%'} width={'100%'} flex={{ align: 'center-center' }}>
            <Layout.Vertical spacing={'medium'} style={{ alignItems: 'center' }}>
              <Icon name="steps-spinner" size={32} color={Color.GREY_600} />
              <Text font={{ size: 'medium', align: 'center' }} color={Color.GREY_600}>
                {getString('loading')}
              </Text>
            </Layout.Vertical>
          </Container>
        ) : (
          <Layout.Vertical
            background={Color.WHITE}
            spacing="medium"
            style={{
              boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.04), 0px 2px 4px rgba(96, 97, 112, 0.16)',
              padding: '36px',
              borderRadius: '4px'
            }}
          >
            <ListItems
              title={getString('discovery.serviceDrawer.cluster')}
              content={
                <Text icon={'kubernetes-harness'} color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                  {serviceData?.infraID}
                </Text>
              }
            />
            <ListItems
              title={getString('discovery.serviceDrawer.namespace')}
              content={
                <Text icon={'kubernetes-harness'} color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                  {serviceData?.namespace}
                </Text>
              }
              padding={{ top: 'medium' }}
            />
            <Divider />
            <ListItems
              title={getString('discovery.serviceDrawer.ipFamily')}
              content={
                <>
                  {serviceData?.spec?.ipFamilies?.map(ipFamily => {
                    return (
                      <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }} key={ipFamily}>
                        {ipFamily} &nbsp;
                      </Text>
                    )
                  })}
                </>
              }
              padding={{ top: 'medium' }}
            />
            <ListItems
              title={getString('discovery.serviceDrawer.ipAddress')}
              content={
                <>
                  {serviceData?.spec?.clusterIPs?.map(clusterIP => {
                    return (
                      <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.BODY2 }} key={clusterIP}>
                        {clusterIP} &nbsp;
                      </Text>
                    )
                  })}
                </>
              }
              padding={{ top: 'medium' }}
            />
            <Divider />
            <ListItems
              title={getString('discovery.serviceDrawer.port')}
              content={
                <>
                  {serviceData?.spec?.ports?.map(ports => {
                    return (
                      <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.BODY2 }} key={ports.port}>
                        {ports.port} &nbsp;{' '}
                      </Text>
                    )
                  })}
                </>
              }
              padding={{ top: 'medium' }}
            />

            <ListItems
              title={getString('discovery.serviceDrawer.targetPort')}
              content={
                <>
                  {serviceData?.spec?.ports?.map((ports, index) => {
                    return (
                      <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.BODY2 }} key={index}>
                        {ports.targetPort} &nbsp;
                      </Text>
                    )
                  })}
                </>
              }
              padding={{ top: 'medium' }}
            />
            <Divider />
            {serviceData?.spec?.selector ? (
              <ListItems
                title={getString('discovery.serviceDrawer.selector')}
                content={
                  <>
                    <Layout.Vertical width={'60%'}>
                      {Object.entries(serviceData?.spec?.selector).map(([key, value]) => {
                        return (
                          <Text
                            color={Color.GREY_700}
                            font={{ variation: FontVariation.BODY2 }}
                            lineClamp={1}
                            key={key}
                          >
                            {key}:{value}
                          </Text>
                        )
                      })}
                    </Layout.Vertical>
                  </>
                }
                padding={{ top: 'medium' }}
              />
            ) : (
              <></>
            )}
          </Layout.Vertical>
        )}
      </Layout.Vertical>
      <Layout.Vertical style={{ width: '48%' }}>
        <Text color={Color.GREY_700} font={{ variation: FontVariation.H5, weight: 'semi-bold' }}>
          {getString('discovery.serviceDrawer.workloads')}
        </Text>
        {getServiceWorkloadLoading ? (
          <Container height={'100%'} width={'100%'} flex={{ align: 'center-center' }}>
            <Layout.Vertical spacing={'medium'} style={{ alignItems: 'center' }}>
              <Icon name="steps-spinner" size={32} color={Color.GREY_600} />
              <Text font={{ size: 'medium', align: 'center' }} color={Color.GREY_600}>
                {getString('loading')}
              </Text>
            </Layout.Vertical>
          </Container>
        ) : (
          <Layout.Vertical
            spacing="medium"
            background={Color.WHITE}
            style={{
              boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.04), 0px 2px 4px rgba(96, 97, 112, 0.16)',
              padding: '36px',
              borderRadius: '4px'
            }}
          >
            <ListItems
              title={getString('discovery.serviceDrawer.kind')}
              content={
                <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                  {serviceWorkloadData?.kind}
                </Text>
              }
            />
            <ListItems
              title={getString('discovery.serviceDrawer.replicas')}
              content={
                <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                  {totalReplicas}
                </Text>
              }
              padding={{ top: 'medium' }}
            />
            <Divider />
            {serviceWorkloadData && serviceWorkloadData?.workloads && serviceWorkloadData?.workloads[0]?.podLabels ? (
              <>
                <ListItems
                  title={getString('discovery.serviceDrawer.labels')}
                  content={
                    <Layout.Vertical width={'60%'}>
                      {Object.entries(serviceWorkloadData && serviceWorkloadData?.workloads[0]?.podLabels).map(
                        ([key, value]) => {
                          return (
                            <Text
                              color={Color.GREY_700}
                              font={{ variation: FontVariation.BODY2 }}
                              lineClamp={1}
                              key={key}
                            >
                              {key}:{value}
                            </Text>
                          )
                        }
                      )}
                    </Layout.Vertical>
                  }
                  padding={{ top: 'medium' }}
                />
                <Divider />
              </>
            ) : (
              <></>
            )}
            {serviceWorkloadData &&
            serviceWorkloadData?.workloads &&
            serviceWorkloadData?.workloads[0]?.podAnnotations ? (
              <ListItems
                title={getString('discovery.serviceDrawer.annotations')}
                content={
                  <Layout.Vertical width={'60%'}>
                    {Object.entries(serviceWorkloadData && serviceWorkloadData?.workloads[0]?.podAnnotations).map(
                      ([key, value]) => {
                        return (
                          <Text
                            color={Color.GREY_700}
                            font={{ variation: FontVariation.BODY2 }}
                            lineClamp={1}
                            key={key}
                          >
                            {key}:{value}
                          </Text>
                        )
                      }
                    )}
                  </Layout.Vertical>
                }
                padding={{ top: 'medium' }}
              />
            ) : (
              <></>
            )}
          </Layout.Vertical>
        )}
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default Overview
