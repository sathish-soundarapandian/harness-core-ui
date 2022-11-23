import { getLocationPathName } from '../WindowLocation'
let windowSpy: any

beforeEach(() => {
  windowSpy = jest.spyOn(window, 'window', 'get')
})

afterEach(() => {
  windowSpy.mockRestore()
})
describe('Window Location Utils', () => {
  const browserRouterEnabledPath = '/ng/'
  const browserRouterEnabledWithNameSpace = '/harnessNameSpace/ng/'
  const browserRouterEnabledPathNotEnabled = 'browserRouterEnabledPathNotEnabled'
  test('window location when borwserRouter is present', () => {
    windowSpy.mockImplementation(() => ({
      location: {
        pathname: browserRouterEnabledPathNotEnabled
      },
      browserRouterEnabled: true
    }))
    expect(getLocationPathName()).toBe(browserRouterEnabledPath)
  })
  test('window location when borwserRouter is present with namespace', () => {
    windowSpy.mockImplementation(() => ({
      location: {
        pathname: browserRouterEnabledPathNotEnabled
      },
      harnessNameSpace: 'harnessNameSpace',
      browserRouterEnabled: true
    }))
    expect(getLocationPathName()).toBe(browserRouterEnabledWithNameSpace)
  })
  test('window location when borwserRouter is not present', () => {
    windowSpy.mockImplementation(() => ({
      browserRouterEnabled: undefined,
      location: {
        pathname: browserRouterEnabledPathNotEnabled
      }
    }))
    expect(getLocationPathName()).toBe(browserRouterEnabledPathNotEnabled)
  })
})
