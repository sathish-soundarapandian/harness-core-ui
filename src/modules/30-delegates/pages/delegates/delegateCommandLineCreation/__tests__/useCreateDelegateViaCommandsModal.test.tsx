/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import useCreateDelegateViaCommandsModal from '../components/useCreateDelegateViaCommandsModal'
jest.mock('@delegates/constants', () => {
  return { ...jest.requireActual('@delegates/constants'), DELEGATE_COMMAND_LINE_TIME_OUT: 3 }
})
jest.mock('services/cd-ng', () => ({
  useGenerateTerraformModule: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn(),
      data: 'test',
      loading: false,
      error: null,
      refetch: jest.fn().mockImplementation(() => {
        return 'test'
      })
    }
  })
}))
jest.mock('services/portal', () => ({
  useGenerateKubernetesYaml: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn().mockImplementation(() => {
        return 'test'
      }),
      data: 'test',
      loading: false,
      error: null,
      refetch: jest.fn().mockImplementation(() => {
        return 'test'
      })
    }
  }),
  useGetInstallationCommand: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn(),
      data: { resource: { command: 'test' } },
      loading: false,
      error: null,
      refetch: jest.fn().mockImplementation(() => {
        return {
          data: { resource: { command: 'test' } },
          loading: false,
          error: null
        }
      })
    }
  }),
  useGetDelegatesHeartbeatDetailsV2: jest.fn().mockImplementation(() => {
    return { data: { resource: { numberOfConnectedDelegates: 1 } }, refetch: jest.fn(), error: null, loading: false }
  })
}))
let delegateClosed = false
const Wrapped = ({ noInputs = false }): React.ReactElement => {
  const inputs = !noInputs
    ? {
        onClose: noInputs
          ? undefined
          : () => {
              delegateClosed = true
            }
      }
    : undefined
  const { openDelegateModalWithCommands } = useCreateDelegateViaCommandsModal(inputs)
  const onBtnClick = () => {
    openDelegateModalWithCommands()
  }

  return (
    <>
      <button className="createdelegate" onClick={onBtnClick} />
    </>
  )
}

describe('useDelegateCreateViacommands Test', () => {
  test('should work as expected', async () => {
    const { container } = render(
      <TestWrapper>
        <Wrapped />
      </TestWrapper>
    )

    const createDelegate = container.querySelector('.createdelegate')
    await act(async () => {
      fireEvent.click(createDelegate!)
    })

    //Confirm the dialog is open and matches snapshot
    await waitFor(() => expect(document.body.querySelector(`.bp3-drawer`)).not.toBeNull())
    const drawerArr = document.getElementsByClassName('bp3-drawer')
    expect(drawerArr).toHaveLength(1)
    expect(drawerArr).toMatchSnapshot()
    const crossIcon = document.querySelector('[class*="bp3-icon-cross"]')
    expect(crossIcon).toBeTruthy()
    await act(async () => {
      fireEvent.click(crossIcon!)
    })

    await waitFor(() => expect(delegateClosed).toBeTruthy())
    await waitFor(() => expect(document.body.querySelector(`.bp3-drawer`)).toBeNull())
  })
  test('when on colse is undefined', async () => {
    delegateClosed = false
    const { container } = render(
      <TestWrapper>
        <Wrapped noInputs={true} />
      </TestWrapper>
    )

    const createDelegate = container.querySelector('.createdelegate')
    await act(async () => {
      fireEvent.click(createDelegate!)
    })

    //Confirm the dialog is open and matches snapshot
    await waitFor(() => expect(document.body.querySelector(`.bp3-drawer`)).not.toBeNull())
    const drawerArr = document.getElementsByClassName('bp3-drawer')
    expect(drawerArr).toHaveLength(1)
    expect(drawerArr).toMatchSnapshot()
    const crossIcon = document.querySelector('[class*="bp3-icon-cross"]')
    expect(crossIcon).toBeTruthy()
    await act(async () => {
      fireEvent.click(crossIcon!)
    })

    await waitFor(() => expect(delegateClosed).toBeFalsy())
  })
})
