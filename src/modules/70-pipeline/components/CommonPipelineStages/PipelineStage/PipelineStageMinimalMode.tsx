/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import {
  SelectOption,
  Select,
  Text,
  Button,
  ButtonVariation,
  Color,
  Container,
  Icon,
  Layout,
  PageError,
  TextInput,
  Dialog,
  FontVariation,
  shouldShowError,
  useToaster
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { get, isEmpty } from 'lodash-es'
import { Classes } from '@blueprintjs/core'
import {
  OrganizationResponse,
  ProjectAggregateDTO,
  useGetOrganizationList,
  useGetProjectAggregateDTOList
} from 'services/cd-ng'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import {
  PagePMSPipelineSummaryResponse,
  PipelineFilterProperties,
  PMSPipelineSummaryResponse,
  useGetPipelineList
} from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import type { PipelineListPageQueryParams } from '@pipeline/pages/pipeline-list/types'
import CDPipelineIllustration from '@pipeline/pages/pipeline-list/images/cd-pipeline-illustration.svg'
import type { PartiallyRequired } from '@pipeline/utils/types'
import { queryParamDecodeAll } from '@common/hooks/useQueryParams'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@pipeline/utils/constants'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { PipelineList } from './PipelineList'
import css from './PipelineStageMinimalMode.module.scss'

type PartialPipelineListPageQueryParams = PartiallyRequired<PipelineListPageQueryParams, 'page' | 'size'>
const queryParamOptions = {
  parseArrays: true,
  decoder: queryParamDecodeAll(),
  processQueryParams(params: PipelineListPageQueryParams): PartialPipelineListPageQueryParams {
    return {
      ...params,
      page: params.page ?? DEFAULT_PAGE_INDEX,
      size: params.size ?? DEFAULT_PAGE_SIZE
    }
  }
}

export function PipelineStageMinimalMode(): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<PipelineType<ProjectPathProps>>()
  const { selectedOrg: currentOrg, selectedProject: currentProject } = useAppStore()
  const { repoIdentifier, branch, page, size } = useQueryParams<PartialPipelineListPageQueryParams>(queryParamOptions)
  const { getRBACErrorMessage } = useRBACError()
  const { showError } = useToaster()

  const [pipelineListData, setPipelineListData] = useState<PagePMSPipelineSummaryResponse | undefined>()
  const [isOpen, setOpen] = useState(true)
  const [selectedOrg, setSelectedOrg] = useState<SelectOption>({
    label: get(currentOrg, 'name', orgIdentifier),
    value: get(currentOrg, 'identifier', orgIdentifier)
  } as SelectOption)
  const [selectedProject, setSelectedProject] = useState<SelectOption>({
    label: get(currentProject, 'name', projectIdentifier),
    value: get(currentProject, 'identifier', projectIdentifier)
  } as SelectOption)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [projectsQuery, setProjectsQuery] = useState('')
  const [selectedRow, setSelectedRow] = useState<PMSPipelineSummaryResponse>({})
  const { updateQueryParams } = useUpdateQueryParams<Partial<PipelineListPageQueryParams>>()

  const { data: orgData } = useGetOrganizationList({
    queryParams: {
      accountIdentifier: accountId,
      pageSize: 200
    }
  })
  const { data: projectData } = useGetProjectAggregateDTOList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: selectedOrg.value as string,
      searchTerm: projectsQuery || undefined
    },
    debounce: 400
  })

  const {
    mutate: loadPipelineList,
    error: pipelineListLoadingError,
    loading: isPipelineListLoading
  } = useGetPipelineList({
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const fetchPipelineList = React.useCallback(async () => {
    try {
      const { status, data } = await loadPipelineList(
        {
          filterType: 'PipelineSetup'
        } as PipelineFilterProperties,
        {
          queryParams: {
            accountIdentifier: accountId,
            projectIdentifier: selectedProject.value as string,
            orgIdentifier: selectedOrg.value as string,
            searchTerm,
            page,
            size,
            ...(repoIdentifier &&
              branch && {
                repoIdentifier,
                branch
              })
          }
        }
      )
      if (status === 'SUCCESS') {
        setPipelineListData(data)
      }
    } catch (e) {
      if (shouldShowError(e)) {
        showError(getRBACErrorMessage(e), undefined, 'pipeline.fetch.pipeline.error')
      }
    }
  }, [accountId, selectedProject, selectedOrg, searchTerm, page, size, repoIdentifier, branch])

  useEffect(() => {
    fetchPipelineList()
  }, [fetchPipelineList])

  const organizations: SelectOption[] = React.useMemo(() => {
    const data: OrganizationResponse[] = get(orgData, 'data.content', [])
    return data.map(org => {
      return {
        label: org.organization.name,
        value: org.organization.identifier
      }
    })
  }, [orgData])

  const projects: SelectOption[] = React.useMemo(() => {
    const data: ProjectAggregateDTO[] = get(projectData, 'data.content', [])
    let isSelectedProjectPresent = false
    const options = data.map(project => {
      isSelectedProjectPresent ||= project.projectResponse.project.identifier === get(currentProject, 'identifier')

      return {
        label: project.projectResponse.project.name,
        value: project.projectResponse.project.identifier
      }
    })

    if (!isSelectedProjectPresent && currentProject && currentProject.orgIdentifier === currentOrg && !projectsQuery) {
      options.unshift({
        label: currentProject.name,
        value: currentProject.identifier
      })
    }
    return options
  }, [projectData, selectedProject, projectsQuery, selectedOrg])

  function handleOrgChange(item: SelectOption): void {
    setSelectedOrg(item)
    setSelectedProject({ label: '', value: '' } as SelectOption)
    setSelectedRow({})
  }

  return (
    <Dialog
      isOpen={isOpen}
      enforceFocus={false}
      canEscapeKeyClose
      canOutsideClickClose
      onClose={() => setOpen(false)}
      className={css.dialog}
      title={
        <Text font={{ variation: FontVariation.H3 }}>{getString('pipeline.pipelineChaining.selectPipeline')}</Text>
      }
    >
      <Container className={css.mainContainer}>
        <Layout.Horizontal padding={{ top: 'large' }} spacing="medium">
          <div className={css.searchBox}>
            <TextInput
              wrapperClassName={css.search}
              placeholder={getString('search')}
              leftIcon="search"
              value={searchTerm}
              autoFocus
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={css.selectInput}>
            <Select items={organizations} onChange={handleOrgChange} value={selectedOrg} />
          </div>
          <div className={css.selectInput}>
            <Select
              items={projects}
              onQueryChange={setProjectsQuery}
              onChange={(item: SelectOption) => {
                setSelectedProject(item)
                setSelectedRow({})
              }}
              value={selectedProject}
            />
          </div>
        </Layout.Horizontal>
        <div className={css.pipelineContainer}>
          {isPipelineListLoading ? (
            <Container flex={{ align: 'center-center' }} padding="small" margin={{ top: 'xxlarge' }}>
              <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
            </Container>
          ) : pipelineListLoadingError ? (
            <Container margin={{ top: 'xxlarge' }}>
              <PageError message={get(pipelineListLoadingError, 'message')} onClick={() => fetchPipelineList()} />
            </Container>
          ) : pipelineListData?.content?.length ? (
            <PipelineList
              gotoPage={pageNumber => updateQueryParams({ page: pageNumber })}
              pipelineData={pipelineListData}
              selectedRow={selectedRow}
              setSelectedRow={setSelectedRow}
              orgIdentifier={selectedOrg.value as string}
              projectIdentifier={selectedProject.value as string}
            />
          ) : (
            <div className={css.noPipelineSection}>
              <img src={CDPipelineIllustration} className={css.image} />
              <Text className={css.noPipelineText} margin={{ top: 'medium', bottom: 'small' }}>
                {getString('pipeline.noPipelineText')}
              </Text>
            </div>
          )}
        </div>
        <Layout.Horizontal spacing="medium" padding={{ top: 'medium' }}>
          <Button
            variation={ButtonVariation.PRIMARY}
            text={getString('entityReference.apply')}
            onClick={() => setOpen(false)}
            disabled={isEmpty(selectedRow)}
            className={cx(Classes.POPOVER_DISMISS)}
          />
          <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={() => setOpen(false)} />
        </Layout.Horizontal>
      </Container>
    </Dialog>
  )
}
