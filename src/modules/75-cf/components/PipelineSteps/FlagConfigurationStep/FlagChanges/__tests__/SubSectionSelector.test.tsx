/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import SubSectionSelector, { SubSectionSelectorProps } from '../SubSectionSelector'

const SetFlagSwitch: FC = () => <span />
const DefaultRules: FC = () => <span />
const ServePercentageRollout: FC = () => <span />

const subSectionNameMap = new Map()
subSectionNameMap.set(SetFlagSwitch, 'Set Flag Switch')
subSectionNameMap.set(DefaultRules, 'Default Rules')
subSectionNameMap.set(ServePercentageRollout, 'Serve Percentage Rollout')

const renderComponent = (props: Partial<SubSectionSelectorProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <SubSectionSelector
        subSectionNameMap={subSectionNameMap}
        availableSubSections={[DefaultRules, ServePercentageRollout]}
        currentSubSection={SetFlagSwitch}
        onSubSectionChange={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )

describe('SubSectionSelector', () => {
  test('it should display the current subsection name', async () => {
    renderComponent()

    expect(screen.getByText(subSectionNameMap.get(SetFlagSwitch))).toBeInTheDocument()
  })

  test('it should have a button which opens the sub-section menu', async () => {
    renderComponent()

    const btn = screen.getByRole('button')
    expect(btn).toBeInTheDocument()
    expect(screen.queryByText(subSectionNameMap.get(DefaultRules))).not.toBeInTheDocument()
    expect(screen.queryByText(subSectionNameMap.get(ServePercentageRollout))).not.toBeInTheDocument()

    await userEvent.click(btn)

    expect(screen.getByText(subSectionNameMap.get(DefaultRules))).toBeInTheDocument()
    expect(screen.getByText(subSectionNameMap.get(ServePercentageRollout))).toBeInTheDocument()
  })

  test('it should call the onSubSectionChange handler when the sub-section is changed', async () => {
    const onSubSectionChange = jest.fn()
    const newSubSection = ServePercentageRollout

    renderComponent({ onSubSectionChange })

    const btn = screen.getByRole('button')
    await userEvent.click(btn)

    await userEvent.click(screen.getByText(subSectionNameMap.get(newSubSection)))

    expect(onSubSectionChange).toHaveBeenCalledWith(newSubSection)
  })

  test('it should not display the button when there are no available sub-sections', function () {
    const currentSubSection = DefaultRules
    renderComponent({ currentSubSection, availableSubSections: [] })

    expect(screen.getByText(subSectionNameMap.get(currentSubSection))).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
