/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MultiTypeInputType } from '@harness/uicore'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DownloadArtifactCommandEdit } from '../DownloadArtifactCommandEdit'

describe('test <DownloadArtifactCommandEdit />', () => {
  test('should render relevant fields when command type is Download Artifact', async () => {
    const { queryByText } = render(
      <TestWrapper>
        <DownloadArtifactCommandEdit
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
        />
      </TestWrapper>
    )

    expect(queryByText('cd.steps.commands.destinationPath')).toBeInTheDocument()
  })
})
