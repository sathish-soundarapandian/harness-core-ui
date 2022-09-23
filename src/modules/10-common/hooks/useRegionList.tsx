/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

export interface Country {
  countryCode: string
  name: string
}
export interface State {
  code: string
  name: string
}

export interface StateByCountryMap {
  [key: string]: State[]
}

interface CountryState {
  loading: boolean
  list: Country[]
}

interface StatesState {
  loading: boolean
  list: StateByCountryMap
}
export default function useRegionList(): { countries: Country[]; states: StateByCountryMap; loading: boolean } {
  const [countries, setCountries] = React.useState<CountryState>({ loading: true, list: [] })
  const [states, setStates] = React.useState<StatesState>({ loading: true, list: {} })

  React.useEffect(() => {
    fetchCountries().then(countryList => {
      setCountries({ loading: false, list: countryList })
    })
    fetchStates().then(stateList => {
      setStates({ loading: false, list: stateList })
    })
  }, [])
  return countries.loading || states.loading
    ? { countries: [], states: {}, loading: true }
    : { countries: countries.list, states: states.list, loading: false }
}

export const fetchCountries = async (): Promise<Country[]> => {
  const countries = await import('./countries.json')
  return countries.default
}

export const fetchStates = async (): Promise<StateByCountryMap> => {
  const states = (await import('./statesByCountry.json')) as unknown as { default: StateByCountryMap }
  return states.default
}
