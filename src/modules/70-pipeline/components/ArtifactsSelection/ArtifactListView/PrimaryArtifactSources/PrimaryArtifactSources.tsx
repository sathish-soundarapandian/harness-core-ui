/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout, MultiSelectOption, MultiTypeInputType, RUNTIME_INPUT_VALUE, Text, Popover } from '@harness/uicore'
import { Position, PopoverInteractionKind } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { ArtifactSource, PageConnectorResponse } from 'services/cd-ng'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import MultiTypeSelectorButton from '@common/components/MultiTypeSelectorButton/MultiTypeSelectorButton'
import { isMultiTypeRuntime, isValueRuntimeInput } from '@common/utils/utils'
import type { ModalViewFor } from '../../ArtifactHelper'
import type { ArtifactType } from '../../ArtifactInterface'
import PrimaryArtifactView from '../PrimaryArtifact/PrimaryArtifactView'
import css from '../../ArtifactsSelection.module.scss'

interface PrimaryArtifactSourcesProps {
  artifactSources: ArtifactSource[]
  isReadonly: boolean
  accountId: string
  fetchedConnectorResponse: PageConnectorResponse | undefined
  editArtifact: (view: ModalViewFor, type?: ArtifactType, index?: number) => void
  removeArtifactSource?: (index: number) => void
  primaryArtifactRef?: string
  setPrimaryArtifactRef?: (primaryArtifactRefValue: string) => void
}
function PrimaryArtifactSources(props: PrimaryArtifactSourcesProps): React.ReactElement | null {
  const { artifactSources, editArtifact, removeArtifactSource, primaryArtifactRef, setPrimaryArtifactRef, ...rest } =
    props
  const { getString } = useStrings()
  const [isHoverPopoverDisabled, setIsHoverPopoverDisabled] = useState(false)
  const artifactSourceOptions: MultiSelectOption[] = artifactSources?.map(artifactSource => ({
    label: artifactSource.identifier,
    value: artifactSource.identifier
  }))

  const renderIdentifier = (identifier: string): JSX.Element => {
    return (
      <div>
        <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
          {identifier}
        </Text>
      </div>
    )
  }
  if (!artifactSources?.length) {
    return null
  }

  const updatePrimaryArtifactRef = (value?: string): void => {
    if (typeof setPrimaryArtifactRef === 'function') {
      setPrimaryArtifactRef(value as string)
    }
  }
  const isPrimaryArtifactRefRuntime = isValueRuntimeInput(primaryArtifactRef)

  return (
    <>
      <div className={css.sidecarList}>
        <div className={cx(css.artifactList, css.listHeader, css.primaryArtifactList)}>
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('common.ID')}</Text>
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
            {getString('pipeline.artifactsSelection.artifactType')}
          </Text>
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('artifactRepository')}</Text>
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('location')}</Text>
          <Layout.Horizontal style={{ alignItems: 'baseline' }}>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('primary')} </Text>
            <Popover
              interactionKind={PopoverInteractionKind.HOVER}
              position={Position.TOP}
              disabled={isHoverPopoverDisabled}
            >
              <div>
                <MultiTypeSelectorButton
                  type={isPrimaryArtifactRefRuntime ? MultiTypeInputType.RUNTIME : MultiTypeInputType.FIXED}
                  allowedTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
                  onChange={value => {
                    updatePrimaryArtifactRef(isMultiTypeRuntime(value) ? RUNTIME_INPUT_VALUE : undefined)
                  }}
                  popoverProps={{
                    onOpening: () => setIsHoverPopoverDisabled(true),
                    onClosing: () => setIsHoverPopoverDisabled(false)
                  }}
                />
              </div>
              {isPrimaryArtifactRefRuntime && (
                <Text padding="medium" className={css.primaryArtifactRefRuntimeValue}>
                  {`${getString('pipeline.artifactTriggerConfigPanel.runtimeInput')}: ${primaryArtifactRef}`}
                </Text>
              )}
            </Popover>
            {isPrimaryArtifactRefRuntime && (
              <SelectConfigureOptions
                options={artifactSourceOptions}
                value={primaryArtifactRef as string}
                type="String"
                variableName="primaryArtifactRef"
                onChange={updatePrimaryArtifactRef}
              />
            )}
          </Layout.Horizontal>
          <span></span>
        </div>
      </div>

      {artifactSources?.map((artifactSource, index) => (
        <PrimaryArtifactView
          key={artifactSource.identifier}
          primaryArtifact={artifactSource}
          editArtifact={(view, type) => editArtifact(view, type, index)}
          removePrimary={() => removeArtifactSource?.(index)}
          identifierElement={renderIdentifier(artifactSource.identifier)}
          primaryArtifactRef={primaryArtifactRef}
          setPrimaryArtifactRef={setPrimaryArtifactRef}
          isSingleArtifact={artifactSources.length === 1}
          {...rest}
        />
      ))}
    </>
  )
}

export default PrimaryArtifactSources
