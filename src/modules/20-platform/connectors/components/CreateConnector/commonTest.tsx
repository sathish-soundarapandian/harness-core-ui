/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { act, fireEvent, queryByText, render } from '@testing-library/react'
import type { ConnectorInfoDTO } from 'services/cd-ng'

export interface BackButtonTestProps {
  Element: React.ReactElement
  mock: ConnectorInfoDTO
  backButtonSelector: string
}

export const backButtonTest = ({ Element, mock, backButtonSelector }: BackButtonTestProps) => {
  test('should go back to the previous step and show saved data', async () => {
    const { container } = render(Element)
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    await act(async () => {
      fireEvent.click(container.querySelector(backButtonSelector)!)
    })
    expect(container.querySelector('input[name="name"]')?.getAttribute('value')).toEqual(mock.name)
    expect(container.querySelector('textarea[name="description"]')?.textContent).toEqual(mock.description)
    expect(queryByText(container, mock.identifier)).toBeDefined()
  })
}
