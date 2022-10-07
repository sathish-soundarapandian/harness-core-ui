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

const TemplateProviderMock = jest
  .spyOn(TemplateContext, 'TemplateProvider')
  .mockImplementation(() => <div className={'template-provider-mock'} />)

describe('<TemplateStudioWrapper /> tests', () => {
  test('should call TemplateProvider with correct renderPipelineStage prop', () => {
    render(
      <TestWrapper>
        <TemplateStudio />
      </TestWrapper>
    )
    expect(TemplateProviderMock).toBeCalledWith(
      expect.objectContaining({ renderPipelineStage: expect.any(Function) }),
      {}
    )
  })
})
