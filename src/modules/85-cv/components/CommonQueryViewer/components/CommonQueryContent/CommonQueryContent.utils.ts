import { isEmpty } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'

export const getRunQueryButtonTooltip = (
  query: string | undefined,
  isQueryFieldNotPresent: boolean,
  queryFieldIdentifier: string | undefined,
  getString: UseStringsReturn['getString']
): string => {
  let message = ''
  if (isEmpty(query) && !isQueryFieldNotPresent) {
    message = getString('cv.monitoringSources.commonHealthSource.query.enterQuery')
  } else if (isQueryFieldNotPresent && !isEmpty(query)) {
    message = getString('cv.monitoringSources.commonHealthSource.query.selectQueryField', { queryFieldIdentifier })
  } else if (isQueryFieldNotPresent && isEmpty(query)) {
    message = getString('cv.monitoringSources.commonHealthSource.query.enterQueryAndQueryField', {
      queryFieldIdentifier
    })
  }
  return message
}
