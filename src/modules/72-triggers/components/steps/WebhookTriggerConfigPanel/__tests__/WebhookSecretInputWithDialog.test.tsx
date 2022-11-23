/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik } from 'formik'
import { Button, FormikForm, Text } from '@harness/uicore'
import { noop } from 'lodash-es'
import { act, fireEvent, queryByText, render, waitFor } from '@testing-library/react'
import * as cdng from 'services/cd-ng'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import WebhookSecretInputWithDialog from '../WebhookSecretInputWithDialog'

type WrapperComponentProps = {
  isGithubWebhookAuthenticationEnabled?: boolean
  encryptedWebhookSecretIdentifier?: string
}

const WrapperComponent: React.FC<WrapperComponentProps> = ({
  isGithubWebhookAuthenticationEnabled = true,
  encryptedWebhookSecretIdentifier = 'testSecret'
}) => {
  return (
    <Formik initialValues={{ isGithubWebhookAuthenticationEnabled, encryptedWebhookSecretIdentifier }} onSubmit={noop}>
      {formikProps => (
        <FormikForm>
          <TestWrapper>
            <WebhookSecretInputWithDialog formikProps={formikProps} />
          </TestWrapper>
        </FormikForm>
      )}
    </Formik>
  )
}

// eslint-disable-next-line react/display-name
jest.mock('@secrets/components/SecretInput/SecretInput', () => (props: { secret: string; onSuccess: () => void }) => (
  <>
    <Text data-testid="mockSecretInput">{props.secret}</Text>
    <Button type="button" data-testid="mockSecretInputSubmit" onClick={props.onSuccess}>
      Mock SecretInput Submit
    </Button>
  </>
))

const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'testSecret',
      identifier: 'testSecret',
      tags: {},
      description: '',
      spec: { secretManagerIdentifier: 'harnessSecretManager' }
    },
    createdAt: 1606373702954,
    updatedAt: 1606373702954,
    draft: false
  },
  metaData: null,
  correlationId: '0346aa2b-290e-4892-a7f0-4ad2128c9829'
}

describe('WebhookSecretInputWithDialog Tests:', () => {
  test('Should return null if SPG_NG_GITHUB_WEBHOOK_AUTHENTICATION FF is false', () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlag').mockReturnValue(false)
    const { container } = render(
      <Formik initialValues={{}} onSubmit={noop}>
        {formikProps => <WebhookSecretInputWithDialog formikProps={formikProps} />}
      </Formik>
    )

    expect(container).toMatchSnapshot()
  })

  describe('SPG_NG_GITHUB_WEBHOOK_AUTHENTICATION FF is true', () => {
    beforeEach(() => {
      jest.spyOn(FeatureFlag, 'useFeatureFlag').mockReturnValue(true)
    })

    test('Initial render', async () => {
      jest.spyOn(cdng, 'getSecretV2Promise').mockReturnValue({ loading: false } as any)
      const { container, getByTestId } = render(
        <WrapperComponent isGithubWebhookAuthenticationEnabled={true} encryptedWebhookSecretIdentifier="" />
      )
      await waitFor(() => {
        expect(getByTestId('mockSecretInput')).toBeDefined()
      })
      expect(container).toMatchSnapshot()
    })

    test('Should show loading button if the secret data loading', async () => {
      jest.spyOn(cdng, 'getSecretV2Promise').mockReturnValue({ loading: true } as any)
      const { container } = render(<WrapperComponent />)
      await waitFor(() => expect(container.getElementsByClassName('bp3-button-spinner')).not.toBeUndefined())
      expect(container).toMatchSnapshot()
    })

    test('getSecretV2Promise API Error', async () => {
      const errorMessage = 'Something went wrong'
      jest.spyOn(cdng, 'getSecretV2Promise').mockImplementation(() => {
        throw new Error(errorMessage)
      })
      const { container } = render(<WrapperComponent />)
      await waitFor(() => expect(queryByText(container, errorMessage)).toBeDefined())
      expect(container).toMatchSnapshot()
    })

    describe('Render with secret value', () => {
      beforeEach(() => {
        jest.spyOn(cdng, 'getSecretV2Promise').mockReturnValue({ loading: false, data: mockSecret } as any)
      })

      test('SecretInput: Optional', async () => {
        const { container, getByTestId } = render(<WrapperComponent isGithubWebhookAuthenticationEnabled={false} />)
        await waitFor(() => {
          expect(getByTestId('mockSecretInput')).toBeDefined()
          expect(queryByText(container, mockSecret.data.secret.name)).toBeDefined()
        })
        expect(container).toMatchSnapshot()
      })

      test('SecretInput: Required', async () => {
        const { container, getByTestId } = render(<WrapperComponent isGithubWebhookAuthenticationEnabled={true} />)
        await waitFor(() => {
          expect(getByTestId('mockSecretInput')).toBeDefined()
          expect(queryByText(container, mockSecret.data.secret.name)).toBeDefined()
        })
        expect(container).toMatchSnapshot()
      })

      test('Account Level SecretInput: Required', async () => {
        const { container, getByTestId } = render(
          <WrapperComponent encryptedWebhookSecretIdentifier={'account.testSecret'} />
        )
        await waitFor(() => {
          expect(getByTestId('mockSecretInput')).toBeDefined()
          expect(queryByText(container, mockSecret.data.secret.name)).toBeDefined()
        })
        expect(container).toMatchSnapshot()
      })

      test('SecretInput: Open the Dialog', async () => {
        const { container, getByTestId } = render(<WrapperComponent isGithubWebhookAuthenticationEnabled={true} />)
        await waitFor(() => {
          expect(getByTestId('mockSecretInput')).toBeDefined()
          expect(getByTestId('mockSecretInputSubmit')).toBeDefined()
          expect(queryByText(container, mockSecret.data.secret.name)).toBeDefined()
        })
        await act(async () => {
          fireEvent.click(getByTestId('mockSecretInputSubmit'))
        })
        const dialog = findDialogContainer()
        if (!dialog) {
          throw new Error('Something went wrong')
        }
        expect(dialog.getElementsByClassName('Dialog--close').length).toBe(1)
        expect(container).toMatchSnapshot()
        expect(dialog).toMatchSnapshot()
      })

      test('SecretInput: Close the Dialog', async () => {
        const { container, getByTestId } = render(<WrapperComponent isGithubWebhookAuthenticationEnabled={true} />)
        await waitFor(() => {
          expect(getByTestId('mockSecretInput')).toBeDefined()
          expect(queryByText(container, mockSecret.data.secret.name)).toBeDefined()
        })
        await act(async () => {
          fireEvent.click(getByTestId('mockSecretInputSubmit'))
        })
        const openedDialog = findDialogContainer()
        if (!openedDialog) {
          throw new Error('Something went wrong')
        }
        const dialogCloseBtn = openedDialog.getElementsByClassName('Dialog--close')[0]
        if (!dialogCloseBtn) {
          throw new Error('Something went wrong')
        }
        await act(async () => {
          fireEvent.click(dialogCloseBtn)
        })
        await waitFor(() => {
          const closedDialog = findDialogContainer()
          expect(closedDialog).not.toBeInTheDocument()
        })

        expect(container).toMatchSnapshot()
      })
    })
  })
})
