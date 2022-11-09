import { useGetLicensesAndSummary, GetLicensesAndSummaryQueryParams } from 'services/cd-ng'
import type { ModuleName } from 'framework/types/ModuleName'

export const useFetchLicenseUseAndSummary = (moduleName: ModuleName | string, accountId: string) => {
  const response = useGetLicensesAndSummary({
    queryParams: { moduleType: moduleName as GetLicensesAndSummaryQueryParams['moduleType'] },
    accountIdentifier: accountId,
    lazy: true
  })
  return response
}
