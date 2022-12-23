import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponsePMSPipelineResponseDTO } from 'services/pipeline-ng'

export const PipelineResponse: UseGetReturnData<ResponsePMSPipelineResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      yamlPipeline:
        'pipeline:\n  name: TG2\n  identifier: TG2\n  projectIdentifier: Kapil\n  orgIdentifier: default\n  tags: {}\n  stages:\n    - stage:\n        name: STG1\n        identifier: STG1\n        description: ""\n        type: Deployment\n        spec:\n          deploymentType: AzureWebApp\n          execution:\n            steps:\n              - step:\n                  type: AzureSlotDeployment\n                  name: ASD\n                  identifier: ASD\n                  spec:\n                    webApp: wan\n                    deploymentSlot: dp\n                  timeout: 20m\n            rollbackSteps: []\n          service:\n            serviceRef: AWA_TG4\n            serviceInputs:\n              serviceDefinition:\n                type: AzureWebApp\n                spec:\n                  artifacts:\n                    primary:\n                      primaryArtifactRef: <+input>\n                      sources: <+input>\n          environment:\n            environmentRef: TEST_TAMARA\n            deployToAll: false\n            infrastructureDefinitions:\n              - identifier: AWA_Infra\n        tags: {}\n        failureStrategies:\n          - onFailure:\n              errors:\n                - AllErrors\n              action:\n                type: StageRollback\n  description: mmmm\n',
      entityValidityDetails: {
        valid: true
      },
      modules: ['cd', 'pms']
    },
    correlationId: 'b897ea63-3a84-4439-8c13-5fa971ad904e'
  }
}
