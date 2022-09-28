/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Checkbox,
  Card,
  Text,
  Layout,
  ButtonVariation,
  Button,
  ButtonSize,
  getErrorInfoFromErrorObject
} from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'

import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetSmtpConfig, useDeleteSmtpConfig } from 'services/cd-ng'

import useCreateSmtpModal from '@common/components/Smtp/useCreateSmtpModal'
import routes from '@common/RouteDefinitions'
import { ActivityDetailsRowInterface, RenderDetailsTable } from '../RenderDetailsTable/RenderDetailsTable'
import css from './useCreateSmtpModal.module.scss'
const SmtpDetails: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<OrgPathProps>()
  const { loading, data, refetch } = useGetSmtpConfig({ queryParams: { accountId } })
  const { loading: deleteProcessing, mutate: deleteSmtp } = useDeleteSmtpConfig({
    queryParams: { accountIdentifier: accountId }
  })
  const [errorOnPage, setErrorOnPage] = useState<string>('')
  const refetchData = (): void => {
    refetch()
  }
  const { openCreateSmtpModal } = useCreateSmtpModal({ onCloseModal: refetchData })

  const handleEdit = (): void => {
    openCreateSmtpModal(data?.data)
  }
  const handleDelete = (): void => {
    if (data?.data?.uuid) {
      deleteSmtp(data?.data?.uuid, {
        headers: { 'content-type': 'application/json' }
      })
        .then(val => {
          if (val.status === 'SUCCESS') {
            history.push(routes.toAccountResources({ accountId }))
          } else {
            setErrorOnPage(getErrorInfoFromErrorObject(val))
          }
        })
        .catch(err => {
          setErrorOnPage(getErrorInfoFromErrorObject(err))
        })
    }
  }
  const getSmtpDetailsRow = (): ActivityDetailsRowInterface[] => {
    const smtpData = data?.data
    const emtpyString = ' '
    if (smtpData) {
      return [
        { label: getString('name'), value: smtpData?.name || emtpyString },
        { label: getString('common.hostLabel'), value: smtpData?.value?.host || emtpyString },
        { label: getString('common.smtp.port'), value: smtpData?.value?.port || emtpyString },
        {
          label: '',
          value: (
            <>
              <Checkbox label={getString('common.smtp.enableSSL')} checked={smtpData?.value?.useSSL} />
              <Checkbox label={getString('common.smtp.startTLS')} checked={smtpData?.value?.startTLS} />
            </>
          )
        },
        { label: getString('common.smtp.fromAddress'), value: smtpData?.value?.fromAddress || emtpyString },
        { label: getString('username'), value: smtpData?.value?.username || emtpyString },
        { label: getString('password'), value: smtpData?.value?.password || emtpyString }
      ]
    }
    return []
  }
  return (
    <>
      <Page.Header
        title={getString('common.smtp.conifg')}
        breadcrumbs={
          <NGBreadcrumbs
            links={[
              {
                url: routes.toAccountResources({ accountId }),
                label: getString('common.accountResources')
              }
            ]}
          />
        }
      />
      <Page.Body
        loading={loading || deleteProcessing}
        error={errorOnPage}
        loadingMessage={deleteProcessing ? getString('common.smtp.deleteInProgress') : undefined}
      >
        <Card className={css.smtpDetailsCardContainer}>
          <RenderDetailsTable
            className={css.smtpDetailsCard}
            title={
              <Layout.Horizontal flex>
                <Text font={{ variation: FontVariation.H5 }} color={Color.GREY_700}>
                  {getString('overview')}
                </Text>
                <Layout.Horizontal spacing={'xsmall'}>
                  <Button
                    icon="trash"
                    text={getString('delete')}
                    onClick={handleDelete}
                    size={ButtonSize.SMALL}
                    disabled={deleteProcessing}
                    variation={ButtonVariation.TERTIARY}
                  />
                  <Button
                    icon="Edit"
                    text={getString('edit')}
                    onClick={handleEdit}
                    disabled={deleteProcessing}
                    size={ButtonSize.SMALL}
                    variation={ButtonVariation.SECONDARY}
                  />
                </Layout.Horizontal>
              </Layout.Horizontal>
            }
            data={getSmtpDetailsRow()}
          />
        </Card>
      </Page.Body>
    </>
  )
}

export default SmtpDetails
