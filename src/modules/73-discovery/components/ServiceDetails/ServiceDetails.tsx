import { Button, ButtonVariation, Container, Layout, Page, Tabs, Text } from '@harness/uicore'
import React from 'react'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import Overview from './Overview'
import css from './ServiceDetails.module.scss'

interface ServiceDetailsProps {
  serviceId: string
  infraId: string
  serviceName: string
  closeModal: () => void
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ serviceId, infraId, serviceName, closeModal }) => {
  const { getString } = useStrings()

  return (
    <Container background={Color.PRIMARY_BG}>
      <Page.Header
        title={
          <Layout.Vertical>
            <Text font={{ size: 'xsmall', weight: 'semi-bold' }}>{getString('discovery.serviceDrawer.header')}</Text>
            <Text font={{ size: 'medium', weight: 'bold' }} color={Color.GREY_800}>
              {serviceName}
            </Text>
          </Layout.Vertical>
        }
        toolbar={
          <Button
            margin={{ left: 'medium' }}
            icon="cross"
            variation={ButtonVariation.SECONDARY}
            onClick={() => {
              closeModal()
            }}
          />
        }
      />
      <Page.Body>
        <Layout.Horizontal className={css.tabsContainerMain} flex={{ justifyContent: 'space-between' }}>
          <Tabs
            id={'serviceDetailsTab'}
            defaultSelectedTabId={'overview'}
            tabList={[
              {
                id: 'overview',
                title: getString('discovery.serviceDrawer.overview'),
                panel: (
                  <Container className={css.overviewContainer}>
                    <Overview infraId={infraId} serviceId={serviceId} />
                  </Container>
                )
              },
              {
                id: 'resource',
                title: getString('discovery.serviceDrawer.resources'),
                panel: <div>Resources</div>
              }
            ]}
          />
        </Layout.Horizontal>
      </Page.Body>
    </Container>
  )
}

export default ServiceDetails
