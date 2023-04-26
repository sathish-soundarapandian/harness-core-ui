import { buildSearchBox, buildResultList, buildFacet, buildPager, buildSort } from '@coveo/headless'
import { useCoveoEngine } from '../engine'
import { criteria } from './SortCriteria'

export function useCoveoControllers(): any {
  const { headlessEngine } = useCoveoEngine()
  const searchBox = buildSearchBox(headlessEngine)

  const resultList = buildResultList(headlessEngine)

  const facet = buildFacet(headlessEngine, { options: { field: 'source' } })

  const pager = buildPager(headlessEngine)

  const initialCriterion = criteria[0][1]
  const sort = buildSort(headlessEngine, {
    initialState: { criterion: initialCriterion }
  })

  return {
    searchBox,
    resultList,
    facet,
    pager,
    sort
  }
}
