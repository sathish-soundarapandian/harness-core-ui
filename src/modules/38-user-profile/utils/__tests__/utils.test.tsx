import type { SCMData } from '@user-profile/modals/SourceCodeManager/views/SourceCodeManagerForm'
import { getAuthentication, getFormDataBasedOnSCMType } from '../utils'
import {
  accountIdentifier,
  mockGithubSCM,
  mockBitBucketSCM,
  mockSecretResponse,
  mockUsernamePasswordAuthFormdata,
  mockUsernameTokenAuthFormdata
} from './mockData'

const getSecret = jest.fn(() => mockSecretResponse)

jest.mock('services/cd-ng', () => ({
  getSecretV2Promise: jest.fn().mockImplementation(() => getSecret())
}))

describe('User profile utils test', () => {
  test('getAuthentication test for authType UsernamePassword', () => {
    const authData = getAuthentication(mockUsernamePasswordAuthFormdata as SCMData)
    expect(authData).toStrictEqual({
      spec: {
        spec: {
          passwordRef: 'account.dummySecret',
          username: 'dev'
        },
        type: 'UsernamePassword'
      },
      type: 'Http'
    })
  })

  test('getAuthentication test for authType UsernameToken', () => {
    const authData = getAuthentication(mockUsernameTokenAuthFormdata as SCMData)
    expect(authData).toStrictEqual({
      spec: {
        spec: {
          tokenRef: 'account.dummySecret',
          username: 'dev'
        },
        type: 'UsernameToken'
      },
      type: 'Http'
    })
  })

  test('getFormDataBasedOnSCMType should return required gitHub data for form', async () => {
    const gitHubFormData = await getFormDataBasedOnSCMType(mockGithubSCM, accountIdentifier)
    expect(gitHubFormData).toStrictEqual({
      name: 'scmOne',
      authType: 'UsernameToken',
      accessToken: {
        accountIdentifier: 'dummyAccount',
        identifier: 'dummySecret',
        name: 'dummySecret',
        referenceString: 'account.dummySecret'
      },
      username: { type: 'TEXT', value: 'dev' }
    })
  })

  test('getFormDataBasedOnSCMType should return required bitBucket data for form', async () => {
    const bitBucketFormData = await getFormDataBasedOnSCMType(mockBitBucketSCM, accountIdentifier)
    expect(bitBucketFormData).toStrictEqual({
      authType: 'UsernamePassword',
      name: 'scmTwo',
      password: {
        accountIdentifier: 'dummyAccount',
        identifier: 'dummySecret',
        name: 'dummySecret',
        referenceString: 'account.dummySecret'
      },
      username: { type: 'TEXT', value: 'dev' }
    })
  })
})
