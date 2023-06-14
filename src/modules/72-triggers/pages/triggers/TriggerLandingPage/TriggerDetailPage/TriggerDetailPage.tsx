/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  Button,
  ButtonVariation,
  Layout,
  Text,
  tagsType,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle,
  HarnessDocTooltip
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { isEmpty, get, pickBy, defaultTo } from 'lodash-es'
import { parse } from 'yaml'
import { NGTriggerConfigV2, useGetTriggerDetails, useGetSchemaYaml, useGetPipelineSummary } from 'services/pipeline-ng'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { TagsPopover, PageSpinner } from '@common/components'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isSimplifiedYAMLEnabled } from '@common/utils/utils'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import DetailPageCard, { ContentType, Content } from '@common/components/DetailPageCard/DetailPageCard'
import routes from '@common/RouteDefinitions'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { useQueryParams } from '@common/hooks'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import useTriggerView from '@common/components/Wizard/useTriggerView'
import { useIsTriggerCreatePermission } from '@triggers/components/Triggers/useIsTriggerCreatePermission'
import css from '../TriggerLandingPage.module.scss'

export interface Condition {
  key: string
  operator: string
  value: string
}

const getTriggerConditionsStr = (payloadConditions: Condition[]): string[] => {
  const arr: string[] = []
  payloadConditions.forEach(condition => {
    const { key, operator, value } = condition

    arr.push(`${key} ${operator} ${value}`)
  })
  return arr
}

const renderConditions = ({
  conditions,
  jexlCondition,
  cronExpression,
  getString
}: {
  conditions: string[]
  jexlCondition?: string
  cronExpression?: string
  getString: UseStringsReturn['getString']
}): JSX.Element => (
  <Layout.Vertical style={{ overflowX: 'hidden' }} spacing="medium">
    {conditions.length ? (
      <>
        <Text style={{ fontSize: '12px' }}>{getString('conditions')}</Text>
        {conditions.map(condition => (
          <Text color={Color.BLACK} key={condition} width="424px" lineClamp={1}>
            {condition}
          </Text>
        ))}
      </>
    ) : null}
    {jexlCondition ? (
      <>
        <Text style={{ fontSize: '12px' }}>{getString('triggers.conditionsPanel.jexlCondition')}</Text>
        <Text color={Color.BLACK} width="424px" lineClamp={1}>
          {jexlCondition}
        </Text>
      </>
    ) : null}
    {cronExpression ? (
      <>
        <Text style={{ fontSize: '12px' }}>{getString('triggers.schedulePanel.cronExpression')}</Text>
        <Text color={Color.BLACK} width="424px" lineClamp={1}>
          {cronExpression}
        </Text>
      </>
    ) : null}
  </Layout.Vertical>
)

const getOverviewContent = ({
  getString,
  name,
  description,
  identifier,
  tags
}: {
  getString: UseStringsReturn['getString']
  name?: string
  description?: string
  identifier?: string
  tags?: tagsType
}): Content[] => [
  {
    label: getString('common.triggerName'),
    value: name
  },
  {
    label: getString('description'),
    value: description || '-'
  },
  {
    label: getString('identifier'),
    value: identifier
  },
  {
    label: getString('tagsLabel'),
    value: !isEmpty(tags) ? <TagsPopover tags={tags as tagsType} /> : undefined
  }
]

const getDetailsContent = ({
  getString,
  conditionsExist,
  conditions,
  jexlCondition,
  cronExpression,
  pipelineInputSet,
  selectiveStageFF,
  stagesToExecute
}: {
  getString: UseStringsReturn['getString']
  conditionsExist: boolean
  conditions: string[]
  jexlCondition?: string
  cronExpression?: string
  pipelineInputSet?: string
  selectiveStageFF?: boolean
  stagesToExecute?: string[]
}): Content[] => {
  const arr: Content[] = [
    {
      label: '',
      value: conditionsExist ? renderConditions({ conditions, jexlCondition, cronExpression, getString }) : undefined,
      hideOnUndefinedValue: true,
      type: ContentType.CUSTOM
    },
    {
      label: getString('triggers.pipelineExecutionInput'),
      value: !isEmpty(pipelineInputSet) ? <pre>{pipelineInputSet}</pre> : undefined,
      type: ContentType.CUSTOM
    }
  ]
  if (selectiveStageFF) {
    arr.push({
      label: getString('triggers.selectPipelineStages'),
      value: stagesToExecute?.length ? <p>{stagesToExecute}</p> : <p>{getString('pipeline.allStages')}</p>
    })
  }
  return arr
}

