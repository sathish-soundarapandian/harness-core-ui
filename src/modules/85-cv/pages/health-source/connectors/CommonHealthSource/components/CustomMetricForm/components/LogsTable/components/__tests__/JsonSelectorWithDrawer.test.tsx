import React from 'react'
import { Formik } from 'formik'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { commonHealthSourceProviderPropsMock } from '@cv/components/CommonMultiItemsSideNav/tests/CommonMultiItemsSideNav.mock'
import { FIELD_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { TestWrapper } from '@common/utils/testUtils'
import JsonSelectorWithDrawer from '../JsonSelectorWithDrawer'
import CommonHealthSourceProvider from '../../../CommonHealthSourceContext/CommonHealthSourceContext'

describe('JsonSelectorWithDrawer', () => {
  test('should pass correct selected data', async () => {
    render(
      <TestWrapper>
        <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
          <Formik initialValues={{ serviceInstance: 'test' }} onSubmit={() => Promise.resolve()}>
            <JsonSelectorWithDrawer
              jsonData={{ propertyName: 'test value' }}
              fieldMappings={[
                {
                  type: FIELD_ENUM.JSON_SELECTOR,
                  label: 'Identifier service path',
                  identifier: 'serviceInstance',
                  defaultValue: '_sourcehost'
                }
              ]}
              disableFields={false}
              multiTypeRecord={null}
              setMultiTypeRecord={() => void 0}
            />
          </Formik>
        </CommonHealthSourceProvider>
      </TestWrapper>
    )

    act(() => {
      userEvent.click(screen.getByText(/test/))
    })

    await waitFor(() =>
      expect(document.body.querySelector('.bp3-drawer-header')?.textContent).toBe(
        'cv.monitoringSources.commonHealthSource.logsTable.jsonSelectorDrawerTitlePrefix Identifier service path'
      )
    )

    act(() => {
      userEvent.click(screen.getByText(/propertyName/))
    })

    await waitFor(() => expect(screen.getByText('propertyName')).toBeInTheDocument())
  })

  test('should not render anything if invalid config is passed', async () => {
    render(
      <TestWrapper>
        <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
          <Formik initialValues={{ serviceInstance: 'test' }} onSubmit={() => Promise.resolve()}>
            <JsonSelectorWithDrawer
              jsonData={{ propertyName: 'test value' }}
              fieldMappings={[
                {
                  type: 'JsonSelector_abc' as FIELD_ENUM.JSON_SELECTOR,
                  label: 'Identifier service path',
                  identifier: 'serviceInstance',
                  defaultValue: '_sourcehost'
                }
              ]}
              disableFields={false}
              multiTypeRecord={null}
              setMultiTypeRecord={() => void 0}
            />
          </Formik>
        </CommonHealthSourceProvider>
      </TestWrapper>
    )

    expect(screen.queryByText(/test/)).not.toBeInTheDocument()
  })
})
