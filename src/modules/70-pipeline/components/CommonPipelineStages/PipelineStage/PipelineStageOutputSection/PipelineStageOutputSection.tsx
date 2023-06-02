/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { Card, Container, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import ErrorsStripBinded from '@pipeline/components/ErrorsStrip/ErrorsStripBinded'
import { VariableOutputPanel } from './VariableOutputPanel'
import type { PipelineStageOutputSectionProps } from './utils'
import css from '../PipelineStageOverview.module.scss'

export function PipelineStageOutputSection(props: PipelineStageOutputSectionProps): React.ReactElement {
  const { getString } = useStrings()
  const scrollRef = useRef<HTMLDivElement | null>(null)

  return (
    <div className={css.pipelineStageOverviewWrapper}>
      <ErrorsStripBinded domRef={scrollRef as React.MutableRefObject<HTMLElement | undefined>} />
      <Container className={css.content}>
        <Text font={{ variation: FontVariation.H5 }} margin={{ bottom: 'medium' }}>
          {getString('pipeline.pipelineChaining.pipelineOutputs')}
        </Text>
        <Text font={{ variation: FontVariation.H6, weight: 'light' }} margin={{ bottom: 'small' }}>
          {getString('pipeline.pipelineChaining.outputTabSummaryDetail')}
        </Text>
        <Card className={css.outputPanel} id="outputs">
          <VariableOutputPanel />
        </Card>
        <Container margin={{ top: 'xxlarge' }} className={css.actionButtons}>
          {props.children}
        </Container>
      </Container>
    </div>
  )
}
