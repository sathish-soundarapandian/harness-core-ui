/* Generated by restful-react */

import React from 'react'
import { Get, GetProps, useGet, UseGetProps } from 'restful-react'

import { getConfig } from '../config'
export const SPEC_VERSION = '1.0.0'
export interface GithubMember {
  id?: number
  name?: string
  login?: string
  avatar_url?: string
  contributions?: number
}

export interface GithubOrg {
  id?: number
  name?: string
  login?: string
  public_repos?: number
  total_private_repos?: number
  two_factor_requirement_enabled?: boolean
  plan?: GithubPlan
}

export interface GithubPlan {
  seats?: number
  filled_seats?: number
  name?: string
}

export interface GithubDetailsResponse {
  org?: GithubOrg
  members?: any
  inactive_members?: any
  rarely_active_members?: any
}

export type GithubDetailsProps = Omit<GetProps<GithubDetailsResponse, void, void, void>, 'path'>

/**
 * Gets githubDetails
 *
 * githubDetails
 */
export const GithubDetails = (props: GithubDetailsProps) => (
  <Get<GithubDetailsResponse, void, void, void> path={`/github/details`} base={getConfig('asaasin/api')} {...props} />
)

export type UseGithubDetailsProps = Omit<UseGetProps<GithubDetailsResponse, void, void, void>, 'path'>

/**
 * Gets githubDetails
 *
 * githubDetails
 */
export const useGithubDetails = (props: UseGithubDetailsProps) =>
  useGet<GithubDetailsResponse, void, void, void>(`/github/details`, { base: getConfig('asaasin/api'), ...props })
