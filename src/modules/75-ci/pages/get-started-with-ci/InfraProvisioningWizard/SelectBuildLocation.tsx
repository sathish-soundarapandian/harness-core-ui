/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { Icon, Container, Text, FontVariation, Layout, CardSelect, PillToggle, Color } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  Hosting,
  SelectBuildLocationProps,
  BuildLocationDetails,
  AllBuildLocationsForSaaS,
  AllBuildLocationsForOnPrem,
  ProvisioningStatus,
  HostedByHarnessBuildLocation,
  K8sBuildLocation
} from './Constants'
import { ProvisioningStatusPill } from './ProvisioningStatusPill'

import css from './InfraProvisioningWizard.module.scss'

export interface SelectBuildLocationRef {
  hosting: Hosting
  buildLocation: BuildLocationDetails
}

export type SelectBuildLocationForwardRef =
  | ((instance: SelectBuildLocationRef | null) => void)
  | React.MutableRefObject<SelectBuildLocationRef | null>
  | null

const SelectBuildLocationRef = (
  props: SelectBuildLocationProps,
  forwardRef: SelectBuildLocationForwardRef
): React.ReactElement => {
  const { selectedHosting, selectedBuildLocation, provisioningStatus, onChangeBuildLocation, onStartProvisioning } =
    props
  const [buildLocation, setBuildLocation] = useState<BuildLocationDetails>()
  const [hosting, setHosting] = useState<Hosting>()
  const { getString } = useStrings()

  useEffect(() => {
    if (!forwardRef) {
      return
    }
    if (typeof forwardRef === 'function') {
      return
    }

    if (hosting && buildLocation) {
      forwardRef.current = {
        hosting,
        buildLocation
      }
    }
  }, [hosting, buildLocation])

  useEffect(() => {
    if (hosting === Hosting.OnPrem) {
      setBuildLocation(K8sBuildLocation)
    } else if (hosting === Hosting.SaaS) {
      setBuildLocation(selectedBuildLocation ?? HostedByHarnessBuildLocation)
    }
  }, [hosting])

  useEffect(() => {
    setBuildLocation(selectedBuildLocation)
  }, [selectedBuildLocation])

  useEffect(() => {
    if (selectedHosting) {
      setHosting(selectedHosting)
    } else {
      setHosting(Hosting.SaaS)
    }
  }, [selectedHosting])

  return (
    <Layout.Vertical>
      <Text font={{ variation: FontVariation.H4 }}>{getString('ci.getStartedWithCI.buildLocation')}</Text>
      <Container padding={{ top: 'xlarge', bottom: 'xxlarge' }}>
        {hosting ? (
          <PillToggle
            options={[
              {
                label: getString('ci.getStartedWithCI.hosting', {
                  hosting: getString('ci.getStartedWithCI.onCloudLabel')
                }),
                value: Hosting.SaaS
              },
              {
                label: getString('ci.getStartedWithCI.hosting', {
                  hosting: getString('ci.getStartedWithCI.onPremLabel').toLowerCase()
                }),
                value: Hosting.OnPrem
              }
            ]}
            disableToggle={true}
            selectedView={hosting}
            onChange={(item: Hosting) => setHosting(item)}
            className={css.hostingToggle}
          />
        ) : null}
      </Container>
      <Text font={{ variation: FontVariation.H5 }} padding={{ bottom: 'medium' }}>
        {getString('ci.getStartedWithCI.selectInfra')}
      </Text>
      <CardSelect
        cornerSelected={true}
        data={hosting === Hosting.SaaS ? AllBuildLocationsForSaaS : AllBuildLocationsForOnPrem}
        cardClassName={css.card}
        renderItem={(item: BuildLocationDetails) => {
          const { icon, label, details, approxETAInMins, disabled } = item
          return (
            <Layout.Vertical height="100%" flex={{ justifyContent: 'space-between' }}>
              <Layout.Vertical spacing="medium">
                <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small">
                  <Icon name={icon} size={20} />
                  <Text font={{ variation: FontVariation.H5 }}>{getString(label)}</Text>
                </Layout.Horizontal>
                <Text font={{ variation: FontVariation.SMALL }}>{getString(details)}</Text>
              </Layout.Vertical>
              <Layout.Horizontal
                flex={{
                  justifyContent:
                    disabled || item.location === HostedByHarnessBuildLocation.location ? 'space-between' : 'flex-end'
                }}
                width="100%"
              >
                {disabled ? (
                  <Container className={css.comingSoonPill} flex={{ justifyContent: 'center' }}>
                    <Text font={{ variation: FontVariation.TINY }} color={Color.WHITE}>
                      {getString('common.comingSoon')}
                    </Text>
                  </Container>
                ) : null}
                {item.location === HostedByHarnessBuildLocation.location ? (
                  <ProvisioningStatusPill
                    provisioningStatus={provisioningStatus}
                    onStartProvisioning={onStartProvisioning}
                  />
                ) : (
                  <Text font={{ variation: FontVariation.TINY }}>
                    ~ {approxETAInMins} {getString('timeMinutes')}
                  </Text>
                )}
              </Layout.Horizontal>
            </Layout.Vertical>
          )
        }}
        selected={buildLocation}
        onChange={(item: BuildLocationDetails) => {
          setBuildLocation(item)
          onChangeBuildLocation(ProvisioningStatus.TO_DO)
        }}
      />
    </Layout.Vertical>
  )
}

export const SelectBuildLocation = React.forwardRef(SelectBuildLocationRef)
