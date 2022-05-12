/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SecurityTestsStage } from '../SecurityTestsStage'

jest.mock('@ci/components/PipelineStudio/BuildStage/EditStageView/EditStageView', () => ({
  EditStageView: () => <div data-test-id="EditStageView" />
}))
jest.mock('@ci/components/PipelineStudio/BuildStageSetupShell/BuildStageSetupShell', () => () => (
  <div data-test-id="BuildStageSetupShell" />
))
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))

describe('SecurityTestsStage', () => {
  test('matches snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <SecurityTestsStage
          name="test"
          type="ADVANCED"
          icon="sto-color-filled"
          isDisabled={false}
          isApproval={false}
          title="test"
          description=""
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('matches snapshot when minimal="true"', () => {
    const { container } = render(
      <TestWrapper>
        <SecurityTestsStage
          name="test"
          type="ADVANCED"
          icon="sto-color-filled"
          isDisabled={false}
          isApproval={false}
          title="test"
          description=""
          minimal
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
