import React from 'react'
import { useGetOrganizationAggregateDTOList } from 'services/cd-ng'

export const useFreezeStudioData = ({ accountId }) => {
  const {
    loading: loadingOrgs,
    data: orgsData,
    refetch: refetchOrgs,
    error: orgsError
  } = useGetOrganizationAggregateDTOList({
    queryParams: { accountIdentifier: accountId },
    lazy: true
  })

  const [orgs, setOrgs] = React.useState([])
  // data.content[1].organizationResponse.organization.identifier
  React.useEffect(() => {
    refetchOrgs()
  }, [accountId])

  React.useEffect(() => {
    if (!loadingOrgs && orgsData?.data?.content) {
      const adaptedOrgsData = orgsData.data.content.map(org => {
        const organization = org?.organizationResponse?.organization
        return {
          label: organization?.name,
          value: organization?.identifier
        }
      })
      setOrgs(adaptedOrgsData)
    }
  }, [loadingOrgs])

  return {
    orgs
  }
}
