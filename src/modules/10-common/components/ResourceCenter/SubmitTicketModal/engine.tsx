import { buildSearchEngine } from '@coveo/headless'

export const headlessEngine = buildSearchEngine({
  configuration: {
    organizationId: 'harnessproductionp9tivsqy',
    accessToken:
      'eyJhbGciOiJIUzI1NiJ9.eyJzZWFyY2hIdWIiOiJXZWJzaXRlU2VhcmNoIiwidjgiOnRydWUsIm9yZ2FuaXphdGlvbiI6Imhhcm5lc3Nwcm9kdWN0aW9ucDl0aXZzcXkiLCJ1c2VySWRzIjpbeyJwcm92aWRlciI6IkVtYWlsIFNlY3VyaXR5IFByb3ZpZGVyIiwibmFtZSI6Imd1ZXN0IiwidHlwZSI6IlVzZXIifV0sInJvbGVzIjpbInF1ZXJ5RXhlY3V0b3IiXSwiZXhwIjoxNjc4NDMwMDE0LCJpYXQiOjE2NzgzNDM2MTR9.VwAminlvnyONMh3Kg0ZAePIVo5S3DvN_fBP-n6gYfo8'
  }
})
