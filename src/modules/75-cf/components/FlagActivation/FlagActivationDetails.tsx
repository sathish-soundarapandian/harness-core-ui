/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { Container, FlexExpander, Heading, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import routes from '@common/RouteDefinitions'
import type { StringKeys } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useStrings } from 'framework/strings'
import StringWithTooltip from '@common/components/StringWithTooltip/StringWithTooltip'
import {
  DeleteFeatureFlagQueryParams,
  Feature,
  PatchFeatureQueryParams,
  useDeleteFeatureFlag,
  usePatchFeature,
  Variation
} from 'services/cf'
import { VariationWithIcon } from '@cf/components/VariationWithIcon/VariationWithIcon'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useFeatureFlagTypeToStringMapping } from '@cf/utils/CFUtils'

import type { UseGitSync } from '@cf/hooks/useGitSync'
import GitSyncActions from '@cf/components/GitSyncActions/GitSyncActions'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { FlagTypeVariations } from '../CreateFlagDialog/FlagDialogUtils'
import { VariationTypeIcon } from '../VariationTypeIcon/VariationTypeIcon'
import { IdentifierText } from '../IdentifierText/IdentifierText'
import { EditVariationsModal } from '../EditVariationsModal/EditVariationsModal'
import { FlagPrerequisites } from './FlagPrerequisites'
import ServicesList from './ServicesList'
import FlagDetailsOptionsMenuButton from '../FlagDetailsOptionsMenuButton/FlagDetailsOptionsMenuButton'
import JiraIssueList from './JiraIssueList'
import css from './FlagActivationDetails.module.scss'

interface FlagActivationDetailsProps {
  featureFlag: Feature
  gitSync: UseGitSync
  refetchFlag: () => void
  setGovernanceMetadata: (governanceMetadata: any) => void
}

const VariationItem: React.FC<{ variation: Variation; index: number }> = ({ variation, index }) => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal
      flex={{ alignItems: 'center', justifyContent: 'space-between' }}
      spacing="xsmall"
      className={css.variationItem}
    >
      <VariationWithIcon variation={variation} index={index} color={Color.GREY_800} fontSize="small" />
      <Text font={{ variation: FontVariation.TINY }} className={css.flagVariationValue}>{`${getString('valueLabel')}: ${
        variation.value
      }`}</Text>
    </Layout.Horizontal>
  )
}

