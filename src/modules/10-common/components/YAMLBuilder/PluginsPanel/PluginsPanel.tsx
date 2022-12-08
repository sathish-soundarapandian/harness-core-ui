/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import {
  Container,
  Layout,
  Tabs,
  Text,
  ExpandingSearchInput,
  Tab,
  IconName,
  Icon,
  IconProps,
  Button,
  Formik,
  FormikForm,
  FormInput
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { PluginInterface } from './plugins'
import { Plugins } from './plugins'

import css from './PluginsPanel.module.scss'

interface PluginsPanelInterface {
  existingPluginValues?: Record<string, any>
  onPluginAdd: (pluginInput: Record<string, any>) => void
  height?: React.CSSProperties['height']
}

export function PluginsPanel(props: PluginsPanelInterface): React.ReactElement {
  const { height, onPluginAdd, existingPluginValues = {} } = props
  const { getString } = useStrings()
  const [selectedPlugin, setSelectedPlugin] = useState<string>('')

  const renderPlugin = useCallback((plugin: PluginInterface): JSX.Element => {
    const { name, description, pluginIcon, publisherIcon, className } = plugin
    const pluginIconProps: IconProps = {
      name: pluginIcon.name as IconName,
      size: 18,
      margin: { top: 'xsmall', right: 'small', bottom: 'small', left: 'xxlarge' },
      ...(pluginIcon.color ? { color: pluginIcon.color } : {}),
      className: cx(css.pluginIcon, { [className as string]: className })
    }
    return (
      <Layout.Horizontal
        padding={{ top: 'large', bottom: 'large', right: 'large' }}
        className={css.plugin}
        width="100%"
        flex={{ justifyContent: 'space-between' }}
        onClick={() => setSelectedPlugin(name)}
      >
        <Layout.Horizontal style={{ flex: 2 }}>
          {/* {isInstalled ? (
            <Container className={css.installedBadge}>
              <Text font={{ variation: FontVariation.TINY }} color={Color.PRIMARY_7}>
                {getString('common.installed').toUpperCase()}
              </Text>
            </Container>
          ) : null} */}
          <Layout.Horizontal>
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
            selectedPlugin ? (
              <Layout.Vertical spacing="medium" padding="medium">
                <Formik
                  initialValues={existingPluginValues}
                  enableReinitialize={true}
                  formName="configureOptionsForm"
                  onSubmit={data => {
                    try {
                      onPluginAdd({ ...data, shouldInsertYAML: true })
                    } catch (e) {
                      //ignore error
                    }
                  }}
                >
                  {_formik => {
                    return (
                      <FormikForm>
                        <FormInput.Text name="command" placeholder={'Enter a command'} label={'Command'} />
                        <FormInput.TextArea
                          name="pathToProjects"
                          placeholder={'Enter path to projects'}
                          label={'Path to projects'}
                        />
                        <FormInput.Text name="arguments" placeholder={'Enter arguments'} label={'Arguments'} />
                        <Button style={{ height: '40px', width: '100px' }} type="submit">
                          {getString('add')}
                        </Button>
                      </FormikForm>
                    )
                  }}
                </Formik>
                {!isEmpty(existingPluginValues) && existingPluginValues && !existingPluginValues.shouldInsertYAML ? (
                  <Text>Value received from YAML view!</Text>
                ) : null}
              </Layout.Vertical>
            ) : (
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
            )
          }
        />
      </Tabs>
    </Container>
  )
}
