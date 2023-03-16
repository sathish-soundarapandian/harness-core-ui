/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import InlineVarFileInputSet from '../InlineVarFileInputSet'

jest.mock('react-monaco-editor', () => ({ value, onChange, name }: any) => {
  return <textarea value={value} onChange={e => onChange(e.target.value)} name={name} />
})

describe('Test VarFileListInput set', () => {
  test(`renders content in input set form when made runtime`, async () => {
    const { getByText } = render(
      <TestWrapper>
        <InlineVarFileInputSet
          varFilePath={'stages[0].stage.spec.execution.steps[0].step.spec.configuration.spec.varFiles[0]'}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]}
          inlineVarFile={{
            varFile: {
              identifier: 'test-varFile',
              spec: {
                content: MultiTypeInputType.RUNTIME
              },
              type: 'Inline'
            }
          }}
          stepViewType={StepViewType.DeploymentForm}
        />
      </TestWrapper>
    )
    expect(getByText('test-varFile')).toBeDefined()
  })
})
