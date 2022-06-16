/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import type { MonacoEditorProps } from 'react-monaco-editor'
import { useParams } from 'react-router-dom'
import { Drawer, Position } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { Button, Heading, Layout } from '@wings-software/uicore'
import { PageSpinner } from '@common/components'
import MonacoDiffEditor from '@common/components/MonacoDiffEditor/MonacoDiffEditor'
import { PipelineExecutionSummary, useGetExecutionData } from 'services/pipeline-ng'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { String } from 'framework/strings'

import css from './ExecutionCompareYamls.module.scss'

interface ExecutionCompareYamlsProps {
  compareItems?: PipelineExecutionSummary[]
  onClose: () => void
}

export function ExecutionCompareYamls({ compareItems, onClose }: ExecutionCompareYamlsProps): ReactElement {
  const { module, accountId } = useParams<PipelineType<PipelinePathProps>>()

  const { data: dataOne, loading: loadingOne } = useGetExecutionData({
    planExecutionId: compareItems?.[0].planExecutionId || '',
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { data: dataTwo, loading: loadingTwo } = useGetExecutionData({
    planExecutionId: compareItems?.[1].planExecutionId || '',
    queryParams: {
      accountIdentifier: accountId
    }
  })

  return (
    <Drawer
      onClose={onClose}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      enforceFocus={false}
      hasBackdrop={true}
      size="calc(100vw - 128px)"
      isOpen
      position={Position.RIGHT}
    >
      <Button className={css.drawerClosebutton} minimal icon="cross" withoutBoxShadow onClick={onClose} />
      {loadingOne || loadingTwo ? (
        <PageSpinner />
      ) : (
        <>
          <Layout.Horizontal>
            <Layout.Horizontal
              spacing="small"
              padding="xlarge"
              flex={{ alignItems: 'baseline', justifyContent: 'flex-start' }}
              className={css.grow}
            >
              <Heading level={2} color={Color.GREY_800} font={{ weight: 'bold' }}>
                {compareItems?.[0]?.name}
              </Heading>
              <String
                className={css.executionId}
                tagName="div"
                stringID={module === 'cd' ? 'execution.pipelineIdentifierTextCD' : 'execution.pipelineIdentifierTextCI'}
                vars={compareItems?.[0]}
              />
            </Layout.Horizontal>
            <Layout.Horizontal
              spacing="small"
              padding="xlarge"
              flex={{ alignItems: 'baseline', justifyContent: 'flex-start' }}
              className={css.grow}
            >
              <Heading level={2} color={Color.GREY_800} font={{ weight: 'bold' }}>
                {compareItems?.[1]?.name}
              </Heading>
              <String
                className={css.executionId}
                tagName="div"
                stringID={module === 'cd' ? 'execution.pipelineIdentifierTextCD' : 'execution.pipelineIdentifierTextCI'}
                vars={compareItems?.[1]}
              />
            </Layout.Horizontal>
          </Layout.Horizontal>
          <MonacoDiffEditor
            data-testid="execution-compare-yaml-viewer"
            width="100%"
            height="100%"
            original={dataOne?.data?.executionYaml}
            value={dataTwo?.data?.executionYaml}
            language={'yaml'}
            options={
              {
                fontFamily: "'Roboto Mono', monospace",
                fontSize: 13,
                minimap: {
                  enabled: false
                },
                readOnly: true,
                scrollBeyondLastLine: false
              } as MonacoEditorProps['options']
            }
          />
        </>
      )}
    </Drawer>
  )
}
