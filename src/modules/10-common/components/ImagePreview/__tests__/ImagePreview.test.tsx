/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ImagePreview } from '../ImagePreview'

const base64 =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PGc+PHBhdGggZmlsbD0iI0Q2MzAyMyIgZD0iTTQwMCAyMDBjMCAxMTAuNDQ3LTg5LjU0MiAyMDAtMjAwIDIwMEM4OS41NCA0MDAgMCAzMTAuNDQ3IDAgMjAwIDAgODkuNTQgODkuNTQ2IDAgMjAwIDBjMTEwLjQ1OCAwIDIwMCA4OS41NCAyMDAgMjAweiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xMDkuOTU2IDk2LjEwNGMtNy42NzMgMC0xMy44NTMgNi4xNzgtMTMuODUzIDEzLjg1djQ4LjQ4Nmg0MS41NnYtMTMuODVjMC0zLjgzNSAzLjA4NC02LjkyNiA2LjkyNi02LjkyNmgxMTAuODJjMy44MzMgMCA2LjkyNyAzLjA5IDYuOTI3IDYuOTI2djEzLjg1aDQxLjU1OHYtNDguNDg1YzAtNy42NzMtNi4xOC0xMy44NS0xMy44NS0xMy44NWgtMTgwLjA5em0tMTMuODUyIDc2LjE4OHY1NS40MTVoNDEuNTZ2LTU1LjQxNWgtNDEuNTZ6bTE2Ni4yMzQgMHY1NS40MTVoNDEuNTU4di01NS40MTVoLTQxLjU1OHpNOTYuMTA0IDI0MS41NnY0OC40ODdjMCA3LjY2OCA2LjE4IDEzLjg1IDEzLjg1MyAxMy44NWgxODAuMDg4YzcuNjcgMCAxMy44NS02LjE4MiAxMy44NS0xMy44NVYyNDEuNTZIMjYyLjM0djEzLjg0OGMwIDMuODM4LTMuMDk0IDYuOTMtNi45MjYgNi45M0gxNDQuNTljLTMuODQzIDAtNi45MjgtMy4wOTItNi45MjgtNi45M1YyNDEuNTZIOTYuMTA0eiIvPjwvZz48L3N2Zz4='

test('loads and displays image if src is valid', () => {
  render(
    <TestWrapper>
      <ImagePreview size={99} src={base64} alt={'Preview of the uploaded image'} fallbackIcon={'main-user'} />
    </TestWrapper>
  )

  expect(screen.getByAltText('Preview of the uploaded image')).toBeInTheDocument()
})

test('shows fallback icon on error', async () => {
  render(
    <TestWrapper>
      <ImagePreview size={99} src={'invalid-url'} alt={'Preview of the uploaded image'} fallbackIcon={'main-user'} />
    </TestWrapper>
  )

  fireEvent.error(screen.getByAltText('Preview of the uploaded image'))

  expect(screen.queryByAltText('Preview of the uploaded image')).not.toBeInTheDocument()
  expect(screen.getByTestId('fallback-icon-main-user')).toBeInTheDocument()
})
