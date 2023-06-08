/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import moment from 'moment'
import cx from 'classnames'
import { capitalize, pick } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Text, Layout, Button, PageSpinner, ButtonVariation, ButtonSize } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings, UseStringsReturn } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { useToaster } from '@common/components'
import type { Module } from 'framework/types/ModuleName'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { useLocalStorage } from '@common/hooks/useLocalStorage'
import { useContactSalesMktoModal } from '@common/modals/ContactSales/useContactSalesMktoModal'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import {
  useExtendTrialLicense,
  useSaveFeedback,
  FeedbackFormDTO,
  useGetLicensesAndSummary,
  GetLicensesAndSummaryQueryParams
} from 'services/cd-ng'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useExtendTrialOrFeedbackModal,
  FORM_TYPE,
  FeedbackFormValues
} from '@common/modals/ExtendTrial/useExtendTrialOrFeedbackModal'
import css from './layouts.module.scss'

export const BANNER_KEY = 'license_banner_dismissed'

export const moduleDescriptionMap: Record<string, keyof StringsMap> = {
  cd: 'cd.continuous',
  ce: 'ce.continuous',
  cf: 'cf.continuous',
  ci: 'ci.continuous',
  cv: 'cv.continuous',
  sto: 'sto.continuous'
}

const moduleNameMap: Record<string, keyof StringsMap> = {
  cd: 'common.module.cd',
  ce: 'common.module.ce',
  cf: 'common.module.cf',
  ci: 'common.module.ci',
  cv: 'common.module.cv',
  sto: 'common.module.sto'
}

const getModuleDescriptions: (
  getString: UseStringsReturn['getString'],
  module?: Module
) => { moduleName: string; moduleDescription: string } = (getString, module) => {
  if (!module) {
    return { moduleName: '', moduleDescription: '' }
  }

  const lowercaseName = module.toLowerCase()

  const moduleDescriptionKey = lowercaseName ? moduleDescriptionMap[lowercaseName] : undefined
  const moduleDescription = moduleDescriptionKey ? getString(moduleDescriptionKey) : ''

  const moduleNameKey = lowercaseName ? moduleNameMap[lowercaseName] : undefined
  const moduleName = moduleNameKey ? getString(moduleNameKey) : ''

  return { moduleName, moduleDescription }
}

const getAlertMsg = (
  moduleName: string,
  moduleDescription: string,
  edition: string | undefined,
  isExpired: boolean,
  days: number,
  expiredDays: number,
  getString: UseStringsReturn['getString']
): React.ReactElement => {
  if (isExpired) {
    let expiredMsg
    if (expiredDays > 14) {
      expiredMsg = getString('common.banners.trial.expired.contactSales', {
        expiredDays,
        moduleDescription
      })
    } else {
      expiredMsg = getString('common.banners.trial.expired.description', {
        expiredDays,
        moduleDescription
      })
    }

    return (
      <Text
        color={Color.WHITE}
        font={{ variation: FontVariation.FORM_MESSAGE_WARNING }}
        icon="issue"
        iconProps={{ padding: { right: 'small' }, className: css.issueIcon }}
      >
        {expiredMsg}
      </Text>
    )
  }

  return (
    <Text
      color={Color.PRIMARY_10}
      font={{ variation: FontVariation.FORM_MESSAGE_WARNING }}
      icon="info-message"
      iconProps={{ padding: { right: 'small' }, size: 25, className: css.infoIcon }}
    >
      {getString('common.banners.trial.description', {
        module: moduleName,
        days,
        moduleDescription,
        edition: capitalize(edition)
      })}
    </Text>
  )
}

const ExtendOrFeedBackBtn: React.FC<{
  isExpired: boolean
  expiredDays: number
  module?: Module
  openExtendTrialOrFeedbackModal: () => void
  setExtendingTrial: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ isExpired, openExtendTrialOrFeedbackModal, setExtendingTrial }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  const { loading } = useExtendTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  useEffect(() => {
    setExtendingTrial(loading)
  }, [loading])

  if (!isExpired) {
    return (
      <Layout.Horizontal padding={{ right: 'large' }} flex={{ alignItems: 'center' }}>
        <Text
          padding={{ left: 'small', right: 'small' }}
          color={Color.PRIMARY_6}
          font={{ variation: FontVariation.FORM_MESSAGE_WARNING }}
        >
          {'or'}
        </Text>
        <Text
          onClick={openExtendTrialOrFeedbackModal}
          color={Color.PRIMARY_6}
          className={css.link}
          flex={{ alignItems: 'center' }}
          font={{ variation: FontVariation.FORM_MESSAGE_WARNING }}
        >
          {getString('common.banners.trial.provideFeedback')}
        </Text>
      </Layout.Horizontal>
    )
  }

  return <></>
}

