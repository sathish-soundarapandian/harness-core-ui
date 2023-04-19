/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { capitalize, get, groupBy, isEmpty } from 'lodash-es'
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
  Popover,
  IconName,
  Accordion
} from '@harness/uicore'
import { Input, PluginMetadataResponse, useListPlugins } from 'services/ci'
import { useStrings } from 'framework/strings'
import { Status } from '@common/utils/Constants'
import { PluginType, PluginAddUpdateMetadata } from '@common/interfaces/YAMLBuilderProps'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'

import css from './PluginsPanel.module.scss'

export enum PluginKind {
  HarnessBuiltIn = 'harness-built-in',
  Harness = 'harness',
  Bitrise = 'bitrise',
  GitHubActions = 'action'
}

enum PluginPanelView {
  Category = 'CATEGORY',
  List = 'LIST',
  Configuration = 'CONFIGURATION'
}

enum PluginCategory {
  RunStep = 'RUN_STEP',
  RunTestStep = 'RUN_TEST_STEP',
  BackgroundStep = 'BACKGROUND_STEP',
  Harness = 'HARNESS',
  GithubActions = 'GITHUB_ACTIONS',
  Bitrise = 'BITRISE'
}

interface PluginsPanelInterface {
  selectedPluginFromYAMLView?: Record<string, any>
  onPluginAddUpdate?: (pluginMetadata: PluginAddUpdateMetadata, isEdit: boolean) => void
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
    pluginAddUpdateOpnStatus = Status.TO_DO
  } = props
  const { getString } = useStrings()
  const [selectedPlugin, setSelectedPlugin] = useState<PluginMetadataResponse | undefined>()
  const [plugins, setPlugins] = useState<PluginMetadataResponse[]>([])
  const [query, setQuery] = useState<string>()
  const [pluginCategory, setPluginCategory] = useState<PluginCategory>()
  const [pluginPanelView, setPluginPanelView] = useState<PluginPanelView>(PluginPanelView.Category)

  const [isPluginUpdateAction, setIsPluginUpdateAction] = useState<boolean>(false)
  const defaultQueryParams = { pageIndex: 0, pageSize: 200 }
  const {
    data,
    loading,
    error,
    refetch: fetchPlugins
  } = useListPlugins({ queryParams: defaultQueryParams, lazy: true })
  const scriptPlugin: PluginMetadataResponse = {
    name: 'Script',
    inputs: [{ name: 'run', type: 'Textarea', required: true } as Input],
    kind: PluginKind.HarnessBuiltIn,
    description: getString('common.plugin.runStepDesc')
  }
  const selectedPluginName: string = get(selectedPluginFromYAMLView, 'name', '')
  const selectedPluginType: PluginType = get(selectedPluginFromYAMLView, 'type', '')
  const HarnessBuiltInSteps = [PluginCategory.RunStep, PluginCategory.RunTestStep, PluginCategory.BackgroundStep]

  useEffect(() => {
    if (!isEmpty(selectedPluginFromYAMLView)) {
      setPluginPanelView(PluginPanelView.Configuration)
      setIsPluginUpdateAction(true)
      if (selectedPluginType === PluginType.Script) {
        setSelectedPlugin(scriptPlugin)
        setPluginCategory(PluginCategory.RunStep)
      } else if (selectedPluginName) {
        setQuery(selectedPluginName)
      }
    }
  }, [selectedPluginFromYAMLView])

  useEffect(() => {
    if (!error && !loading) {
      setPlugins(data?.data?.content || [])
    }
  }, [data, loading, error])

  useEffect(() => {
    if (selectedPluginName) {
      const matchingPlugin = plugins.find((item: PluginMetadataResponse) => item.name === selectedPluginName)
      if (matchingPlugin) {
        setSelectedPlugin(matchingPlugin)
        const matchingCategory = getPluginCategoryForPluginKind(get(matchingPlugin, 'kind') as PluginKind)
        if (matchingCategory) {
          setPluginCategory(matchingCategory)
        }
      }
    }
  }, [plugins])

  useEffect(() => {
    if (
      pluginPanelView === PluginPanelView.List ||
      (!isEmpty(selectedPluginFromYAMLView) && pluginPanelView === PluginPanelView.Configuration)
    ) {
      fetchPlugins({ queryParams: { ...defaultQueryParams, searchTerm: query || '' } })
    }
  }, [query, pluginPanelView])

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

  const renderPluginsPanel = useCallback((): JSX.Element => {
    switch (pluginPanelView) {
      case PluginPanelView.Category:
        return renderPluginsPanelCategoryView()
      case PluginPanelView.Configuration:
        return renderPluginsPanelConfigurationView()
      case PluginPanelView.List:
        return renderPluginsPanelListView()
      default:
        return <></>
    }
  }, [pluginPanelView, pluginCategory, plugins, loading, error, query, selectedPlugin, pluginAddUpdateOpnStatus])

  const getPluginCategoryForPluginKind = useCallback((kind: PluginKind): PluginCategory | undefined => {
    switch (kind) {
      case PluginKind.Harness:
        return PluginCategory.Harness
      case PluginKind.Bitrise:
        return PluginCategory.Bitrise
      case PluginKind.GitHubActions:
        return PluginCategory.GithubActions
    }
  }, [])

  const getFixedPluginForCategory = useCallback((category: PluginCategory): PluginMetadataResponse | undefined => {
    // TODO define individual plugin for below categories once schema/fieldds for them are finalized
    switch (category) {
      case PluginCategory.RunStep:
      case PluginCategory.RunTestStep:
      case PluginCategory.BackgroundStep:
        return scriptPlugin
    }
  }, [])

  const renderPluginsPanelCategoryView = useCallback((): JSX.Element => {
    const categories: { category: PluginCategory; label: string; description: string; iconName: IconName }[] = [
      {
        category: PluginCategory.RunStep,
        label: `${getString('runPipelineText')} ${getString('step')}`,
        description: getString('common.plugin.runStepDesc'),
        iconName: 'run-step-plugin'
      },
      {
        category: PluginCategory.RunTestStep,
        label: `${getString('runPipelineText')} ${getString('test')} ${getString('step')}`,
        description: getString('common.plugin.runTestStepDesc'),
        iconName: 'run-test-step-plugin'
      },
      {
        category: PluginCategory.BackgroundStep,
        label: `${getString('common.background')} ${getString('step')}`,
        description: getString('common.plugin.backgroundStepDesc'),
        iconName: 'background-step-plugin'
      },
      {
        category: PluginCategory.Harness,
        label: `${getString('harness')} ${getString('common.plugins')}`,
        description: getString('common.plugin.harnessPluginsDesc'),
        iconName: 'harness-plugin'
      },
      {
        category: PluginCategory.Bitrise,
        label: `${getString('common.bitrise')} ${getString('common.plugins')}`,
        description: getString('common.plugin.bitrisePluginsDesc'),
        iconName: 'bitrise-plugin'
      },
      {
        category: PluginCategory.GithubActions,
        label: `${getString('common.gitHubActions')}`,
        description: getString('common.plugin.gitHubActionsPluginsDesc'),
        iconName: 'github-action-plugin'
      }
    ]
    return (
      <Container>
        {categories.map(
          (item: { category: PluginCategory; label: string; description: string; iconName: IconName }) => {
            const { category, label, description, iconName } = item
            return (
              <Layout.Horizontal
                key={label}
                padding={{ left: 'xlarge', top: 'medium', bottom: 'medium', right: 'xlarge' }}
                className={css.pluginCategory}
                onClick={() => {
                  setPluginCategory(category)
                  if (HarnessBuiltInSteps.includes(category)) {
                    const plugin = getFixedPluginForCategory(category)
                    if (plugin) {
                      setSelectedPlugin(plugin)
                    }
                    setPluginPanelView(PluginPanelView.Configuration)
                  } else {
                    setPluginPanelView(PluginPanelView.List)
                  }
                }}
              >
                <Icon name={iconName} size={16} className={css.categoryIcon} />
                <Layout.Vertical spacing="small" padding={{ left: 'small' }}>
                  <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.BODY2 }}>
                    {label}
                  </Text>
                  <Text font={{ variation: FontVariation.TINY }}>{description}</Text>
                </Layout.Vertical>
              </Layout.Horizontal>
            )
          }
        )}
      </Container>
    )
  }, [])

  //#region Plugins List

  const renderPluginsPanelListView = useCallback((): JSX.Element => {
    let el: JSX.Element = <></>
    if (loading) {
      el = (
        <Container flex={{ justifyContent: 'space-evenly' }} padding="large">
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    } else {
      if (error) {
        el = (
          <Container flex={{ justifyContent: 'space-evenly' }} padding="large">
            <Text>{getString('errorTitle')}</Text>
          </Container>
        )
      } else {
        if (Array.isArray(plugins) && plugins.length > 0) {
          el = (
            <Container className={css.overflow}>
              {plugins.map((item: PluginMetadataResponse, index: number) => renderPlugin(item, index))}
            </Container>
          )
        } else if (query) {
          el = (
            <Container flex={{ justifyContent: 'space-evenly' }} padding="large">
              <Text>{getString('noSearchResultsFoundPeriod')}</Text>
            </Container>
          )
        }
      }
    }
    return (
      <Layout.Vertical>
        <Container className={css.search}>
          <Layout.Horizontal flex>
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small">
              <Icon name="arrow-left" onClick={handleBackArrowClick} className={css.backBtn} />
              <Text font={{ variation: FontVariation.H5 }}>{`${getString('select')} ${getString(
                'common.plugin.label'
              )}`}</Text>
            </Layout.Horizontal>
            <ExpandingSearchInput
              autoFocus={true}
              alwaysExpanded={true}
              defaultValue={query}
              onChange={setQuery}
              className={css.expandingSearch}
            />
          </Layout.Horizontal>
        </Container>
        {el}
      </Layout.Vertical>
    )
  }, [loading, plugins, error, query])

  const getPluginIconForKind = useCallback((pluginKind: string): IconName => {
    switch (pluginKind) {
      case PluginKind.HarnessBuiltIn:
      case PluginKind.Harness:
        return 'harness'
      case PluginKind.Bitrise:
        return 'bitrise'
      case PluginKind.GitHubActions:
        return 'github-actions'
      default:
        return 'gear'
    }
  }, [])

  const getCertificationLabelForKind = useCallback((_kindOfPlugin: string): string => {
    switch (_kindOfPlugin) {
      case PluginKind.Harness:
      case PluginKind.HarnessBuiltIn:
        return `by ${capitalize(PluginKind.Harness)}`
      case PluginKind.Bitrise:
        return `by ${capitalize(_kindOfPlugin)}`
      case PluginKind.GitHubActions:
        return `by ${getString('common.repo_provider.githubLabel')} ${capitalize(_kindOfPlugin)}`
      default:
        return ''
    }
  }, [])

  const getPluginTypeFromKind = useCallback((kindOfPlugin: string): PluginType => {
    switch (kindOfPlugin) {
      case PluginKind.HarnessBuiltIn:
        return PluginType.Script
      case PluginKind.Harness:
        return PluginType.Plugin
      case PluginKind.Bitrise:
        return PluginType.Bitrise
      case PluginKind.GitHubActions:
        return PluginType.Action
      default:
        return PluginType.Plugin
    }
  }, [])

  const renderPlugin = useCallback((_plugin: PluginMetadataResponse, index?: number): JSX.Element => {
    const { name, description, kind: pluginKind } = _plugin
    return (
      <Layout.Horizontal
        className={css.plugin}
        width="100%"
        flex={{ justifyContent: 'space-between' }}
        onClick={() => {
          setSelectedPlugin(_plugin)
          setPluginPanelView(PluginPanelView.Configuration)
        }}
        key={index}
      >
        <Layout.Horizontal style={{ flex: 2 }}>
          <Layout.Horizontal width="100%">
            {pluginKind ? <Icon name={getPluginIconForKind(pluginKind)} size={20} className={css.pluginIcon} /> : null}
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
        {pluginKind ? (
          <Text font={{ variation: FontVariation.TINY }}>{getCertificationLabelForKind(pluginKind)}</Text>
        ) : null}
      </Layout.Horizontal>
    )
  }, [])

  //#endregion

  //#region Plugin Configuration

  const renderPluginsPanelConfigurationView = useCallback((): JSX.Element => {
    if (!selectedPlugin) {
      return <></>
    }
    const { name: pluginName, repo: pluginDocumentationLink, inputs: formFields, kind, uses, image } = selectedPlugin
    return kind ? (
      <Layout.Vertical
        spacing="medium"
        margin={{ left: 'xxlarge', top: 'large', right: 'xxlarge', bottom: 'xxlarge' }}
        height="95%"
        flex={{ alignItems: 'baseline', justifyContent: 'flex-start' }}
      >
        <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small">
          <Icon name="arrow-left" onClick={handleBackArrowClick} className={css.backBtn} />
          <Text font={{ variation: FontVariation.H5 }}>{pluginName}</Text>
        </Layout.Horizontal>
        <Container className={css.form}>
          <Formik
            initialValues={
              isPluginUpdateAction
                ? get(selectedPluginFromYAMLView, kind === PluginKind.HarnessBuiltIn ? 'spec' : 'spec.with')
                : {}
            }
            validationSchema={formFields ? generateValidationSchema(formFields) : {}}
            enableReinitialize={true}
            formName="pluginsForm"
            onSubmit={formValues => {
              try {
                onPluginAddUpdate?.(
                  {
                    pluginName:
                      kind === PluginKind.HarnessBuiltIn && selectedPluginName ? selectedPluginName : pluginName,
                    pluginData: formValues,
                    shouldInsertYAML: true,
                    pluginType: getPluginTypeFromKind(kind),
                    ...(uses ? { pluginUses: uses } : {}),
                    ...(image ? { pluginImage: image } : {})
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
                    <Container className={css.pluginFields}>{renderPluginCongigurationForm()}</Container>
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
                    {[Status.SUCCESS, Status.ERROR].includes(pluginAddUpdateOpnStatus) ? (
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
      <></>
    )
  }, [selectedPlugin, pluginAddUpdateOpnStatus])

  const renderPluginCongigurationFormField = useCallback(
    ({ field, index }: { field: Input; index: number }): JSX.Element => {
      const { name, default: defaultValue, secret: isFieldOfSecretType } = field
      if (name) {
        // switch (type) {
        //   case 'Textarea':
        //     return (
        //       <FormInput.TextArea
        //         name={name}
        //         label={generateLabelForPluginField(field)}
        //         style={{ width: '100%' }}
        //         placeholder={defaultValue}
        //         key={index}
        //       />
        //     )
        //   case 'String':
        //   default:
        //     return isFieldOfSecretType ? (
        //       <MultiTypeSecretInput
        //         name={name}
        //         label={generateFriendlyPluginName(name)}
        //         type={'SecretText'}
        //         key={index}
        //       />
        //     ) : (
        //       <FormInput.Text
        //         name={name}
        //         label={generateLabelForPluginField(field)}
        //         style={{ width: '100%' }}
        //         placeholder={defaultValue}
        //         key={index}
        //       />
        //     )
        // }
        return isFieldOfSecretType ? (
          <Container className={css.secretSelector}>
            <MultiTypeSecretInput
              name={name}
              label={generateFriendlyPluginName(name)}
              type={'SecretText'}
              key={index}
            />
          </Container>
        ) : (
          <FormInput.Text
            name={name}
            label={generateLabelForPluginField(field)}
            style={{ width: '100%' }}
            placeholder={defaultValue}
            key={index}
          />
        )
      }
      return <></>
    },
    []
  )

  const renderPluginCongigurationForm = useCallback((): JSX.Element => {
    const { inputs: formFields = [] } = selectedPlugin || {}
    if (formFields.length > 0) {
      const partitionedFields = groupBy(formFields, 'required')
      const requiredFields = partitionedFields['true'] || []
      const optionalFields = partitionedFields['false'] || []
      const optionalFieldsSection = optionalFields.map((input: Input, index: number) => {
        return renderPluginCongigurationFormField({ field: input, index })
      })
      return (
        <Layout.Vertical height="100%">
          {requiredFields.length > 0 ? (
            requiredFields.map((input: Input, index: number) => {
              return renderPluginCongigurationFormField({ field: input, index })
            })
          ) : (
            <></>
          )}
          {requiredFields.length > 0 && optionalFields.length > 0 ? (
            <Accordion>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={optionalFieldsSection}
              />
            </Accordion>
          ) : optionalFields.length > 0 ? (
            <>{optionalFieldsSection}</>
          ) : (
            <></>
          )}
        </Layout.Vertical>
      )
    }
    return (
      <Layout.Vertical flex={{ justifyContent: 'center' }} spacing="large" height="100%">
        <Icon name="plugin-inputs" size={35} />
        <Text font={{ variation: FontVariation.BODY2 }}>{getString('common.noPluginInputsRequired')}</Text>
      </Layout.Vertical>
    )
  }, [selectedPlugin])

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

  const renderPluginAddUpdateOpnStatus = useCallback((): React.ReactElement => {
    switch (pluginAddUpdateOpnStatus) {
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
  }, [pluginAddUpdateOpnStatus, isPluginUpdateAction])

  //#endregion

  const handleBackArrowClick = useCallback((): void => {
    if (pluginPanelView === PluginPanelView.Configuration) {
      if (pluginCategory && HarnessBuiltInSteps.includes(pluginCategory)) {
        setPluginPanelView(PluginPanelView.Category)
      } else {
        setPluginPanelView(PluginPanelView.List)
      }
    } else if (pluginPanelView === PluginPanelView.List) {
      setPluginPanelView(PluginPanelView.Category)
    }
    onPluginDiscard()
    setPluginCategory(undefined)
    setSelectedPlugin(undefined)
    setIsPluginUpdateAction(false)
    setQuery('') // TODO query should be plugin type specific here
  }, [pluginCategory, pluginPanelView])

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
              {renderPluginsPanel()}
            </Container>
          }
        />
      </Tabs>
    </Container>
  )
}
