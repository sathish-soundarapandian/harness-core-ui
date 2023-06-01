/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Button, ButtonVariation, Container, Layout, Select, Text, TextInput } from '@harness/uicore'
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
import css from './CreateAFlagView.module.scss'
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
  const [newFlagName, setNewFlagName] = useState<string>('')
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

  const noExistingFlags = useMemo<boolean>(
    () => allFeatureFlags?.itemCount === 0 && !selectedFlag && !searchTerm && !isLoadingCreateFeatureFlag,
    [allFeatureFlags?.itemCount, selectedFlag, searchTerm, isLoadingCreateFeatureFlag]
  )

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
      .catch(error => {
        showError(getErrorMessage(error), undefined, 'cf.create.ff.error')
      })
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
    <>
      <Layout.Vertical spacing="medium">
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
          {getString('cf.featureFlags.flagsDescription')}
        </Text>

        {noExistingFlags ? (
          <>
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} padding={{ bottom: 'xsmall' }}>
              {getString('cf.onboarding.typeNewFeatureName')}
            </Text>
            <Layout.Horizontal spacing="small">
              <TextInput
                wrapperClassName={css.newFlagInput}
                intent="primary"
                aria-label={getString('cf.onboarding.typeNewFeatureName')}
                placeholder={getString('cf.onboarding.typeNewFeatureName')}
                value={newFlagName}
                onChange={e => setNewFlagName((e?.target as HTMLInputElement)?.value)}
              />
              <Button
                variation={ButtonVariation.SECONDARY}
                text={getString('common.createFlag')}
                onClick={() => createNewFlag(newFlagName)}
              />
            </Layout.Horizontal>
          </>
        ) : (
          <Container width="max-content">
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} padding={{ bottom: 'xsmall' }}>
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
                id: 'selectOrCreateFlag'
              }}
            />
          </Container>
        )}
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
    </>
  )
}
