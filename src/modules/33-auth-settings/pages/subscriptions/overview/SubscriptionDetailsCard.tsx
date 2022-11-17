/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import moment from 'moment'
import { useParams } from 'react-router-dom'
import { Card, Heading, Layout, PageSpinner } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { StringsMap } from 'stringTypes'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useContactSalesMktoModal } from '@common/modals/ContactSales/useContactSalesMktoModal'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useExtendTrialLicense, StartTrialDTO, FeedbackFormDTO, useSaveFeedback } from 'services/cd-ng'
import { useToaster } from '@common/components'
import type { ModuleName } from 'framework/types/ModuleName'
import type { ModuleLicenseDTO } from 'services/cd-ng'
import {
  useExtendTrialOrFeedbackModal,
  FORM_TYPE,
  FeedbackFormValues
} from '@common/modals/ExtendTrial/useExtendTrialOrFeedbackModal'
import { Editions } from '@common/constants/SubscriptionTypes'
import SubscriptionDetailsCardFooter from './SubscriptionDetailsCardFooter'
import type { TrialInformation } from '../SubscriptionsPage'
import SubscriptionDetailsCardBody from './SubscriptionDetailsCardBody'
import pageCss from '../SubscriptionsPage.module.scss'

interface SubscriptionDetailsCardProps {
  accountName?: string
  licenseData?: ModuleLicenseDTO
  module: ModuleName
  trialInformation: TrialInformation
  refetchGetLicense?: () => void
}

const SubscriptionDetailsCard: React.FC<SubscriptionDetailsCardProps> = props => {
  const { accountName, module, licenseData, trialInformation, refetchGetLicense } = props
  const { days, expiryDate, isExpired, expiredDays, edition, isFreeOrCommunity } = trialInformation

  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const { currentUserInfo } = useAppStore()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()
  const { accountId } = useParams<AccountPathProps>()
  const { openMarketoContactSales, loading: loadingContactSales } = useContactSalesMktoModal({})

  const { mutate: extendTrial, loading: extendingTrial } = useExtendTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: saveFeedback, loading: sendingFeedback } = useSaveFeedback({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const handleFeedbackSubmit = async (values: FeedbackFormValues): Promise<void> => {
    try {
      await saveFeedback({
        accountId,
        moduleType: module as FeedbackFormDTO['moduleType'],
        email: currentUserInfo.email,
        score: Number(values.experience),
        suggestion: values.suggestion
      }).then(() => {
        if (isExpired) {
          refetchGetLicense?.()
        } else {
          closeExtendTrialOrFeedbackModal()
        }
      })
      showSuccess(getString('common.banners.trial.feedbackSuccess'))
    } catch (error) {
      showError(error.data?.message || error.message)
    }
  }

  const { openExtendTrialOrFeedbackModal, closeExtendTrialOrFeedbackModal } = useExtendTrialOrFeedbackModal({
    onSubmit: handleFeedbackSubmit,
    onCloseModal: () => {
      if (isExpired) {
        refetchGetLicense?.()
      }
    },
    module,
    expiryDateStr: moment(expiryDate).format('MMMM D YYYY'),
    formType: isExpired ? FORM_TYPE.EXTEND_TRIAL : FORM_TYPE.FEEDBACK,
    moduleDescription: getString(`${module.toLowerCase()}.continuous` as keyof StringsMap),
    loading: sendingFeedback
  })

  const handleExtendTrial = async (): Promise<void> => {
    try {
      const data = await extendTrial({
        moduleType: module as StartTrialDTO['moduleType'],
        edition: Editions.ENTERPRISE
      })
      handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module as any, data?.data)
      openExtendTrialOrFeedbackModal()
    } catch (error) {
      showError(error.data?.message)
    }
  }

  const loading = loadingContactSales || extendingTrial || sendingFeedback

  if (loading) {
    return <PageSpinner />
  }

  return (
    <Card className={pageCss.outterCard}>
      <Layout.Vertical spacing="xxlarge" flex={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Heading color={Color.BLACK} font={{ size: 'medium' }}>
          {getString('common.subscriptions.overview.details')}
        </Heading>
        <SubscriptionDetailsCardBody
          licenseData={licenseData}
          edition={edition}
          isFreeOrCommunity={isFreeOrCommunity}
          isExpired={isExpired}
          days={days}
          expiryDate={expiryDate}
          expiredDays={expiredDays}
          accountName={accountName}
        />
        <SubscriptionDetailsCardFooter
          openMarketoContactSales={openMarketoContactSales}
          handleExtendTrial={handleExtendTrial}
          licenseData={licenseData}
          module={module}
          isExpired={isExpired}
          expiredDays={expiredDays}
        />
      </Layout.Vertical>
    </Card>
  )
}

export default SubscriptionDetailsCard
