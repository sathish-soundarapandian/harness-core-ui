/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { omit } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import * as hooks from '@pipeline/components/PipelineStudio/SaveTemplateButton/useSaveAsTemplate'
import { SaveTemplateButton, SaveTemplateButtonProps } from '../SaveTemplateButton'

const saveMock = jest.fn()

const useSaveAsTemplateMock = jest.spyOn(hooks, 'useSaveAsTemplate').mockReturnValue({
  save: saveMock
})

const stepTemplateMock = {
  name: 'Test Http Template',
  identifier: 'Test_Http_Template',
  versionLabel: 'v1',
  type: 'Step',
  projectIdentifier: 'Yogesh_Test',
  orgIdentifier: 'default',
  tags: {},
  spec: {
    type: 'Http',
    timeout: '1m 40s',
    spec: { url: '<+input>', method: 'GET', headers: [], outputVariables: [], requestBody: '<+input>' }
  }
}

const baseProps: SaveTemplateButtonProps = {
  data: {
    ...stepTemplateMock.spec,
    name: 'name',
    identifier: 'identifier',
    description: 'some description',
    tags: { tag1: '', tag2: '' }
  },
  type: 'Stage',
  gitDetails: {
    repoIdentifier: 'repo',
    branch: 'branch'
  }
}
const PATH = routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })
const PATH_PARAMS = {
  pipelineIdentifier: 'stage1',
  accountId: 'accountId',
  orgIdentifier: 'CV',
  projectIdentifier: 'Milos2',
  module: 'cd'
}

describe('<SaveTemplateButton /> tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <SaveTemplateButton {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should call useSaveAsTemplate method with correct params on click', async () => {
    const { getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <SaveTemplateButton {...baseProps} />
      </TestWrapper>
    )

    expect(useSaveAsTemplateMock).toBeCalledWith(omit(baseProps, 'buttonProps'))

    const saveAsTemplateBtn = getByText('common.saveAsTemplate')
    await act(async () => {
      fireEvent.click(saveAsTemplateBtn)
    })

    expect(saveMock).toBeCalled()
  })
})
