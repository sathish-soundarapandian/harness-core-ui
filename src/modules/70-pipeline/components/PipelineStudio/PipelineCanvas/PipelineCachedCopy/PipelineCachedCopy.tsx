/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import type { GetDataError } from 'restful-react'
import { Button, ButtonVariation, Icon, IconName, Layout, ModalDialog, Text, useToggleOpen } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import { Tooltip } from '@blueprintjs/core'
import { isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import type { CacheResponseMetadata, Failure } from 'services/pipeline-ng'
import css from './PipelineCachedCopy.module.scss'

// enum CacheState {
//   VALID_CACHE = 'VALID_CACHE',
//   STALE_CACHE = 'STALE_CACHE',
//   UNKNOWN = 'UNKNOWN'
// }
interface PipelineCachedCopyInterface {
  reloadContent: string
  cacheResponse: CacheResponseMetadata
  reloadFromCache: () => void
  fetchError?: GetDataError<Failure | Error> | null
}
const cacheStateToIconMap: Record<CacheResponseMetadata['cacheState'], IconName> = {
  VALID_CACHE: 'success-tick',
  STALE_CACHE: 'stale-cache',
  UNKNOWN: 'danger-icon'
}

function PipelineCachedCopy({
  reloadContent,
  cacheResponse,
  fetchError,
  reloadFromCache
}: PipelineCachedCopyInterface): React.ReactElement {
  const { getString } = useStrings()
  const { isOpen: isModalOpen, close: hideModal, open: showModal } = useToggleOpen(false)
  const { isOpen: isErrorModalOpen, close: hideErrorModal, open: showErrorModal } = useToggleOpen(false)

  useEffect(() => {
    if (!isEmpty(fetchError)) {
      showErrorModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchError])

  function reloadPipeline(): void {
    reloadFromCache()
  }

  function getTooltipContent(): JSX.Element {
    return (
      <>
        {/* Commenting this temporarily, as the reload of cache on pipeline studio initial render is not supported yet
        {cacheResponse.cacheState === CacheState.STALE_CACHE && (
          <div>{getString('pipeline.pipelineCachedCopy.cacheInProgress')}</div>
        )} */}
        <div>
          <span>{getString('common.lastUpdatedAt')}</span>: {formatDatetoLocale(cacheResponse.lastUpdatedAt)}
        </div>
      </>
    )
  }

  return (
    <>
      <div className={css.cachedcopy}>
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }} spacing="small">
          <Tooltip position="bottom" content={getTooltipContent()}>
            <Text
              font={{ align: 'center', size: 'xsmall' }}
              icon={cacheStateToIconMap[cacheResponse.cacheState]}
              iconProps={{ size: 12 }}
            >
              {getString('pipeline.pipelineCachedCopy.cachedCopyText')}
            </Text>
          </Tooltip>
          <Icon size={12} name="command-rollback" onClick={() => showModal()} />
        </Layout.Horizontal>
      </div>
      <ModalDialog
        isOpen={isModalOpen}
        isCloseButtonShown
        canEscapeKeyClose
        canOutsideClickClose
        enforceFocus={false}
        onClose={hideModal}
        title={
          <>
            <Icon name="warning-icon" intent={Intent.WARNING} size={32} />{' '}
            <span>{getString('pipeline.pipelineCachedCopy.reloadPipeline', { pageType: reloadContent })}</span>
          </>
        }
        footer={
          <Layout.Horizontal spacing="small">
            <Button variation={ButtonVariation.PRIMARY} text={getString('confirm')} onClick={reloadPipeline} />
            <Button
              variation={ButtonVariation.TERTIARY}
              text={getString('cancel')}
              onClick={/* istanbul ignore next */ () => hideModal()}
            />
          </Layout.Horizontal>
        }
        width={600}
        className={css.dialogStyles}
      >
        <Text margin={{ left: 'huge', right: 'huge' }}>
          {getString('pipeline.pipelineCachedCopy.reloadPipelineContent', { pageType: reloadContent })}
        </Text>
      </ModalDialog>
      <ModalDialog
        isOpen={isErrorModalOpen}
        isCloseButtonShown
        canEscapeKeyClose
        canOutsideClickClose
        enforceFocus={false}
        onClose={hideErrorModal}
        title={
          <>
            <Icon name="danger-icon" intent={Intent.DANGER} size={32} />
            <span>{getString('pipeline.pipelineCachedCopy.cacheUpdateFailed')}</span>
          </>
        }
        footer={
          <Layout.Horizontal spacing="small">
            <Button variation={ButtonVariation.PRIMARY} text={getString('common.tryAgain')} onClick={reloadPipeline} />
            <Button
              variation={ButtonVariation.TERTIARY}
              text={getString('cancel')}
              onClick={/* istanbul ignore next */ () => hideErrorModal()}
            />
          </Layout.Horizontal>
        }
        width={600}
        className={css.dialogStyles}
      >
        <Text margin={{ left: 'huge', right: 'huge' }}>
          {getString('pipeline.pipelineCachedCopy.reloadPipelineContent', { pageType: reloadContent })}
        </Text>
      </ModalDialog>
    </>
  )
}

export default PipelineCachedCopy
