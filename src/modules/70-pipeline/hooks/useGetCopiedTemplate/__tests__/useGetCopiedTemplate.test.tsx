/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByRole, render } from '@testing-library/react'
import { defaultTo, noop } from 'lodash-es'
import useGetCopiedTemplate, {
  VariablesInputModalProps
} from '@pipeline/hooks/useGetCopiedTemplate/useGetCopiedTemplate'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'

const stepTemplate: TemplateSummaryResponse = {
  accountId: 'px7xd_BFRCi-pfWPYXVjvw',
  childType: 'Http',
  description: '',
  identifier: 'Test_Http_Template',
  lastUpdatedAt: 1637668359934,
  name: 'Test Http Template',
  orgIdentifier: 'default',
  projectIdentifier: 'Yogesh_Test',
  stableTemplate: true,
  tags: {},
  templateEntityType: 'Step',
  templateScope: 'project',
  version: 3,
  versionLabel: 'v1',
  yaml:
    'template:' +
    '\n    name: Test Http Template' +
    '\n    identifier: Test_Http_Template' +
    '\n    versionLabel: v1' +
    '\n    type: Step' +
    '\n    projectIdentifier: Yogesh_Test' +
    '\n    orgIdentifier: default' +
    '\n    description: null' +
    '\n    tags: {}' +
    '\n    spec:' +
    '\n        type: Http' +
    '\n        timeout: 1m 40s' +
    '\n        spec:' +
    '\n            url: <+input>' +
    '\n            method: GET' +
    '\n            headers: []' +
    '\n            outputVariables: []' +
    '\n            requestBody: <+input>' +
    '\n'
}

jest.mock('@pipeline/hooks/useGetCopiedTemplate/VariablesInputModal/VariablesInputModal', () => ({
  ...jest.requireActual('@pipeline/hooks/useGetCopiedTemplate/VariablesInputModal/VariablesInputModal'),
  VariablesInputModal: (props: VariablesInputModalProps) => {
    return (
      <div className={'variables-input-modal-mock'}>
        <button onClick={() => props.onResolve(defaultTo(stepTemplate.yaml, ''))}>Submit</button>
        <button onClick={() => props.onReject()}>Cancel</button>
      </div>
    )
  }
}))

function Wrapped(): React.ReactElement {
  const { getCopiedTemplate } = useGetCopiedTemplate()
  const [yaml, setYaml] = React.useState<string>('')
  const onBtnClick = () => {
    getCopiedTemplate(stepTemplate).then(setYaml).catch(noop)
  }

  return (
    <>
      <p className={'yaml'}>{yaml}</p>
      <button className="getCopiedYaml" onClick={onBtnClick} />
    </>
  )
}

describe('useGetCopiedTemplate tests', () => {
  test('should work as expected', async () => {
    const { container } = render(
      <TestWrapper>
        <Wrapped />
      </TestWrapper>
    )

    //Open dialog
    const getCopiedYamlButton = container.querySelector('.getCopiedYaml')
    await act(async () => {
      fireEvent.click(getCopiedYamlButton!)
    })

    //Confirm the dialog is open and matches snapshot
    let dialogContainer = findDialogContainer() as HTMLElement
    expect(dialogContainer).toBeTruthy()

    //Close dialog with cancel
    await act(async () => {
      fireEvent.click(getByRole(dialogContainer, 'button', { name: 'Cancel' }))
    })

    //Confirm the dialog is closed
    expect(findDialogContainer()).toBeFalsy()

    //Open dialog again
    await act(async () => {
      fireEvent.click(getCopiedYamlButton!)
    })

    //Confirm the dialog is open again
    dialogContainer = findDialogContainer() as HTMLElement
    expect(dialogContainer).toBeTruthy()

    //Save comment
    await act(async () => {
      fireEvent.click(getByRole(dialogContainer, 'button', { name: 'Submit' }))
    })

    //Confirm the dialog is closed
    expect(findDialogContainer()).toBeFalsy()
    expect(container.querySelector('.yaml')).toHaveTextContent(
      'template: name: Test Http Template identifier: Test_Http_Template versionLabel: v1 type: Step projectIdentifier: Yogesh_Test orgIdentifier: default description: null tags: {} spec: type: Http timeout: 1m 40s spec: url: <+input> method: GET headers: [] outputVariables: [] requestBody: <+input>'
    )
  })
})
