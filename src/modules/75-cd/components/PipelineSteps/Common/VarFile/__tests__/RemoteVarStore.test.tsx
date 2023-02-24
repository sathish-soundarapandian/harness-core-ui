/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { render, fireEvent, screen } from '@testing-library/react'

import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { RemoteVarStore } from '../RemoteVarStore'

describe('Remote VarStore tests', () => {
  test('new connector view works correctly', async () => {
    const defaultProps = {
      name: 'Terraform Var store',
      initialValues: {
        varFile: {
          type: 'Remote',
          spec: {
            store: {
              type: 'Git'
            }
          }
        }
      },
      isEditMode: true,
      isReadOnly: false,
      allowableTypes: [
        MultiTypeInputType.FIXED,
        MultiTypeInputType.EXPRESSION,
        MultiTypeInputType.RUNTIME
      ] as AllowedTypesWithRunTime[],
      handleConnectorViewChange: jest.fn(),
      setSelectedConnector: jest.fn(),
      isTerragrunt: false
    }
    render(
      <TestWrapper>
        <RemoteVarStore {...defaultProps} />
      </TestWrapper>
    )

    const newConnectorLabel = await screen.findByText('newLabel pipeline.manifestType.gitConnectorLabel connector')
    expect(newConnectorLabel).toBeInTheDocument()
    fireEvent.click(newConnectorLabel)

    const nextStepButton = await screen.findByText('continue')
    expect(nextStepButton).toBeDefined()
    fireEvent.click(nextStepButton)
    expect(nextStepButton).toBeDefined()
  })
})
