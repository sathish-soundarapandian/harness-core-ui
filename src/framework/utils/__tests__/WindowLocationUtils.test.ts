import { getLocationPathName } from '../WindowLocationUtils'
let windowSpy: any

beforeEach(() => {
  windowSpy = jest.spyOn(window, 'window', 'get')
})

afterEach(() => {
  windowSpy.mockRestore()
})
describe('Window Location Utils', () => {
  const browserRouterEnabledPath = 'browserRouterEnabledPath'
  const browserRouterEnabledPathNotEnabled = 'browserRouterEnabledPathNotEnabled'
  test('window location when borwserRouter is present', () => {
    windowSpy.mockImplementation(() => ({
      getHarnessLocationPathname: () => {
        return browserRouterEnabledPath
      }
    }))
    expect(getLocationPathName()).toBe(browserRouterEnabledPath)
  })
  test('window location when borwserRouter is not present', () => {
    windowSpy.mockImplementation(() => ({
      getHarnessLocationPathname: undefined,
      location: {
        pathname: browserRouterEnabledPathNotEnabled
      }
    }))
    expect(getLocationPathName()).toBe(browserRouterEnabledPathNotEnabled)
  })
})
