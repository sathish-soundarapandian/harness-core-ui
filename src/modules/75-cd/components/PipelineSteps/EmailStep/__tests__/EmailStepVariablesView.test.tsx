/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import type { VariableResponseMapValue } from 'services/pipeline-ng'
import { EmailStepVariablesView } from '../EmailStepVariablesView'
import type { EmailStepData } from '../emailStepTypes'

describe('EmailStepVariablesView tests', () => {
  test('Empty data snapshot test for EmailStepVariablesView', () => {
    const { container } = render(
      <EmailStepVariablesView
        metadataMap={{} as unknown as Record<string, VariableResponseMapValue>}
        variablesData={{} as EmailStepData}
        originalData={{} as EmailStepData}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
