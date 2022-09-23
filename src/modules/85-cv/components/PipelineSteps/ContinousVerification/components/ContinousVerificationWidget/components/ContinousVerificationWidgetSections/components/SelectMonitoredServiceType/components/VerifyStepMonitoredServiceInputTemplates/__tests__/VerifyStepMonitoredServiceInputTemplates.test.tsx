/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as templateService from 'services/template-ng'
import VerifyStepMonitoredServiceInputTemplates, {
  VerifyStepMonitoredServiceInputTemplatesProps
} from '../VerifyStepMonitoredServiceInputTemplates'

jest.mock('services/cv', () => {
  return {
    useGetTemplateInputSetYaml: jest.fn().mockImplementation(() => {
      return {
        data: {},
        refetch: jest.fn(),
        error: null,
        loading: false,
        cancel: jest.fn()
      }
    })
  }
})

jest.spyOn(templateService, 'useGetTemplate').mockImplementation(
  () =>
    ({
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: true,
      cancel: jest.fn()
    } as any)
)

jest.mock('framework/Templates/TemplateSelectorContext/useTemplateSelector', () => ({
  useTemplateSelector: jest.fn().mockReturnValue({
    getTemplate: jest.fn().mockImplementation(() => ({ template: {}, isCopied: false }))
  })
}))

jest.mock('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment', () => ({
  useGetHarnessServices: () => ({
    serviceOptions: [
      { label: 'service1', value: 'service1' },
      { label: 'AppDService101', value: 'AppDService101' }
    ]
  }),
  useGetHarnessEnvironments: () => {
    return {
      environmentOptions: [
        { label: 'env1', value: 'env1' },
        { label: 'AppDTestEnv1', value: 'AppDTestEnv1' }
      ]
    }
  }
}))

const WrapperComponent = (props: VerifyStepMonitoredServiceInputTemplatesProps): JSX.Element => {
  return (
    <TestWrapper>
      <VerifyStepMonitoredServiceInputTemplates {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for VerifyStepMonitoredServiceInputTemplatesProps', () => {
  test('Verify if correct template inputs are rendered in the verify step', async () => {
    const props = {
      allowableTypes: [
        MultiTypeInputType.FIXED,
        MultiTypeInputType.RUNTIME,
        MultiTypeInputType.EXPRESSION
      ] as AllowedTypesWithRunTime[],
      healthSources: [],
      healthSourcesVariables: [],
      versionLabel: '1.0',
      monitoredServiceTemplateRef: 'monitored-service',
      serviceAndEnv: {
        serviceRef: 'service-1',
        environmentRef: 'env-1'
      }
    }

    const { getByText } = render(<WrapperComponent {...props} />)
    // validate service and env.
    expect(getByText('service')).toBeInTheDocument()
    expect(getByText('environment')).toBeInTheDocument()
  })
})
