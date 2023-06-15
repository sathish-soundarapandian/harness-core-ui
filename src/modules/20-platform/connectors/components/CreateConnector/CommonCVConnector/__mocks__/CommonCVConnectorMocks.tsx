/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

export const onNextMock = jest.fn()
const mockCVConnectorHoc = (input: any) => {
  const { ConnectorCredentialsStep, nestedStep } = input
  return function Wrapper(props: any) {
    return nestedStep ? (
      nestedStep
    ) : (
      <ConnectorCredentialsStep {...props} nextStep={onNextMock} prevStepData={props.connectorInfo} />
    )
  }
}

jest.mock('../CVConnectorHOC', () => ({
  ...(jest.requireActual('../CVConnectorHOC') as any),
  cvConnectorHOC: mockCVConnectorHoc
}))
