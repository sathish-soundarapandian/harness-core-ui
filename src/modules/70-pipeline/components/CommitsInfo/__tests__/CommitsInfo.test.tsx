/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { CommitsInfo } from '../CommitsInfo'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

describe('Test CommitsInfo component', () => {
  const mockCommits = [
    { message: 'Update .drone.yml', id: 'commitSha1', ownerName: 'test_user', ownerEmail: 'test_user@mail.com' },
    { message: 'Rebase', id: 'sha2Commit', ownerName: 'test_user1', ownerEmail: 'test_user1@mail.com' }
  ]

  test('renders ok - default view', () => {
    const { getByText } = render(<CommitsInfo commits={mockCommits} />)
    expect(getByText(mockCommits[0].message)).toBeInTheDocument()
    expect(getByText(mockCommits[0].id.slice(0, 7))).toBeInTheDocument()
    expect(getByText(mockCommits[0].message)).toBeInTheDocument()
  })

  test('renders ok - expanded view', () => {
    const { getByText } = render(<CommitsInfo commits={mockCommits} />)
    act(() => {
      fireEvent.click(getByText('pipeline.moreCommitsLabel'))
    })
    expect(getByText(mockCommits[0].message)).toBeInTheDocument()
    expect(getByText(mockCommits[0].id.slice(0, 7))).toBeInTheDocument()
    expect(getByText(mockCommits[0].message)).toBeInTheDocument()

    expect(getByText(mockCommits[1].message)).toBeInTheDocument()
    expect(getByText(mockCommits[1].id.slice(0, 7))).toBeInTheDocument()
    expect(getByText(mockCommits[1].message)).toBeInTheDocument()
  })
})
