import * as Portal from 'services/portal'
import * as cdServices from 'services/cd-ng'

const regionMock = {
  resource: [
    {
      name: 'GovCloud (US-West)',
      value: 'us-gov-west-1'
    },
    {
      name: 'GovCloud (US-East)',
      value: 'us-gov-east-1'
    }
  ]
}

const capMock = {
  data: ['test', 'test-two']
}

const statusMock = {
  data: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM']
}

export const useCFCapabilitiesForAws = (error = false, loading = false) => {
  return jest
    .spyOn(cdServices, 'useCFCapabilitiesForAws')
    .mockImplementation(
      () => ({ loading, error: error && { message: 'error' }, data: !error && capMock, refetch: jest.fn() } as any)
    )
}
export const useListAwsRegions = (error = false, loading = false) => {
  return jest.spyOn(Portal, 'useListAwsRegions').mockImplementation(
    () =>
      ({
        loading,
        error: error && { message: 'error' },
        data: !error && regionMock,
        refetch: jest.fn()
      } as any)
  )
}
export const useCFStatesForAws = (error = false, loading = false) => {
  return jest.spyOn(cdServices, 'useCFStatesForAws').mockImplementation(
    () =>
      ({
        loading,
        error: error && { message: 'error' },
        data: !error && statusMock,
        refetch: jest.fn()
      } as any)
  )
}
export const useGetIamRolesForAws = (error?: boolean) => {
  return jest.spyOn(cdServices, 'useGetIamRolesForAws').mockImplementation(
    () =>
      ({
        loading: false,
        error: error && { message: 'error' },
        data: !error && { data: { iamRole: 'test' } },
        refetch: jest.fn()
      } as any)
  )
}
export const useGetConnector = () => {
  return jest
    .spyOn(cdServices, 'useGetConnector')
    .mockImplementation(() => ({ loading: false, error: null, data: {} } as any))
}
