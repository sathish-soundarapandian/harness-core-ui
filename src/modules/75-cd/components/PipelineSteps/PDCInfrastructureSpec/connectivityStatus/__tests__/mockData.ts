/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const mockData = {
  failure: {
    identifier: 'failureIdentifier',
    host: 'localhost',
    tags: ['tag1'],
    status: 'FAILURE',
    resetError: jest.fn()
  },
  unknownType: {
    identifier: 'unknownIdentifier',
    host: '1.2.3.4',
    tags: ['tag2'],
    status: 'UNKNOWN',
    resetError: jest.fn()
  },
  success: {
    identifier: 'successIdentifier',
    host: '2.2.2.2',
    tags: ['tag3'],
    status: 'SUCCESS',
    resetError: jest.fn()
  },
  failureWithErrorSummary: {
    identifier: 'failureIdentifier',
    host: 'localhost',
    tags: ['tag1'],
    status: {
      status: 'FAILURE',
      errorSummary: 'ErrorSummaryStatus'
    },
    resetError: jest.fn()
  }
}

export default mockData
