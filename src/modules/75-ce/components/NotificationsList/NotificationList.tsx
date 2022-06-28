import React from 'react'
import { Card, Color, FontVariation, Icon, Layout, Text } from '@harness/uicore'

const notificationList = [
  {
    title: 'Data Sync',
    desc: 'This data is applicable only for recently created connectors, we are syncing your data, for detailed information please check back after some time.',
    time: '6m ago'
  },
  {
    title: 'AWS Connector',
    desc: 'AWSTest3 connector is created. We will notify you once the data is ready!',
    time: '8m ago'
  }
]

const NotificationList = ({ hideDrawer }) => {
  return (
    <>
      {notificationList.map((item, index) => {
        return (
          <div style={{ padding: '16px' }} key={index}>
            <Card
              style={{ backgroundColor: 'var(--grey-100)', width: '100%', paddingLeft: '12px', paddingRight: '12px' }}
            >
              <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
                <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY2 }}>
                  <Icon name="success-tick" style={{ marginRight: '5px' }} />
                  {item.title}
                </Text>
                <Text color={Color.GREY_400} font={{ variation: FontVariation.SMALL }}>
                  {item.time}
                </Text>
              </Layout.Horizontal>
              <Text
                color={Color.GREY_400}
                font={{ variation: FontVariation.SMALL_SEMI }}
                style={{ marginLeft: '21px' }}
              >
                {item.desc}
              </Text>
            </Card>
          </div>
        )
      })}
    </>
  )
}

export default NotificationList
