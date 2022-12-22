/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useFormikContext } from 'formik'
import { getAllByRole, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AllowedTypes, MultiTypeInputType } from '@harness/uicore'

import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'

import DeployEnvironmentEntityWidget from '../DeployEnvironmentEntityWidget'

/**
 * Areas to cover
 * 1. Rendering and checking toggle states
 *  a. single
 *  b. multi env
 *  c. env group
 *  d. with & without gitops
 *  e. with env group FF enabled
 *  f. disabled/readonly state
 *  g. confirmation dialog when form contains data
 * 2. Abstract out the functions to utils if possible. Maybe return promises and handle things
 */

const allowableTypes = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.RUNTIME,
  MultiTypeInputType.EXPRESSION
] as AllowedTypes

jest.mock('../DeployEnvironment/DeployEnvironment', () => ({
  __esModule: true,
  default: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const formik = useFormikContext()
    return <div data-testid="mock-deploy-environment">{JSON.stringify(formik.values)}</div>
  }
}))

jest.mock('@pipeline/components/AbstractSteps/StepWidget', () => ({
  ...(jest.requireActual('@pipeline/components/AbstractSteps/StepWidget') as any),
  StepWidget: () => {
    const formik = useFormikContext()
    return <div className="step-widget-mock">{JSON.stringify(formik.values)}</div>
  }
}))

describe('deploy environment entity widget', () => {
  test('renders single environment and can toggle empty state to multi environment', async () => {
    render(
      <TestWrapper defaultAppStoreValues={{ featureFlags: { ENV_GROUP: true } }}>
        <DeployEnvironmentEntityWidget
          initialValues={{ environment: '', category: 'single' }}
          allowableTypes={allowableTypes}
          stageIdentifier="dummy_stage"
          readonly={false}
          gitOpsEnabled={false}
          deploymentType={'Kubernetes'}
          customDeploymentRef={{
            templateRef: 'test'
          }}
        />
      </TestWrapper>
    )

    const multiEnvToggle = screen.getByRole('checkbox')
    await waitFor(() => expect(multiEnvToggle).not.toBeChecked())

    userEvent.click(multiEnvToggle)

    await waitFor(() => expect(multiEnvToggle).toBeChecked())
    await waitFor(() =>
      expect(
        screen.getByText('{"category":"multi","parallel":true,"environments":[],"environmentFilters":{}}')
      ).toBeVisible()
    )
  })

  test('renders single environment and can toggle with state to multi environment', async () => {
    render(
      <TestWrapper defaultAppStoreValues={{ featureFlags: { ENV_GROUP: true } }}>
        <DeployEnvironmentEntityWidget
          initialValues={{ environment: 'Env_1', category: 'single' }}
          allowableTypes={allowableTypes}
          stageIdentifier="dummy_stage"
          readonly={false}
          gitOpsEnabled={false}
          deploymentType={'Kubernetes'}
          customDeploymentRef={{
            templateRef: 'test'
          }}
        />
      </TestWrapper>
    )

    const multiEnvToggle = screen.getByRole('checkbox')
    await waitFor(() => expect(multiEnvToggle).not.toBeChecked())

    userEvent.click(multiEnvToggle)

    const buttonsInDialog = getAllByRole(findDialogContainer()!, 'button')
    userEvent.click(buttonsInDialog[1])

    await waitFor(() => expect(multiEnvToggle).not.toBeChecked())

    userEvent.click(multiEnvToggle)
    userEvent.click(buttonsInDialog[0])

    await waitFor(() => expect(multiEnvToggle).toBeChecked())
    await waitFor(() =>
      expect(
        screen.getByText(
          '{"category":"multi","parallel":true,"environments":[{"label":"Env_1","value":"Env_1"}],"environmentFilters":{},"infrastructures":{"Env_1":[]}}'
        )
      ).toBeVisible()
    )
  })
})
