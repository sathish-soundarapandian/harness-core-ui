import React from 'react'
import { render, act, fireEvent, waitFor, RenderResult } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import {
  getCategoryNamesList,
  SettingType,
  getCategoryHandler,
  getTypeHandler,
  getYupValidationForSetting,
  responseData,
  getCategorySettingsList,
  getCategorySettingsDisplayOrderList,
  getSettingNames,
  getGroupNames,
  getGroupHandler,
  getGroupSettingsDisplayOrderList,
  errorResponse
} from './DefaultFactoryMock'
import SettingsList from '../SettingsList'

jest.mock('@default-settings/factories/DefaultSettingsFactory', () => ({
  getCategoryNamesList: jest.fn().mockImplementation(() => getCategoryNamesList()),
  getCategoryHandler: jest.fn().mockImplementation(category => getCategoryHandler(category)),
  getSettingHandler: jest.fn().mockImplementation(setting => getTypeHandler(setting)),
  getYupValidationForSetting: jest.fn().mockImplementation(() => getYupValidationForSetting()),
  getCategorySettingsList: jest.fn().mockImplementation(() => getCategorySettingsList()),
  getCategorySettingsDisplayOrderList: jest.fn().mockImplementation(() => getCategorySettingsDisplayOrderList()),

  getSettingNames: jest.fn().mockImplementation(() => {
    return getSettingNames()
  }),
  getGroupNames: jest.fn().mockImplementation(() => getGroupNames()),
  getGroupHandler: jest.fn().mockImplementation(groupname => getGroupHandler(groupname)),
  getGroupSettingsDisplayOrderList: jest
    .fn()
    .mockImplementation(groupname => getGroupSettingsDisplayOrderList(groupname))
}))
let valueChanged = 5
let loading = false
let error: any = null
let showedError = false
const saveSettings = jest.fn(data => {
  valueChanged = data[0].value
  let response = {}
  if (data[0].value === 'error') {
    response = errorResponse
  }
  if (data[0].value === 'loading') {
    loading = true
  }
  if (data[0].value === 'reject') {
    error = { status: 'ERROR', message: 'There was error' }
  }

  return Promise.resolve(response)
})
jest.mock('@wings-software/uicore', () => ({
  ...jest.requireActual('@wings-software/uicore'),
  useToaster: jest.fn(() => ({
    showSuccess: jest.fn(),
    showError: jest.fn().mockImplementation(() => {
      showedError = true
    })
  }))
}))
let fetchsetting = () => {
  return Promise.resolve(responseData)
}
jest.mock('services/cd-ng', () => ({
  getSettingsListPromise: jest.fn().mockImplementation(() => {
    return fetchsetting()
  }),
  useUpdateSettingValue: jest.fn().mockImplementation(() => {
    return { data: {}, mutate: saveSettings, error: error, loading: loading }
  })
}))
jest.mock('@default-settings/interfaces/SettingType.types', () => ({
  SettingType: SettingType
}))
describe('Default Settings Page', () => {
  let renderObj: RenderResult
  beforeEach(() => {
    renderObj = render(
      <TestWrapper path={routes.toDefaultSettings({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <SettingsList />
      </TestWrapper>
    )
  })
  test('render data and save the changed data', async () => {
    const { container, getByText, getAllByText } = renderObj
    expect(container).toMatchSnapshot()
    const cd = getByText('common.purpose.ci.continuous')

    await act(async () => {
      fireEvent.click(cd)
    })

    await waitFor(() => {
      expect(getAllByText('mockbox')).toBeTruthy()
    })
    expect(container).toMatchSnapshot()
    const restoreBtn = getAllByText('defaultSettings.restoreToDefault')
    const inputEl = container.querySelector(`input[name="test_setting_CI_6"]`)
    expect(inputEl?.getAttribute('value')).toEqual('something')
    act(() => {
      fireEvent.click(restoreBtn[0])
    })
    expect(inputEl?.getAttribute('value')).toEqual('default')
    const restoreBtnUpdated = getAllByText('defaultSettings.restoreToDefault')
    expect(restoreBtnUpdated.length).toEqual(restoreBtn.length - 1)
    const saveBtn = getByText('save')
    act(() => {
      fireEvent.click(saveBtn)
    })
    expect(container).toMatchSnapshot()
    await waitFor(() => expect(valueChanged).toEqual('default'))
    setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'test_setting_CI_2', value: '9' })
    act(() => {
      fireEvent.click(saveBtn)
    })
    expect(container).toMatchSnapshot()
    await waitFor(() => expect(valueChanged).toEqual('9'))
    const overrides = getAllByText('defaultSettings.allowOverrides')
    act(() => {
      fireEvent.click(overrides[0])
    })
    expect(container).toMatchSnapshot()
  })
  test('test error case on  data save', async () => {
    const { container, getByText, getAllByText } = renderObj
    const cd = getByText('common.purpose.ci.continuous')

    await act(async () => {
      fireEvent.click(cd)
    })

    await waitFor(() => {
      expect(getAllByText('mockbox')).toBeTruthy()
    })
    const inputEl = container.querySelector(`input[name="test_setting_CI_6"]`)
    expect(inputEl?.getAttribute('value')).toEqual('something')
    setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'test_setting_CI_6', value: 'error' })
    const saveBtn = getByText('save')
    await act(async () => {
      fireEvent.click(saveBtn)
    })
    await waitFor(() => {
      expect(getByText('Only numbers are allowed. Received input [fd]')).toBeTruthy()
    })
    expect(getByText('Only numbers are allowed. Received input [fd]')).toBeTruthy()
  })
  test('test loading case on  data save', async () => {
    const { container, getByText, getAllByText } = renderObj
    const cd = getByText('common.purpose.ci.continuous')

    await act(async () => {
      fireEvent.click(cd)
    })

    await waitFor(() => {
      expect(getAllByText('mockbox')).toBeTruthy()
    })
    const inputEl = container.querySelector(`input[name="test_setting_CI_6"]`)
    expect(inputEl?.getAttribute('value')).toEqual('something')
    setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'test_setting_CI_6', value: 'loading' })
    const saveBtn = getByText('save')
    await act(async () => {
      fireEvent.click(saveBtn)
    })
    await waitFor(() => {
      expect(container.querySelector('[data-icon="steps-spinner"]')).toBeTruthy()
    })
    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeTruthy()
  })
  test('test error of api', async () => {
    const { container, getByText, getAllByText } = renderObj
    const cd = getByText('common.purpose.ci.continuous')

    await act(async () => {
      fireEvent.click(cd)
    })

    await waitFor(() => {
      expect(getAllByText('mockbox')).toBeTruthy()
    })
    const inputEl = container.querySelector(`input[name="test_setting_CI_6"]`)
    expect(inputEl?.getAttribute('value')).toEqual('something')
    setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'test_setting_CI_6', value: 'reject' })
    const saveBtn = getByText('save')

    expect(showedError).toBeFalsy()
    await act(async () => {
      fireEvent.click(saveBtn)
    })
    await waitFor(() => {
      expect(showedError).toBeTruthy()
    })
    expect(showedError).toBeTruthy()
  })

  test('error loading page', async () => {
    fetchsetting = () => {
      return Promise.reject(responseData)
    }
    showedError = false
    const { getByText } = renderObj
    const cd = getByText('common.purpose.ci.continuous')
    expect(showedError).toEqual(false)
    await act(async () => {
      fireEvent.click(cd)
    })

    await waitFor(() => {
      expect(showedError).toBeTruthy()
    })
    showedError = false
  })
})
