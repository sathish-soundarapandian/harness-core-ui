import React from 'react'
import SplitPane from 'react-split-pane'
import { debounce } from 'lodash-es'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { StepGroupTemplateDiagram } from '@templates-library/components/TemplateStudio/StepGroupTemplateCanvas/StepGroupTemplateDiagram/StepGroupTemplateDiagram'
import { StepGroupTemplateFormWithRef } from '@templates-library/components/TemplateStudio/StepGroupTemplateCanvas/StepGroupTemplateForm/StepGroupTemplateForm'

const StepGroupTemplateCanvas = (_props: unknown, formikRef: TemplateFormRef) => {
  const [splitPaneSize, setSplitPaneSize] = React.useState(400)
  const setSplitPaneSizeDeb = React.useRef(debounce(setSplitPaneSize, 400))
  const handleStageResize = (size: number): void => {
    setSplitPaneSizeDeb.current(size)
  }
  const resizerStyle = navigator.userAgent.match(/firefox/i)
    ? { display: 'flow-root list-item' }
    : { display: 'inline-table' }

  return (
    <SplitPane
      size={splitPaneSize}
      split="horizontal"
      minSize={360}
      maxSize={500}
      style={{ overflow: 'auto' }}
      pane2Style={{ overflow: 'initial', zIndex: 2 }}
      resizerStyle={resizerStyle}
      onChange={handleStageResize}
    >
      <StepGroupTemplateDiagram />

      <StepGroupTemplateFormWithRef ref={formikRef} />
    </SplitPane>
  )
}

export const StepGroupTemplateCanvasWithRef = React.forwardRef(StepGroupTemplateCanvas)
