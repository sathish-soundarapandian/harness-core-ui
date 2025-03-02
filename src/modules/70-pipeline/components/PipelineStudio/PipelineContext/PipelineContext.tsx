/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { deleteDB, IDBPDatabase, openDB } from 'idb'
import { cloneDeep, defaultTo, get, isEmpty, isEqual, isNil, omit, pick, merge, map, uniq } from 'lodash-es'
import {
  AllowedTypes,
  AllowedTypesWithRunTime,
  IconName,
  MultiTypeInputType,
  VisualYamlSelectedView as SelectedView
} from '@harness/uicore'
import type { GetDataError } from 'restful-react'
import type { PermissionCheck } from 'services/rbac'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import SessionToken from 'framework/utils/SessionToken'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import {
  PipelineInfoConfig,
  StageElementConfig,
  StageElementWrapperConfig,
  CreatePipelineQueryParams,
  createPipelineV2Promise,
  EntityGitDetails,
  ErrorNodeSummary,
  EntityValidityDetails,
  Failure,
  getPipelineSummaryPromise,
  getPipelinePromise,
  GetPipelineQueryParams,
  PutPipelineQueryParams,
  putPipelineV2Promise,
  ResponsePMSPipelineResponseDTO,
  YamlSchemaErrorWrapperDTO,
  ResponsePMSPipelineSummaryResponse,
  CacheResponseMetadata
} from 'services/pipeline-ng'
import { useGlobalEventListener, useLocalStorage, useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { parse, yamlStringify } from '@common/utils/YamlHelperMethods'
import type { PipelineStageWrapper } from '@pipeline/utils/pipelineTypes'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import {
  getResolvedCustomDeploymentDetailsByRef,
  getTemplateTypesByRef,
  TemplateServiceDataType
} from '@pipeline/utils/templateUtils'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import type { Pipeline, TemplateIcons } from '@pipeline/utils/types'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import {
  ActionReturnType,
  DefaultNewPipelineId,
  DefaultPipeline,
  DrawerTypes,
  initialState,
  PipelineContextActions,
  PipelineReducer,
  PipelineReducerState,
  PipelineViewData,
  SelectionState
} from './PipelineActions'
import type { AbstractStepFactory } from '../../AbstractSteps/AbstractStepFactory'
import type { PipelineStagesProps } from '../../PipelineStages/PipelineStages'
import { PipelineSelectionState, usePipelineQuestParamState } from '../PipelineQueryParamState/usePipelineQueryParam'
import {
  comparePipelines,
  getStageFromPipeline as _getStageFromPipeline,
  getStagePathFromPipeline as _getStagePathFromPipeline
} from './helpers'

export interface PipelineInfoConfigWithGitDetails extends Partial<PipelineInfoConfig> {
  gitDetails?: EntityGitDetails
  entityValidityDetails?: EntityValidityDetails
  templateError?: GetDataError<Failure | Error> | null
  remoteFetchError?: GetDataError<Failure | Error> | null
  yamlSchemaErrorWrapper?: YamlSchemaErrorWrapperDTO
  cacheResponse?: CacheResponseMetadata
  validationUuid?: string
}

interface FetchError {
  templateError?: GetDataError<Failure | Error>
  remoteFetchError?: GetDataError<Failure | Error>
}

const logger = loggerFor(ModuleName.CD)
const DBNotFoundErrorMessage = 'There was no DB found'

const remoteFetchErrorGitDetails = (remoteFetchError: ResponsePMSPipelineResponseDTO): Partial<EntityGitDetails> => {
  const branch = remoteFetchError?.metaData?.branch
  return branch ? { branch } : {}
}

export const getPipelineByIdentifier = (
  params: GetPipelineQueryParams & GitQueryParams,
  identifier: string,
  loadFromCache?: boolean,
  signal?: AbortSignal
): Promise<PipelineInfoConfigWithGitDetails | FetchError> => {
  return getPipelinePromise(
    {
      pipelineIdentifier: identifier,
      queryParams: {
        accountIdentifier: params.accountIdentifier,
        orgIdentifier: params.orgIdentifier,
        projectIdentifier: params.projectIdentifier,
        validateAsync: params.validateAsync,
        ...(params.branch ? { branch: params.branch } : {}),
        ...(params.repoIdentifier ? { repoIdentifier: params.repoIdentifier } : {}),
        parentEntityConnectorRef: params.connectorRef,
        parentEntityRepoName: params.repoName,
        ...(params?.storeType === StoreType.REMOTE && !params.branch ? { loadFromFallbackBranch: true } : {})
      },
      requestOptions: {
        headers: {
          'content-type': 'application/yaml',
          ...(loadFromCache ? { 'Load-From-Cache': 'true' } : {})
        }
      }
    },
    signal
  ).then((response: ResponsePMSPipelineResponseDTO & { message?: string }) => {
    let obj = {} as ResponsePMSPipelineResponseDTO
    if ((typeof response as unknown) === 'string') {
      obj = defaultTo(parse<any>(response as string)?.data?.yamlPipeline, {})
    } else if (response.data?.yamlPipeline) {
      obj = response
    }
    if (obj.status === 'SUCCESS' && obj.data?.yamlPipeline) {
      let yamlPipelineDetails: Pipeline | null = null
      try {
        yamlPipelineDetails = parse<Pipeline>(obj.data?.yamlPipeline)
      } catch (e) {
        // caught YAMLSemanticError, YAMLReferenceError, YAMLSyntaxError, YAMLWarning
      }

      return {
        ...(yamlPipelineDetails !== null && { ...yamlPipelineDetails.pipeline }),
        gitDetails: obj.data.gitDetails ?? {},
        entityValidityDetails: obj.data.entityValidityDetails ?? {},
        yamlSchemaErrorWrapper: obj.data.yamlSchemaErrorWrapper ?? {},
        modules: response.data?.modules,
        cacheResponse: obj.data?.cacheResponse,
        validationUuid: obj.data?.validationUuid
      }
    } else if (response?.status === 'ERROR' && params?.storeType === StoreType.REMOTE) {
      return { remoteFetchError: response } as FetchError // handling remote pipeline not found
    } else {
      const message = defaultTo(response?.message, '')
      return {
        templateError: {
          message,
          data: {
            message
          },
          status: 500
        }
      }
    }
  })
}

export const getPipelineMetadataByIdentifier = (
  params: GetPipelineQueryParams & GitQueryParams,
  identifier: string,
  signal?: AbortSignal
): Promise<ResponsePMSPipelineSummaryResponse | FetchError> => {
  return getPipelineSummaryPromise(
    {
      pipelineIdentifier: identifier,
      queryParams: {
        accountIdentifier: params.accountIdentifier,
        orgIdentifier: params.orgIdentifier,
        projectIdentifier: params.projectIdentifier,
        ...(params.branch ? { branch: params.branch } : {}),
        ...(params.repoIdentifier ? { repoIdentifier: params.repoIdentifier } : {}),
        parentEntityConnectorRef: params.connectorRef,
        parentEntityRepoName: params.repoName,
        getMetadataOnly: true
      },
      requestOptions: {
        headers: {
          'content-type': 'application/json'
        }
      }
    },
    signal
  ).then((response: ResponsePMSPipelineSummaryResponse) => {
    return response
  })
}

export const savePipeline = (
  params: CreatePipelineQueryParams & PutPipelineQueryParams,
  pipeline: PipelineInfoConfig,
  isEdit = false
): Promise<Failure | undefined> => {
  const body = yamlStringify({
    pipeline: { ...pipeline, ...pick(params, 'projectIdentifier', 'orgIdentifier') }
  })

  return isEdit
    ? putPipelineV2Promise({
        pipelineIdentifier: pipeline.identifier,
        queryParams: {
          ...params
        },
        body: body as any,
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      })
        .then((response: unknown) => {
          if (typeof response === 'string') {
            return JSON.parse(response as string) as Failure
          } else {
            return response
          }
        })
        .catch(err => {
          return err
        })
    : createPipelineV2Promise({
        body: body as any,
        queryParams: {
          ...params
        },
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      })
        .then(async (response: unknown) => {
          if (typeof response === 'string') {
            return JSON.parse(response as unknown as string) as Failure
          } else {
            return response as unknown as Failure
          }
        })
        .catch(err => {
          return err
        })
}

const DBInitializationFailed = 'DB Creation retry exceeded.'

let IdbPipeline: IDBPDatabase | undefined
const IdbPipelineStoreName = 'pipeline-cache'
export const PipelineDBName = 'pipeline-db'
const KeyPath = 'identifier'

export interface StageAttributes {
  name: string
  type: string
  icon: IconName
  iconColor: string
  isApproval: boolean
  openExecutionStrategy: boolean
}
export interface StagesMap {
  [key: string]: StageAttributes
}

export interface PipelineContextInterface {
  state: PipelineReducerState
  stagesMap: StagesMap
  stepsFactory: AbstractStepFactory
  view: string
  contextType: string
  allowableTypes: AllowedTypes
  isReadonly: boolean
  scope: Scope
  setSchemaErrorView: (flag: boolean) => void
  setView: (view: SelectedView) => void
  renderPipelineStage: (args: Omit<PipelineStagesProps, 'children'>) => React.ReactElement<PipelineStagesProps>
  fetchPipeline: (args: FetchPipelineUnboundProps) => Promise<void>
  setYamlHandler: (yamlHandler: YamlBuilderHandlerBinding) => void
  setTemplateTypes: (data: { [key: string]: string }) => void
  setTemplateIcons: (data: TemplateIcons) => void
  setTemplateServiceData: (data: TemplateServiceDataType) => void
  updatePipeline: (pipeline: PipelineInfoConfig, viewType?: SelectedView) => Promise<void>
  updatePipelineStoreMetadata: (storeMetadata: StoreMetadata, gitDetails: EntityGitDetails) => Promise<void>
  updateGitDetails: (gitDetails: EntityGitDetails) => Promise<void>
  updateEntityValidityDetails: (entityValidityDetails: EntityValidityDetails) => Promise<void>
  updatePipelineView: (data: PipelineViewData) => void
  deletePipelineCache: (gitDetails?: EntityGitDetails) => Promise<void>
  getStageFromPipeline<T extends StageElementConfig = StageElementConfig>(
    stageId: string,
    pipeline?: PipelineInfoConfig | StageElementWrapperConfig
  ): PipelineStageWrapper<T>
  runPipeline: (identifier: string) => void
  pipelineSaved: (pipeline: PipelineInfoConfig) => void
  updateStage: (stage: StageElementConfig) => Promise<void>
  /** @deprecated use `setSelection` */
  setSelectedStageId: (selectedStageId: string | undefined) => void
  /** @deprecated use `setSelection` */
  setSelectedStepId: (selectedStepId: string | undefined) => void
  /** @deprecated use `setSelection` */
  setSelectedSectionId: (selectedSectionId: string | undefined) => void
  setSelection: (selectionState: PipelineSelectionState) => void
  getStagePathFromPipeline(stageId: string, prefix?: string, pipeline?: PipelineInfoConfig): string
  /** Useful for setting any intermittent loading state. Eg. any API call loading, any custom loading, etc */
  setIntermittentLoading: (isIntermittentLoading: boolean) => void
  setValidationUuid: (uuid: string) => void
}

interface PipelinePayload {
  identifier: string
  pipeline: PipelineInfoConfig | undefined
  originalPipeline?: PipelineInfoConfig
  isUpdated: boolean
  modules?: string[]
  storeMetadata?: StoreMetadata
  gitDetails: EntityGitDetails
  entityValidityDetails?: EntityValidityDetails
  templateInputsErrorNodeSummary?: ErrorNodeSummary
  yamlSchemaErrorWrapper?: YamlSchemaErrorWrapperDTO
  cacheResponse?: CacheResponseMetadata
  validationUuid?: string
}

const getId = (
  accountIdentifier: string,
  orgIdentifier: string,
  projectIdentifier: string,
  pipelineIdentifier: string,
  repoIdentifier = '',
  branch = ''
): string =>
  `${accountIdentifier}_${orgIdentifier}_${projectIdentifier}_${pipelineIdentifier}_${repoIdentifier}_${branch}`

export interface FetchPipelineBoundProps {
  dispatch: React.Dispatch<ActionReturnType>
  queryParams: GetPipelineQueryParams
  pipelineIdentifier: string
  gitDetails: EntityGitDetails
  storeMetadata?: StoreMetadata
  supportingTemplatesGitx?: boolean
}

export interface FetchPipelineUnboundProps {
  forceFetch?: boolean
  forceUpdate?: boolean
  newPipelineId?: string
  signal?: AbortSignal
  repoIdentifier?: string
  branch?: string
  loadFromCache?: boolean
}

export const findAllByKey = (keyToFind: string, obj?: PipelineInfoConfig): string[] => {
  return obj
    ? Object.entries(obj).reduce(
        (acc: string[], [key, value]) =>
          key === keyToFind
            ? acc.concat(value as string)
            : typeof value === 'object'
            ? acc.concat(findAllByKey(keyToFind, value))
            : acc,
        []
      )
    : []
}

const getResolvedCustomDeploymentDetailsMap = (
  pipeline: PipelineInfoConfig,
  queryParams: GetPipelineQueryParams
): ReturnType<typeof getResolvedCustomDeploymentDetailsByRef> => {
  const templateRefs = uniq(map(findAllByKey('customDeploymentRef', pipeline), 'templateRef'))
  return getResolvedCustomDeploymentDetailsByRef(
    {
      accountIdentifier: queryParams.accountIdentifier,
      orgIdentifier: queryParams.orgIdentifier,
      projectIdentifier: queryParams.projectIdentifier,
      templateListType: 'Stable',
      repoIdentifier: queryParams.repoIdentifier,
      branch: queryParams.branch,
      getDefaultFromOtherRepo: true
    },
    templateRefs
  )
}

const getTemplateType = (
  pipeline: PipelineInfoConfig,
  queryParams: GetPipelineQueryParams,
  storeMetadata?: StoreMetadata,
  supportingTemplatesGitx?: boolean,
  loadFromCache?: boolean
): ReturnType<typeof getTemplateTypesByRef> => {
  const templateRefs = uniq(findAllByKey('templateRef', pipeline))
  return getTemplateTypesByRef(
    {
      accountIdentifier: queryParams.accountIdentifier,
      orgIdentifier: queryParams.orgIdentifier,
      projectIdentifier: queryParams.projectIdentifier,
      templateListType: 'Stable',
      repoIdentifier: queryParams.repoIdentifier,
      branch: queryParams.branch,
      getDefaultFromOtherRepo: true
    },
    templateRefs,
    storeMetadata,
    supportingTemplatesGitx,
    loadFromCache
  )
}

const getRepoIdentifierName = (gitDetails?: EntityGitDetails): string => {
  return gitDetails?.repoIdentifier || gitDetails?.repoName || ''
}

const _fetchPipeline = async (props: FetchPipelineBoundProps, params: FetchPipelineUnboundProps): Promise<void> => {
  const {
    dispatch,
    queryParams,
    pipelineIdentifier: identifier,
    gitDetails,
    supportingTemplatesGitx,
    storeMetadata
  } = props
  const {
    forceFetch = false,
    forceUpdate = false,
    newPipelineId,
    signal,
    repoIdentifier,
    branch,
    loadFromCache = true
  } = params
  const pipelineId = defaultTo(newPipelineId, identifier)
  let id = getId(
    queryParams.accountIdentifier,
    defaultTo(queryParams.orgIdentifier, ''),
    defaultTo(queryParams.projectIdentifier, ''),
    pipelineId,
    getRepoIdentifierName(gitDetails),
    defaultTo(gitDetails.branch, '')
  )
  dispatch(PipelineContextActions.fetching())

  let data: PipelinePayload | undefined
  try {
    data =
      IdbPipeline?.objectStoreNames?.contains(IdbPipelineStoreName) &&
      (await IdbPipeline?.get(IdbPipelineStoreName, id))
  } catch (_) {
    logger.info(DBNotFoundErrorMessage)
  }

  if ((!data || forceFetch) && pipelineId !== DefaultNewPipelineId) {
    const pipelineByIdPromise = getPipelineByIdentifier(
      {
        ...queryParams,
        validateAsync: true,
        ...(repoIdentifier ? { repoIdentifier } : {}),
        ...(branch ? { branch } : {})
      },
      pipelineId,
      loadFromCache,
      signal
    )

    const pipelineMetaDataPromise = getPipelineMetadataByIdentifier(
      { ...queryParams, ...(repoIdentifier ? { repoIdentifier } : {}), ...(branch ? { branch } : {}) },
      pipelineId,
      signal
    )

    const pipelineAPIResponses = await Promise.allSettled([pipelineByIdPromise, pipelineMetaDataPromise])

    const [pipelineById, pipelineMetaData] = pipelineAPIResponses.map((response: PromiseSettledResult<unknown>) => {
      if (response?.status === 'fulfilled') {
        return response?.value
      } else {
        return response?.reason
      }
    })

    // For aborted request, we have to ignore else Abort error will be set as pipeline in IDB
    // Adding check for stack trace too to ignore other unexpected error
    if (
      pipelineById?.stack ||
      pipelineById?.name === 'AbortError' ||
      pipelineMetaData?.stack ||
      pipelineMetaData?.name === 'AbortError'
    ) {
      return
    }

    if (pipelineById?.templateError) {
      dispatch(PipelineContextActions.error({ templateError: pipelineById.templateError }))
      return
    }

    if (pipelineById?.remoteFetchError) {
      dispatch(
        PipelineContextActions.error({
          remoteFetchError: pipelineById.remoteFetchError,
          pipeline: { ...pick(pipelineMetaData?.data, ['name', 'identifier', 'description', 'tags']) },
          gitDetails: {
            ...pipelineMetaData?.data?.gitDetails,
            ...remoteFetchErrorGitDetails(pipelineById.remoteFetchError)
          }
        })
      )
      return
    }

    const pipelineWithGitDetails = pipelineById as PipelineInfoConfigWithGitDetails & { modules?: string[] }

    id = getId(
      queryParams.accountIdentifier,
      defaultTo(queryParams.orgIdentifier, ''),
      defaultTo(queryParams.projectIdentifier, ''),
      pipelineId,
      defaultTo(getRepoIdentifierName(pipelineWithGitDetails?.gitDetails), gitDetails.repoIdentifier),
      defaultTo(pipelineWithGitDetails?.gitDetails?.branch, defaultTo(gitDetails.branch, ''))
    )

    try {
      data = await IdbPipeline?.get(IdbPipelineStoreName, id)
    } catch (_) {
      logger.info(DBNotFoundErrorMessage)
    }
    const pipeline = omit(
      pipelineWithGitDetails,
      'gitDetails',
      'entityValidityDetails',
      'repo',
      'branch',
      'connectorRef',
      'filePath',
      'yamlSchemaErrorWrapper',
      'modules',
      'cacheResponse',
      'validationUuid'
    ) as PipelineInfoConfig
    const payload: PipelinePayload = {
      [KeyPath]: id,
      pipeline,
      originalPipeline: cloneDeep(pipeline),
      isUpdated: false,
      modules: pipelineWithGitDetails?.modules,
      gitDetails:
        pipelineWithGitDetails?.gitDetails?.objectId || pipelineWithGitDetails?.gitDetails?.commitId
          ? pipelineWithGitDetails.gitDetails
          : data?.gitDetails ?? {},
      entityValidityDetails: defaultTo(
        pipelineWithGitDetails?.entityValidityDetails,
        defaultTo(data?.entityValidityDetails, {})
      ),
      yamlSchemaErrorWrapper: defaultTo(
        pipelineWithGitDetails?.yamlSchemaErrorWrapper,
        defaultTo(data?.yamlSchemaErrorWrapper, {})
      ),
      cacheResponse: defaultTo(pipelineWithGitDetails?.cacheResponse, data?.cacheResponse),
      validationUuid: defaultTo(pipelineWithGitDetails?.validationUuid, data?.validationUuid)
    }
    const templateQueryParams = {
      ...queryParams,
      repoIdentifier: defaultTo(
        gitDetails.repoIdentifier,
        defaultTo(pipelineWithGitDetails?.gitDetails?.repoIdentifier, '')
      ),
      branch: defaultTo(gitDetails.branch, defaultTo(pipelineWithGitDetails?.gitDetails?.branch, ''))
    }
    if (data && !forceUpdate) {
      const { templateTypes, templateServiceData, templateIcons } = data.pipeline
        ? await getTemplateType(
            data.pipeline,
            templateQueryParams,
            storeMetadata,
            supportingTemplatesGitx,
            loadFromCache
          )
        : { templateTypes: {}, templateServiceData: {}, templateIcons: {} }

      const { resolvedCustomDeploymentDetailsByRef } = data.pipeline
        ? await getResolvedCustomDeploymentDetailsMap(data.pipeline, templateQueryParams)
        : { resolvedCustomDeploymentDetailsByRef: {} }
      dispatch(
        PipelineContextActions.success({
          error: '',
          remoteFetchError: undefined,
          pipeline: data.pipeline,
          originalPipeline: cloneDeep(pipeline),
          isBEPipelineUpdated: comparePipelines(pipeline, data.originalPipeline),
          isUpdated: comparePipelines(pipeline, data.pipeline),
          modules: defaultTo(pipelineWithGitDetails?.modules, data.modules),
          gitDetails:
            pipelineWithGitDetails?.gitDetails?.objectId || pipelineWithGitDetails?.gitDetails?.commitId
              ? pipelineWithGitDetails.gitDetails
              : defaultTo(data?.gitDetails, {}),
          templateTypes,
          templateIcons,
          templateServiceData,
          resolvedCustomDeploymentDetailsByRef,
          entityValidityDetails: defaultTo(
            pipelineWithGitDetails?.entityValidityDetails,
            defaultTo(data?.entityValidityDetails, {})
          ),
          yamlSchemaErrorWrapper: defaultTo(
            pipelineWithGitDetails?.yamlSchemaErrorWrapper,
            defaultTo(data?.yamlSchemaErrorWrapper, {})
          ),
          cacheResponse: defaultTo(pipelineWithGitDetails?.cacheResponse, data?.cacheResponse),
          validationUuid: defaultTo(pipelineWithGitDetails?.validationUuid, data?.validationUuid)
        })
      )
    } else {
      // try_catch to update IDBPipeline only if IdbPipeline is defined
      try {
        await IdbPipeline?.put(IdbPipelineStoreName, payload)
      } catch (_) {
        logger.info(DBNotFoundErrorMessage)
      }
      const { templateTypes, templateServiceData, templateIcons } = await getTemplateType(
        pipeline,
        templateQueryParams,
        storeMetadata,
        supportingTemplatesGitx,
        loadFromCache
      )
      const { resolvedCustomDeploymentDetailsByRef } = await getResolvedCustomDeploymentDetailsMap(
        pipeline,
        templateQueryParams
      )
      dispatch(
        PipelineContextActions.success({
          error: '',
          remoteFetchError: undefined,
          pipeline,
          originalPipeline: cloneDeep(pipeline),
          isBEPipelineUpdated: false,
          isUpdated: false,
          modules: payload.modules,
          gitDetails: payload.gitDetails,
          entityValidityDetails: payload.entityValidityDetails,
          cacheResponse: payload.cacheResponse,
          templateTypes,
          templateIcons,
          templateServiceData,
          resolvedCustomDeploymentDetailsByRef,
          yamlSchemaErrorWrapper: payload?.yamlSchemaErrorWrapper,
          validationUuid: payload.validationUuid
        })
      )
    }
    dispatch(PipelineContextActions.initialized())
  } else {
    dispatch(
      PipelineContextActions.success({
        error: '',
        remoteFetchError: undefined,
        pipeline: defaultTo(data?.pipeline, {
          ...DefaultPipeline,
          projectIdentifier: queryParams.projectIdentifier,
          orgIdentifier: queryParams.orgIdentifier
        }),
        originalPipeline: defaultTo(
          cloneDeep(data?.originalPipeline),
          cloneDeep({
            ...DefaultPipeline,
            projectIdentifier: queryParams.projectIdentifier,
            orgIdentifier: queryParams.orgIdentifier
          })
        ),
        isUpdated: true,
        modules: data?.modules,
        isBEPipelineUpdated: false,
        gitDetails: defaultTo(data?.gitDetails, {}),
        entityValidityDetails: defaultTo(data?.entityValidityDetails, {}),
        yamlSchemaErrorWrapper: defaultTo(data?.yamlSchemaErrorWrapper, {}),
        cacheResponse: data?.cacheResponse,
        validationUuid: data?.validationUuid
      })
    )
    dispatch(PipelineContextActions.initialized())
  }
}

const _softFetchPipeline = async (
  dispatch: React.Dispatch<ActionReturnType>,
  queryParams: GetPipelineQueryParams,
  pipelineId: string,
  originalPipeline: PipelineInfoConfig,
  pipeline: PipelineInfoConfig,
  pipelineView: PipelineReducerState['pipelineView'],
  selectionState: PipelineReducerState['selectionState'],
  gitDetails: EntityGitDetails
): Promise<void> => {
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    pipelineId,
    getRepoIdentifierName(gitDetails),
    gitDetails.branch || ''
  )
  if (IdbPipeline) {
    try {
      const data: PipelinePayload = await IdbPipeline.get(IdbPipelineStoreName, id)
      if (data?.pipeline && !isEqual(data.pipeline, pipeline)) {
        const isUpdated = comparePipelines(originalPipeline, data.pipeline)
        if (!isEmpty(selectionState.selectedStageId) && selectionState.selectedStageId) {
          const stage = _getStageFromPipeline(selectionState.selectedStageId, data.pipeline).stage
          if (isNil(stage)) {
            dispatch(
              PipelineContextActions.success({
                error: '',
                pipeline: data.pipeline,
                isUpdated,
                pipelineView: {
                  ...pipelineView,
                  isSplitViewOpen: false,
                  isDrawerOpened: false,
                  drawerData: { type: DrawerTypes.StepConfig },
                  splitViewData: {}
                }
              })
            )
          } else {
            dispatch(PipelineContextActions.success({ error: '', pipeline: data.pipeline, isUpdated }))
          }
        } else {
          dispatch(PipelineContextActions.success({ error: '', pipeline: data.pipeline, isUpdated }))
        }
      }
    } catch (err) {
      dispatch(PipelineContextActions.success({ error: 'DB is not initialized' }))
    }
  } else {
    dispatch(PipelineContextActions.success({ error: 'DB is not initialized' }))
  }
}

