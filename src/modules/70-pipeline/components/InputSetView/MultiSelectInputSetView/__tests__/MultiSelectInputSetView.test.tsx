/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, fireEvent, queryByText, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType } from '@harness/uicore'

import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import { MultiSelectInputSetView } from '../MultiSelectInputSetView'

describe('MultiSelectInputSetView tests', () => {
  test('when field has allowed values configured, a MultiSelectTypeInput with allowed values should be rendered', async () => {
    const onChange = jest.fn()
    const { container } = render(
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

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const dropdownMultiSelectInput = queryByNameAttribute('spec.artifacts.primary.spec.artifactDirectory', container)
    fireEvent.keyDown(dropdownMultiSelectInput!, { key: 'Enter', code: 13 })
    await waitFor(() => expect(portalDivs.length).toBe(1))
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const abcOption = await findByText(selectListMenu as HTMLElement, 'abc')
    expect(abcOption).toBeInTheDocument()
    const defOption = await findByText(selectListMenu as HTMLElement, 'def')
    expect(defOption).toBeInTheDocument()
    const ghiOption = await findByText(selectListMenu as HTMLElement, 'ghi')
    expect(ghiOption).toBeInTheDocument()
    expect(queryByText(selectListMenu as HTMLElement, 'Option 1')).toBeNull()
    userEvent.click(abcOption)
    expect(onChange).toHaveBeenCalledWith([{ label: 'abc', value: 'abc' }], 'MULTI_SELECT_OPTION', 'FIXED')
  })

  test('when field does not have allowed values configured, MultiSelectTypeInput should be rendered with provided options', async () => {
    const onChange = jest.fn()
    const { container } = render(
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

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const dropdownMultiSelectInput = queryByNameAttribute('spec.artifacts.primary.spec.artifactDirectory', container)
    fireEvent.keyDown(dropdownMultiSelectInput!, { key: 'Enter', code: 13 })
    await waitFor(() => expect(portalDivs.length).toBe(1))
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const option1 = await findByText(selectListMenu as HTMLElement, 'Option 1')
    expect(option1).toBeInTheDocument()
    const option2 = await findByText(selectListMenu as HTMLElement, 'Option 2')
    expect(option2).toBeInTheDocument()
    userEvent.click(option1)
    expect(onChange).toHaveBeenCalledWith([{ label: 'Option 1', value: 'Option_1' }], 'MULTI_SELECT_OPTION', 'FIXED')
  })
})
