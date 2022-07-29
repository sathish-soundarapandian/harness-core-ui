import React from 'react'
import { render } from '@testing-library/react'
import { MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { SshServiceSpecInputSetMode } from '../SshServiceSpecInputSetMode'

describe('<SshServiceSpecInputSetMode /> tests', () => {
  test('snapshot test for ssh service spec input set mode', () => {
    const { container } = render(
      <TestWrapper>
        <SshServiceSpecInputSetMode
          stageIdentifier=""
          allowableTypes={[MultiTypeInputType.EXPRESSION]}
          initialValues={{}}
          allValues={{
            artifacts: {
              primary: {
                type: 'ArtifactoryRegistry',
                spec: {}
              }
            }
          }}
          template={{
            manifests: [
              {
                manifest: {
                  identifier: 'config_1',
                  spec: {},
                  type: 'K8sManifest'
                }
              }
            ],
            configFiles: [
              {
                configFile: {
                  identifier: 'config_1',
                  spec: { store: { type: 'Harness', spec: {} } }
                }
              }
            ],
            variables: [
              {
                type: 'String',
                description: 'SshVariable'
              }
            ]
          }}
          stepViewType={StepViewType.DeploymentForm}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
