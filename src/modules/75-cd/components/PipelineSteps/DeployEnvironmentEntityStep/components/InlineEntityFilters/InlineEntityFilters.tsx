/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { BaseSyntheticEvent, PropsWithChildren, ReactNode, useState } from 'react'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import { get } from 'lodash-es'
import { Card, Container, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { RadioGroup } from '@blueprintjs/core'

import { useStrings } from 'framework/strings'

import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'

import { InlineEntityFiltersProps, InlineEntityFiltersRadioType } from './InlineEntityFiltersUtils'
import EntityFilterList from './EntityFiltersList/EntityFilterList'

import css from './InlineEntityFilters.module.scss'

export default function InlineEntityFilters<T>({
  filterPrefix,
  readonly,
  entityStringKey,
  onRadioValueChange,
  showCard,
  hasTopMargin,
  baseComponent,
  entityFilterListProps,
  gridAreaProps,
  children
}: PropsWithChildren<InlineEntityFiltersProps>): React.ReactElement {
  const { getString } = useStrings()
  const { values } = useFormikContext<T>()
  const [radioValue, setRadioValue] = useState(
    get(values, filterPrefix, [])?.length ? InlineEntityFiltersRadioType.FILTERS : InlineEntityFiltersRadioType.MANUAL
  )
  const isInfraClusterTaggingEnabled = useFeatureFlag(FeatureFlag.CDS_FILTER_INFRA_CLUSTERS_ON_TAGS)

  const handleFilterRadio = (event: BaseSyntheticEvent): void => {
    const selectedRadioValue = event.target.value
    setRadioValue(selectedRadioValue)
    onRadioValueChange?.(selectedRadioValue)
  }

  const renderHeaderAndRadioGroup = (): React.ReactElement => (
    <>
      <Text font={{ variation: FontVariation.CARD_TITLE }} margin={{ bottom: 'small' }}>
        {getString(entityStringKey)}
      </Text>

      <RadioGroup
        options={[
          {
            label: getString('common.selectNameManually', { name: getString(entityStringKey) }),
            value: InlineEntityFiltersRadioType.MANUAL
          },
          {
            label: getString('common.deployToFilteredList'),
            value: InlineEntityFiltersRadioType.FILTERS,
            disabled: !isInfraClusterTaggingEnabled
          }
        ]}
        onChange={handleFilterRadio}
        selectedValue={radioValue}
        disabled={readonly}
        className={css.radioGroup}
        inline
      />
    </>
  )

  const renderInlineEntityFilters = (inlineEntityFilterChildren: ReactNode): React.ReactElement => {
    const renderContent = (): React.ReactElement => (
      <>
        {radioValue === InlineEntityFiltersRadioType.MANUAL && baseComponent}

        {radioValue === InlineEntityFiltersRadioType.FILTERS && (
          <EntityFilterList<T> filterPrefix={filterPrefix} readonly={readonly} {...entityFilterListProps} />
        )}

        {radioValue === InlineEntityFiltersRadioType.MANUAL && inlineEntityFilterChildren}
      </>
    )

    return (
      <>
        {gridAreaProps ? (
          <>
            <Container style={{ gridArea: gridAreaProps.headerAndRadio }}>{renderHeaderAndRadioGroup()}</Container>
            <Card
              className={cx(css.inlineEntityFilterCard, { [css.topMargin]: hasTopMargin })}
              style={{ gridArea: gridAreaProps.content }}
            >
              {renderContent()}
            </Card>
          </>
        ) : (
          <>
            {renderHeaderAndRadioGroup()}
            {renderContent()}
          </>
        )}
      </>
    )
  }

  return showCard ? (
    <Card className={cx(css.inlineEntityFilterCard, { [css.topMargin]: hasTopMargin })}>
      {renderInlineEntityFilters(children)}
    </Card>
  ) : (
    renderInlineEntityFilters(children)
  )
}
