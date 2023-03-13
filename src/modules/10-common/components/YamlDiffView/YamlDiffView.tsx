/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { Container, Layout, Text, PageError, PageSpinner, Button, ButtonVariation, ButtonSize } from '@harness/uicore'
import type { MonacoDiffEditor as MonacoDiffEditorType } from 'react-monaco-editor'
import { FontVariation } from '@harness/design-system'
import { defaultTo, get } from 'lodash-es'
import MonacoDiffEditor from '@common/components/MonacoDiffEditor/MonacoDiffEditor'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import css from './YamlDiffView.module.scss'

interface TemplateErrorUtils {
  isTemplateResolved?: boolean
  buttonLabel?: string
  onNodeUpdate?: () => Promise<void>
  isYamlDiffForTemplate?: boolean
}

interface YamlDiffViewProps {
  originalYaml: string
  refreshedYaml: string
  error: any
  refetchYamlDiff: () => void
  loading?: boolean
  templateErrorUtils?: TemplateErrorUtils
}

export function YamlDiffView({
  originalYaml,
  refreshedYaml,
  error,
  refetchYamlDiff,
  loading,
  templateErrorUtils
}: YamlDiffViewProps): React.ReactElement {
  const editorRef = useRef<MonacoDiffEditorType>(null)
  const { getString } = useStrings()

  const { isTemplateResolved, buttonLabel, onNodeUpdate, isYamlDiffForTemplate } = defaultTo(templateErrorUtils, {})
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF

  return (
    <Container className={css.mainContainer}>
      {loading && <PageSpinner />}
      {!loading && error && (
        <PageError message={get(error.data as Error, 'message') || error.message} onClick={() => refetchYamlDiff()} />
      )}
      {!error && originalYaml && refreshedYaml && (
        <Layout.Vertical height={'100%'}>
          <Container height={56}>
            <Layout.Horizontal height={'100%'}>
              <Container className={css.leftHeader} border={{ right: true }}>
                <Layout.Horizontal
                  height={'100%'}
                  flex={{ justifyContent: 'space-between', alignItems: 'center' }}
                  padding={{ left: 'xlarge', right: 'xlarge' }}
                >
                  <Text font={{ variation: FontVariation.H6 }}>
                    {getString('common.yamlDiffView.originalYamlLabel')}
                  </Text>
                </Layout.Horizontal>
              </Container>
              <Container className={css.refreshedHeader}>
                <Layout.Horizontal
                  height={'100%'}
                  flex={{ justifyContent: 'space-between', alignItems: 'center' }}
                  padding={{ left: 'xlarge', right: 'xlarge' }}
                >
                  <Text font={{ variation: FontVariation.H6 }}>
                    {getString('common.yamlDiffView.refreshedYamlLabel')}
                  </Text>
                  {isTemplateResolved || (isYamlDiffForTemplate && isGitSyncEnabled) ? (
                    <CopyToClipboard content={refreshedYaml} showFeedback={true} />
                  ) : (
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      text={buttonLabel}
                      onClick={onNodeUpdate}
                      size={ButtonSize.SMALL}
                      data-testid={'yaml-update-button'}
                    />
                  )}
                </Layout.Horizontal>
              </Container>
            </Layout.Horizontal>
          </Container>
          <MonacoDiffEditor
            original={originalYaml}
            value={refreshedYaml}
            width={'100%'}
            height={'calc(100% - 56px)'}
            language="yaml"
            options={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: 13,
              ignoreTrimWhitespace: true,
              readOnly: true,
              inDiffEditor: true,
              scrollBeyondLastLine: false,
              enableSplitViewResizing: false,
              minimap: { enabled: true },
              codeLens: true,
              renderSideBySide: true,
              lineNumbers: 'on'
            }}
            ref={editorRef}
          />
        </Layout.Vertical>
      )}
    </Container>
  )
}
