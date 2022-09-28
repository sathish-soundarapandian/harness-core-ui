/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { Container, Layout, Text } from '@wings-software/uicore'
import { MonacoDiffEditor } from 'react-monaco-editor'
import { PageError } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { get } from 'lodash-es'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import { useStrings } from 'framework/strings'
import css from './YamlDiffView.module.scss'

interface YamlDiffViewProps {
  oldYaml: string
  newYaml: string
  error: any
  refetchYamlDiff: () => void
}

export function YamlDiffView({ oldYaml, newYaml, error, refetchYamlDiff }: YamlDiffViewProps): React.ReactElement {
  const editorRef = useRef<MonacoDiffEditor>(null)
  const { getString } = useStrings()

  return (
    <Container className={css.mainContainer}>
      {error && (
        <PageError message={get(error.data as Error, 'message') || error.message} onClick={() => refetchYamlDiff()} />
      )}
      {!error && oldYaml && newYaml && (
        <Layout.Vertical height={'100%'}>
          <Container height={56}>
            <Layout.Horizontal height={'100%'}>
              <Container width={604} border={{ right: true }}>
                <Layout.Horizontal
                  height={'100%'}
                  flex={{ justifyContent: 'space-between', alignItems: 'center' }}
                  padding={{ left: 'xlarge', right: 'xlarge' }}
                >
                  <Text font={{ variation: FontVariation.H6 }}>
                    {getString('pipeline.inputSetErrorStrip.existingYaml')}
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
                    {getString('pipeline.inputSetErrorStrip.validYaml')}
                  </Text>
                  <CopyToClipboard content={newYaml} showFeedback={true} />
                </Layout.Horizontal>
              </Container>
            </Layout.Horizontal>
          </Container>
          <MonacoDiffEditor
            original={oldYaml}
            value={newYaml}
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