export const TrialLicenseBanner: React.FC = () => {
  const { getString } = useStrings()
  const { module } = useModuleInfo()
  const { currentUserInfo } = useAppStore()
  const { accountId } = useParams<AccountPathProps>()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()
  const { showError, showSuccess } = useToaster()
  const [isBannerDismissed, setIsBannerDismissed] = useLocalStorage<Partial<Record<Module, boolean>>>(
    BANNER_KEY,
    {},
    window.sessionStorage
  )

  const {
    data,
    refetch,
    loading: gettingLicense
  } = useGetLicensesAndSummary({
    queryParams: { moduleType: module?.toUpperCase() as GetLicensesAndSummaryQueryParams['moduleType'] },
    accountIdentifier: accountId,
    lazy: true
  })
  const [extendingTrial, setExtendingTrial] = useState<boolean>(false)
  const maxExpiryTime = (module && licenseInformation?.[module.toUpperCase()]?.expiryTime) || 0
  const edition = (module && licenseInformation?.[module.toUpperCase()]?.edition) || ''
  const licenseType = (module && licenseInformation?.[module.toUpperCase()]?.licenseType) || ''
  const updatedLicenseInfo = data?.data &&
    module && {
      ...licenseInformation?.[module.toUpperCase()],
      ...pick(data?.data, ['licenseType', 'edition']),
      expiryTime: maxExpiryTime
    }

  useEffect(() => {
    if (module) {
      handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, updatedLicenseInfo)
    }
    // added to fix https://harness.atlassian.net/browse/BG-328
    return () => setExtendingTrial(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  const days = Math.round(moment(maxExpiryTime).diff(moment.now(), 'days', true))
  const isExpired = days < 0
  const expiredDays = Math.abs(days)
  const expiredClassName = isExpired ? css.expired : css.notExpired

  const { moduleName, moduleDescription } = getModuleDescriptions(getString, module)

  const { openMarketoContactSales, loading: loadingContactSales } = useContactSalesMktoModal({})

  const alertMsg = getAlertMsg(moduleName, moduleDescription, edition, isExpired, days, expiredDays, getString)

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
          refetch?.()
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
        refetch?.()
      }
    },
    module: module || '',
    expiryDateStr: moment(maxExpiryTime).format('MMMM D YYYY'),
    formType: isExpired ? FORM_TYPE.EXTEND_TRIAL : FORM_TYPE.FEEDBACK,
    moduleDescription,
    loading: sendingFeedback
  })

  const loading = extendingTrial || loadingContactSales || sendingFeedback || gettingLicense
  const contactSalesLink = (
    <Layout.Horizontal padding={{ left: 'large' }} flex={{ alignItems: 'center' }}>
      <Text
        onClick={openMarketoContactSales}
        color={isExpired ? Color.WHITE : Color.PRIMARY_6}
        className={css.link}
        font={{ variation: FontVariation.FORM_MESSAGE_WARNING }}
      >
        {getString('common.banners.trial.contactSales')}
      </Text>
    </Layout.Horizontal>
  )
  if (module === undefined || isBannerDismissed[module] || licenseType !== 'TRIAL') {
    return <></>
  }
  if (loading) {
    return <PageSpinner />
  }
  return (
    <div className={cx(css.trialLicenseBanner, expiredClassName)} data-trial-banner-is-visible>
      <Layout.Horizontal width="95%" padding={{ left: 'large' }}>
        {alertMsg}
        {contactSalesLink}
        <ExtendOrFeedBackBtn
          isExpired={isExpired}
          expiredDays={expiredDays}
          module={module}
          openExtendTrialOrFeedbackModal={openExtendTrialOrFeedbackModal}
          setExtendingTrial={setExtendingTrial}
        />
      </Layout.Horizontal>
      <Button
        variation={ButtonVariation.ICON}
        size={ButtonSize.LARGE}
        icon="cross"
        data-testid="trial-banner-dismiss"
        onClick={() => setIsBannerDismissed(prev => (module ? { ...prev, [module]: true } : prev))}
      />
    </div>
  )
}
