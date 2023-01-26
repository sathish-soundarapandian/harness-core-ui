import React from 'react'
import { Pagination } from '@harness/uicore'
import type { PageAnalyzedRadarChartLogDataDTO, PageLogAnalysisRadarChartListDTO } from 'services/cv'

interface LogAnalysisPaginationProps {
  logResourceData: PageLogAnalysisRadarChartListDTO | PageAnalyzedRadarChartLogDataDTO
  goToPage: (val: number) => void
}

export default function LogAnalysisPagination({ logResourceData, goToPage }: LogAnalysisPaginationProps): JSX.Element {
  return (
    <Pagination
      pageSize={logResourceData.pageSize as number}
      pageCount={logResourceData.totalPages as number}
      itemCount={logResourceData.totalItems as number}
      pageIndex={logResourceData.pageIndex}
      gotoPage={goToPage}
      hidePageNumbers
    />
  )
}
