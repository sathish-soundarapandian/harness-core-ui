/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ButtonVariation, FontVariation, Button, Text, Card, OverlaySpinner, Color } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { ResponsePageUserAggregate, useGetAggregatedUsers, UserAggregate } from 'services/cd-ng'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import UserLabelBilling from './UserLabelBilling'
import css from './BillingPage.module.scss'

function BillingAdminsCard(): JSX.Element {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const [billingAdmins, setBillingAdmins] = useState<Array<UserAggregate>>([])
  const { mutate, loading: isFetchingBillingAdmins } = useGetAggregatedUsers({
    queryParams: { accountIdentifier: accountId }
  })

  useEffect(() => {
    mutate({ roleIdentifiers: [PermissionIdentifier.EDIT_LICENSE] }).then((response: ResponsePageUserAggregate) => {
      if (response.data?.content && response.data?.content?.length) {
        setBillingAdmins(response.data?.content)
      }
    })
  }, [])

  return (
    <OverlaySpinner show={isFetchingBillingAdmins}>
      <Card className={css.card}>
        <div className={css.adminAdd}>
          <Text color={Color.GREY_500} font={{ variation: FontVariation.CARD_TITLE }}>
            {getString('authSettings.billingInfo.billingAdmin')}
          </Text>
          <Button
            disabled
            tooltip={getString('common.featureComingSoon')}
            tooltipProps={{ isDark: true }}
            variation={ButtonVariation.LINK}
            text={getString('plusAdd')}
          />
        </div>
        <div>
          {billingAdmins[0] && (
            <UserLabelBilling
              name={billingAdmins[0].user.name as string}
              email={billingAdmins[0].user.email as string}
            />
          )}
        </div>
      </Card>
    </OverlaySpinner>
  )
}

export default BillingAdminsCard
