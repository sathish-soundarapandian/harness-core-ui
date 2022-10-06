/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType } from '@harness/uicore'

import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import { TextFieldInputSetView } from '../TextFieldInputSetView'

describe('TextFieldInputSetView tests', () => {
  test('when field has allowed values configured, a MultiTypeInput with allowed values should be rendered', async () => {
    const { container } = render(
      <TestWrapper>
        <TextFieldInputSetView
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
          multiTextInputProps={{
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
          }}
        />
      </TestWrapper>
    )

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    // This icon indicates that field is rendered as dropdown
    const dropDownButton = container.querySelector('[data-icon="chevron-down"]')
    userEvent.click(dropDownButton!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const abcOption = await findByText(selectListMenu as HTMLElement, 'abc')
    expect(abcOption).toBeDefined()
    const defOption = await findByText(selectListMenu as HTMLElement, 'def')
    expect(defOption).toBeDefined()
    const ghiOption = await findByText(selectListMenu as HTMLElement, 'ghi')
    expect(ghiOption).toBeDefined()
  })

  test('when field does not have allowed values configured, MultiTextInput should be rendered', async () => {
    const onChange = jest.fn()
    const { container } = render(
      <TestWrapper>
        <TextFieldInputSetView
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
          multiTextInputProps={{
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
          }}
          onChange={onChange}
        />
      </TestWrapper>
    )

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    // Icon does not exist indicates that dropdown field is NOT rendered
    const dropDownButton = container.querySelector('[data-icon="chevron-down"]')
    expect(dropDownButton).toBeNull()
    const textField = queryByNameAttribute(
      'spec.artifacts.primary.spec.artifactDirectory',
      container
    ) as HTMLInputElement
    expect(textField.value).toBe('')
    act(() => {
      fireEvent.change(textField, { target: { value: 'testDir' } })
    })
    await waitFor(() => expect(onChange).toHaveBeenCalled())
  })
})
