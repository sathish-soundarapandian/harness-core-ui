/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Container,
  Layout,
  Checkbox,
  ExpandingSearchInput,
  Button,
  ButtonVariation,
  Text,
  FormError,
  FormikForm
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { defaultTo, get, isEmpty, pick } from 'lodash-es'
import { Formik } from 'formik'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PageSpinner, useToaster } from '@common/components'
import { TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { useMutateAsGet } from '@common/hooks'
import {
  TemplateSummaryResponse,
  useDeleteTemplateVersionsOfIdentifier,
  useGetTemplateList,
  useGetTemplateMetadataList
} from 'services/template-ng'
import { TemplatePreview } from '@templates-library/components/TemplatePreview/TemplatePreview'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import useDeleteConfirmationDialog from '@pipeline/pages/utils/DeleteConfirmDialog'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useEntityDeleteErrorHandlerDialog } from '@common/hooks/EntityDeleteErrorHandlerDialog/useEntityDeleteErrorHandlerDialog'
import css from './DeleteTemplateModal.module.scss'

export interface DeleteTemplateProps {
  template: TemplateSummaryResponse
  onClose: () => void
  onSuccess: () => void
  // onDeleteTemplateGitSync: (commitMsg: string, versions?: string[]) => Promise<void>
}
export interface CheckboxOptions {
  label: string
  value: string
  checked: boolean
  visible: boolean
}

const getTemplateNameWithVersions = (name: string, versions: string[]) =>
  `${name} (${versions && versions.length > 1 ? versions.join(', ') : versions[0]})`

