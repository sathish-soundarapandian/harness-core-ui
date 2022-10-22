/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { TrialType } from '@pipeline/components/TrialModalTemplate/trialModalUtils'
import { useCITrialModal } from '../useCITrialModal'

jest.mock('services/pipeline-ng', () => ({
  useGetPipelineList: jest.fn().mockImplementation(() => {
    return {
      cancel: jest.fn(),
      loading: false,
      mutate: jest.fn().mockImplementationOnce(() => {
        return {
          data: {}
        }
      })
    }
  })
}))

const onCloseModal = jest.fn()
function TestComponent({ trialType = TrialType.SET_UP_PIPELINE }: { trialType?: TrialType }): React.ReactElement {
  const { openTrialModal } = useCITrialModal({
    actionProps: {
      onSuccess: jest.fn(),
      onCreateProject: jest.fn()
    },
    trialType,
    onCloseModal
  })
  return (
    <>
      <button className="open" onClick={openTrialModal} />
    </>
  )
}

describe('open and close CITrial Modal', () => {
  describe('Rendering', () => {
    test('should open and default as Create Pipeline Form', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('pipeline.createPipeline.setupHeader')).toBeDefined())
      const dialog = findDialogContainer() as HTMLElement
      expect(dialog).toMatchSnapshot()
    })
  })

  test('should render Select Pipeline Form when TrialType is CREATE_OR_SELECT_PIPELINE', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <TestComponent trialType={TrialType.CREATE_OR_SELECT_PIPELINE} />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('.open')!)
    await waitFor(() => expect(() => getByText('pipeline.selectOrCreatePipeline.selectAPipeline')).toBeDefined())
    fireEvent.click(getByText('pipeline.createANewPipeline')!)
    await waitFor(() => expect(() => getByText('pipeline.createPipeline.setupHeader')).toBeDefined())
    const dialog = findDialogContainer() as HTMLElement
    expect(dialog).toMatchSnapshot()
  })

  test('create or select project modal', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <TestComponent trialType={TrialType.CREATE_OR_SELECT_PROJECT} />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('.open')!)
    await waitFor(() => expect(() => getByText('ci.continuous')).toBeDefined())
    const dialog = findDialogContainer() as HTMLElement
    expect(dialog).toMatchSnapshot()
  })
})