interface UpdateGitDetailsArgs {
  dispatch: React.Dispatch<ActionReturnType>
  queryParams: GetPipelineQueryParams
  identifier: string
  originalPipeline: PipelineInfoConfig
  pipeline: PipelineInfoConfig
}

const _updateStoreMetadata = async (
  args: UpdateGitDetailsArgs,
  storeMetadata: StoreMetadata,
  gitDetails: EntityGitDetails
): Promise<void> => {
  const { dispatch, queryParams, identifier, originalPipeline, pipeline } = args
  await _deletePipelineCache(queryParams, identifier, {})
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    identifier,
    getRepoIdentifierName(gitDetails),
    gitDetails.branch || ''
  )
  const isUpdated = comparePipelines(originalPipeline, pipeline)

  // In pipeline studio, storeMetadata only contains 2 properties - connectorRef and storeType.
  // We need all 5 properties in storeMetadata for use in templates, Other 3 are coming from gitDetails
  const newStoreMetadata: StoreMetadata = {
    ...storeMetadata,
    ...(storeMetadata.storeType === StoreType.REMOTE
      ? pick(gitDetails, 'repoName', 'branch', 'filePath')
      : { connectorRef: undefined })
  }

  try {
    if (IdbPipeline) {
      const payload: PipelinePayload = {
        [KeyPath]: id,
        pipeline,
        originalPipeline,
        isUpdated,
        storeMetadata,
        gitDetails
      }
      await IdbPipeline.put(IdbPipelineStoreName, payload)
    }
    dispatch(
      PipelineContextActions.success({ error: '', pipeline, isUpdated, storeMetadata: newStoreMetadata, gitDetails })
    )
  } catch (_) {
    logger.info(DBNotFoundErrorMessage)
    dispatch(
      PipelineContextActions.success({ error: '', pipeline, isUpdated, storeMetadata: newStoreMetadata, gitDetails })
    )
  }
}