const VariationsList: React.FC<{
  featureFlag: Feature
  onEditSuccess: () => void
  gitSync: UseGitSync
  setGovernanceMetadata: (governanceMetadata: any) => void
}> = ({ featureFlag, onEditSuccess, gitSync, setGovernanceMetadata }) => {
  const { orgIdentifier, accountId: accountIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const isFlagTypeBoolean = featureFlag.kind === FlagTypeVariations.booleanFlag
  const { variations } = featureFlag
  const { getString } = useStrings()
  const typeToStringMapping = useFeatureFlagTypeToStringMapping()
  const { activeEnvironment } = useActiveEnvironment()

  return (
    <Layout.Vertical margin={{ bottom: 'xlarge' }}>
      <Layout.Horizontal flex={{ align: 'center-center' }} margin={{ bottom: 'medium' }}>
        <Heading level={5} font={{ variation: FontVariation.H5 }}>
          <StringWithTooltip stringId="cf.shared.variations" tooltipId="ff_ffVariations_heading" />
        </Heading>
        <FlexExpander />
        <EditVariationsModal
          gitSync={gitSync}
          accountIdentifier={accountIdentifier}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          feature={featureFlag}
          permission={{
            permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG,
            resource: activeEnvironment
              ? { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment }
              : { resourceType: ResourceType.FEATUREFLAG }
          }}
          onSuccess={onEditSuccess}
          minimal
          intent="primary"
          icon="Edit"
          disabled={featureFlag.archived}
          setGovernanceMetadata={setGovernanceMetadata}
        />
      </Layout.Horizontal>

      <Layout.Vertical className={css.variationsList}>
        <Text border={{ bottom: true, color: Color.GREY_300 }} padding={{ bottom: 'small' }} flex>
          <VariationTypeIcon style={{ transform: 'translateY(1px)' }} multivariate={!isFlagTypeBoolean} />
          {isFlagTypeBoolean ? getString('cf.boolean') : getString('cf.multivariate')}
          {!isFlagTypeBoolean && (
            <Text color={Color.GREY_400} padding={{ left: 'xsmall' }}>
              ({typeToStringMapping[featureFlag.kind] || ''})
            </Text>
          )}
          <FlexExpander />
          <Text color={Color.GREY_400}>
            {getString('cf.featureFlagDetail.variationCount', { count: variations.length })}
          </Text>
        </Text>

        {featureFlag.variations.map((variation, index) => (
          <VariationItem key={variation.identifier} variation={variation} index={index} />
        ))}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

const FlagActivationDetails: React.FC<FlagActivationDetailsProps> = props => {
  const { featureFlag, refetchFlag, gitSync, setGovernanceMetadata } = props
  const { getString } = useStrings()
  const { orgIdentifier, accountId: accountIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { withActiveEnvironment } = useActiveEnvironment()
  const { FFM_4117_INTEGRATE_SRM, FFM_4737_JIRA_INTEGRATION } = useFeatureFlags()
  const breadcrumbs = [
    {
      label: getString('cf.continuous'),
      url: withActiveEnvironment(
        routes.toCFFeatureFlags({
          accountId: accountIdentifier,
          orgIdentifier,
          projectIdentifier
        })
      )
    }
  ]

  const { mutate: submitPatch } = usePatchFeature({
    identifier: featureFlag.identifier as string,
    queryParams: {
      projectIdentifier: featureFlag.project as string,
      environmentIdentifier: featureFlag.envProperties?.environment as string,
      accountIdentifier,
      orgIdentifier
    } as PatchFeatureQueryParams
  })

  const { mutate: deleteFeatureFlag } = useDeleteFeatureFlag({
    queryParams: {
      projectIdentifier,
      accountIdentifier,
      orgIdentifier
    } as DeleteFeatureFlagQueryParams
  })

  const queryParams = {
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier: featureFlag.envProperties?.environment as string
  } as PatchFeatureQueryParams

  const renderTime = (time: number, langString: StringKeys, style?: React.CSSProperties): React.ReactNode => (
    <Text
      style={{
        fontWeight: 500,
        lineHeight: '14px',
        fontSize: '10px',
        color: '#555770',
        letterSpacing: '0.2px',
        ...style
      }}
    >
      {getString(langString, {
        date: moment(time).format('MMMM D, YYYY hh:mm A')
      })}
    </Text>
  )

  return (
    <>
      <Layout.Horizontal>
        <NGBreadcrumbs customPathParams={{ module: 'cf' }} links={breadcrumbs} />
        <FlexExpander />
        <FlagDetailsOptionsMenuButton
          featureFlag={featureFlag}
          gitSync={gitSync}
          queryParams={queryParams}
          submitPatch={submitPatch}
          deleteFeatureFlag={deleteFeatureFlag}
          refetchFlag={refetchFlag}
          setGovernanceMetadata={setGovernanceMetadata}
        />
      </Layout.Horizontal>

      <Container>
        <Heading level={4}>
          <Text inline lineClamp={1} color={Color.BLACK} font={{ variation: FontVariation.H4 }}>
            {featureFlag.name}
          </Text>
        </Heading>
        <IdentifierText identifier={featureFlag.identifier} allowCopy />
        {featureFlag.description && (
          <Text margin={{ bottom: 'small' }} color={Color.GREY_800} font={{ variation: FontVariation.SMALL }}>
            {featureFlag.description}
          </Text>
        )}

        <Container
          flex={{ justifyContent: 'space-between', alignItems: 'center' }}
          width={230}
          margin={{ top: 'small' }}
        >
          <GitSyncActions isLoading={gitSync.isGitSyncActionsEnabled && gitSync.gitSyncLoading} />
        </Container>

        <Layout.Vertical margin={{ top: 'medium', bottom: 'xlarge' }}>
          {renderTime(featureFlag.createdAt, 'cf.featureFlags.createdDate')}
          {featureFlag.modifiedAt &&
            renderTime(featureFlag.modifiedAt, 'cf.featureFlags.modifiedDate', { paddingTop: 'var(--spacing-xsmall)' })}
        </Layout.Vertical>

        <VariationsList
          featureFlag={featureFlag}
          gitSync={gitSync}
          onEditSuccess={() => {
            refetchFlag()
          }}
          setGovernanceMetadata={setGovernanceMetadata}
        />

        <FlagPrerequisites
          featureFlag={featureFlag}
          refetchFlag={refetchFlag}
          gitSync={gitSync}
          setGovernanceMetadata={setGovernanceMetadata}
        />

        {FFM_4117_INTEGRATE_SRM && <ServicesList featureFlag={featureFlag} refetchFlag={refetchFlag} />}
        {FFM_4737_JIRA_INTEGRATION && featureFlag.envProperties?.jiraEnabled && (
          <JiraIssueList
            featureIdentifier={featureFlag.identifier}
            refetchFlag={refetchFlag}
            jiraIssues={featureFlag.envProperties?.jiraIssues}
          />
        )}
      </Container>
    </>
  )
}

export default FlagActivationDetails
