/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useFormikContext } from 'formik'
import { Button, ButtonVariation, Container, Layout, Page, Tag, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import { DowntimeForm, DowntimeFormFields } from '@cv/pages/slos/components/CVCreateDowntime/CVCreateDowntime.types'
import type { RestResponseListMonitoredServiceDetail } from 'services/cv'
import MSList from './components/MSList'
import css from '../../CreateDowntimeForm.module.scss'

interface AddMonitoredServicesProp {
  msListData?: RestResponseListMonitoredServiceDetail | null
  msListLoading?: boolean
  refetchMsList?: (props?: any) => Promise<void> | undefined
  msListError?: string
  isCreateFlow: boolean
}

const AddMonitoredServices = ({
  msListData,
  msListLoading,
  refetchMsList,
  msListError,
  isCreateFlow
}: AddMonitoredServicesProp): JSX.Element => {
  const formikProps = useFormikContext<DowntimeForm>()
  const { getString } = useStrings()
  const { msList } = formikProps.values

  const { showDrawer, hideDrawer } = useDrawer({
    createDrawerContent: () => {
      return <MSList hideDrawer={hideDrawer} onAddMS={formikProps.setFieldValue} msList={msList} />
    },
    drawerOptions: { size: '60%', canOutsideClickClose: false }
  })

  const onRemove = (value?: string | null): void => {
    formikProps.setFieldValue(
      DowntimeFormFields.MS_LIST,
      msList.filter(item => item.monitoredServiceIdentifier !== value)
    )
  }

  return (
    <Page.Body
      loading={msListLoading}
      error={msListError}
      className={css.minHeight}
      retryOnError={() => refetchMsList?.()}
    >
      <Layout.Vertical spacing={'medium'} className={css.addMonitoredServices}>
        {((msListData?.resource && msListData?.resource.length > 0) || (isCreateFlow && msList.length > 0)) && (
          <Layout.Vertical spacing={'small'} margin={{ left: 'xsmall', top: 'xsmall' }}>
            <Text font={{ weight: 'semi-bold' }} color={Color.GREY_1000} style={{ lineHeight: '20px' }}>
              {getString('cv.sloDowntime.msList')}
            </Text>
            <Layout.Horizontal spacing={'small'} style={{ display: 'flex', flexWrap: 'nowrap' }}>
              {msList.map(ms => (
                <Tag
                  id={ms.monitoredServiceIdentifier}
                  key={ms.monitoredServiceIdentifier}
                  onRemove={e => {
                    e.stopPropagation()
                    onRemove(e.currentTarget.parentElement?.getAttribute('id'))
                  }}
                >
                  <b>{ms.serviceName}</b> - {ms.environmentName}
                </Tag>
              ))}
            </Layout.Horizontal>
          </Layout.Vertical>
        )}
        <Container>
          <Button
            margin={'xsmall'}
            onClick={showDrawer}
            text={getString('cv.sloDowntime.selectMonitoredServices')}
            variation={ButtonVariation.SECONDARY}
          />
        </Container>
      </Layout.Vertical>
    </Page.Body>
  )
}

export default AddMonitoredServices
