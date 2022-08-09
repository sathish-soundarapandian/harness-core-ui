import React from 'react'
import { noop } from 'lodash-es'
import { render } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import {
  DefaultSettingNumberTextbox,
  DefaultSettingCheckBoxWithTrueAndFalse,
  DefaultSettingStringDropDown,
  DefaultSettingTextbox,
  DefaultSettingRadioBtnWithTrueAndFalse
} from '@default-settings/components/ReusableHandlers'
import type { SettingRendererProps } from '@default-settings/factories/DefaultSettingsFactory'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import type { StringsMap } from 'framework/strings/StringsContext'
import type { SettingDTO } from 'services/cd-ng'
import type { SettingCategory } from '@default-settings/interfaces/SettingType.types'
jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))
describe('Reusable Components', () => {
  const settingValue: SettingDTO = {
    value: 'abcd',
    allowOverrides: true,
    category: 'CD' as SettingCategory,
    groupIdentifier: '',
    identifier: 'abcd',
    isSettingEditable: true,
    name: 'abcd',
    valueType: 'String',
    allowedValues: ['abcd', 'bcd']
  }
  const props: SettingRendererProps = {
    setFieldValue: jest.fn(),
    categoryAllSettings: new Map(),
    identifier: 'abcd',
    onRestore: jest.fn(),
    onSettingSelectionChange: jest.fn(),
    settingValue: settingValue
  }

  test('text box', () => {
    const renderObj = render(
      <Formik initialValues={{ textbx: 'abcd' }} onSubmit={noop} formName="testing">
        <DefaultSettingTextbox {...props} identifier="textbx" />
      </Formik>
    )

    const { container } = renderObj
    setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'textbx', value: 'user name' })

    expect(container).toMatchSnapshot()
  })
  test('DefaultSettingCheckBoxWithTrueAndFalse', () => {
    const renderObj = render(<DefaultSettingCheckBoxWithTrueAndFalse {...props} identifier="check" />)

    const { container } = renderObj
    setFieldValue({ container, type: InputTypes.CHECKBOX, fieldId: 'check', value: 'false' })
    expect(container).toMatchSnapshot()
  })
  test('DefaultSettingCheckBoxWithTrueAndFalse with different labels', () => {
    const renderObj = render(
      <DefaultSettingCheckBoxWithTrueAndFalse
        {...props}
        identifier="check"
        falseLabel={'new false' as keyof StringsMap}
        trueLabel={'new true' as keyof StringsMap}
      />
    )

    const { container } = renderObj
    setFieldValue({ container, type: InputTypes.CHECKBOX, fieldId: 'check', value: 'false' })
    expect(container).toMatchSnapshot()
  })
  test('DefaultSettingStringDropDown', () => {
    const renderObj = render(<DefaultSettingStringDropDown {...props} identifier="drpdown" />)

    const { container } = renderObj
    setFieldValue({ container, type: InputTypes.SELECT, fieldId: 'drpdown', value: 'bcd' })
    expect(container).toMatchSnapshot()
  })
  test('no DefaultSettingStringDropDown', () => {
    const renderObj = render(
      <DefaultSettingStringDropDown
        {...props}
        settingValue={{ ...(settingValue as SettingDTO), allowedValues: undefined }}
        identifier="drpdown"
      />
    )

    const { container } = renderObj
    expect(container).toMatchSnapshot()
  })
  test('DefaultSettingTextbox', () => {
    const renderObj = render(<DefaultSettingNumberTextbox {...props} identifier="nbr" />)

    const { container } = renderObj
    setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'nbr', value: '3' })
    expect(container).toMatchSnapshot()
  })
  test('DefaultSettingRadioBtnWithTrueAndFalse', () => {
    const renderObj = render(
      <DefaultSettingRadioBtnWithTrueAndFalse
        {...props}
        identifier="nbr"
        falseLabel={'common.false'}
        trueLabel={'common.true'}
      />
    )

    const { container } = renderObj
    setFieldValue({ container, type: InputTypes.RADIOS, fieldId: 'nbr', value: 'false' })
    expect(container).toMatchSnapshot()
  })
})
