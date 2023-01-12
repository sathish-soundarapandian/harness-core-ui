/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockedUserJourneysData = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 100,
    content: [
      {
        createdAt: 1635416123988,
        lastModifiedAt: 1635416123988,
        userJourney: { identifier: 'journey3', name: 'journey-3' }
      },
      {
        createdAt: 1635415897583,
        lastModifiedAt: 1635415897583,
        userJourney: { identifier: 'journey2', name: 'journey-2' }
      },
      { createdAt: 1635415683365, lastModifiedAt: 1635415683365, userJourney: { identifier: 'Test1', name: 'Test-1' } }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: {},
  correlationId: '4084b7ee-176e-4b02-b618-0a54ffbe65c6'
}

export const expectedUserJourneyOptions = [
  {
    label: 'journey-3',
    value: 'journey3'
  },
  {
    label: 'journey-2',
    value: 'journey2'
  },
  {
    label: 'Test-1',
    value: 'Test1'
  }
]
