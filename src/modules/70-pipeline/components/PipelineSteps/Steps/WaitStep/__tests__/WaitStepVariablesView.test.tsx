/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import type { VariableResponseMapValue } from 'services/pipeline-ng'

import { WaitStepVariablesView } from '../WaitStepVariablesView'
import type { WaitStepData } from '../WaitStepTypes'

import WaitStepVariablesViewProps from './WaitStepVariablesViewProps.json'

describe('<WaitStepVariablesView /> tests', () => {
  test('renders variables in wait step spec', () => {
    const { container } = render(
      <WaitStepVariablesView
        stageIdentifier={WaitStepVariablesViewProps.stageIdentifier}
        metadataMap={WaitStepVariablesViewProps.metadataMap as unknown as Record<string, VariableResponseMapValue>}
        variablesData={WaitStepVariablesViewProps.variablesData as WaitStepData}
        initialValues={WaitStepVariablesViewProps.initialValues as WaitStepData}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
