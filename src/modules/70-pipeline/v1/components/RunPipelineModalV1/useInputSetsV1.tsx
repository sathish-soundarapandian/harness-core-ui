/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { isEmpty } from 'lodash-es'
import { useGetPipelineInputs } from 'services/pipeline-ng'

export interface useInputSetsProps {
  projectIdentifier: string
  orgIdentifier: string
  pipelineIdentifier: string
  accountId: string
  branch?: string
  repoIdentifier?: string
  connectorRef?: string
}

export type pipelineInputsV1 = { [key: string]: string }
export interface InputsYaml {
  inputs?: pipelineInputsV1
  repository?: {
    reference: { [key: string]: any }
  }
}

export function useInputSetsV1(props: useInputSetsProps) {
  const { branch, repoIdentifier, orgIdentifier, accountId, connectorRef, projectIdentifier, pipelineIdentifier } =
    props
  const {
    data: pipelineInputs,
    loading: loading,
    error: error
  } = useGetPipelineInputs({
    org: orgIdentifier,
    project: projectIdentifier,
    pipeline: pipelineIdentifier,
    queryParams: {
      repo_name: repoIdentifier,
      branch_name: branch,
      connector_ref: connectorRef
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json',
        'Harness-Account': `${accountId}`
      }
    }
  })

  const hasRuntimeInputs = !isEmpty(pipelineInputs?.inputs)
  const hasCodebaseInputs = !isEmpty(pipelineInputs?.repository)

  const inputSetYaml: InputsYaml = {}

  if (!isEmpty(pipelineInputs?.inputs)) {
    inputSetYaml.inputs = {}
    for (const key in pipelineInputs?.inputs) {
      inputSetYaml.inputs[key] = ''
      if (pipelineInputs?.inputs[key].default) {
        inputSetYaml.inputs[key] = pipelineInputs?.inputs[key].default
      }
    }
  }
  if (!isEmpty(pipelineInputs?.repository)) {
    inputSetYaml.repository = {
      reference: {}
    }
    for (const key in pipelineInputs?.repository?.reference) {
      inputSetYaml.repository.reference[key] = ''
    }
  }

  return { inputSets: pipelineInputs, inputSetYaml, hasRuntimeInputs, hasCodebaseInputs, loading, error }
}
