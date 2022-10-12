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
import { useCDTrialModal, getCDTrialDialog } from '../useCDTrialModal'

jest.mock('services/pipeline-ng', () => ({
  useGetPipelineList: jest.fn().mockImplementation(() => {
    return {
      cancel: jest.fn(),
      loading: false,
      mutate: jest.fn().mockImplementationOnce(() => {
        return {
          data: {
            content: [
              {
                identifier: 'item 1'
              },
              {
                identifier: 'item 2'
              }
            ]
          }
        }
      })
    }
  })
}))

const onCloseModal = jest.fn()
function TestComponent({ trialType = TrialType.SET_UP_PIPELINE }: { trialType?: TrialType }): React.ReactElement {
  const { openTrialModal } = useCDTrialModal({
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

describe('CDTrial Modal', () => {
  describe('Rendering', () => {
    test('should open CDTrial', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('cd.cdTrialHomePage.startTrial.description')).toBeDefined())
      const dialog = findDialogContainer() as HTMLElement
      expect(dialog).toMatchSnapshot()
    })
  })

  describe('validation', () => {
    test('should validate inputs', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      fireEvent.click(getByText('start'))
      await waitFor(() => expect(getByText('createPipeline.pipelineNameRequired')).toBeDefined())
    })
  })

  describe('trial type', () => {
    test('create or select project modal', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <TestComponent trialType={TrialType.CREATE_OR_SELECT_PROJECT} />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('cd.continuous')).toBeDefined())
      const dialog = findDialogContainer() as HTMLElement
      expect(dialog).toMatchSnapshot()
    })

    test('create or select pipeline modal', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <TestComponent trialType={TrialType.CREATE_OR_SELECT_PIPELINE} />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('pipeline.selectOrCreateForm.description')).toBeDefined())
      const dialog = findDialogContainer() as HTMLElement
      expect(dialog).toMatchSnapshot()
    })

    test('function getCDTrialDialog', () => {
      const { getByText } = render(
        <TestWrapper>
          {getCDTrialDialog({
            actionProps: {
              onSuccess: jest.fn(),
              onCreateProject: jest.fn()
            },
            trialType: TrialType.CREATE_OR_SELECT_PIPELINE,
            onCloseModal
          })}
        </TestWrapper>
      )
      expect(() => getByText('pipeline.selectOrCreateForm.description')).toBeDefined()
      const dialog = findDialogContainer() as HTMLElement
      expect(dialog).toMatchSnapshot()
    })
  })
})
