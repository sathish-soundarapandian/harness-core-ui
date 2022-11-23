/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Container, Layout, Text, useToaster, PageSpinner } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { clone, defaultTo, isEmpty, isEqual, omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import {
  refreshAllPromise as refreshAllTemplatePromise,
  ErrorNodeSummary,
  TemplateResponse,
  NGTemplateInfoConfig
} from 'services/template-ng'
import { YamlDiffView } from '@pipeline/components/TemplateLibraryErrorHandling/YamlDiffView/YamlDiffView'
import { ErrorNode } from '@pipeline/components/TemplateLibraryErrorHandling/ErrorDirectory/ErrorNode'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String, useStrings } from 'framework/strings'
import { EntityGitDetails, refreshAllPromise as refreshAllPipelinePromise } from 'services/pipeline-ng'
import { getScopeBasedProjectPathParams, getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useSaveTemplate } from '@pipeline/utils/useSaveTemplate'
import { parse } from '@common/utils/YamlHelperMethods'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import { getFirstLeafNode, getTitleFromErrorNodeSummary, TemplateErrorEntity } from '../utils'
import css from './ReconcileDialog.module.scss'

export interface ReconcileDialogProps {
  errorNodeSummary: ErrorNodeSummary
  entity: TemplateErrorEntity
  isEdit: boolean
  originalEntityYaml: string
  setResolvedTemplateResponses?: (resolvedTemplateInfos: TemplateResponse[]) => void
  onRefreshEntity?: () => void
  updateRootEntity: (refreshedYaml: string) => Promise<void>
  gitDetails?: EntityGitDetails
  storeMetadata?: StoreMetadata
}

