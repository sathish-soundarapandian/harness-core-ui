import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponsePMSPipelineResponseDTO } from 'services/pipeline-ng'

export const PipelineResponse: UseGetReturnData<ResponsePMSPipelineResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      ngPipeline: {
        pipeline: {
          name: 'teststas',
          identifier: 'teststasid',
          description: '',
          tags: null,
          variables: null,
          metadata: null
        }
      },
      executionsPlaceHolder: [],
      yamlPipeline:
        'pipeline:\n  name: testsdfsdf\n  identifier: testqqq\n  description: ""\n  stages:\n    - stage:\n        name: asd\n        identifier: asd\n        description: ""\n        type: Deployment\n        spec:\n          service:\n            identifier: asd\n            name: asd\n            description: ""\n            serviceDefinition:\n              type: Ssh\n              spec:\n                artifacts:\n                  sidecars: []\n                  primary:\n                    type: Dockerhub\n                    spec:\n                      connectorRef: org.docker\n                      imagePath: asd\n                manifests: []\n                artifactOverrideSets: []\n                manifestOverrideSets: []\n          execution:\n            steps:\n              - step:\n                  name: Rollout Deployment\n                  identifier: rolloutDeployment\n                  type: K8sRollingDeploy\n                  spec:\n                    timeout: 10m\n                    skipDryRun: false\n            rollbackSteps:\n              - step:\n                  name: Rollback Rollout Deployment\n                  identifier: rollbackRolloutDeployment\n                  type: K8sRollingRollback\n                  spec:\n                    timeout: 10m\n          infrastructure:\n            environment:\n              name: qa\n              identifier: qa\n              description: ""\n              type: PreProduction\n            infrastructureDefinition:\n              type: KubernetesDirect\n              spec:\n                connectorRef: <+input>\n                namespace: <+input>\n                releaseName: <+input>\n'
    } as any,
    correlationId: '7a84d477-4549-4026-8113-a02730b4f7c5'
  }
}
