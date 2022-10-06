/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useCallback, ReactNode } from 'react'
import { useParams } from 'react-router-dom'

import { noop } from 'lodash-es'
import { PageSpinner } from '@wings-software/uicore'
import { GitSyncConfig, SourceCodeManagerDTO, useGetSourceCodeManagers, useListGitSync } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export interface GitSyncStoreProps {
  readonly gitSyncRepos: GitSyncConfig[]
  readonly codeManagers: SourceCodeManagerDTO[]
  readonly loadingRepos: boolean
  readonly loadingCodeManagers: boolean
  updateStore(data: Partial<Pick<GitSyncStoreProps, 'gitSyncRepos'>>): void
  refreshStore(): void
  spinner?: ReactNode
}

export const GitSyncStoreContext = React.createContext<GitSyncStoreProps>({
  gitSyncRepos: [],
  codeManagers: [],
  loadingRepos: false,
  loadingCodeManagers: false,
  updateStore: noop,
  refreshStore: noop,
  spinner: PageSpinner
})

export const useGitSyncStore = (): GitSyncStoreProps => {
  return React.useContext(GitSyncStoreContext)
}

export const GitSyncStoreProvider: React.FC<Pick<GitSyncStoreProps, 'spinner'>> = props => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  //Note: right now we support git-sync only at project level
  const {
    data: dataAllGitSync,
    loading: loadingRepos,
    refetch
  } = useListGitSync({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })

  const { data: codeManagers, loading: loadingCodeManagers } = useGetSourceCodeManagers({
    queryParams: { accountIdentifier: accountId }
  })

  const [storeData, setStoreData] = React.useState<Omit<GitSyncStoreProps, 'updateStore' | 'strings'>>({
    gitSyncRepos: [],
    codeManagers: [],
    loadingRepos,
    loadingCodeManagers,
    refreshStore: refetch
  })

  useEffect(() => {
    if (!loadingCodeManagers) {
      setStoreData(prevStateData => ({
        ...prevStateData,
        loadingCodeManagers: false,
        codeManagers: codeManagers?.data || []
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingCodeManagers])

  useEffect(() => {
    if (!loadingRepos) {
      setStoreData(prevStateData => ({
        ...prevStateData,
        loadingRepos: false,
        gitSyncRepos: dataAllGitSync || []
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingRepos])

  useEffect(() => {
    if (projectIdentifier) {
      refetch()
      setStoreData(prevStateData => ({
        ...prevStateData,
        loadingRepos: true
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIdentifier])

  const updateStore = useCallback(
    () =>
      (data: Partial<Pick<GitSyncStoreProps, 'gitSyncRepos'>>): void => {
        setStoreData(prevState => ({
          ...prevState,
          gitSyncRepos: data.gitSyncRepos || prevState.gitSyncRepos
        }))
      },
    []
  )

  return (
    <GitSyncStoreContext.Provider
      value={{
        ...storeData,
        updateStore
      }}
    >
      {loadingRepos ? props.spinner : props.children}
    </GitSyncStoreContext.Provider>
  )
}
