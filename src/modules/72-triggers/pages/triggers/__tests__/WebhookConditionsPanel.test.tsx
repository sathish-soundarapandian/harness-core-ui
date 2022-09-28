/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, queryByText, fireEvent } from '@testing-library/react'
import { Formik, FormikForm, Button } from '@wings-software/uicore'
import { renderHook } from '@testing-library/react-hooks'
import { useStrings } from 'framework/strings'
import { setFieldValue, InputTypes } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { getTriggerConfigDefaultProps, getTriggerConfigInitialValues } from './webhookMockConstants'
import WebhookConditionsPanel from '../views/WebhookConditionsPanel'
const defaultTriggerConfigDefaultProps = getTriggerConfigDefaultProps({})

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })

function WrapperComponent(props: { initialValues: any }): JSX.Element {
  const { initialValues } = props
  return (
    <TestWrapper>
      <Formik
        formName="webhookConditionTestForm"
        enableReinitialize={true}
        initialValues={initialValues}
        // validationSchema={getValidationSchema(
        //   TriggerTypes.WEBHOOK as unknown as NGTriggerSourceV2['type'],
        //   result.current.getString
        // )}
        onSubmit={jest.fn()}
      >
        {formikProps => {
          return (
            <FormikForm>
              <WebhookConditionsPanel {...defaultTriggerConfigDefaultProps} formikProps={formikProps} />
              <Button text="Submit" className="submitButton" type="submit" />
            </FormikForm>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

// eslint-disable-next-line jest/no-disabled-tests
describe('WebhookConditionsPanel Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Github Trigger Conditions Panel', async () => {
      const { container } = render(<WrapperComponent initialValues={getTriggerConfigInitialValues({})} />)
      await waitFor(() => queryByText(container, result.current.getString('conditions')))
      expect(container).toMatchSnapshot()
    })

    test('Initial Render - Custom Trigger Conditions Panel', async () => {
      const { container } = render(
        <WrapperComponent initialValues={getTriggerConfigInitialValues({ sourceRepo: 'CUSTOM' })} />
      )
      await waitFor(() => queryByText(container, result.current.getString('conditions')))
      expect(container).toMatchSnapshot()
    })
  })
  describe('Interactivity: Non-Custom Source Repo/Payload Type', () => {
    test('Add Payload Conditions row', async () => {
      const { container } = render(<WrapperComponent initialValues={getTriggerConfigInitialValues({})} />)

      await waitFor(() => queryByText(container, result.current.getString('conditions')))

      const addButton = document.body.querySelector('[data-name="payloadConditions"] [data-name="plusAdd"]')
      if (!addButton) {
        throw Error('no add button')
      }
      fireEvent.click(addButton)
      expect(result.current.getString('triggers.conditionsPanel.attribute')).not.toBeNull()
    })

    test('Delete Payload Conditions row (1st of 3 rows)', async () => {
      const { container } = render(<WrapperComponent initialValues={getTriggerConfigInitialValues({})} />)

      await waitFor(() => queryByText(container, result.current.getString('conditions')))

      const addButton = document.body.querySelector('[data-name="payloadConditions"] [data-name="plusAdd"]')
      if (!addButton) {
        throw Error('no add button')
      }
      fireEvent.click(addButton)
      expect(result.current.getString('triggers.conditionsPanel.attribute')).not.toBeNull()
      await waitFor(() => expect(container.querySelectorAll('[class*="rowContainer"]').length).toEqual(1))

      const addButton2 = document.body.querySelector('[data-name="payloadConditions"] [data-name="plusAdd"]')
      if (!addButton2) {
        throw Error('no add button')
      }
      fireEvent.click(addButton2)
      await waitFor(() => expect(container.querySelectorAll('[class*="rowContainer"]').length).toEqual(2))

      const addButton3 = document.body.querySelector('[data-name="payloadConditions"] [data-name="plusAdd"]')
      if (!addButton3) {
        throw Error('no add button')
      }
      fireEvent.click(addButton3)
      await waitFor(() => expect(container.querySelectorAll('[class*="rowContainer"]').length).toEqual(3))
      const firstAttributeInput = document.body.querySelector('[name="payloadConditions.0.key"]')
      const thirdAttributeInput = document.body.querySelector('[name="payloadConditions.2.key"]')
      if (!firstAttributeInput || !thirdAttributeInput) {
        throw Error('missing attribute input')
      }

      fireEvent.change(firstAttributeInput, { target: { value: 'attribute1' } })
      fireEvent.change(thirdAttributeInput, { target: { value: 'attribute3' } })
      expect('attribute1').not.toBeNull()
      expect('attribute2').not.toBeNull()
      expect('attribute3').not.toBeNull()

      const firstDeleteButton = document.body.querySelectorAll('[data-name="main-delete"]')[0]
      if (!firstDeleteButton) {
        throw Error('no delete button')
      }
      fireEvent.click(firstDeleteButton)

      await waitFor(() => expect(container.querySelectorAll('[class*="rowContainer"]').length).toEqual(2))
      expect('attribute2').not.toBeNull()
      expect('attribute3').not.toBeNull()
    })

    test('Delete Payload Conditions row (2nd of 3 rows)', async () => {
      const { container } = render(<WrapperComponent initialValues={getTriggerConfigInitialValues({})} />)

      await waitFor(() => queryByText(container, result.current.getString('conditions')))

      const addButton = document.body.querySelector('[data-name="payloadConditions"] [data-name="plusAdd"]')
      if (!addButton) {
        throw Error('no add button')
      }
      fireEvent.click(addButton)
      expect(result.current.getString('triggers.conditionsPanel.attribute')).not.toBeNull()
      await waitFor(() => expect(container.querySelectorAll('[class*="rowContainer"]').length).toEqual(1))

      const addButton2 = document.body.querySelector('[data-name="payloadConditions"] [data-name="plusAdd"]')
      if (!addButton2) {
        throw Error('no add button')
      }
      fireEvent.click(addButton2)
      await waitFor(() => expect(container.querySelectorAll('[class*="rowContainer"]').length).toEqual(2))

      const addButton3 = document.body.querySelector('[data-name="payloadConditions"] [data-name="plusAdd"]')
      if (!addButton3) {
        throw Error('no add button')
      }
      fireEvent.click(addButton3)
      await waitFor(() => expect(container.querySelectorAll('[class*="rowContainer"]').length).toEqual(3))
      const firstAttributeInput = document.body.querySelector('[name="payloadConditions.0.key"]')
      const thirdAttributeInput = document.body.querySelector('[name="payloadConditions.2.key"]')
      if (!firstAttributeInput || !thirdAttributeInput) {
        throw Error('missing attribute input')
      }

      fireEvent.change(firstAttributeInput, { target: { value: 'attribute1' } })
      fireEvent.change(thirdAttributeInput, { target: { value: 'attribute3' } })
      expect('attribute1').not.toBeNull()
      expect('attribute2').not.toBeNull()
      expect('attribute3').not.toBeNull()

      const middleDeleteButton = document.body.querySelectorAll('[data-name="main-delete"]')[1]
      if (!middleDeleteButton) {
        throw Error('no delete button')
      }
      fireEvent.click(middleDeleteButton)

      await waitFor(() => expect(container.querySelectorAll('[class*="rowContainer"]').length).toEqual(2))
      expect('attribute1').not.toBeNull()
      expect('attribute3').not.toBeNull()
    })

    // 3rd of 3 in Header Conditions for custom source repo. Logic is same for both

    // Skip following tests because of some issue with validationSchema
    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('Source Branch Conditions Row validation with all values or none filled', async () => {
      const { container, getByText } = render(<WrapperComponent initialValues={getTriggerConfigInitialValues({})} />)

      const sourceBranchValue = container.querySelector('[name="sourceBranchValue"]')
      if (!sourceBranchValue) {
        throw Error('No source branch value')
      }

      const targetBranchOperator = container.querySelector('[name="targetBranchOperator"]')
      if (!targetBranchOperator) {
        throw Error('No target branch operator')
      }

      setFieldValue({ container, type: InputTypes.SELECT, fieldId: 'sourceBranchOperator', value: 'Equals' })
      setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'sourceBranchValue', value: '' })

      const submit = document.querySelector('[class*="submitButton"]')
      if (!submit) {
        throw Error('no submit')
      }
      fireEvent.click(submit)
      expect(container).toMatchSnapshot('temp')

      await waitFor(() =>
        expect(getByText(result.current.getString('triggers.validation.matchesValue'))).not.toBeNull()
      )
      setFieldValue({ container, type: InputTypes.TEXTFIELD, fieldId: 'sourceBranchValue', value: 'val' })

      fireEvent.click(submit)
      await waitFor(() => expect(container.querySelector('[class*="bp3-form-helper-text"]')).toBeNull())
    })

    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('Payload Conditions Row validation with all values or none filled', async () => {
      const { container, getByText } = render(<WrapperComponent initialValues={getTriggerConfigInitialValues({})} />)
      const addButton2 = document.body.querySelector('[data-name="payloadConditions"] [data-name="plusAdd"]')

      if (!addButton2) {
        throw Error('no add button')
      }
      fireEvent.click(addButton2)
      await waitFor(() => expect(container.querySelectorAll('[class*="rowContainer"]').length).toEqual(1))

      const sourceBranchValue = container.querySelector('[name="sourceBranchValue"]')
      if (!sourceBranchValue) {
        throw Error('No source branch value')
      }

      const targetBranchOperator = container.querySelector('[name="targetBranchOperator"]')
      if (!targetBranchOperator) {
        throw Error('No target branch operator')
      }

      setFieldValue({ container, type: InputTypes.SELECT, fieldId: 'payloadConditions.0.operator', value: 'Equals' })

      const submit = document.querySelector('[class*="submitButton"]')
      if (!submit) {
        throw Error('no submit')
      }
      fireEvent.click(submit)
      await waitFor(() =>
        expect(getByText(result.current.getString('triggers.validation.payloadConditions'))).not.toBeNull()
      )
    })
  })
  describe('Interactivity: Custom Source Repo/Payload Type', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    test('Add Header Conditions row', async () => {
      const { container } = render(
        <WrapperComponent initialValues={getTriggerConfigInitialValues({ sourceRepo: 'Custom' })} />
      )

      await waitFor(() => queryByText(container, result.current.getString('conditions')))

      const addButton = document.body.querySelector('[data-name="headerConditions"] [data-name="plusAdd"]')
      if (!addButton) {
        throw Error('no add button')
      }
      fireEvent.click(addButton)
      expect(result.current.getString('triggers.conditionsPanel.attribute')).not.toBeNull()
    })

    // eslint-disable-next-line jest/no-disabled-tests
    test('Delete Header Conditions row (3rd of 3 rows)', async () => {
      const { container } = render(
        <WrapperComponent initialValues={getTriggerConfigInitialValues({ sourceRepo: 'CUSTOM' })} />
      )

      await waitFor(() => queryByText(container, result.current.getString('conditions')))

      const addButton = document.body.querySelector('[data-name="headerConditions"] [data-name="plusAdd"]')
      if (!addButton) {
        throw Error('no add button')
      }
      fireEvent.click(addButton)
      expect(result.current.getString('triggers.conditionsPanel.attribute')).not.toBeNull()
      await waitFor(() => expect(container.querySelectorAll('[class*="rowContainer"]').length).toEqual(1))

      const addButton2 = document.body.querySelector('[data-name="headerConditions"] [data-name="plusAdd"]')
      if (!addButton2) {
        throw Error('no add button')
      }
      fireEvent.click(addButton2)
      await waitFor(() => expect(container.querySelectorAll('[class*="rowContainer"]').length).toEqual(2))

      const addButton3 = document.body.querySelector('[data-name="headerConditions"] [data-name="plusAdd"]')
      if (!addButton3) {
        throw Error('no add button')
      }
      fireEvent.click(addButton3)
      await waitFor(() => expect(container.querySelectorAll('[class*="rowContainer"]').length).toEqual(3))
      const firstAttributeInput = document.body.querySelector('[name="headerConditions.0.key"]')
      const thirdAttributeInput = document.body.querySelector('[name="headerConditions.2.key"]')
      if (!firstAttributeInput || !thirdAttributeInput) {
        throw Error('missing attribute input')
      }

      fireEvent.change(firstAttributeInput, { target: { value: 'attribute1' } })
      fireEvent.change(thirdAttributeInput, { target: { value: 'attribute3' } })
      expect('attribute1').not.toBeNull()
      expect('attribute2').not.toBeNull()
      expect('attribute3').not.toBeNull()

      const lastDeleteButton = document.body.querySelectorAll('[data-name="main-delete"]')[2]
      if (!lastDeleteButton) {
        throw Error('no delete button')
      }
      fireEvent.click(lastDeleteButton)

      await waitFor(() => expect(container.querySelectorAll('[class*="rowContainer"]').length).toEqual(2))
      expect('attribute1').not.toBeNull()
      expect('attribute2').not.toBeNull()
    })
  })
})
