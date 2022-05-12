/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import cx from 'classnames'
import { Button, ButtonSize, Card, Icon, IconName, Layout, Text } from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import useCreateSmtpModal from '@common/components/Smtp/useCreateSmtpModal'
import { useGetSmtpConfig } from 'services/cd-ng'
import css from './ResourceCardList.module.scss'

export interface ResourceOption {
  label: JSX.Element
  icon: IconName
  route?: string
  colorClass: string
  onClick?: () => void
  subLabel?: JSX.Element
  disabled?: boolean
}
interface ResourceCardListProps {
  items?: ResourceOption[]
}

const ResourceCardList: React.FC<ResourceCardListProps> = ({ items }) => {
  const { accountId, orgIdentifier } = useParams<OrgPathProps>()
  const history = useHistory()
  const { getString } = useStrings()
  const { NG_TEMPLATES, NG_VARIABLES } = useFeatureFlags()
  const { loading, data, refetch } = useGetSmtpConfig({ queryParams: { accountId } })
  const refetchSmtpData = (): void => {
    refetch()
  }
  const { openCreateSmtpModal } = useCreateSmtpModal({ onCloseModal: refetchSmtpData })
  const smtpResource: ResourceOption[] = [
    {
      label: <String stringID="common.smtp.conifg" />,
      icon: 'smtp',
      disabled: loading,
      onClick: () => {
        if (!loading) {
          if (!data?.data) {
            openCreateSmtpModal(data?.data)
          } else {
            history.push(routes.toAccountSMTP({ accountId }))
          }
        }
      },
      colorClass: css.smtp,
      subLabel: (
        <>
          {loading ? (
            <Icon name="spinner" size={14} />
          ) : (
            <>
              {!data?.data ? (
                <Button intent="primary" icon={'small-plus'} size={ButtonSize.SMALL} text={getString('common.setup')} />
              ) : (
                <Layout.Horizontal flex={{ alignItems: 'center' }} margin={'xsmall'} spacing="xsmall">
                  <Icon name="tick-circle" size={14} color={Color.GREEN_500} />

                  <Text font={{ variation: FontVariation.FORM_HELP }}>{getString('common.smtp.configured')}</Text>
                </Layout.Horizontal>
              )}
            </>
          )}
        </>
      )
    }
  ]
  const options: ResourceOption[] = items || [
    {
      label: <String stringID="connectorsLabel" />,
      icon: 'connectors-icon',
      route: routes.toConnectors({ accountId, orgIdentifier }),
      colorClass: css.connectors
    },
    {
      label: <String stringID="delegate.delegates" />,
      icon: 'delegates-icon' as IconName,
      route: routes.toDelegates({ accountId, orgIdentifier }),
      colorClass: css.delegates
    },
    {
      label: <String stringID="common.secrets" />,
      icon: 'secrets-icon',
      route: routes.toSecrets({ accountId, orgIdentifier }),
      colorClass: css.secrets
    },
    ...(!orgIdentifier ? smtpResource : []),
    ...(NG_TEMPLATES
      ? [
          {
            label: <String stringID="common.templates" />,
            icon: 'templates-icon',
            route: routes.toTemplates({ accountId, orgIdentifier }),
            colorClass: css.templates
          } as ResourceOption
        ]
      : []),
    ...(NG_VARIABLES
      ? [
          {
            label: <String stringID="common.variables" />,
            icon: 'variable',
            route: routes.toVariables({ accountId, orgIdentifier }),
            colorClass: css.variables
          } as ResourceOption
        ]
      : [])
  ]

  return (
    <Layout.Horizontal spacing="xxlarge">
      {options.map(option => (
        <Card
          key={option.icon}
          className={cx(css.card, option.colorClass)}
          disabled={option.disabled}
          onClick={() => {
            option?.onClick?.()
            if (option.route) {
              history.push(option.route)
            }
          }}
        >
          <Layout.Vertical flex spacing="small">
            <Icon name={option.icon} size={70} />
            <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
              {option.label}
            </Text>
            {option.subLabel}
          </Layout.Vertical>
        </Card>
      ))}
    </Layout.Horizontal>
  )
}

export default ResourceCardList
