/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useFormikContext } from 'formik'
import { Button, ButtonVariation, Checkbox, Container, Layout, Page, Tag, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Divider } from '@blueprintjs/core'
import type { GetDataError } from 'restful-react'
import { useStrings } from 'framework/strings'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import {
  DowntimeForm,
  DowntimeFormFields,
  EntitiesRuleType
} from '@cv/pages/slos/components/CVCreateDowntime/CVCreateDowntime.types'
import type { RestResponseListMonitoredServiceDetail } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import MSList from './components/MSList'
import css from '../../CreateDowntimeForm.module.scss'

interface AddMonitoredServicesProp {
  msListData?: RestResponseListMonitoredServiceDetail | null
  msListLoading: boolean
  refetchMsList: (props?: any) => Promise<void>
  msListError?: GetDataError<unknown> | null
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
  const { msList, entitiesRuleType } = formikProps.values

  const { showDrawer, hideDrawer } = useDrawer({
    createDrawerContent: () => {
      return <MSList hideDrawer={hideDrawer} onAddMS={formikProps.setFieldValue} msList={msList} />
    },
    drawerOptions: { size: '60%', canOutsideClickClose: false }
  })

  const onChange = (e: React.FormEvent<HTMLInputElement>): void => {
    const { checked } = e.target as HTMLInputElement
    formikProps.setFieldValue(
      DowntimeFormFields.ENTITIES_RULE_TYPE,
      checked ? EntitiesRuleType.ALL : EntitiesRuleType.IDENTIFIERS
    )
  }

  const onRemove = (value?: string | null): void => {
    formikProps.setFieldValue(
      DowntimeFormFields.MS_LIST,
      msList.filter(item => item.monitoredServiceIdentifier !== value)
    )
  }

  return (
    <Page.Body
      loading={msListLoading}
      error={getErrorMessage(msListError)}
      className={css.minHeight}
      retryOnError={() => refetchMsList()}
    >
      <Layout.Vertical spacing={'large'} className={css.addMonitoredServices}>
        {(!!msListData?.resource?.length || (isCreateFlow && !!msList.length)) && (
          <Layout.Vertical
            margin={{ top: 'small', left: 'small' }}
            spacing={'medium'}
            className={entitiesRuleType === EntitiesRuleType.ALL ? css.disabled : ''}
          >
            <Text font={{ weight: 'semi-bold' }} color={Color.GREY_1000}>
              {getString('cv.sloDowntime.msList')}
            </Text>
            <Layout.Horizontal className={css.tagBox}>
              {msList.map(ms => (
                <Tag
                  id={ms.monitoredServiceIdentifier}
                  key={ms.monitoredServiceIdentifier}
                  onRemove={e => {
                    e.stopPropagation()
                    onRemove(e.currentTarget.parentElement?.getAttribute('id'))
                  }}
                >
                  <span className={css.serviceName}>{ms.serviceName}</span> - {ms.environmentName}
                </Tag>
              ))}
            </Layout.Horizontal>
          </Layout.Vertical>
        )}
        <Container margin={msList.length === 0 && { top: 'small' }}>
          <Button
            disabled={entitiesRuleType === EntitiesRuleType.ALL}
            margin={{ bottom: 'xsmall', left: 'small' }}
            onClick={showDrawer}
            text={getString('cv.sloDowntime.selectMonitoredServices')}
            variation={ButtonVariation.SECONDARY}
          />
        </Container>
        <Divider />
        <Layout.Horizontal className={css.checkbox} flex={{ justifyContent: 'flex-start' }}>
          <Checkbox checked={entitiesRuleType === EntitiesRuleType.ALL} onChange={onChange} />
          <Text font={{ size: 'small' }} color={Color.GREY_1000}>
            {getString('cv.sloDowntime.selectAllMonitoredServices')}
          </Text>
        </Layout.Horizontal>
      </Layout.Vertical>
    </Page.Body>
  )
}

export default AddMonitoredServices
