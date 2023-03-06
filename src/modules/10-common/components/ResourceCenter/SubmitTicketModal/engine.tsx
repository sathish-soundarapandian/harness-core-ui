import { buildSearchEngine } from '@coveo/headless'

export const headlessEngine = buildSearchEngine({
  configuration: {
    organizationId: 'harnessproductionp9tivsqy',
    accessToken:
      'eyJhbGciOiJIUzI1NiJ9.eyJzZWFyY2hIdWIiOiJXZWJzaXRlU2VhcmNoIiwidjgiOnRydWUsIm9yZ2FuaXphdGlvbiI6Imhhcm5lc3Nwcm9kdWN0aW9ucDl0aXZzcXkiLCJ1c2VySWRzIjpbeyJwcm92aWRlciI6IkVtYWlsIFNlY3VyaXR5IFByb3ZpZGVyIiwibmFtZSI6Imd1ZXN0IiwidHlwZSI6IlVzZXIifV0sInJvbGVzIjpbInF1ZXJ5RXhlY3V0b3IiXSwiZXhwIjoxNjc4MjE1Mzg5LCJpYXQiOjE2NzgxMjg5ODl9.DO89M1uZzD8OAlbYOR2sVpjkY38quzHPtWshtHV8OdI'
  }
})
