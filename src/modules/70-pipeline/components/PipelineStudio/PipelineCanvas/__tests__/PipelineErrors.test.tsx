/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, getByText, getAllByText, fireEvent, act, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { StringsMap } from 'stringTypes'
import PipelineErrors, { getFieldsLabel } from '../PipelineErrors/PipelineErrors'

const PIPELINE_ERROR_1 = {
  message: 'Pipeline Error 1',
  fqn: '$.pipeline.allowStageExecutions'
}

const PIPELINE_ERROR_2 = {
  message: 'Pipeline Error 2',
  fqn: '$.pipeline.identifier'
}

const STAGE_1_INFO = {
  identifier: '1approval',
  type: 'Approval',
  name: 'stage1Name',
  fqn: '$.pipeline.stages[1].stage'
}

const STAGE_2_INFO = {
  identifier: '1a',
  type: 'Deployment1',
  name: 'stage2Name',
  fqn: '$.pipeline.stages[0].stage'
}

const STAGE_1_ERROR_1 = {
  message: 'Stage 1 Error 1',
  stageInfo: STAGE_1_INFO,
  fqn: '$.pipeline.stages[1].stage.type'
}
const STAGE_2_ERROR_1 = {
  message: 'Stage 2 Error 1',
  stageInfo: STAGE_2_INFO,
  fqn: '$.pipeline.stages[0].stage.type'
}
const STAGE_1_ERROR_2 = {
  message: 'Stage 1 Error 2',
  stageInfo: STAGE_1_INFO,
  fqn: '$.pipeline.stages[1].stage.identifier'
}

const STEP_ERROR_1 = {
  message: 'Step Error 1',
  stageInfo: STAGE_1_INFO,
  stepInfo: {
    identifier: '1ss',
    type: 'ShellScript1',
    name: 'step1Name',
    fqn: '$.pipeline.stages[0].stage.spec.execution.steps[0].step'
  },
  fqn: '$.pipeline.stages[0].stage.spec.execution.steps[0].step.type'
}

const STEP_ERROR_2 = {
  message: 'Step Error 2',
  stageInfo: STAGE_1_INFO,
  stepInfo: {
    identifier: '1ss',
    type: 'ShellScript1',
    name: 'step2Name',
    fqn: '$.pipeline.stages[0].stage.spec.execution.steps[0].step'
  },
  fqn: '$.pipeline.stages[0].stage.spec.execution.steps[0].step.identifier'
}
const STEP_ERROR_3 = {
  message: 'Step Error 3',
  stageInfo: STAGE_2_INFO,
  stepInfo: {
    identifier: '1a',
    type: 'Deployment1',
    name: 'step3Name',
    fqn: '$.pipeline.stages[0].stage'
  },
  fqn: '$.pipeline.stages[0].stage.spec.execution.steps[0].step.identifier'
}
const STEP_ERROR_4 = {
  message: 'Step Error 4',
  stageInfo: STAGE_2_INFO,
  stepInfo: {
    identifier: '2a',
    type: 'Deployment1',
    name: 'step4Name',
    fqn: '$.pipeline.stages[0].stage'
  },
  fqn: '$.pipeline.stages[0].stage.spec.execution.steps[0].step.identifier'
}

const getBp3Dialog = (document: Document) => document.getElementsByClassName('pipelineErrorList')[0]

