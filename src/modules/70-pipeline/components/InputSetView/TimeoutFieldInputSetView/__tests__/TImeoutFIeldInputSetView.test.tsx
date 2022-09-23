/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import { TimeoutFieldInputSetView } from '../TimeoutFieldInputSetView'

describe('TimeoutFieldInputSetView tests', () => {
  test('when field has allowed values configured, a MultiTypeInput with allowed values should be rendered', async () => {
    const { container } = render(
      <TestWrapper>
        <TimeoutFieldInputSetView
          name="timeout"
          multiTypeDurationProps={{
            enableConfigureOptions: false,
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
            disabled: false,
            expressions: ['org.identifier']
          }}
          fieldPath={`timeout`}
          label={'pipelineSteps.timeoutLabel'}
          template={{
            identifier: 'asdasd',
            timeout: '<+input>.allowedValues(2d,3d,4d)',
            type: 'HarnessApproval'
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
    const abcOption = await findByText(selectListMenu as HTMLElement, '2d')
    expect(abcOption).toBeDefined()
    const defOption = await findByText(selectListMenu as HTMLElement, '3d')
    expect(defOption).toBeDefined()
    const ghiOption = await findByText(selectListMenu as HTMLElement, '4d')
    expect(ghiOption).toBeDefined()
  })

  test('when field does not have allowed values configured, timeout dropdown should not be rendered', async () => {
    const { container } = render(
      <TestWrapper>
        <TimeoutFieldInputSetView
          name="timeout"
          multiTypeDurationProps={{
            enableConfigureOptions: false,
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
            disabled: false,
            expressions: ['org.identifier']
          }}
          fieldPath={`timeout`}
          label={'pipelineSteps.timeoutLabel'}
          template={{
            identifier: 'asdasd',
            timeout: '<+input>',
            type: 'HarnessApproval'
          }}
        />
      </TestWrapper>
    )

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    // Icon does not exist indicates that dropdown field is NOT rendered
    const dropDownButton = container.querySelector('[data-icon="chevron-down"]')
    expect(dropDownButton).toBeNull()
  })
})
