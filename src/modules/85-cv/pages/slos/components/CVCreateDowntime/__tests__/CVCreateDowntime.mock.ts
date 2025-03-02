/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const downtimeAssociatedMSs = {
  metaData: {},
  resource: [
    {
      createdAt: 1667974886637,
      lastModifiedAt: 1667974886637,
      monitoredService: {
        orgIdentifier: 'default',
        projectIdentifier: 'demokaran',
        identifier: 'newone_datadog',
        name: 'newone_datadog',
        type: 'Application',
        serviceRef: 'newone',
        environmentRef: 'datadog',
        serviceName: 'newone',
        environmentName: 'datadog',
        environmentRefList: ['datadog'],
        tags: {},
        sources: {
          healthSources: [],
          changeSources: [
            {
              name: 'Harness CD Next Gen',
              identifier: 'harness_cd_next_gen',
              type: 'HarnessCDNextGen',
              enabled: true,
              spec: {},
              category: 'Deployment'
            }
          ]
        },
        dependencies: [],
        notificationRuleRefs: [],
        template: {
          templateRef: 'account.new_demo',
          versionLabel: 'v1'
        },
        enabled: false
      }
    },
    {
      createdAt: 1671628160339,
      lastModifiedAt: 1671628160339,
      monitoredService: {
        orgIdentifier: 'default',
        projectIdentifier: 'demokaran',
        identifier: 'newone_gcpl',
        name: 'newone_gcpl',
        type: 'Application',
        description: '',
        serviceRef: 'newone',
        environmentRef: 'gcpl',
        serviceName: 'newone',
        environmentName: 'gcp-l',
        environmentRefList: ['gcpl'],
        tags: {},
        sources: {
          healthSources: [],
          changeSources: [
            {
              name: 'Harness CD Next Gen',
              identifier: 'harness_cd_next_gen',
              type: 'HarnessCDNextGen',
              enabled: true,
              spec: {},
              category: 'Deployment'
            }
          ]
        },
        dependencies: [],
        notificationRuleRefs: [],
        enabled: false
      }
    }
  ],
  responseMessages: []
}

export const oneTimeEndTimeBasedDowntimeResponse = {
  metaData: {},
  resource: {
    downtime: {
      name: 'SLO Downtime',
      identifier: 'SLO_Downtime',
      orgIdentifier: 'default',
      projectIdentifier: 'srm',
      description: 'Weekly downtime',
      category: 'Deployment',
      scope: 'Project',
      enabled: true,
      entitiesRule: {
        type: 'Identifiers',
        entityIdentifiers: [
          {
            entityRef: 'test_run',
            enabled: true
          }
        ],
        affectedEntity: null
      },
      spec: {
        type: 'Onetime',
        spec: {
          timezone: 'Asia/Calcutta',
          startDateTime: '2030-04-15 06:00 PM',
          type: 'EndTime',
          spec: {
            endDateTime: '2030-04-15 06:30 PM'
          }
        }
      }
    },
    createdAt: 1675159069035,
    lastModifiedAt: 1675176200691
  },
  responseMessages: []
}

export const oneTimeDurationBasedDowntimeResponse = {
  metaData: {},
  resource: {
    downtime: {
      name: 'test',
      identifier: 'test',
      orgIdentifier: 'default',
      projectIdentifier: 'srm',
      description: 'First downtime',
      scope: 'Project',
      category: 'Deployment',
      enabled: true,
      entitiesRule: {
        type: 'Identifiers',
        entityIdentifiers: [
          {
            entityRef: 'test_run',
            enabled: true
          }
        ],
        affectedEntity: null
      },
      spec: {
        type: 'Onetime',
        spec: {
          timezone: 'Asia/Calcutta',
          startDateTime: '2030-04-15 12:00 PM',
          type: 'Duration',
          spec: {
            downtimeDuration: {
              durationType: 'Minutes',
              durationValue: 30
            }
          }
        }
      }
    },
    createdAt: 1675159069035,
    lastModifiedAt: 1675176200691
  },
  responseMessages: []
}

export const recurrenceBasedDowntimeResponse = {
  metaData: {},
  resource: {
    downtime: {
      orgIdentifier: 'default',
      projectIdentifier: 'maintenance_window',
      identifier: 'test2',
      name: 'test2',
      description: 'Recurring downtime',
      tags: {},
      category: 'ScheduledMaintenance',
      scope: 'Project',
      spec: {
        type: 'Recurring',
        spec: {
          timezone: 'Asia/Bangkok',
          startDateTime: '2030-04-15 02:00 PM',
          recurrenceEndDateTime: '2031-04-15 02:00 PM',
          downtimeDuration: {
            durationType: 'Minutes',
            durationValue: 30
          },
          downtimeRecurrence: {
            recurrenceType: 'Week',
            recurrenceValue: 2
          }
        }
      },
      entitiesRule: {
        type: 'Identifiers',
        entityIdentifiers: [
          {
            entityRef: 'test_run',
            enabled: true
          }
        ],
        affectedEntity: null
      },
      enabled: true
    },
    createdAt: 1675159069035,
    lastModifiedAt: 1675176200691
  },
  responseMessages: []
}
