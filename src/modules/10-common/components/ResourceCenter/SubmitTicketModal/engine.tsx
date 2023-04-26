import React from 'react'
import { buildSearchEngine } from '@coveo/headless'
import { useGetCoveoToken } from 'services/resourcegroups'

export function useCoveoEngine(): any {
  const [token, setToken] = React.useState<string>('dummyToken')
  const { data } = useGetCoveoToken({})

  React.useEffect(() => {
    if (data) {
      const responseToken = data.data?.token
      if (responseToken) {
        setToken(responseToken)
      }
    }
  }, [data])
  return {
    headlessEngine: buildSearchEngine({
      configuration: {
        organizationId: 'harnessproductionp9tivsqy',
        accessToken: token
      }
    })
  }
}
