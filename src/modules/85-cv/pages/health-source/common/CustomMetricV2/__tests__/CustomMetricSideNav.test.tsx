import React from 'react'
import * as Formik from 'formik'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import CustomMetricSideNav from '../components/CustomMetricSideNav'
import { formikValuesMock } from './CustomMetric.utils.mock'

jest.mock(
  '@cv/components/MultiItemsSideNav/components/SelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav',
  () =>
    ({ onSelect }: { onSelect: (name: string) => void }) => {
      return (
        <>
          <button data-testid="invalidMetricSelect" onClick={() => onSelect('1234')}>
            invalid metric
          </button>
          <button data-testid="validMetricSelect" onClick={() => onSelect('cw-metric-4')}>
            valid metric
          </button>
        </>
      )
    }
)

describe('AppDIgnoreThresholdTabContent', () => {
  const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext')

  const setFieldValueMock = jest.fn()
  const onAddMock = jest.fn()
  const onDeleteMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    useFormikContextMock.mockReturnValue({
      isValid: true,
      setFieldValue: setFieldValueMock,
      values: formikValuesMock
    } as unknown as any)
  })

  test('should render the component', () => {
    const { container } = render(
      <TestWrapper>
        <Formik.Formik initialValues={formikValuesMock} onSubmit={() => Promise.resolve()}>
          <CustomMetricSideNav onAddMetric={onAddMock} onDeleteMetric={onDeleteMock} />
        </Formik.Formik>
      </TestWrapper>
    )

    screen.debug(container)

    act(() => {
      userEvent.click(screen.getByTestId('invalidMetricSelect'))
    })

    expect(setFieldValueMock).not.toHaveBeenCalled()

    act(() => {
      userEvent.click(screen.getByTestId('validMetricSelect'))
    })

    expect(setFieldValueMock).toHaveBeenCalled()
  })
})
