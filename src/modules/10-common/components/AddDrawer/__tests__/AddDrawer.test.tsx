/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, queryByText } from '@testing-library/react'
import { ModalProvider, useModalHook } from '@harness/use-modal'
import { Container } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { getTriggerListDefaultProps } from './mockConstants'
import AddDrawer from '../AddDrawer'

const defaultAddDrawerTriggersProps = getTriggerListDefaultProps()

function WrapperComponent(): JSX.Element {
  const [openDrawer, hideDrawer] = useModalHook(() => (
    <TestWrapper>
      <AddDrawer {...defaultAddDrawerTriggersProps} />
    </TestWrapper>
  ))

  return (
    <Container>
      <button
        onClick={() => {
          openDrawer()
        }}
        className="openModal"
      />
      <button className="closeModal" onClick={() => hideDrawer()} />
    </Container>
  )
}

describe('AddDrawer Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Trigger List Add Drawer', async () => {
      const { container } = render(
        <ModalProvider>
          <WrapperComponent />
        </ModalProvider>
      )
      const openButton = container.querySelector('.openModal')
      if (!openButton) {
        throw Error('open button was not found.')
      }
      fireEvent.click(openButton)
      await waitFor(() => expect(document.body.querySelector(`.stepPalette`)).not.toBeNull())
      // eslint-disable-next-line no-document-body-snapshot
      expect(document.body).toMatchSnapshot()
      // Should properly hide/close
      const closeButton = container.querySelector('.closeModal')
      if (!closeButton) {
        throw Error('close button was not found.')
      }
      fireEvent.click(closeButton)
      await waitFor(() => expect(container.querySelector(`.stepPalette`)).toBeNull())
    })
  })

  describe('Interactivity', () => {
    test('Filter by clicking on a category', async () => {
      const { container } = render(
        <ModalProvider>
          <WrapperComponent />
        </ModalProvider>
      )
      const openButton = container.querySelector('.openModal')
      if (!openButton) {
        throw Error('open button was not found.')
      }
      fireEvent.click(openButton)
      const webhookCategoryButton = queryByText(document.body, `Webhook (3)`)
      const categories = document.body.querySelectorAll('[class*="categorySteps"]')
      expect(categories.length).toEqual(3) // New Artifact/Manifest, Scheduled, Webhook
      await waitFor(() => expect(webhookCategoryButton).not.toBeNull())

      webhookCategoryButton && fireEvent.click(webhookCategoryButton)
      await waitFor(() => expect(document.body.querySelector('[class*="active"]')).not.toBeNull())
      const newCategories = document.body.querySelectorAll('[class*="categorySteps"]')

      expect(newCategories.length).toEqual(1)

      //   Show all again
      const showAllButton = document.body.querySelector('[class*="showAllBtn"]')
      if (!showAllButton) {
        throw Error('open button was not found.')
      }
      fireEvent.click(showAllButton)
      await waitFor(() => expect(queryByText(document.body, 'New Artifact')).not.toBeNull())
      const resetCategories = document.body.querySelectorAll('[class*="categorySteps"]')

      expect(resetCategories.length).toEqual(3)
    })

    test('Filter by Searching for a Trigger Name', async () => {
      const { container } = render(
        <ModalProvider>
          <WrapperComponent />
        </ModalProvider>
      )
      const openButton = container.querySelector('.openModal')
      if (!openButton) {
        throw Error('open button was not found.')
      }
      fireEvent.click(openButton)
      const searchButton = document.body.querySelector('[class*="ExpandingSearchInput"]')
      expect(queryByText(document.body, 'BitBucket')).not.toBeNull()
      await waitFor(() => expect(searchButton).not.toBeNull())
      if (!searchButton) {
        throw Error('no search button found')
      }
      fireEvent.click(searchButton)
      const searchButtonInput = searchButton.querySelector('input')
      if (!searchButtonInput) {
        throw Error('no search input')
      }
      fireEvent.change(searchButtonInput, { target: { value: 'GitHub' } })
      await waitFor(() => expect(queryByText(document.body, 'BitBucket')).toBeNull())
      const triggerCards = document.body.querySelectorAll('[class*="stepsRenderer"] [class*="card"]')

      expect(triggerCards.length).toEqual(1)
    })

    test('Selecting an item triggers event', async () => {
      const { container } = render(
        <ModalProvider>
          <WrapperComponent />
        </ModalProvider>
      )
      const openButton = container.querySelector('.openModal')
      if (!openButton) {
        throw Error('open button was not found.')
      }
      fireEvent.click(openButton)
      await waitFor(() => expect(document.body.querySelector(`.stepPalette`)).not.toBeNull())
      const bitBucketCard = queryByText(document.body, 'BitBucket')
      if (!bitBucketCard) {
        throw Error('no BitBucket card')
      }

      fireEvent.click(bitBucketCard)

      expect(defaultAddDrawerTriggersProps.onSelect).toBeCalled()
    })
  })
})
