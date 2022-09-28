/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, queryByText, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import { SelectInputSetView } from '../SelectInputSetView'

describe('SelectInputSetView tests', () => {
  test('when field has allowed values configured, a MultiTypeInput with allowed values should be rendered', async () => {
    const { container } = render(
      <TestWrapper>
        <SelectInputSetView
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
          multiTypeInputProps={{
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
          }}
          selectItems={[{ label: 'Option 1', value: 'Option_1' }]}
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
    expect(abcOption).toBeInTheDocument()
    const defOption = await findByText(selectListMenu as HTMLElement, 'def')
    expect(defOption).toBeInTheDocument()
    const ghiOption = await findByText(selectListMenu as HTMLElement, 'ghi')
    expect(ghiOption).toBeInTheDocument()
    expect(queryByText(selectListMenu as HTMLElement, 'Option 1')).toBeNull()
  })

  test('when field does not have allowed values configured, MultiTypeInput should be rendered with provided options', async () => {
    const { container } = render(
      <TestWrapper>
        <SelectInputSetView
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
          multiTypeInputProps={{
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
          }}
          selectItems={[
            { label: 'Option 1', value: 'Option_1' },
            { label: 'Option 2', value: 'Option_2' }
          ]}
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
    const option1 = await findByText(selectListMenu as HTMLElement, 'Option 1')
    expect(option1).toBeInTheDocument()
    const option2 = await findByText(selectListMenu as HTMLElement, 'Option 2')
    expect(option2).toBeInTheDocument()
  })
})
