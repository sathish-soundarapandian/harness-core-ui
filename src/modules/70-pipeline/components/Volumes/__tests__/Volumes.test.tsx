/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render, act, fireEvent, queryByAttribute, waitFor } from '@testing-library/react'
import { Formik, Form } from 'formik'
import { MultiTypeInputType } from '@wings-software/uicore'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'

import Volumes from '../Volumes'

interface TestProps {
  initialValues?: any
  volumesProps?: { restrictToSingleEntry?: boolean }
}

function TestComponent({ initialValues }: TestProps): React.ReactElement {
  return (
    <TestWrapper>
      <Formik initialValues={initialValues} onSubmit={noop}>
        {formik => (
          <Form>
            <Volumes
              name="volumes"
              formik={formik}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            />
          </Form>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('<Volumes /> tests', () => {
  test('Initial Default render', () => {
    const { container } = render(<TestComponent initialValues={{ volumes: [] }} />)
    expect(container).toMatchSnapshot()
  })

  test('All onEdit values render', () => {
    const { container } = render(
      <TestComponent
        initialValues={{
          volumes: [
            {
              mountPath: 'persistenVolumeClaim',
              type: 'PersistentVolumeClaim',
              spec: {
                claimName: 'claimName',
                readOnly: true
              }
            },
            {
              mountPath: 'hostPath',
              type: 'HostPath',
              spec: {
                path: 'Path',
                type: 'pathType'
              }
            },
            {
              mountPath: 'emptyDir',
              type: 'EmptyDir',
              spec: {
                medium: '1234',
                size: '10Gi'
              }
            }
          ]
        }}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('+ Add button should add a new field', async () => {
    const { container, getByTestId } = render(
      <TestComponent
        initialValues={{
          volumes: [
            {
              mountPath: 'persistenVolumeClaim',
              type: 'PersistentVolumeClaim',
              spec: {
                claimName: 'claimName',
                readOnly: true
              }
            }
          ]
        }}
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    await act(async () => {
      fireEvent.click(getByTestId('add-volumes'))
    })
    await act(async () => {
      fireEvent.click(getByTestId('add-volumes'))
    })

    expect(queryByNameAttribute('volumes.0.mountPath')).toBeTruthy()
    expect(queryByNameAttribute('volumes.0.type')).toBeTruthy()
    expect(queryByNameAttribute('volumes.0.spec.claimName')).toBeTruthy()
    expect(queryByNameAttribute('volumes.0.spec.readOnly')).toBeTruthy()
    expect(queryByNameAttribute('volumes.1.mountPath')).toBeTruthy()
    expect(queryByNameAttribute('volumes.1.type')).toBeTruthy()
    expect(queryByNameAttribute('volumes.2.mountPath')).toBeTruthy()
    expect(queryByNameAttribute('volumes.2.type')).toBeTruthy()
  })

  test('Remove button should remove a field', async () => {
    const { container, getByTestId } = render(<TestComponent initialValues={{ volumes: [] }} />)

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    await act(async () => {
      fireEvent.click(getByTestId('add-volumes'))
    })
    await act(async () => {
      fireEvent.click(getByTestId('add-volumes'))
    })

    await act(async () => {
      fireEvent.click(getByTestId('remove-volumes-[1]'))
    })

    expect(queryByNameAttribute('volumes.0.mountPath')).toBeTruthy()
    expect(queryByNameAttribute('volumes.0.type')).toBeTruthy()
    expect(queryByNameAttribute('volumes.1.mountPath')).toBeNull()
    expect(queryByNameAttribute('volumes.1.type')).toBeNull()
  })

  test('Select type renders additional fields', async () => {
    const { container, getByTestId } = render(<TestComponent initialValues={{ volumes: [] }} />)

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    await act(async () => {
      fireEvent.click(getByTestId('add-volumes'))
    })
    await act(async () => {
      fireEvent.click(getByTestId('add-volumes'))
    })
    await act(async () => {
      fireEvent.click(getByTestId('add-volumes'))
    })

    expect(queryByNameAttribute('volumes.0.type')).toBeTruthy()
    await waitFor(() => expect(queryByNameAttribute('volumes.2.type')).toBeTruthy())

    fillAtForm([
      {
        container,
        type: InputTypes.SELECT,
        fieldId: 'volumes.0.type',
        value: 'HostPath'
      }
    ])

    expect(queryByNameAttribute('volumes.0.spec.path')).toBeTruthy()
    expect(queryByNameAttribute('volumes.0.spec.type')).toBeTruthy()
    fillAtForm([
      {
        container,
        type: InputTypes.SELECT,
        fieldId: 'volumes.0.type',
        value: 'EmptyDir'
      }
    ])
    waitFor(() => expect(queryByNameAttribute('volumes.0.spec.medium')).toBeTruthy())
    waitFor(() => expect(queryByNameAttribute('volumes.0.spec.size')).toBeTruthy())

    fillAtForm([
      {
        container,
        type: InputTypes.SELECT,
        fieldId: 'volumes.0.type',
        value: 'PersistentVolumeClaim'
      }
    ])

    waitFor(() => expect(queryByNameAttribute('volumes.0.spec.claimName')).toBeTruthy())
    waitFor(() => expect(queryByNameAttribute('volumes.0.spec.readOnly')).toBeTruthy())
  })

  test('Should render runtime input properly', () => {
    const { container } = render(<TestComponent initialValues={{ volumes: '<+input>' }} />)
    expect(container).toMatchSnapshot()
  })
})
