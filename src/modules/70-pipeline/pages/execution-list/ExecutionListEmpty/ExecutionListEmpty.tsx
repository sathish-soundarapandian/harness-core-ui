import { Color } from '@harness/design-system'
import { Button, ButtonVariation, Icon, IconName, Layout, Text } from '@wings-software/uicore'
import React from 'react'
import { useStrings } from 'framework/strings'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import type { StringsMap } from 'stringTypes'
import type { ExecutionListProps } from '../ExecutionList'
import { useExecutionListFilterContext } from '../ExecutionListFilterContext/ExecutionListFilterContext'
import cdExecutionListIllustration from '../images/cd-execution-illustration.svg'
import ciExecutionListIllustration from '../images/ci-execution-illustration.svg'
import stoExecutionListIllustration from '../images/sto-execution-illustration.svg'
import { useExecutionListEmptyAction } from './useExecutionListEmptyAction'
import css from './ExecutionListEmpty.module.scss'

export function ExecutionListEmpty({
  isPipelineInvalid,
  onRunPipeline
}: Pick<ExecutionListProps, 'isPipelineInvalid' | 'onRunPipeline'>): JSX.Element {
  const { getString } = useStrings()
  const { isAnyFilterApplied, clearFilter } = useExecutionListFilterContext()
  const { module = 'cd' } = useModuleInfo()
  const { hasNoPipelines, loading, EmptyAction } = useExecutionListEmptyAction(!!isPipelineInvalid, onRunPipeline)

  let icon: IconName
  let illustration: string
  let noExecutionsText: keyof StringsMap
  let noExecutionsAboutText: keyof StringsMap

  switch (module) {
    case 'ci':
      icon = 'ci-main'
      illustration = ciExecutionListIllustration
      noExecutionsText = 'pipeline.noBuildsText'
      noExecutionsAboutText = 'noBuildsText'
      break

    case 'sto':
      icon = 'sto-color-filled'
      illustration = stoExecutionListIllustration
      noExecutionsText = 'stoSteps.noScansText'
      noExecutionsAboutText = 'stoSteps.noScansRunPipelineText'
      break

    default:
      icon = 'cd-main'
      illustration = cdExecutionListIllustration
      noExecutionsText = 'pipeline.noDeploymentText'
      noExecutionsAboutText = 'noDeploymentText'
  }

  if (hasNoPipelines) {
    noExecutionsAboutText = 'pipeline.noPipelineText'
  }

  return (
    <div className={css.noExecutions}>
      {isAnyFilterApplied ? (
        <Layout.Vertical spacing="small" flex>
          <Icon size={50} name={icon} margin={{ bottom: 'large' }} />
          <Text
            margin={{ top: 'large', bottom: 'small' }}
            font={{ weight: 'bold', size: 'medium' }}
            color={Color.GREY_800}
          >
            {getString('common.filters.noMatchingFilterData')}
          </Text>
          <Button
            text={getString('common.filters.clearFilters')}
            variation={ButtonVariation.LINK}
            onClick={clearFilter}
          />
        </Layout.Vertical>
      ) : (
        <Layout.Vertical spacing="small" flex={{ justifyContent: 'center', alignItems: 'center' }} width={720}>
          <img src={illustration} className={css.image} />
          <Text className={css.noExecutionsText} margin={{ top: 'medium', bottom: 'small' }}>
            {getString(noExecutionsText)}
          </Text>
          {!loading && (
            <Text className={css.noExecutionsAboutText} margin={{ top: 'xsmall', bottom: 'xlarge' }}>
              {getString(noExecutionsAboutText)}
            </Text>
          )}
          <EmptyAction />
        </Layout.Vertical>
      )}
    </div>
  )
}
