/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, findByText as globalFindByText, fireEvent, waitFor, act } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import * as cdng from 'services/cd-ng'
import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'
import { ServiceHooksMap } from '@pipeline/components/ServiceHooks/ServiceHooksHelper'
import { ServiceHooksDetailsStep } from '../ServiceHooksDetailsStep'

jest.useFakeTimers()

export const mockActionsData = {
  status: 'SUCCESS',
  data: ['FetchFiles', 'TemplateManifest', 'SteadyStateCheck'],
  metaData: null,
  correlationId: 'correlationId'
}

jest.mock('services/cd-ng', () => ({
  useHookActions: jest.fn().mockImplementation(() => {
    return { data: mockActionsData, loading: false }
  })
}))

const handleSubmit = jest.fn()
const defaultProps = {
  stepName: 'Service Hooks Store',
  prevStepData: {
    identifier: 'serviceHook',
    storeType: ServiceHooksMap.Inline,
    hookType: 'preHook',
    actions: ['FetchFiles'],
    store: {
      content: 'echo string'
    }
  },
  previousStep: jest.fn(),
  isEditMode: false,
  handleSubmit,
  listOfServiceHooks: [],
  configFileIndex: 0
}
const defaultPrevStepData = {
  identifier: '',
  storeType: ServiceHooksMap.Inline,
  hookType: 'preHook',
  actions: [],
  store: {
    content: ''
  }
}

function WrapperComponent(props: any): JSX.Element {
  const { initialErrors } = props || {}
  return (
    <TestWrapper>
      <Formik initialErrors={initialErrors} initialValues={{}} onSubmit={() => undefined} formName="TestWrapper">
        {formikProps => (
          <FormikForm>
            <ServiceHooksDetailsStep {...formikProps} {...props} />
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('Service Hooks details step', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should render service hooks details step', async () => {
    const props = { ...defaultProps }

    const { container } = render(<WrapperComponent {...props} />)
    const identifierField = container.querySelector('input[name="identifier"]') as HTMLInputElement
    fireEvent.change(identifierField, { target: { value: 'updatedServiceHook' } })
    expect(identifierField).toHaveValue('updatedServiceHook')

    // Update Hook Type dropdown
    const hookTypeDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[0]
    fireEvent.click(hookTypeDropDownButton!)
    const selectListMenu = container.querySelector('.bp3-menu')
    const selectItem = await globalFindByText(selectListMenu as HTMLElement, 'pipeline.serviceHooks.postHook')
    act(() => {
      fireEvent.click(selectItem)
    })
    const selectedHookType = queryByNameAttribute('hookType', container) as HTMLInputElement
    expect(selectedHookType.value).toBe('pipeline.serviceHooks.postHook')

    // Update content
    const contentInput = queryByNameAttribute('store.content', container) as HTMLInputElement
    fireEvent.input(contentInput!, {
      target: { value: 'echo updated content' },
      bubbles: true
    })
    expect(contentInput.value).toBe('echo updated content')

    expect(container).toBeDefined()
  })

  test('validate form validation errors', async () => {
    const props = {
      ...defaultProps,
      prevStepData: defaultPrevStepData,
      listOfServiceHooks: [
        {
          preHook: {
            identifier: 'testIdentifier',
            storeType: 'Inline',
            actions: ['FetchFiles'],
            store: {
              content: 'kubectl get namespaces'
            }
          }
        }
      ]
    }

    const { container, findByText } = render(<WrapperComponent {...props} />)
    const submitBtn = await findByText('submit')
    act(() => {
      fireEvent.click(submitBtn)
    })

    const identifierRequiredErr = await findByText('validation.identifierRequired')
    expect(identifierRequiredErr).toBeInTheDocument()
    const actionsRequiredErr = await findByText('pipeline.serviceHooks.error.actionsRequired')
    expect(actionsRequiredErr).toBeInTheDocument()
    const contentRequiredErr = await findByText('common.contentRequired')
    expect(contentRequiredErr).toBeInTheDocument()

    // validate duplicate identifier
    const identifierField = container.querySelector('input[name="identifier"]') as HTMLInputElement
    fireEvent.change(identifierField, { target: { value: 'testIdentifier' } })
    act(() => {
      fireEvent.click(submitBtn)
    })

    const duplicateIdentifierErr = await findByText('pipeline.serviceHooks.error.duplicateIdError')
    expect(duplicateIdentifierErr).toBeInTheDocument()
    const backBtn = await findByText('back')
    act(() => {
      fireEvent.click(backBtn)
    })
  })

  test('validate empty actions errors', async () => {
    jest.spyOn(cdng, 'useHookActions').mockImplementation(() => {
      return {
        data: null,
        loading: false,
        error: false,
        refetch: jest.fn()
      } as any
    })
    const props = {
      ...defaultProps,
      prevStepData: {
        ...defaultPrevStepData,
        identifier: 'testIdentifier',
        hookType: 'postHook'
      },
      listOfServiceHooks: [
        {
          postHook: {
            identifier: 'testIdentifier',
            storeType: 'Inline',
            actions: [],
            store: {
              content: 'kubectl get namespaces'
            }
          }
        }
      ]
    }

    const { findByText } = render(<WrapperComponent {...props} />)
    const submitBtn = await findByText('submit')
    act(() => {
      fireEvent.click(submitBtn)
    })

    // validate duplicate identifier for postHook
    const duplicateIdentifierErr = await findByText('pipeline.serviceHooks.error.duplicateIdError')
    expect(duplicateIdentifierErr).toBeInTheDocument()
  })
  test('should submit form data', async () => {
    const props = { ...defaultProps, stepName: undefined }

    const { findByText } = render(<WrapperComponent {...props} />)
    const submitBtn = await findByText('submit')
    act(() => {
      fireEvent.click(submitBtn)
    })

    waitFor(() => expect(handleSubmit).toHaveBeenCalled())
  })
})
