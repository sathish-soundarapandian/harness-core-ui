/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import {
  Container,
  Layout,
  Tabs,
  Text,
  ExpandingSearchInput,
  Tab,
  Icon,
  Button,
  Formik,
  FormikForm
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
  shouldEnableFormView?: boolean
}

export function PluginsPanel(props: PluginsPanelInterface): React.ReactElement {
  const { height, onPluginAdd, existingPluginValues = {}, shouldEnableFormView = false } = props
  const { getString } = useStrings()
  const [showFormView, setShowFormView] = useState<boolean>(false)
  const [selectedPlugin, setSelectedPlugin] = useState<PluginInterface | undefined>()

  useEffect(() => {
    if (shouldEnableFormView) {
      setShowFormView(shouldEnableFormView)
    }
  }, [shouldEnableFormView])

  const renderPlugin = useCallback((plugin: PluginInterface): JSX.Element => {
    const { name, description } = plugin
    // const pluginIconProps: IconProps = {
    //   name: pluginIcon.name as IconName,
    //   size: 18,
    //   margin: { top: 'xsmall', right: 'small', bottom: 'small', left: 'xxlarge' },
    //   ...(pluginIcon.color ? { color: pluginIcon.color } : {}),
    //   className: cx(css.pluginIcon, { [className as string]: className })
    // }
    return (
      <Layout.Horizontal
        padding={{ top: 'large', bottom: 'large', right: 'large' }}
        className={css.plugin}
        width="100%"
        flex={{ justifyContent: 'space-between' }}
        onClick={() => setSelectedPlugin(plugin)}
      >
        <Layout.Horizontal style={{ flex: 2 }}>
          <Layout.Horizontal>
            {/* <Icon {...pluginIconProps} /> */}
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
          {/* <Icon name={publisherIcon as IconName} size={20} /> */}
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
      <Tabs id={'pluginsPanel'} defaultSelectedTabId={'plugins'} className={css.tabs}>
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
            <Container style={{ height }}>
              {selectedPlugin || showFormView ? (
                <Layout.Vertical
                  spacing="medium"
                  padding="medium"
                  height="100%"
                  flex={{ justifyContent: 'space-between', alignItems: 'baseline' }}
                >
                  <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small">
                    <Icon name="arrow-left" onClick={() => setSelectedPlugin(undefined)} className={css.backBtn} />
                    <Text font={{ variation: FontVariation.H5 }}>{selectedPlugin?.name}</Text>
                  </Layout.Horizontal>
                  <Formik
                    initialValues={existingPluginValues}
                    enableReinitialize={true}
                    formName="pluginsForm"
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
                          <Button style={{ height: '40px', width: '100px' }} type="submit">
                            {getString('add')}
                          </Button>
                        </FormikForm>
                      )
                    }}
                  </Formik>
                </Layout.Vertical>
              ) : (
                <Layout.Vertical
                  style={{
                    height
                  }}
                >
                  <Container className={css.search}>
                    <ExpandingSearchInput autoFocus={true} alwaysExpanded={true} />
                  </Container>
                  <Container className={css.overflow}>
                    {Plugins.map((item: PluginInterface) => renderPlugin(item))}
                  </Container>
                </Layout.Vertical>
              )}
            </Container>
          }
        />
      </Tabs>
    </Container>
  )
}
