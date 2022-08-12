import React, { useRef } from 'react'
import { Container, Layout, Text } from '@wings-software/uicore'
import { Color } from '@wings-software/design-system'
import { MonacoDiffEditor } from 'react-monaco-editor'
import { PageError } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import css from './YamlDiffView.module.scss'

interface YamlDiffViewProps {
  oldYaml: string
  newYaml: string
  error: any
  refetchYamlDiff: () => void
}

export function YamlDiffView({ oldYaml, newYaml, error, refetchYamlDiff }: YamlDiffViewProps): React.ReactElement {
  const editorRef = useRef<MonacoDiffEditor>(null)

  return (
    <Container className={css.mainContainer} height={700} background={Color.WHITE} border={{ radius: 4 }}>
      {error && (
        <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetchYamlDiff()} />
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
                  <Text font={{ variation: FontVariation.H6 }}>Existing YAML (Invalid)</Text>
                </Layout.Horizontal>
              </Container>
              <Container className={css.refreshedHeader}>
                <Layout.Horizontal
                  height={'100%'}
                  flex={{ justifyContent: 'space-between', alignItems: 'center' }}
                  padding={{ left: 'xlarge', right: 'xlarge' }}
                >
                  <Text font={{ variation: FontVariation.H6 }}>Valid YAML</Text>
                  <CopyToClipboard content={newYaml} showFeedback={true} />
                </Layout.Horizontal>
              </Container>
            </Layout.Horizontal>
          </Container>
          <MonacoDiffEditor
            width={'100%'}
            height={'calc(100% - 56px)'}
            language="yaml"
            original={oldYaml}
            value={newYaml}
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
