import React from 'react'
import { Container, Layout, Tabs, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import css from './PluginsPanel.module.scss'

export function PluginsPanel(): React.ReactElement {
  const { getString } = useStrings()

  return (
    <Container className={css.tabs}>
      <Tabs
        id={'pluginsPanel'}
        defaultSelectedTabId={'plugins'}
        tabList={[
          {
            id: 'plugins',
            title: <Text padding="small">{getString('common.plugins')}</Text>,
            panel: <Layout.Vertical>Tab 1 content</Layout.Vertical>
          }
        ]}
      />
    </Container>
  )
}