export default function TriggerDetailPage(): JSX.Element {
  const { repoIdentifier, branch, connectorRef, repoName, storeType } = useQueryParams<GitQueryParams>()
  const [selectedView, setSelectedView] = useTriggerView(false)
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, triggerIdentifier, module } = useParams<
    PipelineType<
      PipelinePathProps & {
        triggerIdentifier: string
      }
    >
  >()

  const { CI_YAML_VERSIONING, CDS_NG_TRIGGER_SELECTIVE_STAGE_EXECUTION } = useFeatureFlags()

  const { data: triggerResponse, loading: loadingTrigger } = useGetTriggerDetails({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier
    }
  })

  const triggerResponseData = triggerResponse?.data
  const { lastTriggerExecutionDetails, name, description, identifier, tags, type } = defaultTo(triggerResponseData, {})

  const isTriggerCreatePermission = useIsTriggerCreatePermission()

  const history = useHistory()

  const goToEditWizard = (): void => {
    history.push(
      routes.toTriggersWizardPage({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        triggerIdentifier,
        triggerType: type,
        module,
        repoIdentifier,
        branch,
        connectorRef,
        repoName,
        storeType
      })
    )
  }

  const { loading, data: pipelineSchema } = useGetSchemaYaml({
    queryParams: {
      entityType: 'Triggers',
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })

  let triggerJSON
  const triggerResponseYaml = get(triggerResponse, 'data.yaml', '')
  try {
    triggerJSON = parse(triggerResponseYaml)
  } catch (e) {
    // ignore error
  }

  const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
    fileName: `${identifier ?? 'Trigger'}.yaml`,
    entityType: 'Triggers',
    existingJSON: triggerJSON,
    width: 900
  }

  const { getString } = useStrings()
  const triggerObj = parse(triggerResponseYaml)?.trigger as NGTriggerConfigV2
  let conditions: string[] = []
  const headerConditions: string[] = triggerObj?.source?.spec?.spec?.headerConditions?.length
    ? getTriggerConditionsStr(triggerObj.source.spec.spec.headerConditions)
    : []
  const payloadConditions: string[] = triggerObj?.source?.spec?.spec?.payloadConditions?.length
    ? getTriggerConditionsStr(triggerObj.source.spec.spec.payloadConditions)
    : []
  const eventConditions: string[] = triggerObj?.source?.spec?.spec?.eventConditions?.length
    ? getTriggerConditionsStr(triggerObj.source.spec.spec.eventConditions)
    : []
  conditions = conditions.concat(headerConditions)
  conditions = conditions.concat(payloadConditions)
  conditions = conditions.concat(eventConditions)
  const jexlCondition = triggerObj?.source?.spec?.spec?.jexlCondition
  const cronExpression = triggerObj?.source?.spec?.spec?.expression
  const stagesToExecute = get(triggerObj, 'stagesToExecute')
  const conditionsExist = [...conditions, jexlCondition, cronExpression].some(x => !!x)
  const { data: pipeline } = useGetPipelineSummary({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    requestOptions: { headers: { 'Load-From-Cache': 'true' } }
  })

  const isPipelineInvalid = pipeline?.data?.entityValidityDetails?.valid === false

  const isTriggerRbacDisabled = !isTriggerCreatePermission || isPipelineInvalid

  let pipelineInputSet
  if (get(triggerObj, 'inputSetRefs')?.length) {
    pipelineInputSet = yamlStringify(
      pickBy(
        {
          pipelineBranchName: get(triggerObj, 'pipelineBranchName'),
          inputSetRefs: get(triggerObj, 'inputSetRefs')
        },
        key => key !== undefined
      )
    )
  } else {
    pipelineInputSet = triggerObj?.inputYaml || ''
  }

  useEffect(() => {
    if (isSimplifiedYAMLEnabled(module, CI_YAML_VERSIONING)) {
      setSelectedView(SelectedView.VISUAL)
    }
  }, [CI_YAML_VERSIONING, module])

  return (
    <>
      <Layout.Horizontal className={css.panel}>
        <Layout.Vertical spacing="medium" className={css.information}>
          <Layout.Horizontal flex={{ distribution: 'space-between' }}>
            {!isSimplifiedYAMLEnabled(module, CI_YAML_VERSIONING) ? (
              <VisualYamlToggle
                selectedView={selectedView}
                disableToggle={isSimplifiedYAMLEnabled(module, CI_YAML_VERSIONING)}
                onChange={
                  /* istanbul ignore next */ nextMode => {
                    setSelectedView(nextMode)
                  }
                }
              />
            ) : null}
            <Button
              variation={ButtonVariation.SECONDARY}
              icon="edit"
              onClick={goToEditWizard}
              minimal
              disabled={isTriggerRbacDisabled}
              tooltip={isPipelineInvalid ? getString('pipeline.cannotEditTriggerInvalidPipeline') : ''}
              text={getString('edit')}
            ></Button>
          </Layout.Horizontal>
          {selectedView === SelectedView.VISUAL ? (
            <Layout.Horizontal spacing="medium">
              <DetailPageCard
                title={getString('overview')}
                content={getOverviewContent({
                  getString,
                  name,
                  description,
                  identifier,
                  tags
                })}
              />
              {loadingTrigger ? (
                <PageSpinner />
              ) : (
                <DetailPageCard
                  classname={css.inputSet}
                  title={getString('details')}
                  content={getDetailsContent({
                    getString,
                    conditionsExist,
                    conditions,
                    jexlCondition,
                    cronExpression,

                    pipelineInputSet,
                    selectiveStageFF: CDS_NG_TRIGGER_SELECTIVE_STAGE_EXECUTION,
                    stagesToExecute
                  })}
                />
              )}
            </Layout.Horizontal>
          ) : (
            <div className={css.editor}>
              {loading ? (
                <PageSpinner />
              ) : (
                <YAMLBuilder
                  {...yamlBuilderReadOnlyModeProps}
                  isReadOnlyMode={true}
                  schema={pipelineSchema?.data}
                  onEnableEditMode={goToEditWizard}
                  isEditModeSupported={!isPipelineInvalid}
                  yamlSanityConfig={{
                    removeEmptyString: false,
                    removeEmptyArray: false,
                    removeEmptyObject: false
                  }}
                />
              )}
            </div>
          )}
        </Layout.Vertical>
        <Layout.Vertical style={{ flex: 1 }}>
          <Layout.Horizontal spacing="xxlarge">
            <Text font={{ size: 'medium', weight: 'bold' }} inline={true} color={Color.GREY_800}>
              {getString('triggers.lastActivationDetails')}
              <HarnessDocTooltip tooltipId="lastActivationDetails" useStandAlone={true} />
            </Text>
            {lastTriggerExecutionDetails?.lastExecutionSuccessful === false ? (
              <Text
                tooltip={lastTriggerExecutionDetails?.message}
                icon="warning-sign"
                iconProps={{ color: Color.RED_500 }}
                color={Color.RED_500}
                font={{ size: 'medium' }}
                inline={true}
              >
                {getString('failed')}
              </Text>
            ) : (
              /* istanbul ignore next */
              lastTriggerExecutionDetails?.lastExecutionSuccessful === true && (
                <Text
                  tooltip={lastTriggerExecutionDetails?.message}
                  icon="execution-success"
                  color={Color.GREEN_500}
                  iconProps={{ color: Color.GREEN_500 }}
                  font={{ size: 'medium' }}
                  inline={true}
                >
                  {getString('passed')}
                </Text>
              )
            )}
          </Layout.Horizontal>
          <Layout.Vertical spacing="small" margin={{ top: 'small' }}>
            <div>
              {lastTriggerExecutionDetails?.lastExecutionTime ? (
                <Text>
                  {`${getString('triggers.lastActivationAt')}: ${new Date(
                    lastTriggerExecutionDetails.lastExecutionTime
                  ).toLocaleDateString()} ${new Date(
                    lastTriggerExecutionDetails.lastExecutionTime
                  ).toLocaleTimeString()}`}
                </Text>
              ) : null}
            </div>
            <hr />
          </Layout.Vertical>
        </Layout.Vertical>
      </Layout.Horizontal>
    </>
  )
}
