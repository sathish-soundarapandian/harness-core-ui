import { accountId, orgIdentifier, pipelineIdentifier, projectId } from '../../support/70-pipeline/constants'

export const createTriggerAPI = `/pipeline/api/triggers?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&targetIdentifier=${pipelineIdentifier}`
export const getTriggerListAPI = `/pipeline/api/triggers?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}&targetIdentifier=${pipelineIdentifier}&size=20&page=0`
