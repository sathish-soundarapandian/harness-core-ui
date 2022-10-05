/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export default {
  details: {
    governanceMetadata: {
      account_id: 'csfR3zFlRxCBKSDoOsvXpA',
      action: 'onsave',
      created: 1663932740299,
      details: [],
      entity: 'onboarding_flag_1',
      entity_metadata: '%7B%22entityName%22:%22Onboarding%20Flag%201%22%7D',
      id: 0,
      input: {
        flag: {
          createdAt: 1663932739913,
          defaultOffVariation: 'false',
          defaultOnVariation: 'true',
          envProperties: [
            {
              defaultServe: {
                variation: 'true'
              },
              environment: 'dummy',
              offVariation: 'false',
              pipelineConfigured: false,
              rules: [],
              state: 'off',
              variationMap: null
            }
          ],
          identifier: 'onboarding_flag_1',
          kind: 'boolean',
          name: 'Onboarding Flag 1',
          owner: [''],
          prerequisites: [],
          project: 'dummy',
          results: null,
          services: [],
          tags: [],
          variations: [
            {
              identifier: 'true',
              name: 'True',
              value: 'true'
            },
            {
              identifier: 'false',
              name: 'False',
              value: 'false'
            }
          ]
        }
      },
      org_id: 'dummy',
      project_id: 'dummy',
      status: 'pass',
      type: 'flag'
    }
  }
}
