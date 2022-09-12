/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import type { VariableResponseMapValue } from 'services/pipeline-ng'

import { PolicyStepVariablesView } from '../PolicyStepVariablesView'
import type { PolicyStepData } from '../PolicyStepTypes'

import PolicyStepVariablesViewProps from './PolicyStepVariablesViewProps.json'

describe('<PolicyStepVariablesView /> tests', () => {
  test('snapshot test for PolicyStepVariablesView - no data', () => {
    const { container } = render(
      <PolicyStepVariablesView
        metadataMap={{} as unknown as Record<string, VariableResponseMapValue>}
        variablesData={{} as PolicyStepData}
        originalData={{} as PolicyStepData}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('snapshot test for PolicyStepVariablesView - complete data', () => {
    const { container } = render(
      <PolicyStepVariablesView
        metadataMap={PolicyStepVariablesViewProps.metadataMap as unknown as Record<string, VariableResponseMapValue>}
        variablesData={PolicyStepVariablesViewProps.variablesData as PolicyStepData}
        originalData={PolicyStepVariablesViewProps.originalData as PolicyStepData}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