const _updateGitDetails = async (args: UpdateGitDetailsArgs, gitDetails: EntityGitDetails): Promise<void> => {
  const { dispatch, queryParams, identifier, originalPipeline, pipeline } = args
  await _deletePipelineCache(queryParams, identifier, {})
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    identifier,
    getRepoIdentifierName(gitDetails),
    gitDetails.branch || ''
  )
  const isUpdated = comparePipelines(originalPipeline, pipeline)
  try {
    if (IdbPipeline) {
      const payload: PipelinePayload = {
        [KeyPath]: id,
        pipeline,
        originalPipeline,
        isUpdated,
        gitDetails
      }
      await IdbPipeline.put(IdbPipelineStoreName, payload)
    }
    dispatch(PipelineContextActions.success({ error: '', pipeline, isUpdated, gitDetails }))
  } catch (_) {
    logger.info(DBNotFoundErrorMessage)
    dispatch(PipelineContextActions.success({ error: '', pipeline, isUpdated, gitDetails }))
  }
}

interface UpdateEntityValidityDetailsArgs {
  dispatch: React.Dispatch<ActionReturnType>
  queryParams: GetPipelineQueryParams
  identifier: string
  originalPipeline: PipelineInfoConfig
  pipeline: PipelineInfoConfig
  gitDetails: EntityGitDetails
}

