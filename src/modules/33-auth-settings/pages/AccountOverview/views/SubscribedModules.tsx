/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { capitalize } from 'lodash-es'
import { Container, Text, Card, Layout, Icon, PageError, PageSpinner, IconName } from '@harness/uicore'
import { Color } from '@harness/design-system'
import moment from 'moment'
import { useParams, Link } from 'react-router-dom'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps, SubscriptionQueryParams } from '@common/interfaces/RouteInterfaces'
import { useGetAccountLicenses } from 'services/cd-ng'
import type { ModuleLicenseDTO } from 'services/cd-ng'
import { Editions } from '@common/constants/SubscriptionTypes'
import css from '../AccountOverview.module.scss'

interface ModuleCardProps {
  module: ModuleLicenseDTO
}

const MODULE_ICONS: {
  [key in ModuleLicenseDTO['moduleType'] as string]: string
} = {
  CD: 'cd-with-dark-text',
  CE: 'ccm-with-dark-text',
  CV: 'srm-with-dark-text',
  CF: 'ff-with-dark-text',
  CI: 'ci-with-dark-text'
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const getPlanDescription = (): string => {
    const days = Math.round(moment(module.expiryTime).diff(moment(module.createdAt), 'days', true)).toString()
    const edition = module.edition || ''
    if (edition === Editions.FREE || edition === Editions.COMMUNITY) {
      return capitalize(edition)
    }

    return capitalize(edition)
      .concat('(')
      .concat(days)
      .concat(' day ')
      .concat(capitalize(module.licenseType))
      .concat(')')
  }

  return (
    <Card className={css.subscribedModules}>
      <Container padding={'large'}>
        <Layout.Vertical>
          {module.moduleType && MODULE_ICONS[module.moduleType] && (
            <Icon name={MODULE_ICONS[module.moduleType] as IconName} className={css.moduleIcons} />
          )}
          <Layout.Horizontal padding="xsmall" margin={{ bottom: 'large' }} border={{ color: Color.GREY_200 }}>
            <Text font={{ size: 'xsmall' }} margin={{ right: 'xsmall' }}>{`${getString(
              'common.subscriptions.overview.plan'
            )}:`}</Text>
            <Text font={{ size: 'xsmall', weight: 'bold' }} color={Color.BLACK}>
              {getPlanDescription()}
            </Text>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Container>
      <Container
        border={{ top: true, color: Color.GREY_250 }}
        padding={{ top: 'large', bottom: 'large', left: 'large' }}
      >
        <Link
          to={routes.toSubscriptions({
            accountId,
            moduleCard: module.moduleType as SubscriptionQueryParams['moduleCard']
          })}
          className={css.manageBtn}
        >
          {getString('common.manage')}
        </Link>
      </Container>
    </Card>
  )
}

const SubscribedModules: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { CDNG_ENABLED, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED } = useFeatureFlags()

  function isModuleEnabled(moduleType: ModuleLicenseDTO['moduleType']): boolean | undefined {
    switch (moduleType) {
      case ModuleName.CD: {
        return CDNG_ENABLED
      }
      case ModuleName.CE: {
        return CENG_ENABLED
      }
      case ModuleName.CI: {
        return CING_ENABLED
      }
      case ModuleName.CF: {
        return CFNG_ENABLED
      }
      case ModuleName.CV: {
        return CVNG_ENABLED
      }
      default:
        return undefined
    }
  }

  const {
    data: accountLicenses,
    loading,
    error,
    refetch
  } = useGetAccountLicenses({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  if (loading) {
    return <PageSpinner />
  }

  if (error) {
    return (
      <Container height={300}>
        <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />
      </Container>
    )
  }

  const modules: {
    [key: string]: ModuleLicenseDTO[]
  } = accountLicenses?.data?.allModuleLicenses || {}

  const subscribedModules =
    Object.values(modules).length > 0 ? (
      Object.values(modules).map(moduleLicenses => {
        if (moduleLicenses?.length > 0) {
          const latestModuleLicense = moduleLicenses[moduleLicenses.length - 1]
          if (isModuleEnabled(latestModuleLicense.moduleType)) {
            return (
              <div key={latestModuleLicense.moduleType}>
                <ModuleCard module={latestModuleLicense} />
              </div>
            )
          }
        }
      })
    ) : (
      <Layout.Horizontal spacing="xsmall">
        <Link to={routes.toSubscriptions({ accountId })}>{getString('common.account.visitSubscriptions.link')}</Link>
        <Text>{getString('common.account.visitSubscriptions.description')}</Text>
      </Layout.Horizontal>
    )

  return (
    <Container margin="xlarge" padding="xlarge" className={css.container} background="white">
      <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'medium' }} margin={{ bottom: 'xlarge' }}>
        {getString('common.account.subscribedModules')}
      </Text>
      <Layout.Horizontal spacing="large">{subscribedModules}</Layout.Horizontal>
    </Container>
  )
}

export default SubscribedModules
