/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const emptyDowntimeResponse = {
  metaData: {},
  resource: {
    downtime: {},
    createdAt: 1666181322626,
    lastModifiedAt: 1666181322626
  },
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
      entityRefs: [
        {
          entityRef: 'test_run',
          enabled: true
        }
      ],
      spec: {
        type: 'Onetime',
        spec: {
          timezone: 'Asia/Calcutta',
          startTime: 1691747256,
          type: 'EndTime',
          spec: {
            endTime: 1690757256
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
      entityRefs: [
        {
          entityRef: 'test_run',
          enabled: true
        }
      ],
      spec: {
        type: 'Onetime',
        spec: {
          timezone: 'Asia/Calcutta',
          startTime: 1691747256,
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
          startTime: 1691747256,
          recurrenceEndTime: 1741847256,
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
      entityRefs: [
        {
          entityRef: 'test_run',
          enabled: true
        }
      ],
      enabled: true
    },
    createdAt: 1675159069035,
    lastModifiedAt: 1675176200691
  },
  responseMessages: []
}