const _updateEntityValidityDetails = async (
  args: UpdateEntityValidityDetailsArgs,
  entityValidityDetails: EntityValidityDetails
): Promise<void> => {
  const { dispatch, queryParams, identifier, originalPipeline, pipeline, gitDetails } = args
  await _deletePipelineCache(queryParams, identifier, {})
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    identifier,
    getRepoIdentifierName(gitDetails),
    gitDetails.branch || ''
  )
  if (IdbPipeline) {
    const payload: PipelinePayload = {
      [KeyPath]: id,
      pipeline,
      originalPipeline,
      isUpdated: false,
      gitDetails,
      entityValidityDetails
    }
    await IdbPipeline.put(IdbPipelineStoreName, payload)
  }
  dispatch(PipelineContextActions.success({ error: '', pipeline, entityValidityDetails }))
}

interface UpdatePipelineArgs {
  dispatch: React.Dispatch<ActionReturnType>
  queryParams: GetPipelineQueryParams
  identifier: string
  originalPipeline: PipelineInfoConfig
  pipeline: PipelineInfoConfig
  gitDetails: EntityGitDetails
}

const _updatePipeline = async (
  args: UpdatePipelineArgs,
  pipelineArg: PipelineInfoConfig | ((p: PipelineInfoConfig) => PipelineInfoConfig)
): Promise<void> => {
  const { dispatch, queryParams, identifier, originalPipeline, pipeline: latestPipeline, gitDetails } = args
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    identifier,
    getRepoIdentifierName(gitDetails),
    gitDetails.branch || ''
  )

  let pipeline = pipelineArg
  if (typeof pipelineArg === 'function') {
    try {
      const dbPipeline = await IdbPipeline?.get(IdbPipelineStoreName, id)
      if (dbPipeline?.pipeline) {
        pipeline = pipelineArg(dbPipeline.pipeline)
      } else {
        throw new Error(DBNotFoundErrorMessage) //'Pipeline does not exist in the db'
      }
    } catch (_) {
      pipeline = pipelineArg(latestPipeline)
      logger.info(DBNotFoundErrorMessage)
    }
  }
  // lodash.isEqual() gives wrong output some times, hence using fast-json-stable-stringify
  const isUpdated = comparePipelines(omit(originalPipeline, 'repo', 'branch'), pipeline as PipelineInfoConfig)
  const payload: PipelinePayload = {
    [KeyPath]: id,
    pipeline: pipeline as PipelineInfoConfig,
    originalPipeline,
    isUpdated,
    gitDetails
  }
  try {
    await IdbPipeline?.put(IdbPipelineStoreName, payload)
  } catch (_) {
    logger.info(DBNotFoundErrorMessage)
  }
  dispatch(PipelineContextActions.success({ error: '', pipeline: pipeline as PipelineInfoConfig, isUpdated }))
}

