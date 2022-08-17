/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Container, Layout, Text, useToaster } from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { Color } from '@wings-software/design-system'
import { clone, defaultTo, isEmpty, isEqual } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { PageSpinner } from '@harness/uicore'
import {
  refreshAllPromise as refreshAllTemplatePromise,
  ErrorNodeSummary,
  TemplateResponse,
  updateExistingTemplateLabelPromise
} from 'services/template-ng'
import { YamlDiffView } from '@pipeline/components/TemplateLibraryErrorHandling/YamlDiffView/YamlDiffView'
import { ErrorNode } from '@pipeline/components/TemplateLibraryErrorHandling/ErrorDirectory/ErrorNode'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String, useStrings } from 'framework/strings'
import { refreshAllPromise as refreshAllPipelinePromise } from 'services/pipeline-ng'
import { getScopeBasedProjectPathParams, getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import type { GitQueryParams, ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useQueryParams } from '@common/hooks'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { getFirstLeafNode } from '@pipeline/components/TemplateLibraryErrorHandling/TemplateLibraryErrorHandlingUtils'
import { getTitleFromErrorNodeSummary } from '../utils'
import css from './ReconcileDialog.module.scss'

export enum TemplateErrorEntity {
  PIPELINE = 'Pipeline',
  TEMPLATE = 'Template'
}

export interface ReconcileDialogProps {
  errorNodeSummary: ErrorNodeSummary
  entity: TemplateErrorEntity
  setResolvedTemplateResponses?: (resolvedTemplateInfos: TemplateResponse[]) => void
  onRefreshEntity?: () => void
  updateRootEntity: (refreshedYaml: string) => Promise<void>
  originalEntityYaml?: string
}

export function ReconcileDialog({
  errorNodeSummary,
  entity,
  setResolvedTemplateResponses: setResolvedTemplates,
  onRefreshEntity,
  updateRootEntity,
  originalEntityYaml
}: ReconcileDialogProps) {
  const { nodeInfo, templateResponse, childrenErrorNodes } = errorNodeSummary
  const hasChildren = !isEmpty(childrenErrorNodes)
  const [selectedErrorNodeSummary, setSelectedErrorNodeSummary] = React.useState<ErrorNodeSummary>()
  const [resolvedTemplateResponses, setResolvedTemplateResponses] = React.useState<TemplateResponse[]>([])
  const params = useParams<ProjectPathProps & ModulePathParams>()
  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()
  const [loading, setLoading] = React.useState<boolean>(false)
  const { showError } = useToaster()
  const { isGitSyncEnabled } = useAppStore()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()

  const [canEditTemplate] = usePermission({
    resource: {
      resourceType: ResourceType.TEMPLATE
    },
    permissions: [PermissionIdentifier.EDIT_TEMPLATE]
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
            branch,
            repoIdentifier,
            getDefaultFromOtherRepo: true
          },
          body: undefined
        })
        if (response && response.status === 'SUCCESS') {
          onRefreshEntity?.()
        } else {
          throw response
        }
      } catch (error) {
        showError(getRBACErrorMessage(error), undefined, 'template.refresh.all.error')
      } finally {
        setLoading(false)
      }
    } else {
      try {
        const response = await refreshAllPipelinePromise({
          queryParams: {
            ...getScopeBasedProjectPathParams(params, Scope.PROJECT),
            identifier: defaultTo(nodeInfo?.identifier, ''),
            branch,
            repoIdentifier,
            getDefaultFromOtherRepo: true
          },
          body: undefined
        })
        if (response && response.status === 'SUCCESS') {
          onRefreshEntity?.()
        } else {
          throw response
        }
      } catch (error) {
        showError(getRBACErrorMessage(error), undefined, 'pipeline.refresh.all.error')
      } finally {
        setLoading(false)
      }
    }
  }

  const updateTemplate = async (refreshedYaml: string) => {
    setLoading(true)
    try {
      const response = await updateExistingTemplateLabelPromise({
        templateIdentifier: defaultTo(selectedErrorNodeSummary?.templateResponse?.identifier, ''),
        versionLabel: defaultTo(selectedErrorNodeSummary?.templateResponse?.versionLabel, ''),
        body: refreshedYaml,
        queryParams: {
          accountIdentifier: defaultTo(selectedErrorNodeSummary?.templateResponse?.accountId, ''),
          projectIdentifier: defaultTo(selectedErrorNodeSummary?.templateResponse?.projectIdentifier, ''),
          orgIdentifier: defaultTo(selectedErrorNodeSummary?.templateResponse?.orgIdentifier, ''),
          comments: 'Reconciling template'
        },
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      })
      if (response && response.status === 'SUCCESS') {
        if (selectedErrorNodeSummary?.templateResponse) {
          setResolvedTemplateResponses([
            ...resolvedTemplateResponses,
            clone(selectedErrorNodeSummary?.templateResponse)
          ])
        }
      } else {
        throw response
      }
    } catch (error) {
      showError(getRBACErrorMessage(error), undefined, 'template.update.error')
    } finally {
      setLoading(false)
    }
  }

  const onUpdateNode = async (refreshedYaml: string): Promise<void> => {
    if (isEqual(selectedErrorNodeSummary, errorNodeSummary)) {
      await updateRootEntity(refreshedYaml)
    } else {
      await updateTemplate(refreshedYaml)
    }
  }

  const title = React.useMemo(
    () => getTitleFromErrorNodeSummary(errorNodeSummary, entity, originalEntityYaml),
    [errorNodeSummary, entity, originalEntityYaml]
  )

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
                {!isEmpty(nodeInfo) && (
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
                    originalEntityYaml={originalEntityYaml}
                  />
                )}
              </Layout.Vertical>
            </Container>
            <Container style={{ flex: 1 }}>
              <YamlDiffView
                errorNodeSummary={selectedErrorNodeSummary}
                resolvedTemplateResponses={resolvedTemplateResponses}
                onUpdate={onUpdateNode}
                originalEntityYaml={originalEntityYaml}
              />
            </Container>
          </Layout.Horizontal>
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
