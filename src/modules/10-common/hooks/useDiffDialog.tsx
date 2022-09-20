/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useModalHook } from '@harness/use-modal'
import { Classes, Dialog } from '@blueprintjs/core'
import type { MonacoEditorProps } from 'react-monaco-editor'
import MonacoDiffEditor from '@common/components/MonacoDiffEditor/MonacoDiffEditor'

interface DiffDialogProps {
  originalYaml: string
  updatedYaml: string
  title?: string
}

interface DialogProps {
  open: () => void
}

const DIFF_EDITOR_OPTIONS: MonacoEditorProps['options'] = {
  fontFamily: "'Roboto Mono', monospace",
  fontSize: 13,
  minimap: {
    enabled: false
  },
  readOnly: true,
  scrollBeyondLastLine: false
}

export default function useDiffDialog(props: DiffDialogProps): DialogProps {
  const { originalYaml, updatedYaml, title } = props

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen enforceFocus={false} onClose={hideModal} title={title} style={{ width: '90vw', height: '90vh' }}>
        <div className={Classes.DIALOG_BODY}>
          <MonacoDiffEditor original={originalYaml} value={updatedYaml} language="yaml" options={DIFF_EDITOR_OPTIONS} />
        </div>
      </Dialog>
    ),
    [title, originalYaml, updatedYaml]
  )

  return { open: showModal }
}
