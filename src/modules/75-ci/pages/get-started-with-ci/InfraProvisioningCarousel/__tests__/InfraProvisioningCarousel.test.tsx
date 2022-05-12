/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, getByText as getByTextBody, act, fireEvent } from '@testing-library/react'
import { findDialogContainer } from '@common/utils/testUtils'
import { CarouselSlides, InfraProvisioningCarousel } from '../InfraProvisioningCarousel'
import { ProvisioningStatus } from '../../InfraProvisioningWizard/Constants'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  }),
  String: jest.fn().mockImplementation((prop: any) => {
    const MockComponent = ({ stringID }: { stringID: string }): React.ReactElement => <div>{stringID}</div>

    return <MockComponent {...prop} />
  })
}))

jest.useFakeTimers()

describe('Test Infra Provisioning Carousel', () => {
  test('Initial render', () => {
    const { rerender } = render(
      <InfraProvisioningCarousel onClose={jest.fn} provisioningStatus={ProvisioningStatus.IN_PROGRESS} show={true} />
    )

    const dialog = findDialogContainer() as HTMLElement
    expect(getByTextBody(dialog, 'ci.getStartedWithCI.provisionSecureEnv')).toBeTruthy()
    expect(getByTextBody(dialog, 'ci.getStartedWithCI.duration')).toBeTruthy()
    /* slides transition */
    expect(getByTextBody(dialog, 'ci.getStartedWithCI.carousel.helptext.connectToRepo')).toBeTruthy()

    act(() => {
      jest.runOnlyPendingTimers()
    })
    expect(getByTextBody(dialog, 'ci.getStartedWithCI.carousel.helptext.harnessCIFeatures')).toBeTruthy()

    act(() => {
      jest.runOnlyPendingTimers()
    })
    expect(getByTextBody(dialog, 'ci.getStartedWithCI.provisionSecureEnv')).toBeTruthy()

    /* dots transition */
    const dotIcons = dialog.querySelectorAll('span[icon="dot"]')
    expect(dotIcons.length).toBe(CarouselSlides.length)
    expect(dialog.querySelectorAll('span[class*="StyledProps--color-blue600"]').length).toBe(1)
    expect(dialog.querySelectorAll('span[class*="StyledProps--color-blue100"]').length).toBe(CarouselSlides.length - 1)

    /* blue600 color should be only on the clicked/active dot icon in transition */
    act(() => {
      fireEvent.click(dotIcons[2])
    })

    act(() => {
      jest.runOnlyPendingTimers()
    })

    expect(dotIcons[2].className).toBe(
      'bp3-icon bp3-icon-dot StyledProps--main StyledProps--color StyledProps--color-blue600'
    )

    rerender(
      <InfraProvisioningCarousel onClose={jest.fn} provisioningStatus={ProvisioningStatus.FAILURE} show={true} />
    )
    expect(getByTextBody(dialog, 'ci.getStartedWithCI.infraProvisioningFailed')).toBeTruthy()
  })
})