const cleanUpDBRefs = (): void => {
  if (IdbPipeline) {
    IdbPipeline.close()
    IdbPipeline = undefined
  }
}

const _initializeDb = async (dispatch: React.Dispatch<ActionReturnType>, version: number, trial = 0): Promise<void> => {
  if (!IdbPipeline) {
    try {
      // show loading spinner during idb initialization to prevent rendering default/initial state on mount
      // isLoading is set to false after fetching pipeline (_fetchPipeline)
      dispatch(PipelineContextActions.setLoading(true))
      IdbPipeline = await openDB(PipelineDBName, version, {
        upgrade(db) {
          if (db.objectStoreNames.contains(IdbPipelineStoreName)) {
            try {
              db.deleteObjectStore(IdbPipelineStoreName)
            } catch (_) {
              // logger.error(DBNotFoundErrorMessage)
              dispatch(PipelineContextActions.error({ error: DBNotFoundErrorMessage }))
            }
          }
          if (!db.objectStoreNames.contains(IdbPipelineStoreName)) {
            const objectStore = db.createObjectStore(IdbPipelineStoreName, { keyPath: KeyPath, autoIncrement: false })
            objectStore.createIndex(KeyPath, KeyPath, { unique: true })
          }
        },
        async blocked() {
          cleanUpDBRefs()
        },
        async blocking() {
          cleanUpDBRefs()
        }
      })
      dispatch(PipelineContextActions.dbInitialized())
    } catch (e) {
      logger.info('DB downgraded, deleting and re creating the DB')
      try {
        await deleteDB(PipelineDBName)
      } catch (_) {
        // ignore
      }
      IdbPipeline = undefined

      ++trial

      if (trial < 5) {
        await _initializeDb(dispatch, version, trial)
      } else {
        logger.error(DBInitializationFailed)
        // continue loading if initialization failed, isLoading is set to false after fetching pipeline
        dispatch(PipelineContextActions.error({ error: DBInitializationFailed, isLoading: true }))
        dispatch(PipelineContextActions.setDBInitializationFailed(true))
      }
    }
  } else {
    dispatch(PipelineContextActions.dbInitialized())
  }
}

