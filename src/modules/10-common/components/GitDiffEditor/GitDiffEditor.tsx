/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import { MonacoDiffEditor } from 'react-monaco-editor'
import type { editor } from 'monaco-editor/esm/vs/editor/editor.api'

import { Button, Container, Icon, Layout, Text, useConfirmationDialog } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import css from './GitDiffEditor.module.scss'

interface GitInfo {
  branch: string
  content: string
}

interface GitDiffEditorInterface {
  remote: GitInfo
  local: GitInfo
  height?: React.CSSProperties['height']
  width?: React.CSSProperties['width']
  onSave: (updatedContent: string) => void
  onCancel: () => void
}

export const GitDiffEditor = ({
  remote = { branch: '', content: '' },
  local = { branch: '', content: '' },
  height,
  width,
  onSave,
  onCancel
}: GitDiffEditorInterface): JSX.Element => {
  const { getString } = useStrings()
  const editorRef = useRef<MonacoDiffEditor>(null)
  const [currentContent, setCurrentContent] = useState<string>(local.content)
  const [totalLinesInModifiedContent, setTotalLinesInModifiedContent] = useState<number>(0)

  useEffect(() => {
    setTotalLinesInModifiedContent(editorRef.current?.editor?.getModifiedEditor()?.getModel()?.getLineCount() || 0)
  }, [])

  const { openDialog } = useConfirmationDialog({
    contentText: getString('common.unsavedChanges'),
    titleText: getString('common.confirmText'),
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    intent: Intent.WARNING,
    onCloseDialog: (isConfirmed: boolean) => {
      if (isConfirmed) {
        onCancel()
      }
    }
  })

  return (
    <Layout.Vertical>
      <Layout.Horizontal className={css.header} width={width}>
        <Layout.Horizontal className={css.panel} style={{ flex: 1 }}>
          {/** TODO @vardan uncomment when branch and version selector capabilities are added */}
          {/* <Container padding={{ right: 'large' }}>
              <BranchSelector branches={mockBranches} currentBranch={branch} isReadOnlyMode />
            </Container>
            <VersionSelector versions={mockVersions} isReadOnlyMode /> */}
          <Layout.Horizontal spacing="small">
            <Icon name="git-branch" size={18} />
            <Text>{remote.branch}</Text>
          </Layout.Horizontal>
        </Layout.Horizontal>
        <Layout.Horizontal className={css.panel} flex style={{ flex: 1 }}>
          {/* <Container padding={{ right: 'large' }}>
                <BranchSelector branches={mockBranches} currentBranch={branch} />
              </Container>
              <VersionSelector versions={mockVersions} isEditMode={isEditMode} /> */}
          <Layout.Horizontal spacing="small">
            <Icon name="git-branch" size={18} />
            <Text>{local.branch}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing="small">
            <Button minimal text={getString('cancel')} onClick={openDialog} />
            <Button intent="primary" text={getString('save')} onClick={() => onSave(currentContent)} />
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Container padding={{ top: 'xsmall' }}>
        <MonacoDiffEditor
          width={width ?? '100%'}
          height={height ?? 'calc(100% - 100px)'}
          language="javascript"
          original={remote.content}
          value={currentContent}
          options={{
            ignoreTrimWhitespace: true,
            minimap: { enabled: true },
            codeLens: true,
            renderSideBySide: true,
            lineNumbers: 'on',
            inDiffEditor: true,
            scrollBeyondLastLine: false,
            enableSplitViewResizing: false,
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 13
          }}
          ref={editorRef}
          editorDidMount={(diffEditor?: editor.IStandaloneDiffEditor): void => {
            setTotalLinesInModifiedContent(diffEditor?.getModifiedEditor()?.getModel()?.getLineCount?.() || 0)
          }}
          onChange={(value: string, _event: editor.IModelContentChangedEvent) => {
            setCurrentContent(value)
            setTotalLinesInModifiedContent(
              editorRef.current?.editor?.getModifiedEditor()?.getModel()?.getLineCount?.() || 0
            )
          }}
        />
      </Container>
      <Container className={css.footer}>
        <Text padding={{ right: 'large' }} font={{ size: 'small', weight: 'bold' }}>
          {getString('common.totalLines')} {totalLinesInModifiedContent}
        </Text>
      </Container>
    </Layout.Vertical>
  )
}
