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
import { Button, Heading, Icon, Layout } from '@wings-software/uicore'
import { PageSpinner } from '@common/components'
import MonacoDiffEditor from '@common/components/MonacoDiffEditor/MonacoDiffEditor'
import { PipelineExecutionSummary, useGetExecutionData } from 'services/pipeline-ng'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { String } from 'framework/strings'

import css from './ExecutionCompareYaml.module.scss'

interface ExecutionCompareYamlProps {
  compareItems?: PipelineExecutionSummary[]
  onClose: () => void
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

export function ExecutionCompareYaml({ compareItems, onClose }: ExecutionCompareYamlProps): ReactElement {
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
      size="calc(100vw - 272px)"
      isOpen
      position={Position.RIGHT}
    >
      <Button className={css.drawerClosebutton} minimal icon="cross" withoutBoxShadow onClick={onClose} />
      {loadingOne || loadingTwo ? (
        <PageSpinner />
      ) : (
        <>
          <Layout.Horizontal>
            {compareItems?.map(compareItem => {
              return (
                <Layout.Horizontal
                  key={compareItem.planExecutionId}
                  spacing="large"
                  padding="xlarge"
                  flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                  className={css.grow}
                >
                  <Icon name="pipeline-advanced" color={Color.PRIMARY_7} size={24} />
                  <Layout.Horizontal spacing="small" flex={{ alignItems: 'baseline' }}>
                    <Heading level={2} color={Color.GREY_800} font={{ weight: 'bold' }}>
                      {compareItem?.name}
                    </Heading>
                    <String
                      className={css.executionId}
                      tagName="div"
                      stringID={
                        module === 'cd' ? 'execution.pipelineIdentifierTextCD' : 'execution.pipelineIdentifierTextCI'
                      }
                      vars={compareItem}
                    />
                  </Layout.Horizontal>
                </Layout.Horizontal>
              )
            })}
          </Layout.Horizontal>
          <MonacoDiffEditor
            data-testid="execution-compare-yaml-viewer"
            width="100%"
            height="100%"
            original={dataOne?.data?.executionYaml}
            value={dataTwo?.data?.executionYaml}
            language={'yaml'}
            options={DIFF_EDITOR_OPTIONS}
          />
        </>
      )}
    </Drawer>
  )
}
