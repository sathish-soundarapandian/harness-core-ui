import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { useLogSettings } from '../useLogsSettings'

function Wrapped(): React.ReactElement {
  const { openDialog } = useLogSettings()
  return (
    <>
      <button className="check" onClick={() => openDialog()} />
    </>
  )
}
const setPreferenceStore = jest.fn()
jest.mock('framework/PreferenceStore/PreferenceStoreContext')
;(usePreferenceStore as jest.Mock).mockImplementation(() => {
  return {
    setPreference: setPreferenceStore,
    preference: {},
    clearPreference: jest.fn
  }
})

describe('useLogsSettings Modal tests', () => {
  test('Basic Modal render on calling openDialog function', async () => {
    const { container, getAllByText } = render(
      <TestWrapper>
        <Wrapped />
      </TestWrapper>
    )

    const mockedButton = container.querySelector('.check')
    fireEvent.click(mockedButton!)
    await waitFor(() => expect(getAllByText('pipeline.logLevelSettings')).toBeDefined())
    const logsSettingsHeader = container.querySelector('pipeline.logSettingsHeader')
    expect(logsSettingsHeader).toBeDefined()
  })
  test('Default check of the show log level and show date time to be checked', () => {
    const { container, getAllByText, getByTestId } = render(
      <TestWrapper>
        <Wrapped />
      </TestWrapper>
    )

    const mockedButton = container.querySelector('.check')
    fireEvent.click(mockedButton!)
    expect(getAllByText('pipeline.logLevelSettings')).toBeDefined()
    const logLevelCheckbox = getByTestId('log-level')
    expect(logLevelCheckbox).toBeChecked()
    const logDateTimeCheckbox = getByTestId('log-date-time')
    expect(logDateTimeCheckbox).toBeChecked()
  })
  test('Check update preference store to be called on click of submit', async () => {
    const { container, getAllByText, getByTestId, getByText } = render(
      <TestWrapper>
        <Wrapped />
      </TestWrapper>
    )

    const mockedButton = container.querySelector('.check')
    fireEvent.click(mockedButton!)
    expect(getAllByText('pipeline.logLevelSettings')).toBeDefined()
    const logLevelCheckbox = getByTestId('log-level')
    fireEvent.click(logLevelCheckbox!)
    await waitFor(() => {
      expect(logLevelCheckbox).toBeChecked()
    })
    const logDateTimeCheckbox = getByTestId('log-date-time')
    fireEvent.click(logDateTimeCheckbox!)
    await waitFor(() => {
      expect(logDateTimeCheckbox).toBeChecked()
    })
    const submitBtn = getByText('enable')
    fireEvent.click(submitBtn)
    expect(setPreferenceStore).toBeCalled()
  })
  test('Open checkbox with correct state from preference store', async () => {
    const preferenceUpdate = jest.fn()
    jest.mock('framework/PreferenceStore/PreferenceStoreContext')
    ;(usePreferenceStore as jest.Mock).mockImplementation(() => {
      return {
        setPreference: preferenceUpdate,
        preference: JSON.stringify({
          '/logsInfoViewSettings': 'false',
          '/logsDateTimeViewSettings': 'true'
        }),
        clearPreference: jest.fn
      }
    })
    const { container, getAllByText, getByTestId, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'dummy' }}>
        <Wrapped />
      </TestWrapper>
    )

    const mockedButton = container.querySelector('.check')
    fireEvent.click(mockedButton!)
    expect(getAllByText('pipeline.logLevelSettings')).toBeDefined()
    const logLevelCheckbox = getByTestId('log-level')
    expect(logLevelCheckbox).not.toBeChecked()
    const logDateTimeCheckbox = getByTestId('log-date-time')
    expect(logDateTimeCheckbox).not.toBeChecked()
    const cancelBtn = getByText('cancel')
    fireEvent.click(cancelBtn!)
    expect(preferenceUpdate).not.toBeCalled()
  })
})
