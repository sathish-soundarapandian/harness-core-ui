import { useGetLicensesAndSummary, GetLicensesAndSummaryQueryParams } from 'services/cd-ng'
import type { ModuleName } from 'framework/types/ModuleName'
import { useParams } from 'react-router'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
const { accountId } = useParams<AccountPathProps>()
export const fetchLicenseUseAndSummary = (moduleName: ModuleName | string) => {
  const response = useGetLicensesAndSummary({
    queryParams: { moduleType: moduleName as GetLicensesAndSummaryQueryParams['moduleType'] },
    accountIdentifier: accountId
  })
  return response
}
