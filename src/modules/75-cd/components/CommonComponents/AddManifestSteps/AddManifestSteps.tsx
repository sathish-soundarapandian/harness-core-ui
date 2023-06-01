/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { defaultTo } from 'lodash-es'
import cx from 'classnames'
import { Container, CopyToClipboard, HarnessDocTooltip, Icon, Text, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import type { ServiceDefinition } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { YamlBuilderMemo } from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import {
  getManifestsFirstStepTooltipId,
  getManifestsSecondStepTooltipId
} from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import css from './AddManifestSteps.module.scss'

interface AddManifestStepsProps {
  selectedDeploymentType: ServiceDefinition['type']
  manifestType: ManifestTypes
  manifestFileName: string
  suggestedManifestYaml: string
}

export const AddManifestSteps: React.FC<AddManifestStepsProps> = (props: AddManifestStepsProps): JSX.Element => {
  const { selectedDeploymentType, manifestType, manifestFileName, suggestedManifestYaml } = props

  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()

  const { showError } = useToaster()
  const { getString } = useStrings()
  const linkRef = React.useRef<HTMLAnchorElement>(null)

  const onDownload = (): void => {
    try {
      const errorMap = yamlHandler?.getYAMLValidationErrorMap()
      if (errorMap?.size) {
        throw new Error(errorMap.entries().next().value)
      }
      const content = new Blob([yamlHandler?.getLatestYaml() as BlobPart], { type: 'data:text/plain;charset=utf-8' })
      if (linkRef?.current) {
        linkRef.current.href = window.URL.createObjectURL(content)
        linkRef.current.download = manifestFileName
        linkRef.current.click()
      }
    } catch (err) {
      showError(err.message)
    }
  }

  return (
    <>
      <Container>
        <Container className={css.manifestStepContainer}>
          <div className={css.manifestStepNumberContainer}>1</div>
          <div
            className={css.manifestStepTitle}
            data-tooltip-id={getManifestsFirstStepTooltipId(selectedDeploymentType, manifestType)}
          >
            {getString('cd.pipelineSteps.serviceTab.manifest.manifestFirstStepTitle')}
            <HarnessDocTooltip
              tooltipId={getManifestsFirstStepTooltipId(selectedDeploymentType, manifestType)}
              useStandAlone={true}
            />
          </div>
        </Container>
        <Container className={css.yamlBuilderContainer}>
          <YamlBuilderMemo
            fileName={manifestFileName}
            existingYaml={suggestedManifestYaml}
            bind={setYamlHandler}
            yamlSanityConfig={{ removeEmptyObject: false, removeEmptyString: false, removeEmptyArray: false }}
            height="200px"
            renderCustomHeader={() => (
              <div className={css.yamlEditorHeader}>
                <Text font={{ variation: FontVariation.BODY2 }}>{manifestFileName}</Text>
                <Container flex margin={{ right: 'small' }}>
                  <CopyToClipboard content={defaultTo(yamlHandler?.getLatestYaml(), '')} showFeedback={true} />
                  <Icon
                    name={'download'}
                    onClick={onDownload}
                    className={css.icon}
                    color={Color.PRIMARY_7}
                    title={getString('delegates.downloadYAMLFile')}
                  ></Icon>
                </Container>
              </div>
            )}
          />
        </Container>
        <Container className={cx(css.manifestStepContainer, css.manifestSecondStepContainer)}>
          <div className={css.manifestStepNumberContainer}>2</div>
          <div
            className={css.manifestStepTitle}
            data-tooltip-id={getManifestsSecondStepTooltipId(selectedDeploymentType, manifestType)}
          >
            {getString('cd.pipelineSteps.serviceTab.manifest.manifestSecondStepTitle')}
            <HarnessDocTooltip
              tooltipId={getManifestsSecondStepTooltipId(selectedDeploymentType, manifestType)}
              useStandAlone={true}
            />
          </div>
        </Container>
      </Container>
      <a className="hide" ref={linkRef} target={'_blank'} data-testid={'fakeDownloadLink'} />
    </>
  )
}
