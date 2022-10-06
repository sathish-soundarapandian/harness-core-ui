/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  ButtonSize,
  ButtonVariation,
  Container,
  Icon,
  Layout,
  PageBody,
  PageError,
  SelectOption,
  Tab,
  Tabs,
  Text
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo, isEmpty, unset } from 'lodash-es'
import produce from 'immer'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { TemplateTags } from '@templates-library/components/TemplateTags/TemplateTags'
import { PageSpinner } from '@common/components'
import {
  getIconForTemplate,
  getTypeForTemplate,
  TemplateListType
} from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { useMutateAsGet } from '@common/hooks'
import {
  Error,
  NGTemplateInfoConfig,
  TemplateMetadataSummaryResponse,
  TemplateResponse,
  TemplateSummaryResponse,
  useGetTemplate,
  useGetTemplateList,
  useGetTemplateMetadataList
} from 'services/template-ng'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import GitPopover from '@pipeline/components/GitPopover/GitPopover'
import { TemplateYaml } from '@pipeline/components/PipelineStudio/TemplateYaml/TemplateYaml'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getVersionLabelText } from '@templates-library/utils/templatesUtils'
import EntitySetupUsage from '@common/pages/entityUsage/EntityUsage'
import { EntityType } from '@common/pages/entityUsage/EntityConstants'
import NoEntityFound, { ErrorPlacement } from '@pipeline/pages/utils/NoEntityFound/NoEntityFound'
import StudioGitPopover from '@pipeline/components/PipelineStudio/StudioGitPopover'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import { ErrorHandler, ResponseMessage } from '@common/components/ErrorHandler/ErrorHandler'
import {
  DefaultStableVersionValue,
  VersionsDropDown
} from '@templates-library/components/VersionsDropDown/VersionsDropDown'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import { TemplateActivityLog } from '../TemplateActivityLog/TemplateActivityLog'
import css from './TemplateDetails.module.scss'

export interface TemplateDetailsProps {
  template: TemplateSummaryResponse
  setTemplate?: (template: TemplateSummaryResponse) => void
  storeMetadata?: StoreMetadata
  isStandAlone?: boolean
  disableVersionChange?: boolean
}

export enum TemplateTabs {
  INPUTS = 'INPUTS',
  YAML = 'YAML',
  REFERENCEDBY = 'REFERENCEDBY'
}

export enum ParentTemplateTabs {
  BASIC = 'BASIC',
  ACTVITYLOG = 'ACTVITYLOG'
}

interface Params {
  selectedTemplate: TemplateSummaryResponse
  templates: TemplateSummaryResponse[]
}

const getTemplateEntityIdentifier = ({ selectedTemplate, templates }: Params): string => {
  const versionLabel = selectedTemplate.versionLabel
    ? selectedTemplate.versionLabel
    : (templates.find(template => template.stableTemplate && template.versionLabel) as TemplateSummaryResponse)
        .versionLabel

  return `${selectedTemplate.identifier}/${versionLabel}/`
}

