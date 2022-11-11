import React from 'react'
import { Container, Layout, Tabs, Text, ExpandingSearchInput, Tab } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import css from './PluginsPanel.module.scss'

export function PluginsPanel(): React.ReactElement {
  const { getString } = useStrings()

  return (
    <Container className={css.tabs}>
      <Tabs id={'pluginsPanel'} defaultSelectedTabId={'plugins'}>
        <Tab
          panelClassName={css.mainTabPanel}
          id="plugins"
          title={
            <Text
              font={{ variation: FontVariation.BODY2 }}
              padding={{ left: 'small', bottom: 'xsmall', top: 'xsmall' }}
              color={Color.PRIMARY_7}
            >
              {getString('common.plugins')}
            </Text>
          }
          panel={
            <Layout.Vertical>
              <Container className={css.search}>
                <ExpandingSearchInput autoFocus={true} alwaysExpanded={true} />
              </Container>
            </Layout.Vertical>
          }
        />
      </Tabs>
    </Container>
  )
}
