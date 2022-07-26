/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'
import type {
  ResponseHarnessApprovalInstanceAuthorization,
  ResponseApprovalInstanceResponse
} from 'services/pipeline-ng'

export const mockAuthData: UseGetMockDataWithMutateAndRefetch<ResponseHarnessApprovalInstanceAuthorization> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: false,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      authorized: true
    }
  }
}

export const mockAuthDataLoading: UseGetMockDataWithMutateAndRefetch<ResponseHarnessApprovalInstanceAuthorization> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: true,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      authorized: true
    }
  }
}

export const mockAuthDataAuthFalse: UseGetMockDataWithMutateAndRefetch<ResponseHarnessApprovalInstanceAuthorization> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: false,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      authorized: false,
      reason: 'User is not authorised'
    }
  }
}

export const mockApprovalData: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: false,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      type: 'HarnessApproval',
      id: 'approvalInstanceId',
      status: 'WAITING',
      details: {
        someDetail: 'someDetail'
      }
    }
  }
}

export const mockJiraApprovalData: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: false,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      type: 'JiraApproval',
      id: 'approvalInstanceId',
      status: 'WAITING',
      details: {
        someDetail: 'someDetail',
        issue: {
          key: 'jiraIssueKey'
        }
      }
    }
  }
}

export const mockApprovalDataLoading: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: true,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      type: 'HarnessApproval',
      id: 'approvalInstanceId',
      status: 'WAITING',
      details: {
        someDetail: 'someDetail'
      }
    }
  }
}

export const mockJiraApprovalDataLoading: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: true,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      type: 'JiraApproval',
      id: 'approvalInstanceId',
      status: 'WAITING',
      details: {
        someDetail: 'someDetail'
      }
    }
  }
}

export const mockApprovalDataError: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: false,
  // eslint-disable-next-line
  // @ts-ignore
  error: 'someerror',
  data: {
    correlationId: '',
    status: 'ERROR',
    metaData: null as unknown as undefined,
    data: {
      type: 'HarnessApproval',
      id: 'approvalInstanceId',
      status: 'FAILED',
      details: {}
    }
  }
}

export const mockJiraApprovalDataError: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: false,
  // eslint-disable-next-line
  // @ts-ignore
  error: 'someerror',
  data: {
    correlationId: '',
    status: 'ERROR',
    metaData: null as unknown as undefined,
    data: {
      type: 'JiraApproval',
      id: 'approvalInstanceId',
      status: 'FAILED',
      details: {}
    }
  }
}

export const mockServiceNowApprovalDataLoading: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: true,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      type: 'ServiceNowApproval',
      id: 'approvalInstanceId',
      status: 'WAITING',
      details: {
        someDetail: 'someDetail'
      }
    }
  }
}

export const mockServiceNowApprovalData: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: false,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      type: 'ServiceNowApproval',
      id: 'approvalInstanceId',
      status: 'WAITING',
      details: {
        someDetail: 'someDetail',
        ticket: {
          key: 'ServiceNowIssueKey'
        }
      }
    }
  }
}

export const mockServiceNowApprovalDataError: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: false,
  // eslint-disable-next-line
  // @ts-ignore
  error: 'someerror',
  data: {
    correlationId: '',
    status: 'ERROR',
    metaData: null as unknown as undefined,
    data: {
      type: 'ServiceNowApproval',
      id: 'approvalInstanceId',
      status: 'FAILED',
      details: {}
    }
  }
}

export const mockCustomApprovalDataLoading: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: true,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      type: 'CustomApproval',
      id: 'approvalInstanceId',
      status: 'WAITING',
      details: {
        someDetail: 'someDetail'
      }
    }
  }
}

export const mockCustomApprovalData: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: false,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      type: 'CustomApproval',
      id: 'approvalInstanceId',
      status: 'WAITING',
      details: {
        someDetail: 'someDetail'
      }
    }
  }
}

export const mockCustomApprovalDataError: UseGetMockDataWithMutateAndRefetch<ResponseApprovalInstanceResponse> = {
  refetch: jest.fn(),
  mutate: jest.fn(),
  loading: false,
  // eslint-disable-next-line
  // @ts-ignore
  error: 'someerror',
  data: {
    correlationId: '',
    status: 'ERROR',
    metaData: null as unknown as undefined,
    data: {
      type: 'CustomApproval',
      id: 'approvalInstanceId',
      status: 'FAILED',
      details: {}
    }
  }
}
