/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, MultiTypeInputType } from '@harness/uicore'
import { render, RenderResult, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from 'formik'
import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import type { CommandUnitType, CustomScriptCommandUnit } from '../../CommandScriptsTypes'
import { TailFilesEdit } from '../TailFilesEdit'

jest.mock('@common/components/MonacoEditor/MonacoEditor')

const initialValues = {
  identifier: 'Script_Cmd',
  name: 'Script Cmd',
  type: 'Script',
  spec: {
    workingDirectory: 'dir',
    shell: 'Bash',
    source: {
      type: 'Inline',
      spec: {
        script: "echo 'script'"
      }
    },
    tailFiles: [
      {
        tailFile: 'abc',
        tailPattern: 'def'
      },
      {
        tailFile: 'ghi',
        tailPattern: 'jkl'
      }
    ]
  }
}

describe('test <TailFilesEdit />', () => {
  let renderResult: RenderResult

  beforeEach(() => {
    renderResult = render(
      <TestWrapper>
        <Formik<CommandUnitType>
          initialValues={initialValues as CustomScriptCommandUnit}
          formName="commandUnit"
          onSubmit={jest.fn()}
        >
          {formik => (
            <Form>
              <TailFilesEdit
                formik={formik}
                allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
              />
            </Form>
          )}
        </Formik>
      </TestWrapper>
    )
  })

  test('should render all tail files', () => {
    const { container } = renderResult

    initialValues.spec.tailFiles.forEach(({ tailPattern, tailFile }, index) => {
      const tailFileInput = queryByNameAttribute(`spec.tailFiles[${index}].tailFile`, container)
      const tailPatternInput = queryByNameAttribute(`spec.tailFiles[${index}].tailPattern`, container)

      expect(tailFileInput).toBeInTheDocument()
      expect(tailFileInput).toHaveDisplayValue(tailFile as string)
      expect(tailPatternInput).toBeInTheDocument()
      expect(tailPatternInput).toHaveDisplayValue(tailPattern as string)
    })
  })

  test('should delete a tail file', async () => {
    const index = 0
    const tailFileToDelete = initialValues.spec.tailFiles[index]
    const tailFilesEditQueries = within(renderResult.getByTestId('tail-files-edit'))

    expect(tailFilesEditQueries.getByDisplayValue(tailFileToDelete.tailFile as string)).toBeInTheDocument()

    userEvent.click(tailFilesEditQueries.getByTestId(`remove-tailFile-${index}`))

    await waitFor(() => {
      expect(tailFilesEditQueries.queryByDisplayValue(tailFileToDelete.tailFile as string)).not.toBeInTheDocument()
    })
  })

  test('should add a tail file', async () => {
    const lastTailFileIndex = initialValues.spec.tailFiles.length - 1
    const tailFilesEditContainer = renderResult.getByTestId('tail-files-edit')

    userEvent.click(within(tailFilesEditContainer).getByTestId(`add-tailFile`))

    await waitFor(() => {
      expect(
        queryByNameAttribute(`spec.tailFiles[${lastTailFileIndex + 1}].tailFile`, tailFilesEditContainer)
      ).toBeInTheDocument()
    })
  })

  test('should update a tail file', async () => {
    const index = 0
    const tailFileToUpdate = initialValues.spec.tailFiles[index]
    const tailFilesEditContainer = renderResult.getByTestId('tail-files-edit')
    const tailFilesEditQueries = within(tailFilesEditContainer)
    const tailFileInput = queryByNameAttribute(`spec.tailFiles[${index}].tailFile`, tailFilesEditContainer)
    const suffix = 'updated'

    userEvent.type(tailFileInput!, suffix)

    expect(await tailFilesEditQueries.findByDisplayValue(tailFileToUpdate.tailFile + suffix)).toBeInTheDocument()
  })
})
