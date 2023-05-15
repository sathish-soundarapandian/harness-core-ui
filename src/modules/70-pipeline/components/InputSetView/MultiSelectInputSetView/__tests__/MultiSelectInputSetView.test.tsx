/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType } from '@harness/uicore'

import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import { MultiSelectInputSetView } from '../MultiSelectInputSetView'

describe('MultiSelectInputSetView tests', () => {
  test('when field has allowed values configured, a MultiSelectTypeInput with allowed values should be rendered', async () => {
    const onChange = jest.fn()
    const { baseElement } = render(
      <TestWrapper>
        <MultiSelectInputSetView
          name={`spec.artifacts.primary.spec.artifactDirectory`}
          fieldPath={`artifacts.primary.spec.artifactDirectory`}
          label={'pipeline.artifactsSelection.artifactDirectory'}
          template={{
            artifacts: {
              primary: {
                type: 'ArtifactoryRegistry',
                spec: {
                  artifactDirectory: '<+input>.allowedValues(abc,def,ghi)'
                }
              }
            }
          }}
          selectItems={[{ label: 'Option 1', value: 'Option_1' }]}
          multiSelectTypeInputProps={{
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
            onChange: onChange
          }}
        />
      </TestWrapper>
    )

    const input = await waitFor(() => {
      const _input = queryByNameAttribute('spec.artifacts.primary.spec.artifactDirectory', baseElement)
      expect(_input).toBeInTheDocument()
      return _input
    })

    userEvent.click(input!)

    const abcOption = await screen.findByText('abc')
    expect(abcOption).toBeInTheDocument()
    const defOption = screen.getByText('def')
    expect(defOption).toBeInTheDocument()
    const ghiOption = screen.getByText('ghi')
    expect(ghiOption).toBeInTheDocument()

    expect(screen.queryByText('Option 1')).toBeNull()

    await userEvent.click(abcOption)

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([{ label: 'abc', value: 'abc' }], 'MULTI_SELECT_OPTION', 'FIXED')
    )
  })

  test('when field does not have allowed values configured, MultiSelectTypeInput should be rendered with provided options', async () => {
    const onChange = jest.fn()
    const { baseElement } = render(
      <TestWrapper>
        <MultiSelectInputSetView
          name={`spec.artifacts.primary.spec.artifactDirectory`}
          fieldPath={`artifacts.primary.spec.artifactDirectory`}
          label={'pipeline.artifactsSelection.artifactDirectory'}
          template={{
            artifacts: {
              primary: {
                type: 'ArtifactoryRegistry',
                spec: {
                  artifactDirectory: '<+input>'
                }
              }
            }
          }}
          selectItems={[
            { label: 'Option 1', value: 'Option_1' },
            { label: 'Option 2', value: 'Option_2' }
          ]}
          multiSelectTypeInputProps={{
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
            onChange: onChange,
            multiSelectProps: {
              usePortal: true,
              items: []
            }
          }}
        />
      </TestWrapper>
    )
    const input = await waitFor(() => {
      const _input = queryByNameAttribute('spec.artifacts.primary.spec.artifactDirectory', baseElement)
      expect(_input).toBeInTheDocument()
      return _input
    })

    userEvent.click(input!)

    const option1 = await screen.findByText('Option 1')
    expect(option1).toBeInTheDocument()
    const option2 = screen.getByText('Option 2')
    expect(option2).toBeInTheDocument()

    await userEvent.click(option1)

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([{ label: 'Option 1', value: 'Option_1' }], 'MULTI_SELECT_OPTION', 'FIXED')
    )
  })
})
