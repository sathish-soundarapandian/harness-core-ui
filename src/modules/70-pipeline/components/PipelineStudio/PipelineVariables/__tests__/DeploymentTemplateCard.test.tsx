/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { metaMap, originalDeploymentTemplate, deploymentTemplate } from './deploymentTemplateMocks'
import DeploymentTemplateCard from '../Cards/DeploymentTemplateCard'

jest.mock('@connectors/pages/connectors/hooks/useGetConnectorsListHook/useGetConectorsListHook', () => ({
  useGetConnectorsListHook: jest.fn().mockReturnValue({
    loading: false,
    categoriesMap: {},
    connectorsList: ['K8sCluster'],
    connectorCatalogueOrder: ['CLOUD_PROVIDER']
  })
}))

describe('DeploymentTemplateCard test', () => {
  test('renders init', async () => {
    const { container } = render(
      <TestWrapper>
        <DeploymentTemplateCard
          deploymentTemplate={deploymentTemplate as any}
          originalDeploymentTemplate={originalDeploymentTemplate as any}
          unresolvedDeploymentTemplate={{} as any}
          metadataMap={metaMap as any}
          allowableTypes={[]}
          stepsFactory={{ getStep: jest.fn(() => ({ hasDelegateSelectionVisible: true })) } as any}
          updateDeploymentTemplate={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('renders when name is not set', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentTemplateCard
          deploymentTemplate={deploymentTemplate as any}
          originalDeploymentTemplate={{ ...originalDeploymentTemplate, name: 'Deployment Template Name' } as any}
          unresolvedDeploymentTemplate={{} as any}
          metadataMap={metaMap as any}
          allowableTypes={[]}
          stepsFactory={{ getStep: jest.fn(() => ({ hasDelegateSelectionVisible: true })) } as any}
          updateDeploymentTemplate={jest.fn()}
        />
      </TestWrapper>
    )
    expect(getByText('Deployment Template: Deployment Template Name')).toBeDefined()

    expect(container).toMatchSnapshot()
  })
})
