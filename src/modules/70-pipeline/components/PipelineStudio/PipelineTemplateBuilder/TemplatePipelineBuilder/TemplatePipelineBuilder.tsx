/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { debounce } from 'lodash-es'
import { Layout } from '@wings-software/uicore'
import cx from 'classnames'
import SplitPane from 'react-split-pane'
import { Container } from '@harness/uicore'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  DefaultSplitPaneSize,
  MaximumSplitPaneSize,
  MinimumSplitPaneSize
} from '@pipeline/components/PipelineStudio/PipelineConstants'
import { TemplateBar } from '@pipeline/components/PipelineStudio/TemplateBar/TemplateBar'
import { usePipelineTemplateActions } from '@pipeline/utils/usePipelineTemplateActions'
import { TemplatePipelineCanvas } from '@pipeline/components/PipelineStudio/PipelineTemplateBuilder/TemplatePipelineCanvas/TemplatePipelineCanvas'
import { TemplatePipelineSpecifications } from '@pipeline/components/PipelineStudio/PipelineTemplateBuilder/TemplatePipelineSpecifications/TemplatePipelineSpecifications'
import css from './TemplatePipelineBuilder.module.scss'

export function TemplatePipelineBuilder(): React.ReactElement {
  const {
    state: { pipeline }
  } = usePipelineContext()
  const [splitPaneSize, setSplitPaneSize] = React.useState(DefaultSplitPaneSize)
  const setSplitPaneSizeDeb = React.useRef(debounce(setSplitPaneSize, 200))

  function handleStageResize(size: number): void {
    setSplitPaneSizeDeb.current(size)
  }

  // eslint-disable-next-line
  const resizerStyle = !!navigator.userAgent.match(/firefox/i)
    ? { display: 'flow-root list-item' }
    : { display: 'inline-table' }

  const { addOrUpdateTemplate, removeTemplate } = usePipelineTemplateActions()

  return (
    <Container className={css.mainContainer}>
      <Layout.Vertical height={'100%'}>
        {pipeline.template && (
          <TemplateBar
            templateLinkConfig={pipeline.template}
            onRemoveTemplate={removeTemplate}
            onOpenTemplateSelector={addOrUpdateTemplate}
            className={css.templateBar}
          />
        )}
        <Container className={cx(css.canvasContainer)}>
          <SplitPane
            size={splitPaneSize}
            split="horizontal"
            minSize={MinimumSplitPaneSize}
            maxSize={MaximumSplitPaneSize}
            style={{ overflow: 'auto' }}
            pane2Style={{ overflow: 'initial', zIndex: 2 }}
            resizerStyle={resizerStyle}
            onChange={handleStageResize}
            allowResize={true}
          >
            <TemplatePipelineCanvas />
            <TemplatePipelineSpecifications />
          </SplitPane>
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
