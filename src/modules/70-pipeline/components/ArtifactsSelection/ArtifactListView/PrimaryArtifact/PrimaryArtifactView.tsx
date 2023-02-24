/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { Button, getMultiTypeFromValue, Icon, Layout, MultiTypeInputType, Popover, Text, Toggle } from '@harness/uicore'
import { Classes, Position, PopoverInteractionKind } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { defaultTo, isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ArtifactSource, PageConnectorResponse, PrimaryArtifact } from 'services/cd-ng'
import type { TemplateStepNode } from 'services/pipeline-ng'
import { TemplateBar } from '@pipeline/components/PipelineStudio/TemplateBar/TemplateBar'
import { getConnectorNameFromValue, getStatus } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { isValueRuntimeInput } from '@common/utils/utils'
import { ArtifactIconByType, ArtifactTitleIdByType, ENABLED_ARTIFACT_TYPES, ModalViewFor } from '../../ArtifactHelper'
import ArtifactRepositoryTooltip from '../ArtifactRepositoryTooltip'
import type { ArtifactType } from '../../ArtifactInterface'
import { getArtifactLocation, showConnectorStep } from '../../ArtifactUtils'
import css from '../../ArtifactsSelection.module.scss'

interface PrimaryArtifactViewProps {
  primaryArtifact: PrimaryArtifact | ArtifactSource
  isReadonly: boolean
  accountId: string
  fetchedConnectorResponse: PageConnectorResponse | undefined
  editArtifact: (view: ModalViewFor, type?: ArtifactType, index?: number) => void
  removePrimary?: () => void
  identifierElement?: JSX.Element
  primaryArtifactRef?: string
  setPrimaryArtifactRef?: (primaryArtifactRefValue: string) => void
  isSingleArtifact?: boolean
}

interface ArtifactSourceTemplateViewProps {
  artifactSourceTemplateData: TemplateStepNode
  primaryArtifactActions: React.ReactElement | null
  templateContainerClass?: string
}

export function ArtifactSourceTemplateView(props: ArtifactSourceTemplateViewProps): React.ReactElement {
  const { artifactSourceTemplateData, primaryArtifactActions, templateContainerClass } = props
  const { name, template } = artifactSourceTemplateData

  return (
    <section className={cx(css.rowItem, css.artifactSourceTemplateContainer, css.artifactRow)} key={'Dockerhub'}>
      <Layout.Horizontal
        className={cx(css.templateEditWrapper, templateContainerClass)}
        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      >
        {name && (
          <Text padding={{ left: 'small' }} width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
            {name}
          </Text>
        )}
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }} style={{ flexGrow: 1 }}>
          <TemplateBar className={css.minimalTemplateBar} templateLinkConfig={template} isReadonly={true} />
        </Layout.Horizontal>
        {primaryArtifactActions}
      </Layout.Horizontal>
    </section>
  )
}

