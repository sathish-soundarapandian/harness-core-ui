import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseMapStringString, ResponseSetString } from 'services/cd-ng'

export const tagsResponse: UseGetReturnData<ResponseSetString> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: ['tag1', 'tag1']
  }
}

export const regionsResponse: UseGetReturnData<ResponseMapStringString> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      region1: 'region-1',
      region2: 'region-2'
    }
  }
}
