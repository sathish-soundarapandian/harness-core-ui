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
import { Button, Heading, Icon, Layout, PageError } from '@wings-software/uicore'
import { PageSpinner } from '@common/components'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import { PipelineExecutionSummary, useGetExecutionData } from 'services/pipeline-ng'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { String } from 'framework/strings'

import css from './ExecutionCompiledYaml.module.scss'

export interface ExecutionCompiledYamlProps {
  executionSummary?: PipelineExecutionSummary
  onClose: () => void
}

export function ExecutionCompiledYaml({ executionSummary, onClose }: ExecutionCompiledYamlProps): ReactElement {
  const { accountId } = useParams<AccountPathProps>()

  const { data, loading, error, refetch } = useGetExecutionData({
    planExecutionId: executionSummary?.planExecutionId || '',
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { module } = useParams<PipelineType<PipelinePathProps>>()

  return (
    <Drawer
      onClose={onClose}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      enforceFocus={false}
      hasBackdrop={true}
      size={876}
      isOpen={!!executionSummary}
      position={Position.RIGHT}
    >
      <Button className={css.drawerClosebutton} minimal icon="cross" withoutBoxShadow onClick={onClose} />
      {loading ? (
        <PageSpinner />
      ) : (
        <>
          <Layout.Horizontal
            spacing="large"
            padding="xlarge"
            flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
          >
            <Icon name="pipeline-advanced" color={Color.PRIMARY_7} size={24} />
            <Layout.Horizontal spacing="small" flex={{ alignItems: 'baseline' }}>
              <Heading level={2} color={Color.GREY_800} font={{ weight: 'bold' }}>
                {executionSummary?.name}
              </Heading>
              <String
                className={css.executionId}
                tagName="div"
                stringID={module === 'cd' ? 'execution.pipelineIdentifierTextCD' : 'execution.pipelineIdentifierTextCI'}
                vars={executionSummary}
              />
            </Layout.Horizontal>
          </Layout.Horizontal>

          {error ? (
            <PageError message={(error.data as Error)?.message || error.message} onClick={refetch as any} />
          ) : (
            <MonacoEditor
              data-testid="execution-compiled-yaml-viewer"
              width="100%"
              height="100%"
              value={data?.data?.executionYaml}
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
          )}
        </>
      )}
    </Drawer>
  )
}