const deletePipelineCacheFromIDB = async (IdbPipelineDatabase: IDBPDatabase | undefined, id: string): Promise<void> => {
  if (IdbPipelineDatabase) {
    try {
      await IdbPipelineDatabase.delete(IdbPipelineStoreName, id)
    } catch (_) {
      logger.info(DBNotFoundErrorMessage)
    }
  }
}
const _deletePipelineCache = async (
  queryParams: GetPipelineQueryParams,
  identifier: string,
  gitDetails?: EntityGitDetails
): Promise<void> => {
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    identifier,
    getRepoIdentifierName(gitDetails),
    gitDetails?.branch || ''
  )
  deletePipelineCacheFromIDB(IdbPipeline, id)

  const defaultId = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    DefaultNewPipelineId,
    getRepoIdentifierName(gitDetails),
    gitDetails?.branch || ''
  )
  deletePipelineCacheFromIDB(IdbPipeline, defaultId)
}

export enum PipelineContextType {
  Pipeline = 'Pipeline',
  StageTemplate = 'StageTemplate',
  PipelineTemplate = 'PipelineTemplate',
  Standalone = 'Standalone',
  StepGroupTemplate = 'StepGroupTemplate'
}

export const PipelineContext = React.createContext<PipelineContextInterface>({
  state: initialState,
  stepsFactory: {} as AbstractStepFactory,
  stagesMap: {},
  setSchemaErrorView: () => undefined,
  isReadonly: false,
  scope: Scope.PROJECT,
  view: SelectedView.VISUAL,
  contextType: PipelineContextType.Pipeline,
  allowableTypes: [],
  updatePipelineStoreMetadata: () => new Promise<void>(() => undefined),
  updateGitDetails: () => new Promise<void>(() => undefined),
  updateEntityValidityDetails: () => new Promise<void>(() => undefined),
  setView: () => void 0,
  runPipeline: () => undefined,
  // eslint-disable-next-line react/display-name
  renderPipelineStage: () => <div />,
  fetchPipeline: () => new Promise<void>(() => undefined),
  updatePipelineView: () => undefined,
  updateStage: () => new Promise<void>(() => undefined),
  getStageFromPipeline: () => ({ stage: undefined, parent: undefined }),
  setYamlHandler: () => undefined,
  setTemplateTypes: () => undefined,
  setTemplateIcons: () => undefined,
  setTemplateServiceData: () => undefined,
  updatePipeline: () => new Promise<void>(() => undefined),
  pipelineSaved: () => undefined,
  deletePipelineCache: () => new Promise<void>(() => undefined),
  setSelectedStageId: (_selectedStageId: string | undefined) => undefined,
  setSelectedStepId: (_selectedStepId: string | undefined) => undefined,
  setSelectedSectionId: (_selectedSectionId: string | undefined) => undefined,
  setSelection: (_selectedState: PipelineSelectionState | undefined) => undefined,
  getStagePathFromPipeline: () => '',
  setIntermittentLoading: () => undefined,
  setValidationUuid: () => undefined
})

