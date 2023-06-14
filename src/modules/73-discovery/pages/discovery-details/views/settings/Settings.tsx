/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Icon, Layout, Text, Toggle } from '@harness/uicore'
import { Divider } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import React, { useEffect } from 'react'
import moment from 'moment'
import { useStrings } from 'framework/strings'
import { useGetInfra } from 'services/servicediscovery'
import type { DiscoveryPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { getConnectorPromise, ResponseConnectorResponse } from 'services/cd-ng'
import { DiscoveryAgentStatus } from '@discovery/components/DelegateAgentStatus/DelegateAgentStatus'
import ListItems from './ListItems'
import { RenderConnectorStatus } from './ConnectorStatus'

const Settings: React.FC = () => {
  const { dAgentId, accountId, orgIdentifier, projectIdentifier } = useParams<DiscoveryPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const { data: dAgentData, loading: dAgentDataLoading } = useGetInfra({
    infraID: dAgentId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const [connectorDetails, setConnectorDetails] = React.useState<ResponseConnectorResponse>()

  const fetchConnectorDetails = async (connectorID: string) => {
    const connectorResult = await getConnectorPromise({
      identifier: connectorID,
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier: orgIdentifier,
        projectIdentifier: projectIdentifier
      }
    })
    if (connectorResult) {
      setConnectorDetails(connectorResult)
    }
  }

  useEffect(() => {
    if (dAgentData) fetchConnectorDetails(dAgentData?.k8sConnectorID ?? '')
  }, [dAgentData])

  const updateTime = (time: string) => {
    return moment(time).format('MMM DD, hh:mm A')
  }

  return (
    <Layout.Horizontal
      style={{ paddingLeft: '40px', paddingTop: '20px', paddingRight: '30px' }}
      spacing="medium"
      flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
    >
      {dAgentDataLoading ? (
        <Container height={'100%'} width={'100%'} flex={{ align: 'center-center' }}>
          <Layout.Vertical spacing={'medium'} style={{ alignItems: 'center' }}>
            <Icon name="steps-spinner" size={32} color={Color.GREY_600} />
            <Text font={{ size: 'medium', align: 'center' }} color={Color.GREY_600}>
              {getString('loading')}
            </Text>
          </Layout.Vertical>
        </Container>
      ) : (
        <>
          <Layout.Vertical style={{ width: '48%' }}>
            <Text color={Color.GREY_700} font={{ variation: FontVariation.H5, weight: 'semi-bold' }}>
              Discovery Agent Overview
            </Text>
            <Layout.Vertical
              background={Color.WHITE}
              spacing="medium"
              style={{
                boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.04), 0px 2px 4px rgba(96, 97, 112, 0.16)',
                padding: '36px',
                borderRadius: '4px'
              }}
            >
              <Text font={{ variation: FontVariation.CARD_TITLE }}>Discovery Agent</Text>
              <ListItems
                title={'Name'}
                content={
                  <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                    {dAgentData?.name}
                  </Text>
                }
                padding={{ top: 'medium' }}
              />
              <ListItems
                title={'Description'}
                content={
                  <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                    {dAgentData?.description}
                  </Text>
                }
                padding={{ top: 'medium' }}
              />
              <ListItems
                title={'Last Discovery'}
                content={
                  <Layout.Horizontal flex={{ alignItems: 'center' }}>
                    <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                      {updateTime(dAgentData?.installationDetails?.createdAt ?? '')}-{' '}
                    </Text>
                    <DiscoveryAgentStatus status={dAgentData?.installationDetails?.delegateTaskStatus} />
                  </Layout.Horizontal>
                }
                padding={{ top: 'medium' }}
              />
              <Divider />
              <Text font={{ variation: FontVariation.CARD_TITLE }}>Connector Details</Text>
              <ListItems
                title={'Connector Name'}
                content={
                  <Text icon={'kubernetes-harness'} color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }}>
                    {connectorDetails?.data?.connector?.name}
                  </Text>
                }
                padding={{ top: 'medium' }}
              />
              <ListItems
                title={'Connector Name'}
                content={<RenderConnectorStatus status={connectorDetails?.data?.status?.status} />}
                padding={{ top: 'medium' }}
              />
            </Layout.Vertical>
          </Layout.Vertical>
          <Layout.Vertical style={{ width: '48%' }}>
            <Text color={Color.GREY_700} font={{ variation: FontVariation.H5, weight: 'semi-bold' }}>
              Discovery Settings
            </Text>
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
                title={'Detect network trace'}
                content={<Toggle checked={dAgentData?.config?.kubernetes?.enableEBPF} />}
              />
              <ListItems
                title={'Enable EBPF'}
                content={<Toggle checked={dAgentData?.config?.kubernetes?.enableEBPF} />}
                padding={{ top: 'medium' }}
              />
              <Divider />
              <Layout.Vertical>
                <Text
                  icon="trash"
                  iconProps={{ color: Color.RED_500 }}
                  font={{ variation: FontVariation.FORM_MESSAGE_DANGER }}
                  color={Color.RED_500}
                  padding={{ top: 'medium' }}
                  style={{ cursor: 'pointer' }}
                >
                  Disable Discovery Agent
                </Text>
                <Text padding={{ top: 'medium' }} color={Color.GREY_600} font={{ variation: FontVariation.BODY }}>
                  Disable Discovery Agent will not stop your existing ongoing discovery. It will stop the subsequent
                  discoveries. This action is not revertible. Learn More
                </Text>
              </Layout.Vertical>
            </Layout.Vertical>
          </Layout.Vertical>
        </>
      )}
    </Layout.Horizontal>
  )
}

export default Settings
