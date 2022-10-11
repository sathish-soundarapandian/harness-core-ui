/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateStudio } from '@templates-library/components/TemplateStudio/TemplateStudio'
import * as TemplateContext from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, templatePathProps } from '@common/utils/routeUtils'

const TemplateProviderMock = jest
  .spyOn(TemplateContext, 'TemplateProvider')
  .mockImplementation(() => <div className={'template-provider-mock'} />)

const PATH = routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...pipelineModuleParams })
const PATH_PARAMS = {
  templateIdentifier: 'Test_Template',
  versionLabel: 'v1',
  accountId: 'accountId',
  projectIdentifier: 'Yogesh_Test',
  orgIdentifier: 'default',
  module: 'cd',
  templateType: 'Step'
}

describe('<TemplateStudio /> tests', () => {
  test('should call TemplateProvider with correct renderPipelineStage prop', () => {
    render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS} queryParams={{ versionLabel: 'v1' }}>
        <TemplateStudio />
      </TestWrapper>
    )
    expect(TemplateProviderMock).toBeCalledWith(
      expect.objectContaining({
        queryParams: {
          accountIdentifier: 'accountId',
          orgIdentifier: 'default',
          projectIdentifier: 'Yogesh_Test'
        },
        module: 'cd',
        templateIdentifier: 'Test_Template',
        templateType: 'Step',
        versionLabel: 'v1'
      }),
      expect.anything()
    )
  })
})
