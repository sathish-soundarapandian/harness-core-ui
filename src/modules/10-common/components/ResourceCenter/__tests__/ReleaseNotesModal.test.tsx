/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { useGetAccountNG } from 'services/cd-ng'
import * as cdNgOpenApiServices from 'services/cd-ng-open-api'
import { useReleaseNotesModal } from '../ReleaseNotesModal/useReleaseNotesModal'

jest.mock('services/cd-ng')
const useGetAccountNGMock = useGetAccountNG as jest.MockedFunction<any>

beforeEach(() => {
  window.deploymentType = 'SAAS'

  useGetAccountNGMock.mockImplementation(() => {
    return {
      data: {
        data: {
          name: 'account name',
          identifier: 'id1',
          cluster: 'free',
          defaultExperience: 'NG'
        }
      },
      refetch: jest.fn()
    }
  })

  jest.spyOn(cdNgOpenApiServices, 'useListModuleVersions').mockReturnValue({
    data: [
      {
        name: 'testName',
        display_name: 'testDisplayName',
        version: '7800',
        updated: 'testUpdate',
        release_notes_link: 'link'
      }
    ],
    refetch: jest.fn(),
    loading: false,
    error: null
  } as any)
})

const TestComponent = (): React.ReactElement => {
  const { showModal, hideModal } = useReleaseNotesModal()
  return (
    <>
      <button className="open" onClick={showModal} />
      <button className="close" onClick={hideModal} />
    </>
  )
}

describe('open and close release notes  Modal', () => {
  describe('Rendering', () => {
    test('should open and close the release notes modal', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)

      const dialog = findDialogContainer() as HTMLElement
      expect(dialog).toMatchSnapshot()

      await waitFor(() => {
        expect(getByText('common.resourceCenter.bottomlayout.releaseNote')).toBeInTheDocument()
        expect(getByText('common.resourceCenter.productUpdates.releaseText')).toBeInTheDocument()
      })
    })
  })
})