describe('PipelineErrors', () => {
  test('should render null, when errors are empty', () => {
    render(<PipelineErrors errors={[]} gotoViewWithDetails={jest.fn()} onClose={jest.fn()} />)
    expect(document.body).toMatchInlineSnapshot(`
      <body>
        <div />
        <div />
      </body>
    `)
  })
  /*** Pipeline Errors ***/
  test('should render single pipeline error', () => {
    const fn = jest.fn()
    render(
      <TestWrapper>
        <PipelineErrors errors={[PIPELINE_ERROR_1]} gotoViewWithDetails={fn} onClose={jest.fn()} />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Pipeline Error 1')).toBeDefined()
    expect(() => getByText(document.body, 'cd.moreIssue')).toThrow()
    expect(getBp3Dialog(document)).toMatchSnapshot('one pipeline error')
    const fixButton = getByText(document.body, 'pipeline.errorFramework.fixErrors')
    act(() => {
      fireEvent.click(fixButton)
    })
    expect(fn).toHaveBeenCalledWith({})
  })
  test('should render multiple pipeline error', async () => {
    render(
      <TestWrapper>
        <PipelineErrors
          errors={[PIPELINE_ERROR_1, PIPELINE_ERROR_2]}
          gotoViewWithDetails={jest.fn()}
          onClose={jest.fn()}
        />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Pipeline Error 1')).toBeDefined()
    expect(() => getByText(document.body, 'Pipeline Error 2')).toThrow()
    expect(getByText(document.body, 'cd.moreIssue')).toBeDefined()
    act(() => {
      fireEvent.mouseEnter(getByText(document.body, 'cd.moreIssue'))
    })
    await waitFor(() => expect(getByText(document.body, 'Pipeline Error 2')).toBeInTheDocument())
    expect(getBp3Dialog(document)).toMatchSnapshot('multiple pipeline error')
    expect(document.body.getElementsByClassName('bp3-popover-content')[0]).toMatchSnapshot('more-issues tooltip')
  })

  /*** Stage Errors ***/
  test('should render one Stage error', () => {
    const fn = jest.fn()
    render(
      <TestWrapper>
        <PipelineErrors errors={[STAGE_1_ERROR_1]} gotoViewWithDetails={fn} onClose={jest.fn()} />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Stage 1 Error 1')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage1Name')).toBeDefined()
    expect(() => getByText(document.body, 'cd.moreIssue')).toThrow()
    expect(getBp3Dialog(document)).toMatchSnapshot('one stage error')
    const fixButton = getByText(document.body, 'pipeline.errorFramework.fixStage')
    act(() => {
      fireEvent.click(fixButton)
    })
    expect(fn).toHaveBeenCalledWith({ stageId: STAGE_1_ERROR_1.stageInfo.identifier, sectionId: '' })
  })
  test('should render one Stage - multiple error', () => {
    render(
      <TestWrapper>
        <PipelineErrors
          errors={[STAGE_1_ERROR_1, STAGE_1_ERROR_2]}
          gotoViewWithDetails={jest.fn()}
          onClose={jest.fn()}
        />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Stage 1 Error 1')).toBeDefined()
    expect(() => getByText(document.body, 'Stage 1 Error 2')).toThrow()
    expect(getByText(document.body, 'cd.moreIssue')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage1Name')).toBeDefined()
    expect(getBp3Dialog(document)).toMatchSnapshot('one stage - multiple errors')
  })
  test('should render multiple Stage - each with single error', () => {
    render(
      <TestWrapper>
        <PipelineErrors
          errors={[STAGE_1_ERROR_1, STAGE_2_ERROR_1]}
          gotoViewWithDetails={jest.fn()}
          onClose={jest.fn()}
        />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Stage 1 Error 1')).toBeDefined()
    expect(getByText(document.body, 'Stage 2 Error 1')).toBeDefined()
    expect(() => getByText(document.body, 'cd.moreIssue')).toThrow()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage1Name')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage2Name')).toBeDefined()
    expect(getBp3Dialog(document)).toMatchSnapshot('multiple stage - each with single error')
  })
  test('should render multiple Stage - multiple errors', () => {
    render(
      <TestWrapper>
        <PipelineErrors
          errors={[STAGE_1_ERROR_1, STAGE_2_ERROR_1, STAGE_1_ERROR_2]}
          gotoViewWithDetails={jest.fn()}
          onClose={jest.fn()}
        />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Stage 1 Error 1')).toBeDefined()
    expect(() => getByText(document.body, 'Stage 1 Error 2')).toThrow()
    expect(getByText(document.body, 'Stage 2 Error 1')).toBeDefined()
    expect(getByText(document.body, 'cd.moreIssue')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage1Name')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage2Name')).toBeDefined()
    expect(getBp3Dialog(document)).toMatchSnapshot('multiple stage - multiple errors')
  })

  /*** Step Errors ***/
  test('should render one step error', () => {
    const fn = jest.fn()
    render(
      <TestWrapper>
        <PipelineErrors errors={[STEP_ERROR_1]} gotoViewWithDetails={fn} onClose={jest.fn()} />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Step Error 1')).toBeDefined()
    expect(() => getByText(document.body, 'cd.moreIssue')).toThrow()
    expect(getByText(document.body, 'pipeline.execution.stepTitlePrefix step1Name')).toBeDefined()
    expect(getBp3Dialog(document)).toMatchSnapshot('only one step error')
    const fixButton = getByText(document.body, 'pipeline.errorFramework.fixStep')
    act(() => {
      fireEvent.click(fixButton)
    })
    expect(fn).toHaveBeenCalledWith({
      stageId: STEP_ERROR_1.stageInfo.identifier,
      stepId: STEP_ERROR_1.stepInfo.identifier
    })
  })
  test('should render multiple step errors in same stage', () => {
    render(
      <TestWrapper>
        <PipelineErrors errors={[STEP_ERROR_1, STEP_ERROR_2]} gotoViewWithDetails={jest.fn()} onClose={jest.fn()} />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Step Error 1')).toBeDefined()
    expect(getByText(document.body, 'cd.moreIssue')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stepTitlePrefix step1Name')).toBeDefined()
    // this will be in more issues tooltip
    expect(() => getByText(document.body, 'pipeline.execution.stepTitlePrefix step2Name')).toThrow()
    expect(getBp3Dialog(document)).toMatchSnapshot('multiple step errors in same stage')
  })
  test('should render multiple step errors in different stage', () => {
    render(
      <TestWrapper>
        <PipelineErrors errors={[STEP_ERROR_1, STEP_ERROR_3]} gotoViewWithDetails={jest.fn()} onClose={jest.fn()} />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Step Error 1')).toBeDefined()
    expect(getByText(document.body, 'Step Error 3')).toBeDefined()
    expect(() => getByText(document.body, 'cd.moreIssue')).toThrow()
    expect(getByText(document.body, 'pipeline.execution.stepTitlePrefix step1Name')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stepTitlePrefix step3Name')).toBeDefined()
    expect(getBp3Dialog(document)).toMatchSnapshot('multiple step errors in different stage')
  })

  /*** Stage & Step Errors ***/
  test('should render one Stage error and step error in same stage', () => {
    render(
      <TestWrapper>
        <PipelineErrors errors={[STAGE_1_ERROR_1, STEP_ERROR_1]} gotoViewWithDetails={jest.fn()} onClose={jest.fn()} />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Stage 1 Error 1')).toBeDefined()
    expect(getByText(document.body, 'Step Error 1')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stepTitlePrefix step1Name')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage1Name')).toBeDefined()
    expect(() => getByText(document.body, 'cd.moreIssue')).toThrow()
    expect(getBp3Dialog(document)).toMatchSnapshot('one Stage error and step error in same stage')
  })
  test('should render one Stage error and step error in different stage', () => {
    render(
      <TestWrapper>
        <PipelineErrors errors={[STAGE_1_ERROR_1, STEP_ERROR_3]} gotoViewWithDetails={jest.fn()} onClose={jest.fn()} />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Stage 1 Error 1')).toBeDefined()
    expect(getByText(document.body, 'Step Error 3')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stepTitlePrefix step3Name')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage1Name')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage2Name')).toBeDefined()
    expect(() => getByText(document.body, 'cd.moreIssue')).toThrow()
    expect(getBp3Dialog(document)).toMatchSnapshot('one Stage error and step error in different stage')
  })
  test('should render Stage errors and step errors in different stage', () => {
    render(
      <TestWrapper>
        <PipelineErrors
          errors={[STAGE_1_ERROR_1, STEP_ERROR_1, STEP_ERROR_3, STEP_ERROR_2]}
          gotoViewWithDetails={jest.fn()}
          onClose={jest.fn()}
        />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Stage 1 Error 1')).toBeDefined()
    expect(getByText(document.body, 'Step Error 1')).toBeDefined()
    expect(getByText(document.body, 'cd.moreIssue')).toBeDefined()
    expect(getByText(document.body, 'Step Error 3')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stepTitlePrefix step3Name')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage1Name')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage2Name')).toBeDefined()

    expect(getBp3Dialog(document)).toMatchSnapshot('Stage errors and step errors in different stage')
  })
  test('should render multiple Stage errors and step errors in different stage', () => {
    render(
      <TestWrapper>
        <PipelineErrors
          errors={[STAGE_1_ERROR_2, STAGE_1_ERROR_1, STAGE_2_ERROR_1, STEP_ERROR_2, STEP_ERROR_3, STEP_ERROR_1]}
          gotoViewWithDetails={jest.fn()}
          onClose={jest.fn()}
        />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Stage 1 Error 2')).toBeDefined()
    expect(() => getByText(document.body, 'Stage 1 Error 1')).toThrow()
    // expect(getByText(document.body, 'cd.moreIssue')).toBeDefined()

    expect(() => getByText(document.body, 'Step Error 1')).toThrow()
    expect(getByText(document.body, 'Step Error 2')).toBeDefined()
    expect(getAllByText(document.body, 'cd.moreIssue').length).toBe(2)

    expect(getByText(document.body, 'Stage 2 Error 1')).toBeDefined()
    expect(getByText(document.body, 'Step Error 3')).toBeDefined()

    // in more
    expect(() => getByText(document.body, 'pipeline.execution.stepTitlePrefix step1Name')).toThrow()

    expect(getByText(document.body, 'pipeline.execution.stepTitlePrefix step2Name')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stepTitlePrefix step3Name')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage1Name')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage2Name')).toBeDefined()

    expect(getBp3Dialog(document)).toMatchSnapshot('multiple Stage errors and step errors in different stage')
  })
  test('should render multiple Stage errors and step errors in different stage - one stage has different step errors', () => {
    render(
      <TestWrapper>
        <PipelineErrors
          errors={[
            STAGE_1_ERROR_2,
            STAGE_1_ERROR_1,
            STAGE_2_ERROR_1,
            STEP_ERROR_2,
            STEP_ERROR_3,
            STEP_ERROR_1,
            STEP_ERROR_4
          ]}
          gotoViewWithDetails={jest.fn()}
          onClose={jest.fn()}
        />
      </TestWrapper>
    )
    expect(getByText(document.body, 'Stage 1 Error 2')).toBeDefined()
    expect(() => getByText(document.body, 'Stage 1 Error 1')).toThrow()
    expect(getByText(document.body, 'Stage 2 Error 1')).toBeDefined()
    // expect(getByText(document.body, 'cd.moreIssue')).toBeDefined()

    expect(() => getByText(document.body, 'Step Error 1')).toThrow()
    expect(getByText(document.body, 'Step Error 2')).toBeDefined()
    expect(getAllByText(document.body, 'cd.moreIssue').length).toBe(2)

    expect(getByText(document.body, 'Stage 2 Error 1')).toBeDefined()
    expect(getByText(document.body, 'Step Error 3')).toBeDefined()
    expect(getByText(document.body, 'Step Error 4')).toBeDefined()

    // in more
    expect(() => getByText(document.body, 'pipeline.execution.stepTitlePrefix step1Name')).toThrow()

    expect(getByText(document.body, 'pipeline.execution.stepTitlePrefix step2Name')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stepTitlePrefix step3Name')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stepTitlePrefix step4Name')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage1Name')).toBeDefined()
    expect(getByText(document.body, 'pipeline.execution.stageTitlePrefix stage2Name')).toBeDefined()

    expect(getBp3Dialog(document)).toMatchSnapshot(
      'multiple Stage errors and step errors in different stage - one stage has different step errors'
    )
  })
})

describe('getFieldsLabel()', () => {
  const getString = (str: keyof StringsMap, vars?: Record<string, any> | undefined) =>
    vars?.stringToAppend ? `${str}_${vars.stringToAppend}` : str
  test('only pipeline errors', () => {
    // it needs
    expect(getFieldsLabel([PIPELINE_ERROR_1], [], {}, getString)).toBe('pipeline.errorFramework.header12')
  })
  test('pipeline, single stage and step errors', () => {
    expect(
      getFieldsLabel(
        [PIPELINE_ERROR_1],
        [STAGE_1_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [STAGE_1_ERROR_2],
            errorsByStep: {
              [STEP_ERROR_1.stepInfo.identifier]: [STEP_ERROR_1]
            },
            stepIds: []
          }
        },
        getString
      )
      // 'pipeline, stage and steps need'
    ).toBe('pipeline.errorFramework.header6_pipeline.errorFramework.header1')
  })
  test('pipeline, multiple stages and step errors', () => {
    expect(
      getFieldsLabel(
        [PIPELINE_ERROR_1],
        [STAGE_1_INFO.identifier, STAGE_2_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [STAGE_1_ERROR_2],
            errorsByStep: {
              [STEP_ERROR_1.stepInfo.identifier]: [STEP_ERROR_1]
            },
            stepIds: []
          }
        },
        getString
      )
      // pipeline, some stages and steps need
    ).toBe('pipeline.errorFramework.header6_pipeline.errorFramework.header2')
  })
  test('pipeline, single stage error', () => {
    expect(
      getFieldsLabel(
        [PIPELINE_ERROR_1],
        [STAGE_1_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [STAGE_1_ERROR_2],
            errorsByStep: {},
            stepIds: []
          }
        },
        getString
      )
      // pipeline and stage need
    ).toBe('pipeline.errorFramework.header6_pipeline.errorFramework.header3')
  })
  test('pipeline, multiple stages error', () => {
    expect(
      getFieldsLabel(
        [PIPELINE_ERROR_1],
        [STAGE_1_INFO.identifier, STAGE_2_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [STAGE_1_ERROR_2],
            errorsByStep: {},
            stepIds: []
          }
        },
        getString
      )
      // 'pipeline and some stages need'
    ).toBe('pipeline.errorFramework.header6_pipeline.errorFramework.header4')
  })
  test('pipeline, and steps error', () => {
    expect(
      getFieldsLabel(
        [PIPELINE_ERROR_1],
        [STAGE_1_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [],
            errorsByStep: {
              [STEP_ERROR_1.stepInfo.identifier]: [STEP_ERROR_1]
            },
            stepIds: []
          }
        },
        getString
      )
      // pipeline and steps need
    ).toBe('pipeline.errorFramework.header6_pipeline.errorFramework.header5')
  })

  test('single stage and step errors', () => {
    expect(
      getFieldsLabel(
        [],
        [STAGE_1_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [STAGE_1_ERROR_2],
            errorsByStep: {
              [STEP_ERROR_1.stepInfo.identifier]: [STEP_ERROR_1]
            },
            stepIds: []
          }
        },
        getString
      )
      // 'stage and steps need'
    ).toBe('pipeline.errorFramework.header7')
  })
  test('multiple stages and step errors', () => {
    expect(
      getFieldsLabel(
        [],
        [STAGE_1_INFO.identifier, STAGE_2_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [STAGE_1_ERROR_2],
            errorsByStep: {
              [STEP_ERROR_1.stepInfo.identifier]: [STEP_ERROR_1]
            },
            stepIds: []
          }
        },
        getString
      )
      // some stages and steps need
    ).toBe('pipeline.errorFramework.header8')
  })
  test('single stage error', () => {
    expect(
      getFieldsLabel(
        [],
        [STAGE_1_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [STAGE_1_ERROR_2],
            errorsByStep: {},
            stepIds: []
          }
        },
        getString
      )
      // stage needs
    ).toBe('pipeline.errorFramework.header9')
  })
  test('multiple stages error', () => {
    expect(
      getFieldsLabel(
        [],
        [STAGE_1_INFO.identifier, STAGE_2_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [STAGE_1_ERROR_2],
            errorsByStep: {},
            stepIds: []
          }
        },
        getString
      )
      // some stages need
    ).toBe('pipeline.errorFramework.header10')
  })
  test('steps error', () => {
    expect(
      getFieldsLabel(
        [],
        [STAGE_1_INFO.identifier],
        {
          [STAGE_1_INFO.identifier]: {
            stageErrors: [],
            errorsByStep: {
              [STEP_ERROR_1.stepInfo.identifier]: [STEP_ERROR_1]
            },
            stepIds: []
          }
        },
        getString
      )
      // some steps need
    ).toBe('pipeline.errorFramework.header11')
  })
})
