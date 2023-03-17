/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { isStatusError, isStatusLoading, isStatusSuccess, ValidationStatus } from './ValidationUtils'
import css from './ValidationBadge.module.scss'

interface ValidationPopoverContentProps {
  status: ValidationStatus | undefined
  errorCount?: number
}

export function ValidationPopoverContent({
  status,
  errorCount = 1
}: ValidationPopoverContentProps): JSX.Element | null {
  const { getString } = useStrings()

  // todo: show popover content for loading status when API supports validation of multiple entities
  if (!status || isStatusLoading(status)) return null

  const isError = isStatusError(status)
  const isSuccess = isStatusSuccess(status)

  return (
    <div className={css.popoverContent}>
      <Text
        font={{ variation: FontVariation.BODY2 }}
        color={Color.GREY_0}
        margin={{ bottom: 'xsmall' }}
        {...(isError && { icon: 'warning-sign', iconProps: { color: Color.RED_700 } })}
        {...(isSuccess && { icon: 'tick', iconProps: { color: Color.PRIMARY_4 } })}
      >
        {isError && getString('pipeline.validation.nIssuesFound', { n: errorCount })}
        {isSuccess && getString('pipeline.validation.validationSuccessful')}
      </Text>
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_100}>
        {isError && getString('pipeline.validation.errorText')}
        {isSuccess && getString('pipeline.validation.validationSuccessfulText')}
      </Text>
    </div>
  )
}

// todo: show this when API supports validation of multiple entities
// function ValidatingPopoverContent(): JSX.Element {
//   const { getString } = useStrings()

//   return (
//     <div className={css.popoverContent}>
//       <Text
//         icon="steps-spinner"
//         iconProps={{ color: Color.PRIMARY_5 }}
//         font={{ variation: FontVariation.BODY2 }}
//         color={Color.GREY_0}
//         margin={{ bottom: 'xsmall' }}
//       >
//         {getString('common.validationInProgress')}
//       </Text>
//       <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_100}>
//         {getString('pipeline.validation.validationInProgressText')}
//       </Text>
//     </div>
//   )
// }