export function ReconcileDialog({
  errorNodeSummary,
  entity,
  isEdit,
  originalEntityYaml,
  setResolvedTemplateResponses: setResolvedTemplates,
  onRefreshEntity,
  updateRootEntity,
  gitDetails,
  storeMetadata
}: ReconcileDialogProps) {
  const { nodeInfo, templateResponse, childrenErrorNodes } = errorNodeSummary
  const hasChildren = !isEmpty(childrenErrorNodes)
  const [selectedErrorNodeSummary, setSelectedErrorNodeSummary] = React.useState<ErrorNodeSummary>()
  const [resolvedTemplateResponses, setResolvedTemplateResponses] = React.useState<TemplateResponse[]>([])
  const params = useParams<ProjectPathProps & ModulePathParams>()
  const [loading, setLoading] = React.useState<boolean>(false)
  const { showError } = useToaster()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()

  const [canEditTemplate] = usePermission({
    resource: {
      resourceType: ResourceType.TEMPLATE
    },
    permissions: [PermissionIdentifier.EDIT_TEMPLATE]
  })

  const { saveAndPublish } = useSaveTemplate({
    onSuccessCallback: async () => {
      if (selectedErrorNodeSummary?.templateResponse) {
        setResolvedTemplateResponses([...resolvedTemplateResponses, clone(selectedErrorNodeSummary?.templateResponse)])
      }
    }
  })

  const updateButtonEnabled = React.useMemo(() => {
    if (isGitSyncEnabled) {
      return false
    } else if (entity === TemplateErrorEntity.PIPELINE && hasChildren) {
      return canEditTemplate
    } else {
      return true
    }
  }, [isGitSyncEnabled, entity, hasChildren, canEditTemplate])

  React.useEffect(() => {
    setResolvedTemplates?.(resolvedTemplateResponses)
  }, [resolvedTemplateResponses])

  React.useEffect(() => {
    setSelectedErrorNodeSummary(getFirstLeafNode(errorNodeSummary))
  }, [])

  const onUpdateAll = async (): Promise<void> => {
    setLoading(true)
    if (templateResponse) {
      const scope = getScopeFromDTO(templateResponse)
      try {
        const response = await refreshAllTemplatePromise({
          queryParams: {
            ...getScopeBasedProjectPathParams(params, scope),
            templateIdentifier: defaultTo(templateResponse.identifier, ''),
            versionLabel: defaultTo(templateResponse.versionLabel, ''),
            ...(omit(gitDetails, 'commitId', 'objectId', 'repoIdentifier', 'rootFolder', 'repoUrl', 'fileUrl') ?? {}),
            lastCommitId: gitDetails?.commitId,
            lastObjectId: gitDetails?.objectId,
            ...(storeMetadata?.storeType === StoreType.REMOTE ? storeMetadata : {})
          },
          body: undefined
        })
        if (response && response.status === 'SUCCESS') {
          onRefreshEntity?.()
        } else {
          throw response
        }
      } catch (error) {
        showError(getRBACErrorMessage(error as RBACError), undefined, 'template.refresh.all.error')
      } finally {
        setLoading(false)
      }
    } else {
      try {
        const response = await refreshAllPipelinePromise({
          queryParams: {
            ...getScopeBasedProjectPathParams(params, Scope.PROJECT),
            identifier: defaultTo(nodeInfo?.identifier, ''),
            ...(omit(gitDetails, 'commitId', 'objectId', 'repoIdentifier', 'rootFolder', 'repoUrl', 'fileUrl') ?? {}),
            lastCommitId: gitDetails?.commitId,
            lastObjectId: gitDetails?.objectId,
            ...(storeMetadata?.storeType === StoreType.REMOTE ? storeMetadata : {})
          },
          body: undefined
        })
        if (response && response.status === 'SUCCESS') {
          onRefreshEntity?.()
        } else {
          throw response
        }
      } catch (error) {
        showError(getRBACErrorMessage(error as RBACError), undefined, 'pipeline.refresh.all.error')
      } finally {
        setLoading(false)
      }
    }
  }

  const updateTemplate = async (refreshedYaml: string) => {
    const isInlineTemplate =
      isEmpty(selectedErrorNodeSummary?.templateResponse?.gitDetails?.branch) &&
      selectedErrorNodeSummary?.templateResponse?.storeType !== StoreType.REMOTE
    if (isInlineTemplate) {
      setLoading(true)
    }
    try {
      await saveAndPublish(parse<{ template: NGTemplateInfoConfig }>(refreshedYaml).template, {
        isEdit: true,
        disableCreatingNewBranch: true,
        updatedGitDetails: selectedErrorNodeSummary?.templateResponse?.gitDetails,
        storeMetadata: {
          storeType: selectedErrorNodeSummary?.templateResponse?.storeType,
          connectorRef: selectedErrorNodeSummary?.templateResponse?.connectorRef,
          repoName: selectedErrorNodeSummary?.templateResponse?.gitDetails?.repoName,
          branch: selectedErrorNodeSummary?.templateResponse?.gitDetails?.branch,
          filePath: selectedErrorNodeSummary?.templateResponse?.gitDetails?.filePath
        }
      })
    } catch (error) {
      if (isInlineTemplate) {
        showError(getRBACErrorMessage(error as RBACError), undefined, 'template.update.error')
      }
    } finally {
      if (isInlineTemplate) {
        setLoading(false)
      }
    }
  }

  const onUpdateNode = async (refreshedYaml: string): Promise<void> => {
    if (isEqual(selectedErrorNodeSummary, errorNodeSummary)) {
      await updateRootEntity(refreshedYaml)
    } else {
      await updateTemplate(refreshedYaml)
    }
  }

  const title = React.useMemo(() => getTitleFromErrorNodeSummary(errorNodeSummary, entity), [errorNodeSummary, entity])

  return (
    <Container className={css.mainContainer} height={'100%'}>
      {loading && <PageSpinner />}
      <Layout.Vertical height={'100%'}>
        <Container
          border={{ bottom: true }}
          padding={{ top: 'large', right: 'xxxlarge', bottom: 'large', left: 'xxxlarge' }}
        >
          <Text font={{ variation: FontVariation.H4 }}>{getString('pipeline.reconcileDialog.title')}</Text>
        </Container>
        <Container
          className={css.contentContainer}
          background={Color.FORM_BG}
          padding={{ top: 'large', right: 'xxxlarge', bottom: 'xxxlarge', left: 'xxxlarge' }}
        >
          <Layout.Horizontal spacing={'huge'} height={'100%'}>
            <Container width={376}>
              <Layout.Vertical spacing={'xlarge'}>
                <Container>
                  <Layout.Vertical spacing={'medium'}>
                    <Text font={{ variation: FontVariation.H5 }}>{getString('pipeline.reconcileDialog.subtitle')}</Text>
                    <Text font={{ variation: FontVariation.BODY }}>
                      <String
                        stringID={
                          hasChildren
                            ? 'pipeline.reconcileDialog.unsyncedTemplateInfo'
                            : 'pipeline.reconcileDialog.updatedTemplateInfo'
                        }
                        vars={{
                          name: title
                        }}
                        useRichText={true}
                      />
                    </Text>
                  </Layout.Vertical>
                </Container>
                {isEdit && (
                  <Button
                    text={
                      hasChildren
                        ? getString('pipeline.reconcileDialog.updateAllLabel')
                        : getString('pipeline.reconcileDialog.updateEntityLabel', { entity })
                    }
                    variation={ButtonVariation.PRIMARY}
                    width={248}
                    disabled={!updateButtonEnabled}
                    onClick={onUpdateAll}
                  />
                )}
                {hasChildren && (
                  <ErrorNode
                    entity={entity}
                    errorNodeSummary={errorNodeSummary}
                    resolvedTemplateResponses={resolvedTemplateResponses}
                    selectedErrorNodeSummary={selectedErrorNodeSummary}
                    setSelectedErrorNodeSummary={setSelectedErrorNodeSummary}
                  />
                )}
              </Layout.Vertical>
            </Container>
            <Container style={{ flex: 1 }}>
              <YamlDiffView
                errorNodeSummary={selectedErrorNodeSummary}
                rootErrorNodeSummary={errorNodeSummary}
                originalEntityYaml={originalEntityYaml}
                resolvedTemplateResponses={resolvedTemplateResponses}
                onUpdate={onUpdateNode}
              />
            </Container>
          </Layout.Horizontal>
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
