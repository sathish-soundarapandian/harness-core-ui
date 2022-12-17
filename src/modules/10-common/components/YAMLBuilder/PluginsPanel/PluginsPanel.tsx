/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { capitalize } from 'lodash-es'
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
  FormikForm,
  ButtonVariation,
  FormInput
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import css from './PluginsPanel.module.scss'
import { Input, PluginMetadataResponse, useListPlugins } from 'services/ci'

interface PluginsPanelInterface {
  existingPluginValues?: Record<string, any>
  onPluginAdd: (pluginInput: Record<string, any>) => void
  height?: React.CSSProperties['height']
  shouldEnableFormView?: boolean
}

export function PluginsPanel(props: PluginsPanelInterface): React.ReactElement {
  const { height, onPluginAdd, existingPluginValues = {} } = props
  const { getString } = useStrings()
  const [selectedPlugin, setSelectedPlugin] = useState<PluginMetadataResponse | undefined>()
  const [plugins, setPlugins] = useState<PluginMetadataResponse[]>([])
  const [query, setQuery] = useState<string>()

  const defaultQueryParams = { pageIndex: 0, pageSize: 200 }
  const { data, loading, error, refetch } = useListPlugins({ queryParams: defaultQueryParams })

  useEffect(() => {
    refetch({ queryParams: { ...defaultQueryParams, searchTerm: query } })
  }, [query])

  useEffect(() => {
    if (!error && !loading) {
      setPlugins(data?.data?.content || [])
    }
  }, [data, loading, error])

  const renderPlugin = useCallback((plugin: PluginMetadataResponse): JSX.Element => {
    const { name, description, kind } = plugin
    return (
      <Layout.Horizontal
        padding={{ top: 'large', bottom: 'large', right: 'xlarge', left: 'xlarge' }}
        className={css.plugin}
        width="100%"
        flex={{ justifyContent: 'space-between' }}
        onClick={() => setSelectedPlugin(plugin)}
      >
        <Layout.Horizontal style={{ flex: 2 }}>
          <Layout.Horizontal width="100%">
            <Icon name={'gear'} size={20} className={css.pluginIcon} />
            <Layout.Vertical spacing="xsmall" width="100%" padding={{ left: 'small' }}>
              <Text font={{ variation: FontVariation.BODY2 }} color={Color.PRIMARY_7}>
                {name}
              </Text>
              <Text font={{ variation: FontVariation.TINY }} lineClamp={1} width="85%">
                {description}
              </Text>
            </Layout.Vertical>
          </Layout.Horizontal>
        </Layout.Horizontal>
        <Text font={{ variation: FontVariation.TINY }}>{`by ${capitalize(kind)}`}</Text>
      </Layout.Horizontal>
    )
  }, [])

  const renderPluginForm = useCallback((): JSX.Element => {
    const { inputs = [] } = selectedPlugin || {}
    return (
      <Layout.Vertical height="100%">
        {inputs.map((input: Input) => {
          const { name } = input
          return name ? (
            <Layout.Horizontal padding="xmall">
              <FormInput.Text name={name} label={name} style={{ width: '100%' }}></FormInput.Text>
            </Layout.Horizontal>
          ) : null
        })}
      </Layout.Vertical>
    )
  }, [selectedPlugin])

  const renderPluginsPanel = useCallback((): JSX.Element => {
    if (loading) {
      return (
        <Container flex={{ justifyContent: 'space-evenly' }} padding="large">
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    }
    if (Array.isArray(plugins) && plugins.length > 0) {
      return (
        <Container className={css.overflow}>
          {plugins.map((item: PluginMetadataResponse) => renderPlugin(item))}
        </Container>
      )
    }
    if (query) {
      return (
        <Container flex={{ justifyContent: 'space-evenly' }} padding="large">
          <Text>{getString('noSearchResultsFoundPeriod')}</Text>
        </Container>
      )
    }
    if (error) {
      return (
        <Container flex={{ justifyContent: 'space-evenly' }} padding="large">
          <Text>{getString('errorTitle')}</Text>
        </Container>
      )
    }
    return <></>
  }, [loading, plugins, error, query])

  const { name: pluginName, repo: pluginDocumentationLink } = selectedPlugin || {}

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
            <Container style={{ height }} className={css.pluginDetailsPanel}>
              {pluginName ? (
                <Layout.Vertical
                  spacing="medium"
                  margin={{ left: 'xxlarge', top: 'large', right: 'xxlarge', bottom: 'xxlarge' }}
                  height="95%"
                  flex={{ alignItems: 'baseline', justifyContent: 'flex-start' }}
                >
                  <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small">
                    <Icon name="arrow-left" onClick={() => setSelectedPlugin(undefined)} className={css.backBtn} />
                    <Text font={{ variation: FontVariation.H5 }}>{pluginName}</Text>
                  </Layout.Horizontal>
                  <Container className={css.form}>
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
                            <Layout.Vertical
                              height="100%"
                              flex={{ justifyContent: 'space-between', alignItems: 'baseline' }}
                              spacing="small"
                            >
                              <Container className={css.pluginFields}>{renderPluginForm()}</Container>
                              <Layout.Horizontal flex spacing="xlarge">
                                <Button type="submit" variation={ButtonVariation.PRIMARY}>
                                  {getString('add')}
                                </Button>
                                {pluginDocumentationLink ? (
                                  <a href={pluginDocumentationLink} target="_blank" rel="noopener noreferrer">
                                    <Text className={css.docsLink}>{getString('common.seeDocumentation')}</Text>
                                  </a>
                                ) : null}
                              </Layout.Horizontal>
                            </Layout.Vertical>
                          </FormikForm>
                        )
                      }}
                    </Formik>
                  </Container>
                </Layout.Vertical>
              ) : (
                <Layout.Vertical>
                  <Container className={css.search}>
                    <ExpandingSearchInput
                      autoFocus={true}
                      alwaysExpanded={true}
                      defaultValue={query}
                      onChange={setQuery}
                    />
                  </Container>
                  {renderPluginsPanel()}
                </Layout.Vertical>
              )}
            </Container>
          }
        />
      </Tabs>
    </Container>
  )
}
