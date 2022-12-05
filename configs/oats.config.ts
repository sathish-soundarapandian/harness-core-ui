import { defineConfig } from '@harnessio/oats-cli'
import reactQueryPlugin from '@harnessio/oats-plugin-react-query'
import { mapKeys, omit } from 'lodash-es'

const fileHeader = `/*
* Copyright ${new Date().getFullYear()} Harness Inc. All rights reserved.
* Use of this source code is governed by the PolyForm Shield 1.0.0 license
* that can be found in the licenses directory at the root of this repository, also available at
* https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
*/`

export default defineConfig({
  services: {
    'cd-ng': {
      url: 'https://stress.harness.io/ng/api/swagger.json',
      output: 'src/services/cd-ng-rq',
      fileHeader,
      transformer(spec) {
        return {
          ...spec,
          components: {
            ...spec.components,
            schemas: omit(spec.components?.schemas, ['OauthSettings'])
          },
          paths: mapKeys(spec.paths, (_val, key) => `ng/api${key}`)
        }
      },
      genOnlyUsed: true,
      plugins: [
        reactQueryPlugin({
          customFetcher: 'services/fetcher',
          allowedOperationIds: [
            'getServicesYamlAndRuntimeInputs',
            'getServiceAccessList',
            'listGitSync',
            'getSourceCodeManagers'
          ],
          overrides: {
            getServicesYamlAndRuntimeInputs: {
              useQuery: true
            }
          }
        })
      ]
    },
    pipeline: {
      url: 'https://stress.harness.io/pipeline/api/swagger.json',
      output: 'src/services/pipeline-rq',
      fileHeader,
      genOnlyUsed: true,
      transformer(spec) {
        return {
          ...spec,
          paths: mapKeys(spec.paths, (_val, key) => `pipeline/api${key}`)
        }
      },
      plugins: [
        reactQueryPlugin({
          customFetcher: 'services/fetcher',
          allowedOperationIds: ['getPipelineSummary', 'validateTemplateInputs']
        })
      ]
    }
  }
})
