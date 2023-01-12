/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  Button,
  ButtonVariation,
  Container,
  Icon,
  Layout,
  Text,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import {
  GetErrorResponse,
  SaveTemplateHandle,
  SaveTemplatePopoverWithRef
} from '@templates-library/components/TemplateStudio/SaveTemplatePopover/SaveTemplatePopover'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import { TemplateStudioSubHeaderLeftView } from '@templates-library/components/TemplateStudio/TemplateStudioSubHeader/views/TemplateStudioSubHeaderLeftView/TemplateStudioSubHeaderLeftView'
import useDiffDialog from '@common/hooks/useDiffDialog'
import { stringify } from '@common/utils/YamlHelperMethods'
import PipelineCachedCopy from '@pipeline/components/PipelineStudio/PipelineCanvas/PipelineCachedCopy/PipelineCachedCopy'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import EndOfLifeBanner from '@pipeline/components/PipelineStudio/PipelineCanvas/EndOfLifeBanner'
import css from './TemplateStudioSubHeader.module.scss'

export interface TemplateStudioSubHeaderProps {
  onViewChange: (view: SelectedView) => boolean
  getErrors: () => Promise<GetErrorResponse>
  onGitBranchChange: (selectedFilter: GitFilterScope) => void
}

export type TemplateStudioSubHeaderHandle = {
  updateTemplate: (templateYaml: string) => Promise<void>
}

const TemplateStudioSubHeader: (
  props: TemplateStudioSubHeaderProps,
  ref: React.ForwardedRef<TemplateStudioSubHeaderHandle>
) => JSX.Element = ({ onViewChange, getErrors, onGitBranchChange }, ref) => {
  const { state, fetchTemplate, view, isReadonly, updateTemplateView } = React.useContext(TemplateContext)
  const {
    template,
    originalTemplate,
    isUpdated,
    entityValidityDetails,
    templateYamlError,
    templateView,
    cacheResponseMetadata: cacheResponse
  } = state
  const { getString } = useStrings()
  const { templateIdentifier } = useParams<TemplateStudioPathProps>()
  const isYaml = view === SelectedView.YAML
  const isVisualViewDisabled = React.useMemo(() => entityValidityDetails.valid === false, [entityValidityDetails.valid])
  const isPipelineGitCacheEnabled = useFeatureFlag(FeatureFlag.PIE_NG_GITX_CACHING)
  const saveTemplateHandleRef = React.useRef<SaveTemplateHandle | null>(null)

  React.useImperativeHandle(
    ref,
    () => ({
      updateTemplate: async (templateYaml: string) => {
        await saveTemplateHandleRef.current?.updateTemplate(templateYaml)
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [saveTemplateHandleRef.current]
  )

  const reloadFromCache = useCallback((): void => {
    updateTemplateView({ ...templateView, isYamlEditable: false })
    fetchTemplate({ forceFetch: true, forceUpdate: true, loadFromCache: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateView])

  const { open: openDiffModal } = useDiffDialog({
    originalYaml: stringify(originalTemplate),
    updatedYaml: stringify(template),
    title: getString('templatesLibrary.diffTitle')
  })

  return (
    <Layout.Vertical>
      <Container
        className={css.subHeader}
        height={49}
        padding={{ right: 'xlarge', left: 'xlarge' }}
        border={{ bottom: true, color: Color.GREY_200 }}
        background={Color.WHITE}
      >
        <Layout.Horizontal height={'100%'} flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <TemplateStudioSubHeaderLeftView onGitBranchChange={onGitBranchChange} />
          {!templateYamlError && (
            <Container>
              <VisualYamlToggle
                className={css.visualYamlToggle}
                selectedView={isYaml || isVisualViewDisabled ? SelectedView.YAML : SelectedView.VISUAL}
                onChange={nextMode => {
                  onViewChange(nextMode)
                }}
                disableToggle={isVisualViewDisabled}
              />
            </Container>
          )}
          <Container>
            <Layout.Horizontal spacing={'medium'} flex={{ alignItems: 'center' }}>
              {isPipelineGitCacheEnabled && !isEmpty(cacheResponse) && (
                <PipelineCachedCopy
                  reloadContent={getString('common.template.label')}
                  cacheResponse={cacheResponse}
                  reloadFromCache={reloadFromCache}
                  fetchError={templateYamlError as any}
                />
              )}
              {!templateYamlError && (
                <Layout.Horizontal spacing={'medium'} flex={{ alignItems: 'center' }}>
                  {isReadonly && (
                    <Container>
                      <Layout.Horizontal spacing={'small'}>
                        <Icon name="eye-open" size={16} color={Color.ORANGE_800} />
                        <Text color={Color.ORANGE_800} font={{ size: 'small' }}>
                          {getString('common.readonlyPermissions')}
                        </Text>
                      </Layout.Horizontal>
                    </Container>
                  )}
                  {isUpdated && !isReadonly && (
                    <Button
                      variation={ButtonVariation.LINK}
                      intent="warning"
                      className={css.tagRender}
                      onClick={openDiffModal}
                    >
                      {getString('unsavedChanges')}
                    </Button>
                  )}
                  {!isReadonly && (
                    <Container>
                      <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center' }}>
                        <SaveTemplatePopoverWithRef getErrors={getErrors} ref={saveTemplateHandleRef} />
                        {templateIdentifier !== DefaultNewTemplateId && (
                          <Button
                            disabled={!isUpdated}
                            onClick={() => {
                              fetchTemplate({ forceFetch: true, forceUpdate: true })
                            }}
                            variation={ButtonVariation.SECONDARY}
                            text={getString('common.discard')}
                          />
                        )}
                      </Layout.Horizontal>
                    </Container>
                  )}
                </Layout.Horizontal>
              )}
            </Layout.Horizontal>
          </Container>
        </Layout.Horizontal>
      </Container>
      <EndOfLifeBanner />
    </Layout.Vertical>
  )
}

export const TemplateStudioSubHeaderWithRef = React.forwardRef(TemplateStudioSubHeader)
