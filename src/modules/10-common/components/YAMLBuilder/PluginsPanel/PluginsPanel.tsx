/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { capitalize, get, isEmpty } from 'lodash-es'
import { Classes, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import { Input, PluginMetadataResponse, useListPlugins } from 'services/ci'
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
  FormInput,
  Popover
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import css from './PluginsPanel.module.scss'

export interface PluginAddUpdateMetadata {
  pluginData: Record<string, any>
  pluginName: string
  shouldInsertYAML: boolean
}

interface PluginsPanelInterface {
  selectedPluginFromYAMLView?: Record<string, any>
  onPluginAddUpdate: (pluginMetadata: PluginAddUpdateMetadata, isEdit: boolean) => void
  onPluginDiscard: () => void
  height?: React.CSSProperties['height']
  shouldEnableFormView?: boolean
}

export function PluginsPanel(props: PluginsPanelInterface): React.ReactElement {
  const { height, onPluginAddUpdate, onPluginDiscard, selectedPluginFromYAMLView = {} } = props
  const { getString } = useStrings()
  const [plugin, setPlugin] = useState<PluginMetadataResponse | undefined>()
  const [plugins, setPlugins] = useState<PluginMetadataResponse[]>([])
  const [query, setQuery] = useState<string>()
  const [isPluginUpdateAction, setIsPluginUpdateAction] = useState<boolean>(false)

  const defaultQueryParams = { pageIndex: 0, pageSize: 200 }
  const { data, loading, error, refetch } = useListPlugins({ queryParams: defaultQueryParams })

  useEffect(() => {
    if (!isEmpty(selectedPluginFromYAMLView)) {
      setIsPluginUpdateAction(true)
      const pluginNameFromYAML = get(selectedPluginFromYAMLView, 'name', '')
      if (pluginNameFromYAML) {
        setQuery(pluginNameFromYAML)
        // first look up for matching plugin names in existing plugins list
        const matchingPlugin = plugins.filter((item: PluginMetadataResponse) => item.name === pluginNameFromYAML)?.[0]
        if (matchingPlugin) {
          setPlugin(matchingPlugin)
        } else {
          // if not found, make an api call to fetch it
          searchPlugins(pluginNameFromYAML)
        }
      }
    }
  }, [selectedPluginFromYAMLView])

  useEffect(() => {
    if (!error && !loading) {
      setPlugins(data?.data?.content || [])
    }
  }, [data, loading, error])

  useEffect(() => {
    if (query && !isEmpty(selectedPluginFromYAMLView)) {
      const pluginNameFromYAML = get(selectedPluginFromYAMLView, 'name', '')
      const matchingPlugin = plugins.filter((item: PluginMetadataResponse) => item.name === pluginNameFromYAML)?.[0]
      setPlugin(matchingPlugin)
    }
  }, [query, plugins, selectedPluginFromYAMLView])

  const { name: pluginName, repo: pluginDocumentationLink, inputs: formFields } = plugin || {}

  const generateFormikInitialValues = useCallback((inputs: Input[]): Record<string, any> => {
    const result = new Map(inputs.map(i => [i.name, i.default]))
    return Object.fromEntries(result)
  }, [])

  const onBackArrowClick = useCallback((): void => {
    onPluginDiscard()
    setPlugin(undefined)
    setIsPluginUpdateAction(false)
    setQuery('')
    searchPlugins('')
  }, [])

  const searchPlugins = useCallback((searchTerm: string) => {
    refetch({ queryParams: { ...defaultQueryParams, searchTerm } })
  }, [])

  const renderPlugin = useCallback((plugin: PluginMetadataResponse): JSX.Element => {
    const { name, description, kind } = plugin
    return (
      <Layout.Horizontal
        padding={{ top: 'large', bottom: 'large', right: 'xlarge', left: 'xlarge' }}
        className={css.plugin}
        width="100%"
        flex={{ justifyContent: 'space-between' }}
        onClick={() => setPlugin(plugin)}
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
    const { inputs = [] } = plugin || {}
    return (
      <Layout.Vertical height="100%">
        {inputs.map((input: Input) => {
          const { name, description } = input
          return name ? (
            <Layout.Horizontal padding="xmall">
              <FormInput.Text
                name={name}
                label={
                  <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
                    <Text font={{ variation: FontVariation.FORM_LABEL }}>{capitalize(name.split('_').join(' '))}</Text>
                    {description ? (
                      <Popover
                        interactionKind={PopoverInteractionKind.HOVER}
                        boundary="viewport"
                        position={PopoverPosition.RIGHT}
                        popoverClassName={Classes.DARK}
                        content={
                          <Container padding="medium">
                            <Text font={{ variation: FontVariation.TINY }} color={Color.WHITE}>
                              {description}
                            </Text>
                          </Container>
                        }
                      >
                        <Icon name="info" color={Color.PRIMARY_7} size={10} padding={{ bottom: 'small' }} />
                      </Popover>
                    ) : null}
                  </Layout.Horizontal>
                }
                style={{ width: '100%' }}
              ></FormInput.Text>
            </Layout.Horizontal>
          ) : null
        })}
      </Layout.Vertical>
    )
  }, [plugin])

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
                    <Icon name="arrow-left" onClick={onBackArrowClick} className={css.backBtn} />
                    <Text font={{ variation: FontVariation.H5 }}>{pluginName}</Text>
                  </Layout.Horizontal>
                  <Container className={css.form}>
                    <Formik
                      initialValues={
                        isPluginUpdateAction
                          ? get(selectedPluginFromYAMLView, 'spec')
                          : formFields
                          ? generateFormikInitialValues(formFields)
                          : {}
                      }
                      enableReinitialize={true}
                      formName="pluginsForm"
                      onSubmit={data => {
                        try {
                          onPluginAddUpdate(
                            { pluginName, pluginData: data, shouldInsertYAML: true } as PluginAddUpdateMetadata,
                            isPluginUpdateAction
                          )
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
                                  {isPluginUpdateAction ? getString('update') : getString('add')}
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
                      onChange={(searchTerm: string) => {
                        searchPlugins(searchTerm)
                        setQuery(searchTerm)
                      }}
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
