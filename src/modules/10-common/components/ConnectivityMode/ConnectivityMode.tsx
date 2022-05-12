/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Text, FormikCollapsableSelect, CollapsableSelectType, CollapsableSelectOptions } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { FormikContextType } from 'formik'

import DelegatesGit from '@common/icons/DelegatesGit.svg'
import PlatformGit from '@common/icons/PlatformGit.svg'
import { useStrings } from 'framework/strings'

export enum ConnectivityModeType {
  Manager = 'Manager',
  Delegate = 'Delegate'
}
export interface ConnectivityCardItem extends CollapsableSelectOptions {
  type: ConnectivityModeType
  title: string
  info: string
  icon: JSX.Element
}

export interface ConnectivityModeForm {
  connectivityMode: ConnectivityModeType | undefined
}

interface ConnectivityModeProps {
  formik: FormikContextType<ConnectivityModeForm>
  className?: string
  onChange: (val: ConnectivityCardItem) => void
}

const ConnectivityMode: React.FC<ConnectivityModeProps> = props => {
  const { getString } = useStrings()
  const ConnectivityCard: ConnectivityCardItem[] = [
    {
      type: ConnectivityModeType.Manager,
      title: getString('common.connectThroughPlatform'),
      info: getString('common.connectThroughPlatformInfo'),
      icon: <img src={PlatformGit} width="100%" />,
      value: ConnectivityModeType.Manager
    },
    {
      type: ConnectivityModeType.Delegate,
      title: getString('common.connectThroughDelegate'),
      info: getString('common.connectThroughDelegateInfo'),
      icon: <img src={DelegatesGit} width="100%" />,
      value: ConnectivityModeType.Delegate
    }
  ]

  return (
    <FormikCollapsableSelect<ConnectivityCardItem>
      name="connectivityMode"
      items={ConnectivityCard}
      itemClassName={cx(props.className)}
      renderItem={(item: ConnectivityCardItem) => {
        return (
          <>
            <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_900} margin={{ bottom: 'small' }}>
              {item.title}
            </Text>

            <Text color={Color.BLACK} font={{ variation: FontVariation.SMALL }}>
              {item.info}
            </Text>
            {item.icon}
          </>
        )
      }}
      onChange={props.onChange}
      type={CollapsableSelectType.CardView}
      selected={
        ConnectivityCard[ConnectivityCard.findIndex(card => card.type === props.formik.values.connectivityMode)]
      }
    />
  )
}

export default ConnectivityMode
