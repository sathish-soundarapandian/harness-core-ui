/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import type { UseGetReturn } from 'restful-react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import KubernetesChangeSource from '../KubernetesChangeSource'
import type { KubernetesChangeSourceProps } from '../KubernetesChangeSource.types'

jest.mock('@connectors/components/ConnectorReferenceField/FormConnectorReferenceField', () => ({
  FormConnectorReferenceField: function MockComp(props: any) {
    return (
      <div>
        <button className="updateValue" onClick={() => props.formik.setFieldValue('spec', { connectorRef: 'kube' })} />
      </div>
    )
  }
}))

function WrapperComponent(props: Omit<KubernetesChangeSourceProps, 'formik'>): JSX.Element {
  return (
    <TestWrapper>
      <Formik onSubmit={() => undefined} initialValues={{}} formName="mockname">
        {formik => <KubernetesChangeSource {...props} formik={formik as any} />}
      </Formik>
    </TestWrapper>
  )
}

describe('Unit tests for KubernetesChangeSource', () => {
  test('Ensure validate api is called after user makes selection, and connector is validated', async () => {
    const refetchSpy = jest.fn()
    jest
      .spyOn(cvService, 'useValidateK8sConnectivity')
      .mockReturnValue({ data: { data: true }, refetch: refetchSpy as unknown } as UseGetReturn<any, any, any, any>)
    const { container, getByText } = render(<WrapperComponent isEdit={false} />)
    await waitFor(() => expect(container.querySelector('[data-name="kubechangesource"]')))

    fireEvent.click(container.querySelector('[class*="updateValue"]')!)
    await waitFor(() => expect(refetchSpy).toHaveBeenCalledTimes(1))
    getByText('cv.monitoringSources.appD.validationsPassed')
  })

  test('Ensure validate api is called after user makes selection, and connector is invalid', async () => {
    const refetchSpy = jest.fn()
    jest
      .spyOn(cvService, 'useValidateK8sConnectivity')
      .mockReturnValue({ data: { data: false }, refetch: refetchSpy as unknown } as UseGetReturn<any, any, any, any>)
    const { container, getByText } = render(<WrapperComponent isEdit={false} />)
    await waitFor(() => expect(container.querySelector('[data-name="kubechangesource"]')))

    fireEvent.click(container.querySelector('[class*="updateValue"]')!)
    await waitFor(() => expect(refetchSpy).toHaveBeenCalledTimes(1))
    getByText('cv.changeSource.kubernetes.invalidConnector')

    fireEvent.click(getByText('retry'))
    await waitFor(() => expect(refetchSpy).toHaveBeenCalledTimes(2))
  })

  test('Ensure validate api is called after user makes selection, and connector is invalid', async () => {
    const refetchSpy = jest.fn()
    jest
      .spyOn(cvService, 'useValidateK8sConnectivity')
      .mockReturnValue({ error: { message: 'mockError' }, refetch: refetchSpy as unknown } as UseGetReturn<
        any,
        any,
        any,
        any
      >)
    const { container, getByText } = render(<WrapperComponent isEdit={false} />)
    await waitFor(() => expect(container.querySelector('[data-name="kubechangesource"]')))

    fireEvent.click(container.querySelector('[class*="updateValue"]')!)
    await waitFor(() => expect(refetchSpy).toHaveBeenCalledTimes(1))
    getByText('mockError')

    fireEvent.click(getByText('retry'))
    await waitFor(() => expect(refetchSpy).toHaveBeenCalledTimes(2))
  })
})
