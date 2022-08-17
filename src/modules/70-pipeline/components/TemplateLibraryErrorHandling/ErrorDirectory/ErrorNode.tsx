/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, Layout, Text } from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { Intent, Radio } from '@blueprintjs/core'
import { defaultTo, isEqual, noop } from 'lodash-es'
import cx from 'classnames'
import type { ErrorNodeSummary, TemplateResponse } from 'services/template-ng'
import type { TemplateErrorEntity } from '@pipeline/components/TemplateLibraryErrorHandling/ReconcileDialog/ReconcileDialog'
import { getTitleFromErrorNodeSummary } from '@pipeline/components/TemplateLibraryErrorHandling/utils'
import css from './ErrorNode.module.scss'

export interface ErrorDirectoryProps {
  entity: TemplateErrorEntity
  errorNodeSummary: ErrorNodeSummary
  resolvedTemplateResponses?: TemplateResponse[]
  selectedErrorNodeSummary?: ErrorNodeSummary
  setSelectedErrorNodeSummary: (errorNodeSummary: ErrorNodeSummary) => void
  originalEntityYaml?: string
}

export function ErrorNode({
  entity,
  errorNodeSummary,
  resolvedTemplateResponses = [],
  selectedErrorNodeSummary,
  setSelectedErrorNodeSummary,
  originalEntityYaml
}: ErrorDirectoryProps) {
  const { childrenErrorNodes, nodeInfo, templateResponse } = errorNodeSummary

  const isEnabled = React.useMemo(() => {
    const childNodes = defaultTo(errorNodeSummary.childrenErrorNodes, [])
    for (const child of childNodes) {
      if (!resolvedTemplateResponses.find(item => isEqual(item, child.templateResponse))) {
        return false
      }
    }
    return true
  }, [resolvedTemplateResponses])

  const onNodeClick = React.useCallback(() => {
    setSelectedErrorNodeSummary(errorNodeSummary)
  }, [])

  const isTemplateResolved = React.useMemo(
    () => !!resolvedTemplateResponses.find(item => isEqual(item, errorNodeSummary?.templateResponse)),
    [resolvedTemplateResponses]
  )

  const title = React.useMemo(
    () => getTitleFromErrorNodeSummary(errorNodeSummary, entity, originalEntityYaml),
    [errorNodeSummary, entity, originalEntityYaml]
  )

  return (
    <Container className={css.mainContainer}>
      <Layout.Vertical>
        <Container
          className={cx(css.nodeContainer, { [css.disabled]: !isEnabled })}
          onClick={isEnabled ? onNodeClick : noop}
        >
          <Layout.Horizontal
            flex={{ alignItems: 'center' }}
            height={'100%'}
            padding={{ left: 'small', right: 'small' }}
          >
            <Radio checked={isEqual(selectedErrorNodeSummary?.nodeInfo, nodeInfo)} />
            <Container className={css.label} margin={{ right: 'medium' }}>
              <Layout.Horizontal spacing={'xsmall'}>
                <Text lineClamp={1} font={{ variation: FontVariation.SMALL }}>
                  {title}
                </Text>
                {templateResponse && <Icon name="template-library" size={8} />}
              </Layout.Horizontal>
            </Container>
            {isTemplateResolved ? (
              <Icon name="success-tick" size={18} />
            ) : (
              <Icon name="warning-sign" intent={Intent.DANGER} />
            )}
          </Layout.Horizontal>
        </Container>
        <Container className={css.childrenNodeContainer} margin={{ left: 'xxlarge' }}>
          <Layout.Vertical>
            {childrenErrorNodes?.map((item, index) => (
              <Container
                key={item.nodeInfo?.identifier}
                className={cx({ [css.blueBorder]: index !== childrenErrorNodes.length - 1 })}
              >
                <Layout.Horizontal>
                  <Container className={css.borderedContainer}></Container>
                  <Container className={css.childrenContainer}>
                    <ErrorNode
                      entity={entity}
                      errorNodeSummary={item}
                      resolvedTemplateResponses={resolvedTemplateResponses}
                      selectedErrorNodeSummary={selectedErrorNodeSummary}
                      setSelectedErrorNodeSummary={setSelectedErrorNodeSummary}
                    />
                  </Container>
                </Layout.Horizontal>
              </Container>
            ))}
          </Layout.Vertical>
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
