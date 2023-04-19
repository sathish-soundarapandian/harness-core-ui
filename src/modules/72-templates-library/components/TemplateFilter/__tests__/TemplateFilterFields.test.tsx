import React from 'react'
import { render } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateFilterFields } from '../TemplateFilterFields'

const TestComponent = ({ initialValues }: any): React.ReactElement => (
  <TestWrapper>
    <Formik formName="test" initialValues={initialValues} onSubmit={Promise.resolve}>
      {<TemplateFilterFields />}
    </Formik>
  </TestWrapper>
)
describe('template filter fields', () => {
  test('Should render <TemplateFilterFields />', async () => {
    const { container } = render(TestComponent({}))

    expect(container).toBeDefined()
  })
})
