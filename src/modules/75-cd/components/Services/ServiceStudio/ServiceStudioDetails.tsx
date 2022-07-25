/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Container,
  Tabs,
  Tab,
  Button,
  ButtonVariation,
  Layout,
  PageSpinner,
  useToaster,
  VisualYamlSelectedView as SelectedView
} from '@harness/uicore'
import { cloneDeep, defaultTo, get, isEmpty, omit, set } from 'lodash-es'
import produce from 'immer'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGServiceConfig, useCreateServiceV2, useUpdateServiceV2 } from 'services/cd-ng'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { useServiceContext } from '@cd/context/ServiceContext'
import { useCache } from '@common/hooks/useCache'
import ServiceConfiguration from './ServiceConfiguration/ServiceConfiguration'
import { ServiceTabs, setNameIDDescription, ServicePipelineConfig } from '../utils/ServiceUtils'
import css from '@cd/components/Services/ServiceStudio/ServiceStudio.module.scss'

interface ServiceStudioDetailsProps {
  serviceData: NGServiceConfig
  summaryPanel?: JSX.Element
  refercedByPanel?: JSX.Element
}
function ServiceStudioDetails(props: ServiceStudioDetailsProps): React.ReactElement | null {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { tab } = useQueryParams<{ tab: string }>()
  const { updateQueryParams } = useUpdateQueryParams()
  const {
    state: { pipeline, isUpdated, pipelineView, isLoading },
    view,
    updatePipelineView,
    fetchPipeline,
    isReadonly
  } = usePipelineContext()

  const { isServiceEntityModalView, isServiceCreateModalView, onServiceCreate, onCloseModal, serviceCacheKey } =
    useServiceContext()
  const [selectedTabId, setSelectedTabId] = useState(tab ?? ServiceTabs.SUMMARY)
  const { showSuccess, showError, clear } = useToaster()
  const isSvcEnvEntityEnabled = useFeatureFlag(FeatureFlag.NG_SVC_ENV_REDESIGN)
  const { setCache } = useCache()

  const handleTabChange = useCallback(
    (nextTab: ServiceTabs): void => {
      setSelectedTabId(nextTab)
      updateQueryParams({ tab: nextTab })
    },
    [updateQueryParams]
  )

  const { mutate: createService } = useCreateServiceV2({
    queryParams: {
      accountIdentifier: accountId
    },
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })
  const { mutate: updateService } = useUpdateServiceV2({
    queryParams: {
      accountIdentifier: accountId
    },
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  const saveAndPublishService = async (): Promise<void> => {
    clear()

    let updatedService
    if (view === SelectedView.YAML) {
      const stage = get(pipeline, 'stages[0].stage.spec.serviceConfig.serviceDefinition')

      updatedService = produce(props.serviceData, draft => {
        if (draft) {
          setNameIDDescription(draft.service as PipelineInfoConfig, pipeline as ServicePipelineConfig)
          set(draft, 'service.serviceDefinition', stage)
        }
      })
    }
    const finalServiceData = view === SelectedView.VISUAL ? props.serviceData : updatedService

    const body = {
      ...omit(cloneDeep(finalServiceData?.service), 'serviceDefinition', 'gitOpsEnabled'),
      projectIdentifier,
      orgIdentifier,
      yaml: yamlStringify({ ...finalServiceData })
    }

    try {
      const response = isServiceCreateModalView ? await createService(body) : await updateService(body)
      if (response.status === 'SUCCESS') {
        if (isServiceEntityModalView) {
          const serviceResponse = response.data?.service

          if (!isServiceCreateModalView) {
            if (!isEmpty(serviceResponse?.yaml) && !isEmpty(serviceCacheKey)) {
              const parsedYaml = yamlParse<NGServiceConfig>(defaultTo(serviceResponse?.yaml, ''))
              const serviceInfo = parsedYaml.service?.serviceDefinition
              setCache(serviceCacheKey, serviceInfo)
            }
          }
          onServiceCreate?.({
            identifier: serviceResponse?.identifier as string,
            name: serviceResponse?.name as string
          })
        } else {
          showSuccess(
            isServiceEntityModalView && isServiceCreateModalView
              ? getString('common.serviceCreated')
              : getString('common.serviceUpdated')
          )
          fetchPipeline({ forceFetch: true, forceUpdate: true })
        }
      } else {
        throw response
      }
    } catch (e: any) {
      showError(e?.data?.message || e?.message || getString('commonError'))
    }
  }

  if (isLoading) {
    return (
      <React.Fragment>
        <PageSpinner fixed />
        <div /> {/* this empty div is required for rendering layout correctly */}
      </React.Fragment>
    )
  }

  if (isSvcEnvEntityEnabled) {
    if (isServiceEntityModalView) {
      return (
        <>
          <ServiceConfiguration serviceData={props.serviceData} />
          <Layout.Horizontal className={css.btnContainer} spacing="medium" margin={{ top: 'medium', bottom: 'medium' }}>
            <Button
              variation={ButtonVariation.PRIMARY}
              disabled={!isUpdated}
              text={getString('save')}
              onClick={saveAndPublishService}
              className={css.saveButton}
            />
            <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onCloseModal} />
          </Layout.Horizontal>
        </>
      )
    }

    return (
      <Container padding={{ left: 'xlarge', right: 'xlarge' }} className={css.tabsContainer}>
        <Tabs id="serviceDetailsTab" selectedTabId={selectedTabId} onChange={handleTabChange}>
          <Tab id={ServiceTabs.SUMMARY} title={getString('summary')} panel={props.summaryPanel} />

          <Tab
            id={ServiceTabs.Configuration}
            title={getString('configuration')}
            panel={<ServiceConfiguration serviceData={props.serviceData} />}
          />

          <Tab id={ServiceTabs.REFERENCED_BY} title={getString('referencedBy')} panel={props.refercedByPanel} />
          {/* <Tab id={ServiceTabs.ActivityLog} title={getString('activityLog')} panel={<></>} /> */}
        </Tabs>
        {selectedTabId === ServiceTabs.Configuration && (
          <Layout.Horizontal className={css.btnContainer}>
            {isUpdated && !isReadonly && <div className={css.tagRender}>{getString('unsavedChanges')}</div>}
            <Button
              variation={ButtonVariation.PRIMARY}
              disabled={!isUpdated}
              text={getString('save')}
              onClick={saveAndPublishService}
              className={css.saveButton}
            />
            <Button
              disabled={!isUpdated}
              onClick={() => {
                updatePipelineView({ ...pipelineView, isYamlEditable: false })
                fetchPipeline({ forceFetch: true, forceUpdate: true })
              }}
              className={css.discardBtn}
              variation={ButtonVariation.SECONDARY}
              text={getString('pipeline.discard')}
            />
          </Layout.Horizontal>
        )}
      </Container>
    )
  }

  return (
    <Container padding={{ left: 'xlarge', right: 'xlarge' }} className={css.tabsContainer}>
      <Tabs id="serviceDetailsTab" selectedTabId={selectedTabId} onChange={handleTabChange}>
        <Tab id={ServiceTabs.SUMMARY} title={getString('summary')} panel={props.summaryPanel} />
        <Tab id={ServiceTabs.REFERENCED_BY} title={getString('referencedBy')} panel={props.refercedByPanel} />
      </Tabs>
    </Container>
  )
}

export default ServiceStudioDetails
