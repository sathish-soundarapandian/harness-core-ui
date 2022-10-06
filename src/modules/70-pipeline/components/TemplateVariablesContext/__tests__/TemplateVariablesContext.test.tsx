/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks/dom'
import { TestWrapper } from '@common/utils/testUtils'
import type { NGTemplateInfoConfig } from 'services/template-ng'
import {
  CreateVariableResponse,
  MergedPipelineResponse
} from '@pipeline/components/TemplateVariablesContext/__tests__/TemplateVariablesMocks'
import template from './template.json'
import variables from './variables.json'
import metaDataMap from './metaDataMap.json'
import { TemplateVariablesContextProvider, useTemplateVariables } from '../TemplateVariablesContext'

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(props => {
    if (props.name === 'useGetYamlWithTemplateRefsResolved') {
      return MergedPipelineResponse
    } else if (props.name === 'useCreateVariablesV2') {
      return CreateVariableResponse
    }
  })
}))

describe('TemplateVariablesContext', () => {
  test('should return the correct info', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper pathParams={{ accountId: 'testAcc', orgIdentifier: 'org1', projectIdentifier: 'proj1' }}>
        <TemplateVariablesContextProvider template={template as NGTemplateInfoConfig}>
          {children}
        </TemplateVariablesContextProvider>
      </TestWrapper>
    )
    const { result } = renderHook(() => useTemplateVariables(), { wrapper })
    await waitFor(() => expect(result.current.originalTemplate).toStrictEqual(template))
    await waitFor(() => expect(result.current.metadataMap).toStrictEqual(metaDataMap))
    await waitFor(() => expect(result.current.variablesTemplate).toStrictEqual(variables.stage))
  })
})
