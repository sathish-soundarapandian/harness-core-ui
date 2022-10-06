/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Container, Layout, Text, Select } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { Spinner } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import {
  CreateFeatureFlagQueryParams,
  Feature,
  FeatureFlagRequestRequestBody,
  useCreateFeatureFlag,
  useGetAllFeatures
} from 'services/cf'
import { CF_DEFAULT_PAGE_SIZE, getErrorMessage } from '@cf/utils/CFUtils'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useToaster } from '@common/exports'
import { Category, FeatureActions } from '@common/constants/TrackingConstants'
import { OnboardingSelectedFlag } from '../OnboardingSelectedFlag'
export interface CreateAFlagViewProps {
  selectedFlag?: Feature
  setSelectedFlag: (flag?: Feature) => void
}

export const CreateAFlagView: React.FC<CreateAFlagViewProps> = ({ selectedFlag, setSelectedFlag }) => {
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [flagCreated, setFlagCreated] = useState(false)
  const { orgIdentifier, accountId: accountIdentifier, projectIdentifier } = useParams<Record<string, string>>()

  const { mutate: createFeatureFlag, loading: isLoadingCreateFeatureFlag } = useCreateFeatureFlag({
    queryParams: {
      accountIdentifier,
      orgIdentifier
    } as CreateFeatureFlagQueryParams
  })

  const queryParams = {
    projectIdentifier,
    accountIdentifier,
    orgIdentifier,
    name: searchTerm,
    pageSize: CF_DEFAULT_PAGE_SIZE
  }

  const { data: allFeatureFlags, refetch: refetchFlags } = useGetAllFeatures({
    lazy: true,
    queryParams,
    debounce: 250
  })

  useEffect(() => {
    trackEvent(FeatureActions.CreateAFlagView, {
      category: Category.FEATUREFLAG
    })
    refetchFlags()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    refetchFlags()
  }, [searchTerm, refetchFlags])

  const createNewFlag = (flagName: string): void => {
    const flagData: FeatureFlagRequestRequestBody = {
      project: projectIdentifier,
      name: flagName,
      identifier: flagName.toLowerCase().trim().replace(/\s|-/g, '_'),
      kind: 'boolean',
      archived: false,
      variations: [
        { identifier: 'true', name: 'True', value: 'true' },
        { identifier: 'false', name: 'False', value: 'false' }
      ],
      defaultOnVariation: 'true',
      defaultOffVariation: 'false',
      permanent: false
    }

    createFeatureFlag(flagData)
      .then(resp => {
        const flag = resp?.details?.governanceMetadata?.input.flag
        setSelectedFlag(flag)
        setFlagCreated(true)
        refetchFlags()
      })
      .catch(error => showError(getErrorMessage(error), undefined, 'cf.create.ff.error'))
  }

  const onChangeSelect = (selectedOption: string): void => {
    const flag = allFeatureFlags?.features?.find(feat => feat.identifier === selectedOption)
    if (!flag) {
      createNewFlag(selectedOption)
    } else {
      setSelectedFlag(flag)
    }
  }

  return (
    <Container height="100%">
      <Container padding="xlarge">
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'large' }} style={{ fontWeight: 'lighter' }}>
          {getString('cf.onboarding.letsGetStarted')}
        </Text>
        <Layout.Vertical spacing="medium">
          <Text font={{ variation: FontVariation.H5 }}>{getString('cf.onboarding.createFlag')}</Text>
          <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
            {getString('cf.featureFlags.flagsDescription')}
          </Text>
          <div>
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
              {getString('cf.onboarding.flagInputLabel')}
            </Text>
            <Select
              value={selectedFlag && { label: selectedFlag.name, value: selectedFlag.identifier }}
              disabled={flagCreated}
              items={
                allFeatureFlags?.features?.map((flag: Feature) => {
                  return {
                    label: flag.name,
                    value: flag.identifier
                  }
                }) || []
              }
              allowCreatingNewItems
              onQueryChange={(query: string) => setSearchTerm(query)}
              onChange={option => onChangeSelect(option.value as string)}
              inputProps={{
                placeholder: getString('cf.onboarding.selectOrCreateFlag'),
                id: 'selectOrCreateFlag',
                style: { width: '350px' }
              }}
            />
          </div>
        </Layout.Vertical>
        {isLoadingCreateFeatureFlag && (
          <Layout.Horizontal padding={{ top: 'medium', bottom: 'medium' }}>
            <Spinner size={24} />
          </Layout.Horizontal>
        )}
        {selectedFlag && (
          <Layout.Horizontal margin={{ top: 'medium' }}>
            <OnboardingSelectedFlag flagCreated={flagCreated} selectedFlag={selectedFlag} />
          </Layout.Horizontal>
        )}
      </Container>
    </Container>
  )
}
