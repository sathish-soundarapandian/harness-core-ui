/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const getMockFor_useGetPipeline = (): any => ({
  data: {
    status: 'SUCCESS',
    data: {
      yamlPipeline:
        'version: 1\nname: Yaml Simp 2\ninputs:\n  image:\n    type: string\n    desc: image name\n    default: golang\n    required: true\n  repo:\n    type: string\n    desc: repository name\n    required: true\n    prompt: true\nrepository:\n  connector: account.github\n  name: <+inputs.repo>\nstages:\n  - name: output variable\n    type: ci\n    spec:\n      steps:\n        - name: one test\n          type: script\n          spec:\n            image: <+inputs.image>\n            run: export foo=bar\n            shell: sh\n            outputs:\n              - foo\n        - name: two\n          type: script\n          spec:\n            image: alpine\n            run: echo <+steps.one_test.output.outputVariables.foo>\n            pull: always\n',
      entityValidityDetails: { valid: true, invalidYaml: null },
      modules: [],
      storeType: 'INLINE'
    },
    metaData: null,
    correlationId: 'edd182f2-93fa-44cf-9990-d9c21af34b3b'
  }
})

export const getMockFor_Generic_useMutate = (mutateMock?: jest.Mock): any => ({
  loading: false,
  refetch: jest.fn(),
  mutate:
    mutateMock ||
    jest.fn().mockResolvedValue({
      data: {
        correlationId: '',
        status: 'SUCCESS',
        metaData: null,
        data: {}
      }
    })
})

export const getMockFor_useGetTemplateFromPipeline = (): any => ({
  mutate: jest.fn().mockResolvedValue({
    inputs: {
      image: { prompt: false, required: true, default: 'golang', type: 'string', desc: 'image name' },
      repo: { prompt: true, required: true, type: 'string', desc: 'repository name' }
    },
    repository: {
      reference: {
        type: { prompt: false, required: true, type: 'string', enums: ['branch', 'tag', 'pr'] },
        value: { prompt: false, required: true, type: 'string' }
      }
    }
  })
})
