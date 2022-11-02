/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const SLODetailsData = {
  metaData: {},
  resource: {
    serviceLevelObjectiveV2: {
      orgIdentifier: 'default',
      projectIdentifier: 'project1',
      identifier: 'new_slov2',
      name: 'new slov2',
      tags: {},
      userJourneyRefs: ['Second_Journey'],
      sloTarget: {
        type: 'Rolling',
        sloTargetPercentage: 87.0,
        spec: {
          periodLength: '3d'
        }
      },
      type: 'Composite',
      spec: {
        serviceLevelObjectivesDetails: [
          {
            serviceLevelObjectiveRef: 'hHJYxnUFTCypZdmYr0Q0tQ',
            weightagePercentage: 50.0
          },
          {
            serviceLevelObjectiveRef: '7b-_GIZxRu6VjFqAqqdVDQ',
            weightagePercentage: 50.0
          }
        ]
      },
      notificationRuleRefs: []
    },
    createdAt: 1666181322626,
    lastModifiedAt: 1666181322626
  },
  responseMessages: []
}

export const rolling = {
  type: 'Rolling',
  sloTargetPercentage: 87.0,
  spec: {
    periodLength: '3d'
  }
}

export const calendarWeekly = {
  type: 'Calender',
  sloTargetPercentage: 77,
  spec: {
    type: 'Weekly',
    spec: {
      dayOfWeek: 'Fri'
    }
  }
}

export const calendarMonthly = {
  type: 'Calender',
  sloTargetPercentage: 77,
  spec: {
    type: 'Monthly',
    spec: {
      dayOfMonth: '4'
    }
  }
}

export const calendarQuarterly = {
  type: 'Calender',
  sloTargetPercentage: 99,
  spec: {
    type: 'Quarterly',
    spec: {}
  }
}
