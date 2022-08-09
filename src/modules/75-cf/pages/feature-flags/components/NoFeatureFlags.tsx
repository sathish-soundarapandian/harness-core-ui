/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactNode } from 'react'
import { ButtonProps, Container, FontVariation, Text } from '@harness/uicore'
import FlagDialog from '@cf/components/CreateFlagDialog/FlagDialog'
import { NoData } from '@cf/components/NoData/NoData'
import { useStrings, String } from 'framework/strings'
import noFlagsImg from '@cf/images/Feature_Flags_Teepee.svg'
import noResultsImg from '@cf/images/EmptySearchResults.svg'
import css from './NoFeatureFlags.module.scss'

export interface NoFeatureFlagsProps {
  hasFeatureFlags: boolean
  hasSearchTerm: boolean
  hasFlagFilter: boolean
  environmentIdentifier: string
  clearFilter: () => void
  clearSearch: () => void
}

export const NoFeatureFlags: React.FC<NoFeatureFlagsProps> = ({
  hasFeatureFlags,
  hasSearchTerm,
  hasFlagFilter,
  environmentIdentifier,
  clearFilter,
  clearSearch
}) => {
  const { getString } = useStrings()

  const mainMessage = (): string => {
    if (hasFeatureFlags) {
      if (hasFlagFilter) return getString('common.filters.noMatchingFilterData')
      if (hasSearchTerm) return getString('cf.noResultMatch')
    }
    return getString('cf.featureFlags.noFlagsInProject')
  }

  const buttonText = (): string => {
    if (hasFlagFilter) return getString('cf.featureFlags.resetFilters')
    if (hasSearchTerm) return getString('cf.featureFlags.clearSearch')
    return ''
  }

  const buttonProps = (): ButtonProps => {
    if (hasFlagFilter) {
      return {
        text: getString('cf.featureFlags.resetFilters'),
        icon: 'reset',
        minimal: true,
        onClick: clearFilter
      }
    }
    if (hasSearchTerm) {
      return {
        text: getString('cf.featureFlags.clearSearch'),
        icon: 'x',
        iconProps: { size: 10 },
        minimal: true,
        onClick: clearSearch
      }
    }
    return {}
  }

  const additionalContent = (): ReactNode => {
    if (hasFeatureFlags && hasFlagFilter) {
      return <Text font={{ variation: FontVariation.BODY1 }}>{getString('cf.featureFlags.changeOrReset')}</Text>
    }
    if (!hasFeatureFlags) {
      return (
        <>
          <div className={css.noFlagsDescription}>
            <String stringID="cf.featureFlags.noFlagsDescription" />
          </div>
          <div className={css.noFlagsToGetStarted}>
            <String useRichText stringID="cf.featureFlags.noFlagsToGetStarted" />
          </div>
          <FlagDialog environment={environmentIdentifier} />
        </>
      )
    }
  }

  return (
    <Container flex={{ justifyContent: 'center' }} padding="xxxlarge">
      <NoData
        imageURL={hasFeatureFlags && (hasSearchTerm || hasFlagFilter) ? noResultsImg : noFlagsImg}
        message={mainMessage()}
        description={additionalContent()}
        buttonText={buttonText()}
        buttonProps={buttonProps()}
        padding="xxxlarge"
        width="570px"
      />
    </Container>
  )
}
