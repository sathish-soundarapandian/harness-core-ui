export const addHashInCypressURLBasedOnBrowserRouter = () => {
  let path = '#/'
  // since urls where above functions is used loaded before the app loads, so window.browserRouterEnabled cannot be accessed
  // so using  the value  browserRouterEnabled from cypress envirnoment
  // @ts-ignore
  if (Cypress.env('browserRouterEnabled')) {
    path = ''
  }
  return path
}
