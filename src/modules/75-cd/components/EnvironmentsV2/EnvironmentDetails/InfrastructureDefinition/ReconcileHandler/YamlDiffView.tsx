/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { Button, ButtonSize, ButtonVariation, Container, Layout, Text, useIsMounted } from '@wings-software/uicore'
import { Color } from '@wings-software/design-system'
import { defaultTo } from 'lodash-es'
import { MonacoDiffEditor } from 'react-monaco-editor'
import { PageError, PageSpinner } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import type { ResponseCustomDeploymentRefreshYaml } from 'services/cd-ng'
import css from './ReconcileHandler.module.scss'

export interface YamlDiffViewProps {
  originalEntityYaml: string
  onUpdate: (refreshedYaml: string) => Promise<void>
  getUpdatedYaml: () => Promise<ResponseCustomDeploymentRefreshYaml>
}

export function YamlDiffView({ originalEntityYaml, getUpdatedYaml, onUpdate }: YamlDiffViewProps): JSX.Element {
  const { getString } = useStrings()
  const editorRef = useRef<MonacoDiffEditor>(null)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<any>()
  const [originalYaml, setOriginalYaml] = React.useState<string>('')
  const [refreshedYaml, setRefreshedYaml] = React.useState<string>('')
  const isMounted = useIsMounted()

  const onNodeUpdate = (): void => {
    onUpdate(refreshedYaml).then(_ => {
      if (isMounted) {
        setOriginalYaml(refreshedYaml)
      }
    })
  }

  const getYamlDiffFromYaml = async (): Promise<void> => {
    try {
      const response = await getUpdatedYaml()

      if (response && response.status === 'SUCCESS') {
        setOriginalYaml(yamlStringify(yamlParse(originalEntityYaml)))
        setRefreshedYaml(yamlStringify(yamlParse(defaultTo(response.data?.refreshedYaml, ''))))
      } else {
        throw response
      }
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const refetch = async (): Promise<void> => {
    setLoading(true)
    setError(undefined)
    await getYamlDiffFromYaml()
  }

  React.useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Container className={css.diffContainer} height={'100%'} background={Color.WHITE} border={{ radius: 4 }}>
      {loading && <PageSpinner />}
      {!loading && error && (
        <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />
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
                    {getString('pipeline.reconcileDialog.originalYamlLabel')}
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
                    {getString('pipeline.reconcileDialog.refreshedYamlLabel')}
                  </Text>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    text={getString('update')}
                    onClick={onNodeUpdate}
                    size={ButtonSize.SMALL}
                    data-testid={'yaml-update-button'}
                  />
                </Layout.Horizontal>
              </Container>
            </Layout.Horizontal>
          </Container>
          <MonacoDiffEditor
            width={'100%'}
            height={'calc(100% - 56px)'}
            language="yaml"
            original={originalYaml}
            value={refreshedYaml}
            options={{
              ignoreTrimWhitespace: true,
              minimap: { enabled: true },
              codeLens: true,
              renderSideBySide: true,
              lineNumbers: 'on',
              readOnly: true,
              inDiffEditor: true,
              scrollBeyondLastLine: false,
              enableSplitViewResizing: false,
              fontFamily: "'Roboto Mono', monospace",
              fontSize: 13
            }}
            ref={editorRef}
          />
        </Layout.Vertical>
      )}
    </Container>
  )
}
