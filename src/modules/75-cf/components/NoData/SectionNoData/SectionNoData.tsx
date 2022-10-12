/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout, Text, FontVariation, Color } from '@harness/uicore'
import React, { FC, PropsWithChildren } from 'react'
import GetStartedWithFF from '@cf/components/GetStartedWithFF/GetStartedWithFF'
import { NoData, NoDataProps } from '../NoData'

export interface SectionNoDataProps extends Pick<NoDataProps, 'message' | 'description'> {
  panels: { imageURL: string; description: string }[]
}

const SectionNoData: FC<PropsWithChildren<SectionNoDataProps>> = ({ message, description, panels, children }) => (
  <NoData message={message} description={description}>
    <Layout.Horizontal spacing="xxxlarge" flex={{ alignItems: 'center', justifyContent: 'center' }}>
      {panels.map(panel => (
        <Layout.Horizontal
          flex={{ align: 'center-center' }}
          style={{ textAlign: 'center' }}
          spacing="huge"
          key={panel.description}
        >
          <Layout.Vertical flex={{ alignItems: 'center' }} spacing="huge" padding={{ bottom: 'huge', top: 'small' }}>
            <img src={panel.imageURL} alt="" width={150} height={150} />
            <Text width={160} font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
              {panel.description}
            </Text>
          </Layout.Vertical>
        </Layout.Horizontal>
      ))}
    </Layout.Horizontal>
    <GetStartedWithFF />
    {children}
  </NoData>
)

export default SectionNoData
