/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text, Icon, Color, MultiTypeInputType, getMultiTypeFromValue } from '@harness/uicore'
import css from './StartupScriptSelection.module.scss'

interface ConnectorFieldPropType {
  connectorRef: string
  connectorColor: string
  connectorName: string | undefined
}
function ConnectorField({ connectorRef, connectorName, connectorColor }: ConnectorFieldPropType): React.ReactElement {
  return (
    <div className={css.connectorNameField}>
      {!!connectorRef && (
        <>
          <Text
            tooltip={
              <Container className={css.borderRadius} padding="medium">
                <div>
                  <Text font="small" color={Color.GREY_100}>
                    {connectorName}
                  </Text>
                  <Text font="small" color={Color.GREY_300}>
                    {connectorRef}
                  </Text>
                </div>
              </Container>
            }
            tooltipProps={{ isDark: true }}
            alwaysShowTooltip
            className={css.connectorName}
            lineClamp={1}
          >
            {connectorName ?? connectorRef}
          </Text>
          {getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED && (
            <Icon name="full-circle" size={8} color={connectorColor} />
          )}
        </>
      )}
    </div>
  )
}

export default ConnectorField
