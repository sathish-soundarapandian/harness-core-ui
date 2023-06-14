import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Container, Layout, Text, CardSelect } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import moment from 'moment'
import { DatabaseInstallInfraCollection, useListInfraInstallations } from 'services/servicediscovery'
import type { DiscoveryPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { SimpleLogViewer } from '@common/components/LogViewer/SimpleLogViewer'
import { DiscoveryAgentStatus } from '@discovery/components/DelegateAgentStatus/DelegateAgentStatus'
import css from './DiscoveryHistory.module.scss'

const DiscoveryHistory: React.FC = () => {
  const { dAgentId, accountId, orgIdentifier, projectIdentifier } = useParams<DiscoveryPathProps & ModulePathParams>()

  const { data: infraInstalls, loading: infraInstallLoading } = useListInfraInstallations({
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      page: 1,
      limit: 25,
      all: false
    },
    infraID: dAgentId
  })

  const [selected, setSelected] = React.useState<DatabaseInstallInfraCollection>()

  useEffect(() => {
    if (infraInstalls?.items && !infraInstallLoading) {
      if (infraInstalls.items?.length > 0) {
        setSelected(infraInstalls.items[0])
      }
    }
  }, [infraInstalls, infraInstallLoading])

  const convertTime = (time: string): string => {
    return moment(time).format('MMM DD, hh:mm A')
  }

  return (
    <Container height={'100vh'} style={{ display: 'flex' }}>
      <Layout.Vertical width={'30%'}>
        <Layout.Horizontal style={{ padding: '10px 30px' }} flex={{ justifyContent: 'space-between' }}>
          <Text font={{ variation: FontVariation.CARD_TITLE }}>Discovery History</Text>
          <div>
            <Button icon="repeat" minimal />
            <Button icon="main-sort" minimal />
          </div>
        </Layout.Horizontal>
        <CardSelect
          data={infraInstalls?.items ?? []}
          className={css.selectableCard}
          renderItem={item => {
            return (
              <Layout.Vertical padding={{ left: 'small' }}>
                <Text font={{ variation: FontVariation.BODY2 }} style={{ fontWeight: 500 }}>
                  {convertTime(item?.createdAt ?? '')}
                </Text>
                <DiscoveryAgentStatus status={item.delegateTaskStatus} />
              </Layout.Vertical>
            )
          }}
          onChange={value => setSelected(value)}
          selected={selected}
        />
      </Layout.Vertical>
      <Layout.Vertical width={'70%'}>
        <SimpleLogViewer className={css.logContainer} data={JSON.stringify(selected, null, '\t')} />
      </Layout.Vertical>
    </Container>
  )
}

export default DiscoveryHistory
