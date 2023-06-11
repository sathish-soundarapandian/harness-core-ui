import React from 'react'
import { useParams } from 'react-router-dom'
import { Button, Container, Layout, Text, CardSelect } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import moment from 'moment'
import type { ApiListInstallInfraResponse } from 'services/servicediscovery'
import type { DiscoveryPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { SimpleLogViewer } from '@common/components/LogViewer/SimpleLogViewer'
import { DiscoveryAgentStatus } from '@discovery/components/DelegateAgentStatus/DelegateAgentStatus'
import css from './DiscoveryHistory.module.scss'

const DiscoveryHistory: React.FC = () => {
  const { dAgentId, accountId, orgIdentifier, projectIdentifier } = useParams<DiscoveryPathProps & ModulePathParams>()

  const dummyData: ApiListInstallInfraResponse = {
    items: [
      {
        id: '647ec9e1aa1033326a187518',
        infraID: '647ec9e1aa1033326a187517',
        created: '2023-06-06T05:53:37.989Z',
        updated: '2023-06-06T05:53:43.449Z',
        delegateTaskID: 'ciTrI0khSDO3McJ-zfV3LA',
        delegateID: '',
        delegateTaskStatus: 'SUCCESS'
      },
      {
        id: '647ec9e1aa1033326a187518',
        infraID: '647ec9e1aa1033326a187517',
        created: '2023-06-06T05:53:37.989Z',
        updated: '2023-06-06T05:53:43.449Z',
        delegateTaskID: 'ciTrI0khSDO3McJ-zfV3LB',
        delegateID: '',
        delegateTaskStatus: 'FAILED'
      }
    ]
  }

  const [selected, setSelected] = React.useState(dummyData?.items ? dummyData.items[0] : {})

  const convertTime = (time: string) => {
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
          data={dummyData.items ?? []}
          className={css.selectableCard}
          renderItem={item => {
            return (
              <Layout.Vertical>
                <Text
                  font={{ variation: FontVariation.BODY2 }}
                  style={{ fontWeight: 500 }}
                  padding={{ bottom: 'xsmall' }}
                >
                  {convertTime(item?.created ?? '')}
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