export interface PipelineProviderProps {
  queryParams: GetPipelineQueryParams & GitQueryParams
  pipelineIdentifier: string
  stepsFactory: AbstractStepFactory
  stagesMap: StagesMap
  runPipeline: (identifier: string) => void
  renderPipelineStage: PipelineContextInterface['renderPipelineStage']
}

export function PipelineProvider({
  queryParams,
  pipelineIdentifier,
  children,
  renderPipelineStage,
  stepsFactory,
  stagesMap,
  runPipeline
}: React.PropsWithChildren<PipelineProviderProps>): React.ReactElement {
  const contextType = PipelineContextType.Pipeline
  const allowableTypes: AllowedTypesWithRunTime[] = [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ]
  const { repoIdentifier, repoName, branch } = useQueryParams<GitQueryParams>()
  const abortControllerRef = React.useRef<AbortController | null>(null)
  const { supportingTemplatesGitx } = useAppStore()
  const isMounted = React.useRef(false)
  const [state, dispatch] = React.useReducer(
    PipelineReducer,
    merge(
      {
        pipeline: {
          projectIdentifier: queryParams.projectIdentifier,
          orgIdentifier: queryParams.orgIdentifier
        },
        originalPipeline: {
          projectIdentifier: queryParams.projectIdentifier,
          orgIdentifier: queryParams.orgIdentifier
        }
      },
      { ...initialState, pipeline: { ...initialState.pipeline, identifier: pipelineIdentifier } }
    )
  )
  const [view, setView] = useLocalStorage<SelectedView>(
    'pipeline_studio_view',
    state.entityValidityDetails.valid === false ? SelectedView.YAML : SelectedView.VISUAL
  )
  state.pipelineIdentifier = pipelineIdentifier
  const fetchPipeline = _fetchPipeline.bind(null, {
    dispatch,
    queryParams,
    pipelineIdentifier,
    gitDetails: {
      repoIdentifier,
      repoName,
      branch
    },
    storeMetadata: state.storeMetadata,
    supportingTemplatesGitx
  })

  const updatePipelineStoreMetadata = _updateStoreMetadata.bind(null, {
    dispatch,
    queryParams,
    identifier: pipelineIdentifier,
    originalPipeline: state.originalPipeline,
    pipeline: state.pipeline
  })

  const updateGitDetails = _updateGitDetails.bind(null, {
    dispatch,
    queryParams,
    identifier: pipelineIdentifier,
    originalPipeline: state.originalPipeline,
    pipeline: state.pipeline
  })

  const updateEntityValidityDetails = _updateEntityValidityDetails.bind(null, {
    dispatch,
    queryParams,
    identifier: pipelineIdentifier,
    originalPipeline: state.originalPipeline,
    pipeline: state.pipeline,
    gitDetails: state.gitDetails
  })
  const updatePipeline = _updatePipeline.bind(null, {
    dispatch,
    queryParams,
    identifier: pipelineIdentifier,
    originalPipeline: state.originalPipeline,
    pipeline: state.pipeline,
    gitDetails: state.gitDetails
  })

  const [isEdit] = usePermission(
    {
      resourceScope: {
        accountIdentifier: queryParams.accountIdentifier,
        orgIdentifier: queryParams.orgIdentifier,
        projectIdentifier: queryParams.projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE],
      options: {
        skipCache: true,
        skipCondition: (permissionCheck: PermissionCheck) => {
          return permissionCheck.resourceIdentifier === '-1'
        }
      }
    },
    [queryParams.accountIdentifier, queryParams.orgIdentifier, queryParams.projectIdentifier, pipelineIdentifier]
  )
  const scope = getScopeFromDTO(queryParams)
  const isReadonly = !isEdit
  const deletePipelineCache = _deletePipelineCache.bind(null, queryParams, pipelineIdentifier)
  const pipelineSaved = React.useCallback(
    async (pipeline: PipelineInfoConfig) => {
      await deletePipelineCache(state.gitDetails)
      dispatch(PipelineContextActions.pipelineSavedAction({ pipeline, originalPipeline: cloneDeep(pipeline) }))
    },
    [deletePipelineCache, state.gitDetails]
  )
  const setYamlHandler = React.useCallback((yamlHandler: YamlBuilderHandlerBinding) => {
    dispatch(PipelineContextActions.setYamlHandler({ yamlHandler }))
  }, [])

  const updatePipelineView = React.useCallback((data: PipelineViewData) => {
    dispatch(PipelineContextActions.updatePipelineView({ pipelineView: data }))
  }, [])

  // stage/step selection
  const queryParamStateSelection = usePipelineQuestParamState()
  const setSelection = (selectedState: PipelineSelectionState): void => {
    queryParamStateSelection.setPipelineQuestParamState(selectedState)
  }
  /** @deprecated use `setSelection` */
  const setSelectedStageId = (selectedStageId: string | undefined): void => {
    queryParamStateSelection.setPipelineQuestParamState({ stageId: selectedStageId })
  }
  /** @deprecated use `setSelection` */
  const setSelectedStepId = (selectedStepId: string | undefined): void => {
    queryParamStateSelection.setPipelineQuestParamState({ stepId: selectedStepId })
  }
  /** @deprecated use `setSelection` */
  const setSelectedSectionId = (selectedSectionId: string | undefined): void => {
    queryParamStateSelection.setPipelineQuestParamState({ sectionId: selectedSectionId })
  }

  const updateSelectionState = React.useCallback((data: SelectionState) => {
    dispatch(PipelineContextActions.updateSelectionState({ selectionState: data }))
  }, [])

  React.useEffect(() => {
    updateSelectionState({
      selectedStageId: queryParamStateSelection.stageId as string,
      selectedStepId: queryParamStateSelection.stepId as string,
      selectedSectionId: queryParamStateSelection.sectionId as string
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParamStateSelection.stepId, queryParamStateSelection.stageId, queryParamStateSelection.sectionId])

  React.useEffect(() => {
    if (state.storeMetadata?.storeType === StoreType.REMOTE && isEmpty(state.storeMetadata?.connectorRef)) {
      return
    }

    const templateRefs = findAllByKey('templateRef', state.pipeline).filter(templateRef =>
      isEmpty(get(state.templateTypes, templateRef))
    )
    getTemplateTypesByRef(
      {
        ...queryParams,
        templateListType: 'Stable',
        repoIdentifier: state.gitDetails.repoIdentifier,
        branch: state.gitDetails.branch,
        getDefaultFromOtherRepo: true
      },
      templateRefs,
      state.storeMetadata,
      supportingTemplatesGitx,
      true
    ).then(({ templateTypes, templateServiceData, templateIcons }) => {
      setTemplateTypes(merge(state.templateTypes, templateTypes))
      setTemplateIcons({ ...merge(state.templateIcons, templateIcons) })
      setTemplateServiceData(merge(state.templateServiceData, templateServiceData))
    })

    const unresolvedCustomDeploymentRefs = map(
      findAllByKey('customDeploymentRef', state.pipeline),
      'templateRef'
    )?.filter(customDeploymentRef => isEmpty(get(state.resolvedCustomDeploymentDetailsByRef, customDeploymentRef)))

    getResolvedCustomDeploymentDetailsByRef(
      {
        ...queryParams,
        templateListType: 'Stable',
        repoIdentifier: state.gitDetails.repoIdentifier,
        branch: state.gitDetails.branch,
        getDefaultFromOtherRepo: true
      },
      unresolvedCustomDeploymentRefs
    ).then(({ resolvedCustomDeploymentDetailsByRef }) => {
      setResolvedCustomDeploymentDetailsByRef(
        merge(state.resolvedCustomDeploymentDetailsByRef, resolvedCustomDeploymentDetailsByRef)
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.pipeline, state.storeMetadata])

  const getStageFromPipeline = React.useCallback(
    <T extends StageElementConfig = StageElementConfig>(
      stageId: string,
      pipeline?: PipelineInfoConfig
    ): PipelineStageWrapper<T> => {
      const localPipeline = pipeline || state.pipeline
      return _getStageFromPipeline(stageId, localPipeline)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.pipeline, state.pipeline?.stages]
  )

  const getStagePathFromPipeline = React.useCallback(
    (stageId: string, prefix = '', pipeline?: PipelineInfoConfig) => {
      const localPipeline = pipeline || state.pipeline
      return _getStagePathFromPipeline(stageId, prefix, localPipeline)
    },
    [state.pipeline, state.pipeline?.stages]
  )

  const setTemplateTypes = React.useCallback(templateTypes => {
    dispatch(PipelineContextActions.setTemplateTypes({ templateTypes }))
  }, [])

  const setTemplateIcons = React.useCallback(templateIcons => {
    dispatch(PipelineContextActions.setTemplateIcons({ templateIcons }))
  }, [])

  const setTemplateServiceData = React.useCallback(templateServiceData => {
    dispatch(PipelineContextActions.setTemplateServiceData({ templateServiceData }))
  }, [])

  const setResolvedCustomDeploymentDetailsByRef = React.useCallback(resolvedCustomDeploymentDetailsByRef => {
    dispatch(PipelineContextActions.setResolvedCustomDeploymentDetailsByRef({ resolvedCustomDeploymentDetailsByRef }))
  }, [])

  const setSchemaErrorView = React.useCallback(flag => {
    dispatch(PipelineContextActions.updateSchemaErrorsFlag({ schemaErrors: flag }))
  }, [])

  const setIntermittentLoading = React.useCallback((isIntermittentLoading: boolean) => {
    dispatch(PipelineContextActions.setIntermittentLoading({ isIntermittentLoading }))
  }, [])

  const setValidationUuid = React.useCallback((uuid: string) => {
    dispatch(PipelineContextActions.setValidationUuid({ validationUuid: uuid }))
  }, [])

  const updateStage = React.useCallback(
    async (newStage: StageElementConfig) => {
      function _updateStages(stages: StageElementWrapperConfig[]): StageElementWrapperConfig[] {
        return stages.map(node => {
          if (node.stage?.identifier === newStage.identifier) {
            // This omitBy condition is required to remove any pseudo fields used in the stage
            return { stage: newStage }
          } else if (node.parallel) {
            return {
              parallel: _updateStages(node.parallel)
            }
          }

          return node
        })
      }

      return updatePipeline(originalPipeline => ({
        ...originalPipeline,
        stages: _updateStages(originalPipeline.stages || [])
      }))
    },
    [updatePipeline]
  )

  useGlobalEventListener('focus', () => {
    _softFetchPipeline(
      dispatch,
      queryParams,
      pipelineIdentifier,
      state.originalPipeline,
      state.pipeline,
      state.pipelineView,
      state.selectionState,
      state.gitDetails
    )
  })

  React.useEffect(() => {
    // fetch pipeline after trying to initialize idb
    if (state.isDBInitialized || state.isDBInitializationFailed) {
      abortControllerRef.current = new AbortController()
      fetchPipeline({ forceFetch: true, signal: abortControllerRef.current?.signal })
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isDBInitialized, state.isDBInitializationFailed])

  React.useEffect(() => {
    isMounted.current = true
    const time = SessionToken.getLastTokenSetTime()
    _initializeDb(dispatch, time || +new Date())

    return () => {
      isMounted.current = false
      cleanUpDBRefs()
    }
  }, [])

  return (
    <PipelineContext.Provider
      value={{
        state,
        view,
        contextType,
        allowableTypes,
        setView,
        runPipeline,
        stepsFactory,
        setSchemaErrorView,
        stagesMap,
        getStageFromPipeline,
        renderPipelineStage,
        fetchPipeline,
        updatePipelineStoreMetadata,
        updateGitDetails,
        updateEntityValidityDetails,
        updatePipeline,
        updateStage,
        updatePipelineView,
        pipelineSaved,
        deletePipelineCache,
        isReadonly,
        scope,
        setYamlHandler,
        setSelectedStageId,
        setSelectedStepId,
        setSelectedSectionId,
        setSelection,
        getStagePathFromPipeline,
        setTemplateTypes,
        setTemplateIcons,
        setTemplateServiceData,
        setIntermittentLoading,
        setValidationUuid
      }}
    >
      {children}
    </PipelineContext.Provider>
  )
}

export function usePipelineContext(): PipelineContextInterface {
  // disabling this because this the definition of usePipelineContext
  // eslint-disable-next-line no-restricted-syntax
  return React.useContext(PipelineContext)
}
