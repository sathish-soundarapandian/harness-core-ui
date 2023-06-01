/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GetDataError } from 'restful-react'
import type { Error, Failure, ResponsePipelineValidationResponseDTO } from 'services/pipeline-ng'

export const successValidationResult: ResponsePipelineValidationResponseDTO = {
  status: 'SUCCESS',
  data: {
    status: 'SUCCESS',
    startTs: 1677240396411,
    endTs: 1677240396592,
    policyEval: {
      id: 'id',
      deny: false,
      details: [
        {
          policySetId: '',
          deny: false,
          policyMetadata: [
            {
              policyId: '',
              policyName: 'custom stage shell script forbidden',
              severity: 'pass',
              denyMessages: [],
              status: 'pass',
              identifier: 'custom_stage_shell_script_forbidden',
              accountId: 'accountId',
              orgId: 'default',
              projectId: 'CD_Test',
              created: '1675951420844',
              updated: '1675951420844',
              error: ''
            }
          ],
          policySetName: 'custom stage shell script forbidden set',
          status: 'pass',
          identifier: 'custom_stage_shell_script_forbidden_set',
          created: '1675951465776',
          accountId: 'accountId',
          orgId: 'default',
          projectId: 'CD_Test'
        }
      ],
      message: '',
      timestamp: '1677240396592',
      status: 'pass',
      accountId: 'accountId',
      orgId: 'default',
      projectId: 'CD_Test',
      entity:
        'accountIdentifier%3AaccountId%2ForgIdentifier%3Adefault%2FprojectIdentifier%3ACD_Test%2FpipelineIdentifier%3Apip_23_feb',
      type: 'pipeline',
      action: 'onsave',
      created: '1677240396581'
    },
    templateValidationResponse: {
      validYaml: true,
      exceptionMessage: undefined
    },
    validateTemplateReconcileResponseDTO: {
      reconcileNeeded: true
    }
  },
  correlationId: 'correlationId'
}

export const terminatedValidationResult: ResponsePipelineValidationResponseDTO = {
  status: 'SUCCESS',
  data: {
    status: 'TERMINATED',
    startTs: 1678790262904,
    endTs: 1678790263029
  },
  correlationId: 'correlationId'
}

export const errorValidationResult: GetDataError<Failure | Error> = {
  message: 'Failed to fetch: 404 Not Found',
  data: {
    status: 'ERROR',
    code: 'ENTITY_NOT_FOUND',
    message: 'No Pipeline Validation Event found for uuid foo',
    correlationId: 'correlationId',
    responseMessages: [
      {
        code: 'ENTITY_NOT_FOUND',
        level: 'ERROR',
        message: 'No Pipeline Validation Event found for uuid foo',
        failureTypes: []
      }
    ]
  },
  status: 404
}

export const policyEvalFailureValidationResult: ResponsePipelineValidationResponseDTO = {
  status: 'SUCCESS',
  data: {
    status: 'FAILURE',
    startTs: 1678790262904,
    endTs: 1678790263029,
    policyEval: {
      id: 'id',
      deny: true,
      details: [
        {
          policySetId: '',
          deny: true,
          policyMetadata: [
            {
              policyId: '',
              policyName: 'custom stage shell script forbidden',
              severity: 'error',
              denyMessages: ["custom stage 's1' has step 'Shell Script_1' that is forbidden type 'ShellScript'"],
              status: 'error',
              identifier: 'custom_stage_shell_script_forbidden',
              accountId: 'accountId',
              orgId: 'default',
              projectId: 'projectId',
              created: '1675886348243',
              updated: '1675886348243',
              error: ''
            }
          ],
          policySetName: 'custom stage shell script forbidden set',
          status: 'error',
          identifier: 'custom_stage_shell_script_forbidden_set',
          created: '1675886558158',
          accountId: 'accountId',
          orgId: 'default',
          projectId: 'projectId'
        },
        {
          policySetId: '',
          deny: true,
          policyMetadata: [
            {
              policyId: '',
              policyName: 'custom stage shell script forbidden',
              severity: 'error',
              denyMessages: ["custom stage 's1' has step 'Shell Script_1' that is forbidden type 'ShellScript'"],
              status: 'error',
              identifier: 'custom_stage_shell_script_forbidden',
              accountId: 'accountId',
              orgId: 'default',
              projectId: 'projectId',
              created: '1675886348243',
              updated: '1675886348243',
              error: ''
            }
          ],
          policySetName: 'shellscript fail policy set',
          status: 'error',
          identifier: 'shellscript_fail_policy_set',
          created: '1678789753615',
          accountId: 'accountId',
          orgId: 'default',
          projectId: 'projectId'
        }
      ],
      message: '',
      timestamp: '1678790263029',
      status: 'error',
      accountId: 'accountId',
      orgId: 'default',
      projectId: 'projectId',
      entity:
        'accountIdentifier%3Aacid%2ForgIdentifier%3Adefault%2FprojectIdentifier%3Apid%2FpipelineIdentifier%3Apipid',
      type: 'pipeline',
      action: 'onsave',
      created: '1678790263016'
    },
    templateValidationResponse: {
      validYaml: true,
      exceptionMessage: undefined
    }
  },
  correlationId: 'correlationId'
}

export const templateFailureValidationResult: ResponsePipelineValidationResponseDTO = {
  status: 'SUCCESS',
  data: {
    status: 'FAILURE',
    startTs: 1681541151590,
    endTs: 1681541151687,
    templateValidationResponse: {
      validYaml: false,
      exceptionMessage: 'Template with template ID async_validation and version v1 not found.'
    }
  },
  correlationId: 'correlationId'
}

export const inProgressValidationResult: ResponsePipelineValidationResponseDTO = {
  status: 'SUCCESS',
  data: {
    status: 'IN_PROGRESS',
    startTs: 1677246727984,
    endTs: undefined,
    policyEval: undefined
  },
  correlationId: 'correlationId'
}