export const TemplateDetails: React.FC<TemplateDetailsProps> = props => {
  const { template, setTemplate, storeMetadata, isStandAlone = false, disableVersionChange = false } = props
  const { getString } = useStrings()
  const history = useHistory()
  const [versionOptions, setVersionOptions] = React.useState<SelectOption[]>([])
  const {
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF,
    supportingTemplatesGitx
  } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const [templates, setTemplates] = React.useState<TemplateSummaryResponse[] | TemplateMetadataSummaryResponse[]>([])
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateSummaryResponse | TemplateResponse>()
  const [selectedParentTab, setSelectedParentTab] = React.useState<ParentTemplateTabs>(ParentTemplateTabs.BASIC)
  const [selectedTab, setSelectedTab] = React.useState<TemplateTabs>(TemplateTabs.INPUTS)
  const params = useParams<ProjectPathProps & ModulePathParams>()
  const { accountId, module } = params
  const [selectedBranch, setSelectedBranch] = React.useState<string | undefined>()
  const gitPopoverBranch = isStandAlone ? storeMetadata?.branch : selectedBranch

  const stableVersion = React.useMemo(() => {
    return (templates as TemplateSummaryResponse[])?.find(item => item.stableTemplate && !isEmpty(item.versionLabel))
      ?.versionLabel
  }, [templates])

  const {
    data: templateYamlData,
    refetch: refetchTemplateYaml,
    loading: loadingTemplateYaml,
    error: templateYamlError
  } = useGetTemplate({
    templateIdentifier: defaultTo(selectedTemplate?.identifier, ''),
    queryParams: {
      accountIdentifier: defaultTo(selectedTemplate?.accountId, accountId),
      orgIdentifier: selectedTemplate?.orgIdentifier,
      projectIdentifier: selectedTemplate?.projectIdentifier,
      versionLabel: selectedTemplate?.versionLabel,
      ...getGitQueryParamsWithParentScope(storeMetadata, params)
    },
    lazy: true
  })

  const {
    data: templateData,
    refetch: reloadTemplates,
    loading,
    error: templatesError
  } = useMutateAsGet(supportingTemplatesGitx ? useGetTemplateMetadataList : useGetTemplateList, {
    body: {
      filterType: 'Template',
      templateIdentifiers: [template.identifier]
    },
    queryParams: {
      accountIdentifier: defaultTo(template.accountId, accountId),
      orgIdentifier: template.orgIdentifier,
      projectIdentifier: template.projectIdentifier,
      module,
      templateListType: TemplateListType.All,
      ...(isGitSyncEnabled
        ? { repoIdentifier: template.gitDetails?.repoIdentifier, branch: template.gitDetails?.branch }
        : {})
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const templateIcon = React.useMemo(() => getIconForTemplate(getString, selectedTemplate), [selectedTemplate])
  const templateType = React.useMemo(() => getTypeForTemplate(getString, selectedTemplate), [selectedTemplate])

  const templateYamlErrorResponseMessages = (templateYamlError?.data as Error)?.responseMessages ?? []

  React.useEffect(() => {
    if (templateData?.data?.content) {
      const allVersions = [...templateData.data.content]
      if (isStandAlone) {
        const templateStableVersion = { ...allVersions.find(item => item.stableTemplate) }
        delete templateStableVersion.versionLabel
        allVersions.unshift(templateStableVersion)
      }
      setTemplates(allVersions)
    }
  }, [isStandAlone, templateData])

  React.useEffect(() => {
    const newVersionOptions: SelectOption[] = (templates as TemplateSummaryResponse[]).map(item => {
      return {
        label: getVersionLabelText(item, getString),
        value: defaultTo(item.versionLabel, DefaultStableVersionValue)
      } as SelectOption
    })
    setVersionOptions(newVersionOptions)
    setSelectedTemplate(
      (templates as TemplateSummaryResponse[]).find(item => item.versionLabel === template.versionLabel)
    )
  }, [templates])

  React.useEffect(() => {
    if (selectedTemplate) {
      setTemplate?.(selectedTemplate)

      if (isEmpty(selectedTemplate?.yaml)) {
        refetchTemplateYaml()
      }
    }
  }, [selectedTemplate])

  React.useEffect(() => {
    if (templateYamlData?.data) {
      const templateWithYaml = produce(templateYamlData.data, draft => {
        if (isEmpty(selectedTemplate?.versionLabel)) {
          unset(draft, 'versionLabel')
        }
      })
      setSelectedTemplate(templateWithYaml)
    }
  }, [templateYamlData?.data])

  const onChange = React.useCallback(
    (option: SelectOption): void => {
      const version = defaultTo(option.value?.toString(), '')
      if (version === DefaultStableVersionValue) {
        setSelectedTemplate((templates as TemplateSummaryResponse[]).find(item => !item.versionLabel))
      } else {
        setSelectedTemplate((templates as TemplateSummaryResponse[]).find(item => item.versionLabel === version))
      }
    },
    [templates]
  )

  const handleTabChange = React.useCallback((tab: TemplateTabs) => {
    setSelectedTab(tab)
  }, [])

  const handleParentTabChange = React.useCallback(
    (tab: ParentTemplateTabs) => {
      setSelectedParentTab(tab)
    },
    [setSelectedParentTab]
  )

  const onGitBranchChange = ({ branch }: GitFilterScope, defaultSelected?: boolean): void => {
    setSelectedBranch(branch)
    if (!defaultSelected) {
      refetchTemplateYaml({
        queryParams: {
          accountIdentifier: defaultTo(selectedTemplate?.accountId, accountId),
          orgIdentifier: selectedTemplate?.orgIdentifier,
          projectIdentifier: selectedTemplate?.projectIdentifier,
          versionLabel: selectedTemplate?.versionLabel,
          branch
        }
      })
    }
  }

  const goToTemplateStudio = (): void => {
    if (selectedTemplate) {
      const url = routes.toTemplateStudio({
        projectIdentifier: selectedTemplate.projectIdentifier,
        orgIdentifier: selectedTemplate.orgIdentifier,
        accountId: defaultTo(selectedTemplate.accountId, ''),
        module,
        templateType: selectedTemplate.templateEntityType,
        templateIdentifier: selectedTemplate.identifier,
        versionLabel: selectedTemplate.versionLabel,
        repoIdentifier: selectedTemplate.gitDetails?.repoIdentifier,
        branch: !isStandAlone ? selectedTemplate.gitDetails?.branch || selectedBranch : storeMetadata?.branch
      })

      if (isStandAlone) {
        window.open(`#${url}`, '_blank')
      } else {
        history.push(url)
      }
    }
  }

  const ErrorPanel = (
    <Container className={css.errorPanel}>
      {!isStandAlone ? (
        <NoEntityFound
          errorPlacement={ErrorPlacement.BOTTOM}
          identifier={selectedTemplate?.identifier as string}
          entityType={'template'}
          errorObj={templateYamlError?.data as Error}
          gitDetails={{
            connectorRef: (selectedTemplate as TemplateResponse)?.connectorRef,
            repoName: (selectedTemplate as TemplateResponse)?.gitDetails?.repoName,
            branch: selectedBranch,
            onBranchChange: onGitBranchChange
          }}
        />
      ) : (
        <ErrorHandler
          responseMessages={(templateYamlError?.data as Error)?.responseMessages as ResponseMessage[]}
          className={css.errorHandler}
        />
      )}
    </Container>
  )

  const TemplateInputsTabPanel = !isEmpty(templateYamlErrorResponseMessages) ? (
    ErrorPanel
  ) : !isEmpty(selectedTemplate?.yaml) && selectedTemplate ? (
    templateFactory.getTemplate(selectedTemplate.templateEntityType || '')?.renderTemplateInputsForm({
      template: selectedTemplate,
      accountId: defaultTo(template.accountId, ''),
      storeMetadata
    })
  ) : (
    <PageBody className={css.yamlLoader} loading />
  )

  const TemplateYamlTabPanel = loadingTemplateYaml ? (
    <PageBody className={css.yamlLoader} loading />
  ) : !isEmpty(templateYamlErrorResponseMessages) ? (
    ErrorPanel
  ) : (
    <TemplateYaml templateYaml={defaultTo(selectedTemplate?.yaml, '')} />
  )

  return (
    <Container height={'100%'} className={css.container} data-template-id={template.identifier}>
      <Layout.Vertical flex={{ align: 'center-center' }} height={'100%'}>
        {loading && <PageSpinner />}
        {!loading && templatesError && (
          <PageError
            message={defaultTo((templatesError.data as Error)?.message, templatesError.message)}
            onClick={reloadTemplates}
          />
        )}
        {!templatesError && selectedTemplate && (
          <Container height={'100%'} width={'100%'}>
            <Layout.Vertical height={'100%'}>
              <Layout.Horizontal
                flex={{ alignItems: 'center' }}
                spacing={'huge'}
                padding={{ top: 'large', left: 'xxlarge', bottom: 'large', right: 'xxlarge' }}
                border={{ bottom: true }}
              >
                <Layout.Horizontal className={css.shrink} spacing={'small'}>
                  <Text lineClamp={1} font={{ size: 'medium', weight: 'bold' }} color={Color.GREY_800}>
                    {selectedTemplate.name}
                  </Text>
                  {supportingTemplatesGitx && (
                    <StudioGitPopover
                      connectorRef={(selectedTemplate as TemplateResponse).connectorRef}
                      gitDetails={defaultTo(
                        {
                          ...selectedTemplate.gitDetails,
                          branch: defaultTo(gitPopoverBranch, selectedTemplate.gitDetails?.branch)
                        },
                        {}
                      )}
                      onGitBranchChange={onGitBranchChange}
                      identifier={defaultTo(selectedTemplate?.identifier, '')}
                      isReadonly={isStandAlone}
                      entityData={selectedTemplate as NGTemplateInfoConfig}
                      entityType={defaultTo(selectedTemplate?.templateEntityType, '')}
                    />
                  )}
                  {isGitSyncEnabled && (
                    <GitPopover
                      data={defaultTo(selectedTemplate.gitDetails, {})}
                      iconProps={{ margin: { left: 'small', top: 'xsmall' } }}
                    />
                  )}
                </Layout.Horizontal>
                <RbacButton
                  text={getString('templatesLibrary.openInTemplateStudio')}
                  variation={ButtonVariation.SECONDARY}
                  size={ButtonSize.SMALL}
                  className={css.openInStudio}
                  onClick={goToTemplateStudio}
                  permission={{
                    permission: PermissionIdentifier.VIEW_TEMPLATE,
                    resource: {
                      resourceType: ResourceType.TEMPLATE
                    }
                  }}
                />
              </Layout.Horizontal>
              <Container background={Color.FORM_BG} className={css.tabsContainer}>
                <Tabs id="template-details-parent" selectedTabId={selectedParentTab} onChange={handleParentTabChange}>
                  <Tab
                    id={ParentTemplateTabs.BASIC}
                    title={getString('details')}
                    panel={
                      <Layout.Vertical height={'100%'}>
                        <Container>
                          <Layout.Vertical
                            className={css.topContainer}
                            spacing={'large'}
                            padding={{ top: 'xlarge', right: 'xxlarge', bottom: 'xlarge', left: 'xxlarge' }}
                          >
                            <Container>
                              <Layout.Vertical spacing={'small'}>
                                <Text font={{ weight: 'semi-bold' }} color={Color.BLACK}>
                                  {getString('typeLabel')}
                                </Text>
                                <Container>
                                  <Layout.Horizontal
                                    spacing={'small'}
                                    flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                                  >
                                    {templateIcon && <Icon name={templateIcon} size={20} />}
                                    {templateType && <Text color={Color.GREY_900}>{templateType}</Text>}
                                  </Layout.Horizontal>
                                </Container>
                              </Layout.Vertical>
                            </Container>
                            <Container>
                              <Layout.Vertical spacing={'small'}>
                                <Text font={{ weight: 'semi-bold' }} color={Color.BLACK}>
                                  {getString('description')}
                                </Text>
                                <Text color={Color.GREY_900}>{defaultTo(selectedTemplate.description, '-')}</Text>
                              </Layout.Vertical>
                            </Container>
                            <Container>
                              <Layout.Vertical spacing={'small'}>
                                <Text font={{ weight: 'semi-bold' }} color={Color.BLACK}>
                                  {getString('tagsLabel')}
                                </Text>
                                {selectedTemplate.tags && !isEmpty(selectedTemplate.tags) ? (
                                  <Container>
                                    <TemplateTags tags={selectedTemplate.tags} />
                                  </Container>
                                ) : (
                                  <Text color={Color.GREY_900}>-</Text>
                                )}
                              </Layout.Vertical>
                            </Container>
                            <Container className={css.versionListContainer}>
                              <Layout.Vertical spacing={'small'}>
                                <Text font={{ weight: 'semi-bold' }} color={Color.BLACK}>
                                  {getString('common.versionLabel')}
                                </Text>
                                <VersionsDropDown
                                  items={versionOptions}
                                  value={defaultTo(selectedTemplate.versionLabel, DefaultStableVersionValue)}
                                  onChange={onChange}
                                  width={300}
                                  popoverClassName={css.dropdown}
                                  stableVersion={stableVersion}
                                  disabled={disableVersionChange}
                                />
                              </Layout.Vertical>
                            </Container>
                          </Layout.Vertical>
                        </Container>
                        <Container className={css.innerTabsContainer}>
                          <Tabs id="template-details" selectedTabId={selectedTab} onChange={handleTabChange}>
                            <Tab
                              id={TemplateTabs.INPUTS}
                              title={getString('pipeline.templateInputs')}
                              panel={TemplateInputsTabPanel}
                            />
                            <Tab id={TemplateTabs.YAML} title={getString('yaml')} panel={TemplateYamlTabPanel} />
                            <Tab
                              id={TemplateTabs.REFERENCEDBY}
                              title={getString('templatesLibrary.referencedBy')}
                              className={css.referencedByTab}
                              panel={
                                <EntitySetupUsage
                                  pageSize={4}
                                  pageHeaderClassName={css.referencedByHeader}
                                  pageBodyClassName={css.referencedByBody}
                                  entityType={EntityType.Template}
                                  entityIdentifier={getTemplateEntityIdentifier({ selectedTemplate, templates })}
                                />
                              }
                            />
                          </Tabs>
                        </Container>
                      </Layout.Vertical>
                    }
                  />
                  <Tab
                    id={ParentTemplateTabs.ACTVITYLOG}
                    title={getString('activityLog')}
                    panel={<TemplateActivityLog template={selectedTemplate} />}
                  />
                </Tabs>
              </Container>
            </Layout.Vertical>
          </Container>
        )}
      </Layout.Vertical>
    </Container>
  )
}