function PrimaryArtifactView({
  primaryArtifact,
  isReadonly,
  accountId,
  fetchedConnectorResponse,
  editArtifact,
  removePrimary,
  identifierElement,
  primaryArtifactRef,
  setPrimaryArtifactRef,
  isSingleArtifact
}: PrimaryArtifactViewProps): React.ReactElement | null {
  const { getString } = useStrings()

  const artifactSourceTemplate = (primaryArtifact as TemplateStepNode)?.template

  const { color: primaryConnectorColor } = getStatus(
    primaryArtifact?.spec?.connectorRef,
    fetchedConnectorResponse,
    accountId
  )
  const primaryConnectorName = getConnectorNameFromValue(primaryArtifact?.spec?.connectorRef, fetchedConnectorResponse)

  const showPrimaryArtifactSelection = primaryArtifactRef !== undefined && setPrimaryArtifactRef !== undefined
  const artifactIdentifier = showPrimaryArtifactSelection ? (primaryArtifact as ArtifactSource)?.identifier : ''
  const isPrimaryArtifactRefRuntime = isValueRuntimeInput(primaryArtifactRef)

  const getPrimaryArtifactRepository = useCallback(
    (artifactType: ArtifactType): string => {
      if (artifactType === ENABLED_ARTIFACT_TYPES.CustomArtifact) {
        return getString('common.repo_provider.customLabel')
      }
      return defaultTo(primaryConnectorName, primaryArtifact?.spec?.connectorRef)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [primaryArtifact?.spec?.connectorRef, primaryConnectorName]
  )

  if (!primaryArtifact) {
    return null
  }

  const primaryArtifactActions = isReadonly ? null : (
    <>
      {showPrimaryArtifactSelection && (
        <Popover interactionKind={PopoverInteractionKind.HOVER} position={Position.TOP} className={Classes.DARK}>
          <Toggle
            checked={primaryArtifactRef === artifactIdentifier}
            onChange={() => {
              if (typeof setPrimaryArtifactRef === 'function') {
                setPrimaryArtifactRef(artifactIdentifier)
              }
            }}
            disabled={isPrimaryArtifactRefRuntime || isSingleArtifact}
          ></Toggle>
          {isSingleArtifact && !isPrimaryArtifactRefRuntime && (
            <Text color={Color.WHITE} padding="medium">
              {getString('pipeline.artifactsSelection.canNotDisablePrimaryArtifact')}
            </Text>
          )}
        </Popover>
      )}
      <Layout.Horizontal>
        <Button
          icon="Edit"
          minimal
          iconProps={{ size: 18 }}
          onClick={() => editArtifact(ModalViewFor.PRIMARY, primaryArtifact?.type)}
        />
        <Popover interactionKind={PopoverInteractionKind.HOVER} position={Position.TOP} className={Classes.DARK}>
          <Button
            iconProps={{ size: 18 }}
            minimal
            icon="main-trash"
            onClick={removePrimary}
            disabled={showPrimaryArtifactSelection && primaryArtifactRef === artifactIdentifier}
          />
          {showPrimaryArtifactSelection && primaryArtifactRef === artifactIdentifier && (
            <Text color={Color.WHITE} padding="medium">
              <div>{getString('pipeline.artifactsSelection.canNotDeletePrimaryArtifact')}</div>
              <div>{getString('pipeline.artifactsSelection.selectOtherArtifactPrimary')}</div>
            </Text>
          )}
        </Popover>
      </Layout.Horizontal>
    </>
  )

  const isArtifactSourceTemplate = !isEmpty(artifactSourceTemplate)

  return isArtifactSourceTemplate ? (
    <ArtifactSourceTemplateView
      artifactSourceTemplateData={primaryArtifact as TemplateStepNode}
      primaryArtifactActions={primaryArtifactActions}
      templateContainerClass={showPrimaryArtifactSelection ? css.primaryArtifactTemplateList : ''}
    />
  ) : (
    <section
      className={cx(css.artifactList, css.rowItem, css.artifactRow, {
        [css.primaryArtifactList]: showPrimaryArtifactSelection
      })}
    >
      {identifierElement ? (
        identifierElement
      ) : (
        <div>
          <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
            {getString('primary')}
          </Text>
        </div>
      )}
      {primaryArtifact.type ? (
        <>
          <div>{getString(ArtifactTitleIdByType[primaryArtifact.type])}</div>
          <div className={css.connectorNameField}>
            <Icon padding={{ right: 'small' }} name={ArtifactIconByType[primaryArtifact.type]} size={18} />
            <Text
              tooltip={
                <ArtifactRepositoryTooltip
                  artifactConnectorName={primaryConnectorName}
                  artifactConnectorRef={primaryArtifact.spec?.connectorRef}
                  artifactType={primaryArtifact.type}
                />
              }
              tooltipProps={{ isDark: true }}
              alwaysShowTooltip={showConnectorStep(primaryArtifact.type)}
              className={css.connectorName}
              lineClamp={1}
            >
              {getPrimaryArtifactRepository(primaryArtifact.type)}
            </Text>

            {getMultiTypeFromValue(primaryArtifact.spec?.connectorRef) === MultiTypeInputType.FIXED && (
              <Icon name="full-circle" size={8} color={primaryConnectorColor} />
            )}
          </div>
        </>
      ) : null}

      <div>
        <Text width={200} lineClamp={1} color={Color.GREY_500}>
          <span className={css.noWrap}>{getArtifactLocation(primaryArtifact)}</span>
        </Text>
      </div>
      {primaryArtifactActions}
    </section>
  )
}

export default PrimaryArtifactView
