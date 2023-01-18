/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const HarnessFFMockData = {
  metaData: {},
  resource: {
    id: 'fWjG6GwTSN-HtyqsgK564g',
    accountId: '-k53qRQAQ1O7DBLb9ACnjQ',
    category: 'FeatureFlag' as any,
    changeSourceIdentifier: 'featureFlag',
    orgIdentifier: 'cvng',
    projectIdentifier: 'SRM_PREQA_Sign_Off_Automation',
    serviceIdentifier: 'demo',
    serviceName: 'demo',
    monitoredServiceIdentifier: 'demo_prod',
    envIdentifier: 'prod',
    environmentName: 'prod',
    name: 'CV Trial Limit',
    eventTime: 1633961702460,
    metadata: {
      internalChangeEvent: {
        internalLinkToEntity: {
          action: 'REDIRECT_URL',
          url: '/account/wFHXHD0RRQWoO8tIZT5YVw/cf/orgs/EngOps/projects/testproject_2/feature-flags'
        },
        eventDescriptions: [
          `Feature Flag turned off`,
          `A rule was added with clauses`,
          `Target "Luis" was added for Variation false`
        ],
        changeEventDetailsLink: {
          action: 'FETCH_DIFF_DATA',
          url: '/cf/admin/objects/8f2b80d9-c08d-473b-820d-7ad0f0b12e41,016b1ec3-e638-474a-ae02-2d5bb99e6f1b'
        }
      },
      updatedBy: 'karan.saraswat@harness.io',
      activityType: 'FEATURE_FLAG',
      eventStartTime: 1633961702460,
      eventEndTime: 1633962499782
    },
    type: 'HarnessFF' as any
  },
  responseMessages: []
}

export const HarnessFFYAMLResponse = {
  data: {
    objectsnapshots: [
      {
        id: '8f2b80d9-c08d-473b-820d-7ad0f0b12e41',
        value: {
          archived: false,
          defaultOffVariation: 'false',
          defaultOnVariation: 'true',
          envProperties: {
            defaultServe: {
              variation: 'true'
            },
            environment: 'stage',
            offVariation: 'false',
            rules: [],
            state: 'off',
            variationMap: null
          },
          identifier: 'test',
          kind: 'boolean',
          name: 'test',
          owner: ['conor.murray@harness.io'],
          permanent: false,
          prerequisites: [],
          project: 'conor',
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
      {
        id: '016b1ec3-e638-474a-ae02-2d5bb99e6f1b',
        value: {
          archived: false,
          defaultOffVariation: 'false',
          defaultOnVariation: 'true',
          envProperties: {
            defaultServe: {
              variation: 'true'
            },
            environment: 'stage',
            offVariation: 'false',
            rules: [],
            state: 'on',
            variationMap: null
          },
          identifier: 'test',
          kind: 'boolean',
          name: 'test',
          owner: ['conor.murray@harness.io'],
          permanent: false,
          prerequisites: [],
          project: 'conor',
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
      }
    ]
  },
  status: 'SUCCESS'
}
