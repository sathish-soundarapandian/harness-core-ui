import React, { useCallback } from 'react'
import cx from 'classnames'
import { Container, Layout, Tabs, Text, ExpandingSearchInput, Tab, IconName, Icon } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { PluginInterface } from '../__mocks__/plugins'
import { Plugins } from '../__mocks__/plugins'

import css from './PluginsPanel.module.scss'

interface PluginsPanelInterface {
  height?: React.CSSProperties['height']
}

export function PluginsPanel(props: PluginsPanelInterface): React.ReactElement {
  const { height } = props
  const { getString } = useStrings()

  const renderPlugin = useCallback((plugin: PluginInterface): JSX.Element => {
    const { name, description, pluginIcon, publisherIcon, isInstalled } = plugin
    const pluginIconProps = {
      name: pluginIcon.name as IconName,
      size: 18,
      padding: { top: 'xsmall', right: 'small', bottom: 'small', left: isInstalled ? 0 : 'xxxlarge' },
      ...(pluginIcon.color ? { color: pluginIcon.color } : {})
    }
    return (
      <Layout.Horizontal
        padding={{ top: 'large', bottom: 'large', right: 'large' }}
        className={css.plugin}
        width="100%"
        flex={{ justifyContent: 'space-between' }}
      >
        <Layout.Horizontal style={{ flex: 2 }}>
          {isInstalled ? (
            <Container className={css.installedBadge}>
              <Text font={{ variation: FontVariation.TINY }} color={Color.PRIMARY_7}>
                {getString('common.installed').toUpperCase()}
              </Text>
            </Container>
          ) : null}
          <Layout.Horizontal className={cx({ [css.pluginInfo]: isInstalled })}>
            <Icon {...pluginIconProps} />
            <Layout.Vertical spacing="xsmall" width="100%">
              <Text font={{ variation: FontVariation.BODY2 }} color={Color.PRIMARY_7}>
                {name}
              </Text>
              <Text font={{ variation: FontVariation.TINY }} lineClamp={1} width="15vw">
                {description}
              </Text>
            </Layout.Vertical>
          </Layout.Horizontal>
        </Layout.Horizontal>
        <Layout.Horizontal flex={{ justifyContent: 'flex-end', alignItems: 'flex-start' }} style={{ flex: 1 }}>
          <Icon name={publisherIcon as IconName} size={20} />
          <Layout.Horizontal flex spacing="xsmall">
            <Icon name="main-tick" size={12} color={Color.PRIMARY_7} />
            <Text font={{ variation: FontVariation.TINY }} color={Color.PRIMARY_7}>
              {getString('common.verified').toLowerCase()}
            </Text>
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Layout.Horizontal>
    )
  }, [])

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
              <Container
                className={css.overflow}
                style={{
                  height: `calc(${height} - 75px)`
                }}
              >
                {Plugins.map((item: PluginInterface) => renderPlugin(item))}
              </Container>
            </Layout.Vertical>
          }
        />
      </Tabs>
    </Container>
  )
}
