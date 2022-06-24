/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep } from 'lodash-es'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'
import * as cfServiceMock from 'services/cf'

import mockFeature from '@cf/utils/testData/data/mockFeature'
import mockPermission from '@cf/utils/testData/data/mockPermission'
import mockGitSync from '@cf/utils/testData/data/mockGitSync'
import { EditVariationsModal, EditVariationsModalProps } from '../EditVariationsModal'

jest.mock('services/cf')

jest.mock('@cf/hooks/useEnvironmentSelectV2', () => ({
  useEnvironmentSelectV2: jest.fn().mockReturnValue({ data: [], loading: false })
}))

const renderComponent = async (props: Partial<EditVariationsModalProps> = {}): Promise<void> => {
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <EditVariationsModal
        accountIdentifier="dummy"
        orgIdentifier="dummy"
        projectIdentifier="dummy"
        gitSync={mockGitSync}
        feature={mockFeature}
        permission={mockPermission}
        onSuccess={jest.fn()}
        setGovernanceMetadata={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )

  userEvent.click(screen.getByTestId('open-edit-variations-modal'))

  await waitFor(() => expect(screen.getByTestId('edit-variation-modal')).toBeInTheDocument())
}

describe('EditVariationsModal', () => {
  const usePatchFeatureMock = jest.spyOn(cfServiceMock, 'usePatchFeature')

  beforeEach(() => {
    usePatchFeatureMock.mockReturnValue({ loading: false, mutate: jest.fn() } as any)
  })

  test('it should render correctly', async () => {
    await renderComponent()

    expect(screen.getByTestId('edit-variation-modal')).toMatchSnapshot()
  })

  test('it should call onSubmit correctly when variation changed', async () => {
    const patchMock = jest.fn()
    usePatchFeatureMock.mockReturnValue({ loading: false, mutate: patchMock } as any)

    await renderComponent()

    const variation1 = document.getElementsByName('variations.0.name')[0]
    userEvent.clear(variation1)
    await userEvent.type(variation1, 'new variation', { allAtOnce: true })

    await userEvent.type(screen.getByPlaceholderText('common.git.commitMessage'), 'test commit message', {
      allAtOnce: true
    })
    userEvent.click(screen.getByText('save'))

    await waitFor(() =>
      expect(patchMock).toBeCalledWith({
        gitDetails: {
          branch: 'main',
          commitMsg: 'test commit message',
          filePath: '/flags.yaml',
          repoIdentifier: 'harnesstest',
          rootFolder: '/.harness/'
        },
        instructions: [
          { kind: 'updateVariation', parameters: { identifier: 'true', name: 'new variation', value: 'true' } }
        ]
      })
    )
  })

  test('it should hide delete variation buttons for boolean flags', async () => {
    const boolFeature = cloneDeep(mockFeature)
    boolFeature.kind = 'boolean'

    await renderComponent({ feature: boolFeature })

    expect(screen.queryAllByRole('button', { name: 'cf.editVariation.remove' })).toHaveLength(0)
  })

  test('it should show delete variation buttons for multivariate flags', async () => {
    const multiFeature = cloneDeep(mockFeature)
    multiFeature.kind = 'string'

    await renderComponent({ feature: multiFeature })

    expect(screen.getAllByRole('button', { name: 'cf.editVariation.remove' })).toHaveLength(
      mockFeature.variations.length
    )
  })

  test('it should remove the variation when the delete variation button is clicked', async () => {
    const multiFeature = cloneDeep(mockFeature)
    multiFeature.kind = 'string'

    await renderComponent({ feature: multiFeature })

    expect(screen.getAllByRole('button', { name: 'cf.editVariation.remove' })).toHaveLength(
      mockFeature.variations.length
    )

    userEvent.click(screen.getAllByRole('button', { name: 'cf.editVariation.remove' })[0])

    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'cf.editVariation.remove' })).toHaveLength(
        mockFeature.variations.length - 1
      )
    )
  })

  test('it should add a new variation when the add variation button is clicked', async () => {
    const multiFeature = cloneDeep(mockFeature)
    multiFeature.kind = 'string'

    await renderComponent({ feature: multiFeature })

    expect(screen.getAllByRole('button', { name: 'cf.editVariation.remove' })).toHaveLength(
      mockFeature.variations.length
    )

    userEvent.click(screen.getByRole('button', { name: 'small-plus cf.shared.variation' }))

    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'cf.editVariation.remove' })).toHaveLength(
        mockFeature.variations.length + 1
      )
    )
  })

  test('it should show the add variation button for multivariate flags', async () => {
    const multiFeature = cloneDeep(mockFeature)
    multiFeature.kind = 'string'

    await renderComponent({ feature: multiFeature })

    expect(screen.getByRole('button', { name: 'small-plus cf.shared.variation' })).toBeInTheDocument()
  })

  test('it should hide the add variation button for boolean flags', async () => {
    const boolFeature = cloneDeep(mockFeature)
    boolFeature.kind = 'boolean'

    await renderComponent({ feature: boolFeature })

    expect(screen.queryByRole('button', { name: 'small-plus cf.shared.variation' })).not.toBeInTheDocument()
  })
})