export const DeleteTemplateModal = (props: DeleteTemplateProps) => {
  const { getString } = useStrings()
  const { template, onClose, onSuccess } = props
  const [checkboxOptions, setCheckboxOptions] = React.useState<CheckboxOptions[]>([])
  const [isSelectAllEnabled, setSelectAllEnabled] = React.useState<boolean>(true)
  const [query, setQuery] = React.useState<string>('')
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const {
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF,
    supportingTemplatesGitx
  } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const { mutate: deleteTemplates, loading: deleteLoading } = useDeleteTemplateVersionsOfIdentifier({})
  const [templateVersionsToDelete, setTemplateVersionsToDelete] = React.useState<string[]>([])
  const { CDS_FORCE_DELETE_ENTITIES } = useFeatureFlags()
  const {
    data: templateData,
    loading,
    error: templatesError
  } = useMutateAsGet(supportingTemplatesGitx ? useGetTemplateMetadataList : useGetTemplateList, {
    body: { filterType: 'Template', templateIdentifiers: [template.identifier] },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      module,
      templateListType: TemplateListType.All,
      repoIdentifier: template.gitDetails?.repoIdentifier,
      branch: template.gitDetails?.branch
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })
  React.useEffect(() => {
    if (templatesError) {
      onClose()
      showError(getRBACErrorMessage(templatesError as RBACError), undefined, 'template.fetch.template.error')
    }
  }, [templatesError])

  const commitMessage = `${getString('delete')} ${template.name}`

  const performDelete = async (commitMsg: string, versions?: string[], forceDelete?: boolean): Promise<void> => {
    const areMultipleVersionsSelected = !!(versions && versions.length > 1)
    try {
      const resp = await deleteTemplates(defaultTo(template.identifier, ''), {
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          comments: commitMsg,
          forceDelete: Boolean(forceDelete),
          ...(isGitSyncEnabled &&
            template.gitDetails?.objectId && {
              ...pick(template.gitDetails, ['branch', 'repoIdentifier', 'filePath', 'rootFolder']),
              commitMsg,
              lastObjectId: template.gitDetails?.objectId
            })
        },
        body: JSON.stringify({ templateVersionLabels: versions }),
        headers: { 'content-type': 'application/json' }
      })
      if (resp?.status === 'SUCCESS') {
        const templateNameWithVersions = getTemplateNameWithVersions(template.name as string, versions as string[])
        showSuccess(
          areMultipleVersionsSelected
            ? getString('common.template.deleteTemplate.templatesDeleted', { name: templateNameWithVersions })
            : getString('common.template.deleteTemplate.templateDeleted', { name: templateNameWithVersions })
        )
        onSuccess?.()
      } else {
        throw getString('somethingWentWrong')
      }
    } catch (err) {
      if (CDS_FORCE_DELETE_ENTITIES && err?.data?.code === 'ENTITY_REFERENCE_EXCEPTION') {
        openReferenceErrorDialog()
        return
      }
      showError(
        getRBACErrorMessage(err as RBACError),
        undefined,
        areMultipleVersionsSelected
          ? 'common.template.deleteTemplate.errorWhileDeletingTemplates'
          : 'common.template.deleteTemplate.errorWhileDeletingTemplate'
      )
    }
  }

  const redirectToReferencedBy = (): void => {
    closeDialog()
  }

  const { openDialog: openReferenceErrorDialog, closeDialog } = useEntityDeleteErrorHandlerDialog({
    entity: {
      type: ResourceType.TEMPLATE,
      name: defaultTo(template?.name, '')
    },
    redirectToReferencedBy: redirectToReferencedBy,
    forceDeleteCallback: CDS_FORCE_DELETE_ENTITIES
      ? () => performDelete(commitMessage, templateVersionsToDelete, true)
      : undefined
  })

  const { confirmDelete } = useDeleteConfirmationDialog(
    { ...template, name: getTemplateNameWithVersions(template.name as string, templateVersionsToDelete) },
    'template',
    performDelete,
    true
  )

  React.useEffect(() => {
    if (templateData?.data?.content) {
      setCheckboxOptions(
        templateData?.data?.content?.map(currTemplateData => {
          return {
            label: currTemplateData.stableTemplate
              ? getString('templatesLibrary.stableVersion', { entity: currTemplateData.versionLabel })
              : currTemplateData.versionLabel || '',
            value: currTemplateData.versionLabel || '',
            checked: false,
            visible: true
          }
        })
      )
    }
  }, [templateData?.data?.content])

  React.useEffect(() => {
    if (!isEmpty(checkboxOptions)) {
      let isQueryResultNonEmpty = false
      setCheckboxOptions(
        checkboxOptions.map(option => {
          const isOptionVisible = option.label.toUpperCase().includes(query.toUpperCase())
          if (isOptionVisible && !isQueryResultNonEmpty) {
            isQueryResultNonEmpty = true
          }
          return {
            label: option.label,
            value: option.value,
            checked: option.checked,
            visible: isOptionVisible
          }
        })
      )
      isQueryResultNonEmpty ? setSelectAllEnabled(true) : setSelectAllEnabled(false)
    }
  }, [query])

  return (
    <Layout.Vertical>
      {(loading || deleteLoading) && <PageSpinner />}
      {templateData?.data?.content && !isEmpty(templateData?.data?.content) && (
        <Formik<{ checkboxOptions: CheckboxOptions[] }>
          onSubmit={values => {
            const selectedVersions = values.checkboxOptions.filter(item => item.checked).map(item => item.value)
            setTemplateVersionsToDelete(selectedVersions)
            confirmDelete({ versions: selectedVersions })
          }}
          enableReinitialize={true}
          initialValues={{ checkboxOptions: checkboxOptions }}
        >
          {({ values, errors, setFieldValue }) => {
            const options = values.checkboxOptions
            const isSelectAllChecked = (): boolean => {
              if (!isSelectAllEnabled) return false
              return !options.some(option => option.visible && !option.checked)
            }
            return (
              <FormikForm>
                <Container>
                  <Layout.Horizontal>
                    <TemplatePreview className={css.preview} previewValues={templateData?.data?.content?.[0]} />
                    <Container className={css.selectVersions} padding={{ left: 'xxlarge', right: 'xxlarge' }}>
                      <Layout.Vertical spacing={'medium'} height={'100%'}>
                        <ExpandingSearchInput
                          alwaysExpanded={true}
                          width={'100%'}
                          defaultValue={query}
                          onChange={setQuery}
                        />
                        <Container>
                          <Layout.Vertical
                            height={'100%'}
                            flex={{ justifyContent: 'space-between', alignItems: 'stretch' }}
                          >
                            <Container height={300} style={{ overflow: 'auto' }}>
                              {options.map((option, index) => {
                                if (!option.visible) {
                                  return null
                                }
                                return (
                                  <Checkbox
                                    key={option.label}
                                    label={option.label}
                                    className={option.checked ? css.selected : ''}
                                    checked={option.checked}
                                    onChange={e => {
                                      const newOptions = [...options]
                                      newOptions[index].checked = e.currentTarget.checked
                                      setFieldValue('checkboxOptions', newOptions)
                                    }}
                                  />
                                )
                              })}
                            </Container>
                            <FormError name="versions" errorMessage={get(errors, 'versions')} />
                            <Container>
                              <Checkbox
                                label={'Select All'}
                                disabled={!isSelectAllEnabled}
                                checked={isSelectAllChecked()}
                                onChange={e => {
                                  setFieldValue(
                                    'checkboxOptions',
                                    options.map(option => {
                                      const isOptionVisible = option.label.toUpperCase().includes(query.toUpperCase())
                                      return {
                                        label: option.label,
                                        value: option.value,
                                        checked: e.currentTarget.checked && isOptionVisible,
                                        visible: isOptionVisible
                                      }
                                    })
                                  )
                                }}
                              />
                            </Container>
                          </Layout.Vertical>
                        </Container>
                      </Layout.Vertical>
                    </Container>
                  </Layout.Horizontal>
                </Container>
                <Container
                  padding={{ top: 'medium', right: 'xxlarge', left: 'xxlarge' }}
                  border={{ top: true, color: Color.GREY_100 }}
                >
                  <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Container>
                      <Layout.Horizontal
                        spacing="small"
                        flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}
                      >
                        <Button
                          text={isGitSyncEnabled ? getString('continue') : 'Delete Selected'}
                          type="submit"
                          variation={ButtonVariation.PRIMARY}
                          disabled={!options.some(item => item.checked)}
                        />
                        <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onClose} />
                      </Layout.Horizontal>
                    </Container>
                    <Container>
                      <Layout.Horizontal spacing={'small'}>
                        <Text color={Color.GREY_600}>{getString('common.totalSelected')}</Text>
                        <Text background={Color.PRIMARY_7} color={Color.WHITE} className={css.badge}>
                          {options.filter(item => item.checked).length}
                        </Text>
                      </Layout.Horizontal>
                    </Container>
                  </Layout.Horizontal>
                </Container>
              </FormikForm>
            )
          }}
        </Formik>
      )}
    </Layout.Vertical>
  )
}
