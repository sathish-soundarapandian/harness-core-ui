/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { capitalize, get, isEmpty } from 'lodash-es'
import { Classes, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import * as Yup from 'yup'
import { Color, FontVariation } from '@harness/design-system'
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
import { Input, PluginMetadataResponse, useListPlugins } from 'services/ci'
import { useStrings } from 'framework/strings'
import { Status } from '@common/utils/Constants'
// eslint-disable-next-line no-restricted-imports
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'

import css from './PluginsPanel.module.scss'

export enum PluginType {
  HARNESS = 'script',
  BITRISE = 'bitrise',
  ACTION = 'action'
}

export enum PluginKind {
  HARNESS = 'harness',
  BITRISE = 'bitrise',
  ACTION = 'action'
}

export interface PluginAddUpdateMetadata {
  pluginType: PluginType
  pluginData: Record<string, any>
  pluginName: PluginMetadataResponse['name']
  pluginUses: PluginMetadataResponse['uses']
  shouldInsertYAML: boolean
}

interface PluginsPanelInterface {
  selectedPluginFromYAMLView?: Record<string, any>
  onPluginAddUpdate: (pluginMetadata: PluginAddUpdateMetadata, isEdit: boolean) => void
  onPluginDiscard: () => void
  height?: React.CSSProperties['height']
  shouldEnableFormView?: boolean
  pluginAddUpdateOpnStatus?: Status
}

export function PluginsPanel(props: PluginsPanelInterface): React.ReactElement {
  const {
    height,
    onPluginAddUpdate,
    onPluginDiscard,
    selectedPluginFromYAMLView = {},
    pluginAddUpdateOpnStatus: pluginCrudOpnStatus = Status.TO_DO
  } = props
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

  const { name: pluginName, repo: pluginDocumentationLink, inputs: formFields, kind, uses } = plugin || {}

  const generateValidationSchema = useCallback((inputs: Input[]) => {
    let validationSchema = {}
    inputs.map((item: Input) => {
      const { name, required } = item
      if (required && name) {
        validationSchema = {
          ...validationSchema,
          [name]: Yup.string()
            .trim()
            .required(getString('common.validation.fieldIsRequired', { name: generateFriendlyPluginName(name) }))
        }
      }
    })
    return Yup.object().shape({ ...validationSchema })
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

  const renderPlugin = useCallback((_plugin: PluginMetadataResponse): JSX.Element => {
    const { name, description, kind: pluginKind } = _plugin
    return (
      <Layout.Horizontal
        padding={{ top: 'large', bottom: 'large', right: 'xlarge', left: 'xlarge' }}
        className={css.plugin}
        width="100%"
        flex={{ justifyContent: 'space-between' }}
        onClick={() => setPlugin(_plugin)}
      >
        <Layout.Horizontal style={{ flex: 2 }}>
          <Layout.Horizontal width="100%">
            <Icon name={'gear'} size={20} className={css.pluginIcon} />
            <Layout.Vertical spacing="xsmall" width="100%" padding={{ left: 'small' }}>
              <Text font={{ variation: FontVariation.BODY2 }} color={Color.PRIMARY_7} width="95%">
                {name}
              </Text>
              <Text font={{ variation: FontVariation.TINY }} lineClamp={1} width="85%">
                {description}
              </Text>
            </Layout.Vertical>
          </Layout.Horizontal>
        </Layout.Horizontal>
        <Text font={{ variation: FontVariation.TINY }}>{`by ${capitalize(pluginKind)}`}</Text>
      </Layout.Horizontal>
    )
  }, [])

  const generateFriendlyPluginName = useCallback((_pluginName: string): string => {
    return capitalize(_pluginName.split('_').join(' '))
  }, [])

  const generateLabelForPluginField = useCallback((formField: Input): JSX.Element | string => {
    const { name, description } = formField
    return (
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
        {name ? <Text font={{ variation: FontVariation.FORM_LABEL }}>{generateFriendlyPluginName(name)}</Text> : null}
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
    )
  }, [])

  const renderPluginForm = useCallback((): JSX.Element => {
    const { inputs = [] } = plugin || {}
    return inputs.length > 0 ? (
      <Layout.Vertical height="100%">
        {inputs.map((input: Input) => {
          const { name, secret } = input
          return name ? (
            <Layout.Horizontal padding="xmall">
              {secret ? (
                <MultiTypeSecretInput name={name} label={generateLabelForPluginField(input) as string} />
              ) : (
                <FormInput.Text
                  name={name}
                  label={generateLabelForPluginField(input)}
                  style={{ width: '100%' }}
                  placeholder={formFields?.find((item: Input) => item.name === name)?.default}
                />
              )}
            </Layout.Horizontal>
          ) : null
        })}
      </Layout.Vertical>
    ) : (
      <Layout.Vertical flex={{ justifyContent: 'center' }} spacing="large" height="100%">
        <Icon name="plugin-inputs" size={35} />
        <Text font={{ variation: FontVariation.BODY2 }}>{getString('common.noPluginInputsRequired')}</Text>
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

  const getPluginTypeFromKind = useCallback((_kind: string): PluginType => {
    switch (_kind) {
      case PluginKind.HARNESS:
        return PluginType.HARNESS
      case PluginKind.BITRISE:
        return PluginType.BITRISE
      case PluginKind.ACTION:
        return PluginType.ACTION
      default:
        return PluginType.HARNESS
    }
  }, [])

  const renderPluginAddUpdateOpnStatus = useCallback((): React.ReactElement => {
    switch (pluginCrudOpnStatus) {
      case Status.SUCCESS:
        return (
          <Layout.Horizontal spacing="small">
            <Icon color={Color.GREEN_700} name="tick-circle" />
            <Text color={Color.GREEN_700}>
              {isPluginUpdateAction ? getString('common.successfullyUpdated') : getString('common.successfullyAdded')}
            </Text>
          </Layout.Horizontal>
        )
      case Status.ERROR:
        return (
          <Layout.Horizontal spacing="small">
            <Icon color={Color.RED_500} name="circle-cross" />
            <Text color={Color.RED_500}>{getString('common.errorOccured', { verb: 'adding', entity: 'plugin' })}</Text>
          </Layout.Horizontal>
        )
      default:
        return <></>
    }
  }, [pluginCrudOpnStatus, isPluginUpdateAction])

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
              {pluginName && kind ? (
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
                          ? get(selectedPluginFromYAMLView, kind === PluginKind.HARNESS ? 'spec' : 'spec.with')
                          : {}
                      }
                      validationSchema={formFields ? generateValidationSchema(formFields) : {}}
                      enableReinitialize={true}
                      formName="pluginsForm"
                      onSubmit={formValues => {
                        try {
                          onPluginAddUpdate(
                            {
                              pluginName,
                              pluginData: formValues,
                              shouldInsertYAML: true,
                              pluginType: getPluginTypeFromKind(kind),
                              pluginUses: uses
                            },
                            isPluginUpdateAction
                          )
                        } catch (e) {
                          //ignore error
                        }
                      }}
                    >
                      {formikProps => {
                        return (
                          <FormikForm>
                            <Layout.Vertical
                              height="100%"
                              flex={{ justifyContent: 'space-between', alignItems: 'baseline' }}
                              spacing="small"
                            >
                              <Container className={css.pluginFields}>{renderPluginForm()}</Container>
                              <Layout.Horizontal flex spacing="xlarge">
                                <Button
                                  type="submit"
                                  variation={ButtonVariation.PRIMARY}
                                  disabled={formFields?.length === 0 || !formikProps.dirty}
                                >
                                  {isPluginUpdateAction ? getString('update') : getString('add')}
                                </Button>
                                {pluginDocumentationLink ? (
                                  <a href={pluginDocumentationLink} target="_blank" rel="noopener noreferrer">
                                    <Text className={css.docsLink}>{getString('common.seeDocumentation')}</Text>
                                  </a>
                                ) : null}
                              </Layout.Horizontal>
                              {[Status.SUCCESS, Status.ERROR].includes(pluginCrudOpnStatus) ? (
                                <Container padding={{ top: 'small', bottom: 'xsmall' }}>
                                  {renderPluginAddUpdateOpnStatus()}
                                </Container>
                              ) : (
                                <></>
                              )}
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
