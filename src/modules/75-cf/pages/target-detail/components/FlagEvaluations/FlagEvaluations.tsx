import React, { FC, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Column } from 'react-table'
import { noop } from 'lodash-es'
import { Button, ButtonVariation, ExpandingSearchInput, FlexExpander, Pagination, TableV2, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import {
  Evaluation,
  Feature,
  GetAllFeaturesQueryParams,
  Target,
  useGetAllEvaluations,
  useGetAllFeatures
} from 'services/cf'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { Page } from '@common/exports'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { VariationWithIcon } from '@cf/components/VariationWithIcon/VariationWithIcon'
import FlagEvaluationExplanationModal from '@cf/pages/target-detail/components/FlagEvaluationExplanationModal/FlagEvaluationExplanationModal'
import css from '@cf/components/TargetManagementFlagConfigurationPanel/TargetManagementFlagConfigurationPanel.module.scss'

export interface FlagEvaluationsProps {
  target: Target
}

type EvaluationWithFlagDetails = Evaluation & { flagDetails: Feature }

const FlagEvaluations: FC<FlagEvaluationsProps> = ({ target }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationWithFlagDetails>()

  const { accountId: accountIdentifier, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const [searchTerm, setSearchTerm] = useState<string>('')

  const {
    data: evaluations,
    loading: loadingEvaluations,
    error: evaluationsError,
    refetch: refetchEvaluations
  } = useGetAllEvaluations({
    identifier: target.identifier,
    queryParams: { accountIdentifier, orgIdentifier, projectIdentifier, environmentIdentifier: target.environment }
  })

  const flagsQueryParams = useMemo<GetAllFeaturesQueryParams>(
    () => ({
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier: target.environment
    }),
    [accountIdentifier, orgIdentifier, projectIdentifier, target.environment]
  )

  const {
    data: flags,
    loading: loadingFlags,
    refetch: fetchFlags
  } = useGetAllFeatures({ queryParams: flagsQueryParams, lazy: true })

  useEffect(() => {
    if (evaluations?.length) {
      fetchFlags({
        queryParams: { ...flagsQueryParams, featureIdentifiers: evaluations.map(({ flag }) => flag).join(',') }
      })
    }
  }, [evaluations, fetchFlags, flagsQueryParams])

  const processedEvaluations = useMemo<EvaluationWithFlagDetails[]>(() => {
    if (evaluations && Array.isArray(flags?.features)) {
      return evaluations.map<EvaluationWithFlagDetails>(evaluation => ({
        ...evaluation,
        flagDetails: flags?.features?.find(({ identifier }) => identifier === evaluation.flag) as Feature
      }))
    }

    return []
  }, [evaluations, flags?.features])

  const filteredEvaluations = useMemo<EvaluationWithFlagDetails[]>(() => {
    if (!processedEvaluations) {
      return []
    }

    if (!searchTerm) {
      return processedEvaluations
    }

    return processedEvaluations.filter(({ flag }) => flag.toLocaleLowerCase().includes(searchTerm))
  }, [processedEvaluations, searchTerm])

  const columns = useMemo<Column<EvaluationWithFlagDetails>[]>(
    () => [
      {
        Header: 'Feature Flag',
        id: 'flag-info',
        accessor: 'flag',
        width: 'calc(100% - 330px)',
        Cell: ({
          row: {
            original: {
              flagDetails: { name, description }
            }
          }
        }) => (
          <>
            <Text lineClamp={1} font={{ variation: FontVariation.BODY2 }}>
              {name}
            </Text>
            {description && <Text lineClamp={2}>{description}</Text>}
          </>
        )
      },
      {
        Header: 'Variation',
        id: 'variation',
        accessor: 'identifier',
        width: '300px',
        Cell: ({
          row: {
            original: { identifier: variationIdentifier, flagDetails }
          }
        }) => {
          const variationIndex = flagDetails.variations.findIndex(
            ({ identifier }) => identifier === variationIdentifier
          )

          return (
            <VariationWithIcon
              variation={flagDetails.variations[variationIndex]}
              index={variationIndex}
              textStyle={{ marginLeft: '10px' }}
            />
          )
        }
      },
      {
        Header: '',
        id: 'actions',
        width: '30px',
        accessor: 'identifier',
        Cell: ({ row: { original: evaluationWithFlagDetails } }) => (
          <Button
            icon="search"
            variation={ButtonVariation.ICON}
            tooltip="Explain evaluation"
            onClick={() => {
              setSelectedEvaluation(evaluationWithFlagDetails)
              setDialogOpen(true)
            }}
          />
        )
      }
    ],
    []
  )

  if (loadingEvaluations || loadingFlags) {
    return <ContainerSpinner flex={{ align: 'center-center' }} />
  }

  if (evaluationsError) {
    return <Page.Error message={getErrorMessage(evaluationsError)} onClick={() => refetchEvaluations()} />
  }

  return (
    <>
      <div className={css.layout}>
        <Page.SubHeader className={css.toolbar}>
          <FlexExpander />
          <ExpandingSearchInput alwaysExpanded onChange={newSearch => setSearchTerm(newSearch.toLocaleLowerCase())} />
        </Page.SubHeader>

        <div className={css.listing}>
          <TableV2<EvaluationWithFlagDetails> columns={columns} data={filteredEvaluations} />
        </div>

        <div className={css.pagination}>
          <Pagination
            pageSize={15}
            pageCount={1}
            itemCount={filteredEvaluations.length}
            pageIndex={0}
            gotoPage={noop}
            showPagination
          />
        </div>
      </div>

      {dialogOpen && selectedEvaluation && (
        <FlagEvaluationExplanationModal
          target={target}
          evaluationWithFlagDetails={selectedEvaluation}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  )
}

export default FlagEvaluations
