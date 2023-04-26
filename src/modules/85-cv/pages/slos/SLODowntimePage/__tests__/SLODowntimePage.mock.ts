/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const monitoredServiceOptionsResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 4,
    pageItemCount: 4,
    pageSize: 10,
    content: [
      {
        identifier: 'demoservice_demoenv',
        name: 'demoservice_demoenv',
        serviceRef: 'demoservice',
        environmentRef: 'demoenv'
      },
      {
        identifier: 'newone_datadog',
        name: 'newone_datadog',
        serviceRef: 'newone',
        environmentRef: 'datadog'
      },
      {
        identifier: 'newone_datadogm',
        name: 'newone_datadogm',
        serviceRef: 'newone',
        environmentRef: 'datadogm'
      },
      {
        identifier: 'newone_demoenv',
        name: 'newone_demoenv',
        serviceRef: 'newone',
        environmentRef: 'demoenv'
      }
    ],
    pageIndex: 0,
    empty: false
  },
  correlationId: '09cafa47-8ea0-4f28-8b31-e62b01cb9055'
}

export const downtimeResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 4,
    pageItemCount: 4,
    pageSize: 10,
    content: [
      {
        identifier: 'all',
        name: 'all',
        category: 'Deployment',
        affectedEntities: [
          {
            serviceName: 'ALL',
            envName: 'ALL',
            monitoredServiceIdentifier: 'ALL'
          }
        ],
        description: 'Recurring downtime',
        duration: {
          durationType: 'Minutes',
          durationValue: 30
        },
        enabled: false,
        lastModified: {
          lastModifiedBy: 'admin@harness.io',
          lastModifiedAt: 1676290050470
        },
        spec: {
          type: 'Recurring',
          spec: {
            timezone: 'Asia/Calcutta',
            startDateTime: '2030-04-15 12:00 PM',
            recurrenceEndDateTime: '2031-04-15 12:00 PM',
            downtimeDuration: {
              durationType: 'Minutes',
              durationValue: 30
            },
            downtimeRecurrence: {
              recurrenceType: 'Week',
              recurrenceValue: 2
            }
          }
        }
      },
      {
        identifier: 'one_time',
        name: 'one time',
        category: 'ScheduledMaintenance',
        affectedEntities: [
          {
            serviceName: 'demo-service',
            envName: 'demo-env',
            monitoredServiceIdentifier: 'demoservice_demoenv'
          },
          {
            serviceName: 'newone',
            envName: 'datadog-m',
            monitoredServiceIdentifier: 'newone_datadogm'
          },
          {
            serviceName: 'newone',
            envName: 'datadog',
            monitoredServiceIdentifier: 'newone_datadog'
          }
        ],
        description: 'one time downtime',
        duration: {
          durationType: 'Minutes',
          durationValue: 30
        },
        downtimeStatusDetails: {
          status: 'Active',
          startTime: 1676385421,
          endTime: 1676386020,
          endDateTime: '2030-04-15 12:30 PM'
        },
        enabled: true,
        lastModified: {
          lastModifiedBy: '',
          lastModifiedAt: 1676289563056
        },
        spec: {
          type: 'Onetime',
          spec: {
            timezone: 'Asia/Calcutta',
            startDateTime: '2031-04-15 12:00 PM',
            spec: {
              downtimeDuration: {
                durationType: 'Minutes',
                durationValue: 30
              }
            },
            type: 'Duration'
          }
        }
      },
      {
        identifier: 'test90',
        name: 'test90',
        category: 'Deployment',
        affectedEntities: [
          {
            serviceName: 'newone',
            envName: 'datadog',
            monitoredServiceIdentifier: 'newone_datadog'
          },
          {
            serviceName: 'newone',
            envName: 'testing env',
            monitoredServiceIdentifier: 'newone_testing_env'
          },
          {
            serviceName: 'prommock',
            envName: 'gcp-l',
            monitoredServiceIdentifier: 'prommock_gcpl'
          }
        ],
        description: 'Recurring downtime',
        duration: {
          durationType: 'Minutes',
          durationValue: 30
        },
        enabled: true,
        lastModified: {
          lastModifiedBy: '',
          lastModifiedAt: 1675945626642
        },
        spec: {
          type: 'Recurring',
          spec: {
            timezone: 'Asia/Calcutta',
            startDateTime: '2030-04-15 12:00 PM',
            recurrenceEndDateTime: '2031-04-15 12:00 PM',
            downtimeDuration: {
              durationType: 'Minutes',
              durationValue: 30
            },
            downtimeRecurrence: {
              recurrenceType: 'Week',
              recurrenceValue: 2
            }
          }
        }
      },
      {}
    ],
    pageIndex: 0,
    empty: false
  },
  correlationId: '0aa743b6-5ab3-4a85-aa82-6f90097d288e'
}

export const downtimeHistoryResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 10,
    content: [
      {
        identifier: 'one_time_test',
        name: 'one time test',
        category: 'Deployment',
        affectedEntities: [
          {
            serviceName: 'newone',
            envName: 'demo-env',
            monitoredServiceIdentifier: 'newone_demoenv'
          }
        ],
        duration: {
          durationType: 'Minutes',
          durationValue: 5
        },
        startDateTime: '2029-04-15 12:00 PM',
        endDateTime: '2029-04-15 12:30 PM',
        downtimeDetails: {
          type: 'Onetime',
          spec: {
            timezone: 'Asia/Baghdad',
            startDateTime: '2030-04-15 12:00 PM',
            spec: {
              downtimeDuration: {
                durationType: 'Minutes',
                durationValue: 5
              }
            },
            type: 'Duration'
          }
        }
      },
      {
        identifier: 'one_time',
        name: 'one time',
        category: 'ScheduledMaintenance',
        affectedEntities: [
          {
            serviceName: 'demo-service',
            envName: 'demo-env',
            monitoredServiceIdentifier: 'demoservice_demoenv'
          },
          {
            serviceName: 'newone',
            envName: 'datadog',
            monitoredServiceIdentifier: 'newone_datadog'
          }
        ],
        duration: {
          durationType: 'Minutes',
          durationValue: 5
        },
        startDateTime: '2030-04-14 12:00 PM',
        endDateTime: '2030-04-14 12:30 PM',
        downtimeDetails: {
          type: 'Onetime',
          spec: {
            timezone: 'Asia/Bangkok',
            startDateTime: '2030-03-15 12:00 PM',
            spec: {
              downtimeDuration: {
                durationType: 'Minutes',
                durationValue: 5
              }
            },
            type: 'Duration'
          }
        }
      },
      {}
    ],
    pageIndex: 0,
    empty: false
  },
  correlationId: '619a26d2-9858-4364-bb02-056e4782a25a'
}
