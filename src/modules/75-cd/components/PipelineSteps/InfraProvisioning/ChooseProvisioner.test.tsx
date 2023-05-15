/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getByText, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import useChooseProvisioner from './ChooseProvisioner'
import { payloadValueforProvisionerTypes, ProvisionerTypes } from '../Common/ProvisionerConstants'

const TestComponent = (): React.ReactElement => {
  const { showModal, hideModal } = useChooseProvisioner({
    onSubmit: jest.fn(),
    onClose: jest.fn()
  })
  return (
    <>
      <button className="open" onClick={showModal} aria-label="open provisioner" />
      <button className="close" onClick={hideModal} />
    </>
  )
}
describe('Choose Provisioner tests', () => {
  test('render dialog for choosing provisioner type', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'open provisioner'
      })
    )
    const modal = findDialogContainer()
    expect(modal).toBeDefined()
    expect(getByText(modal!, 'cd.chooseProvisionerText')).toBeInTheDocument()
    const terragruntProv = await screen.findByTestId('provisioner-Terragrunt')
    await userEvent.click(terragruntProv)
    await userEvent.click(
      screen.getByRole('button', {
        name: 'cd.setUpProvisionerBtnText'
      })
    )
  })

  test('payloadValueforProvisionerTypes function', () => {
    expect(payloadValueforProvisionerTypes(ProvisionerTypes.Terraform)).toBe('TERRAFORM')
    expect(payloadValueforProvisionerTypes(ProvisionerTypes.Terragrunt)).toBe('TERRAGRUNT')
    expect(payloadValueforProvisionerTypes(ProvisionerTypes.TerraformCloud)).toBe('TERRAFORM_CLOUD')
    expect(payloadValueforProvisionerTypes(ProvisionerTypes.CloudFormation)).toBe('CLOUD_FORMATION')
    expect(payloadValueforProvisionerTypes(ProvisionerTypes.ARM)).toBe('AZURE_ARM')
    expect(payloadValueforProvisionerTypes(ProvisionerTypes.Blueprint)).toBe('AZURE_BLUEPRINT')
    expect(payloadValueforProvisionerTypes(ProvisionerTypes.Script)).toBe('SHELL_SCRIPT_PROVISIONER')
  })
})
