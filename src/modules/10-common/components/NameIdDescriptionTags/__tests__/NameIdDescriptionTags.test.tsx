/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { useStrings } from 'framework/strings'
import { NameIdDescriptionTags } from '@common/components'

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })

const onEditInitialValues = {
  name: 'name-123',
  identifier: 'name123',
  description: 'test description',
  tags: {
    test123: 'abc'
  }
}

function WrapperComponent(props: { initialValues: any }): JSX.Element {
  const { initialValues } = props || {}
  return (
    <TestWrapper>
      <Formik initialValues={initialValues} onSubmit={() => undefined} formName="TestWrapper">
        {formikProps => (
          <FormikForm>
            <NameIdDescriptionTags formikProps={formikProps} />
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('NameIdDescriptionTags  tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Name, ID, Description, and Tags', async () => {
      const { container } = render(<WrapperComponent initialValues={{}} />)
      expect(result.current.getString('name')).not.toBeNull()
      expect(container).toMatchSnapshot()
    })

    test('On Edit Render - Name, ID, Description, and Tags', async () => {
      const { container } = render(<WrapperComponent initialValues={onEditInitialValues} />)
      expect(result.current.getString('description')).not.toBeNull()
      expect(result.current.getString('tagsLabel')).not.toBeNull()
      expect(container).toMatchSnapshot()
    })

    test('Should display warning message when length of value for name reaches 63', async () => {
      const { getByText } = render(
        <WrapperComponent
          initialValues={{
            name: 'name-123 vldjvldkj dlvjdlvkj vljdlkvjd vlmdlfvm vlmdlkvj dlvdkl',
            identifier: 'name123',
            description: 'test description',
            tags: {
              test123: 'abc'
            }
          }}
        />
      )

      expect(result.current.getString('name')).not.toBeNull()
      expect(getByText('Limit of 63 characters is reached for name')).not.toBeNull()
    })
  })
})
