/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import { AddDescriptionAndTagsWithIdentifier } from '../AddDescriptionAndTags'
import i18n from '../AddDescriptionAndTags.i18n'

function WrapperComponent(props: { defaultOpenFields?: string[] }): JSX.Element {
  return (
    <Formik initialValues={{}} onSubmit={() => undefined} formName="wrapperComponent">
      <FormikForm>
        <AddDescriptionAndTagsWithIdentifier identifierProps={{ inputLabel: 'name' }} {...props} />
      </FormikForm>
    </Formik>
  )
}

describe('Unit tests for AddDescriptionTags Component', () => {
  test('Ensure description and tag fields open and close', async () => {
    const { container, getByText, getAllByText } = render(<WrapperComponent />)
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    expect(container.querySelector('[class*="expandedDescription"]')).toBeNull()
    expect(container.querySelector('[class*="expandedTags"]')).toBeNull()

    const descriptionButton = getByText(i18n.addDescriptionLabel)
    fireEvent.click(descriptionButton)
    await waitFor(() => expect(container.querySelector('[class*="expandedDescription"]')).not.toBeNull())

    const tagsButton = getByText(i18n.addTagsLabel)
    fireEvent.click(tagsButton)
    await waitFor(() => expect(container.querySelector('[class*="expandedTags"]')).not.toBeNull())

    const hideButtons = getAllByText(i18n.hideInput)
    expect(hideButtons.length).toBe(2)

    fireEvent.click(hideButtons[0])
    await waitFor(() => expect(container.querySelector('[class*="expandedDescription"]')).toBeNull())

    fireEvent.click(hideButtons[1])
    await waitFor(() => expect(container.querySelector('[class*="expandedTags"]')).toBeNull())
  })

  test('Show default open fields (assuming values exist in formik) (Deprecated)', async () => {
    const { container } = render(<WrapperComponent defaultOpenFields={['description', 'tags']} />)

    await waitFor(() => expect(container.querySelector('textarea')).not.toBeNull())
    await waitFor(() => expect(container.querySelector('[class*="tagInput"]')).not.toBeNull())
  })
})
