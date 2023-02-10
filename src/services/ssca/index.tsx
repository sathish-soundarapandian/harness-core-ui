/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* Generated by restful-react */

import React from 'react'
import { Get, GetProps, useGet, UseGetProps, Mutate, MutateProps, useMutate, UseMutateProps } from 'restful-react'

import { getConfig } from '../config'
export const SPEC_VERSION = '0.1.0'
/**
 * login_BadGateway_response_body result type (default view)
 */
export interface DevLoginBadGatewayResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * login_BadRequest_response_body result type (default view)
 */
export interface DevLoginBadRequestResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * login_Forbidden_response_body result type (default view)
 */
export interface DevLoginForbiddenResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * login_InternalServer_response_body result type (default view)
 */
export interface DevLoginInternalServerResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * login_NotFound_response_body result type (default view)
 */
export interface DevLoginNotFoundResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

export interface DevLoginRequestBody {
  /**
   * Password
   */
  password: string
}

/**
 * login_Unauthorized_response_body result type (default view)
 */
export interface DevLoginUnauthorizedResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * A pullrequest of value stream data
 */
export interface Pullrequest {
  /**
   * Harness account ID associated with this pullrequest
   */
  account_id: string
  /**
   * author of the pullrequest
   */
  author: string
  /**
   * Time the commit was authored
   */
  authored_date: number
  /**
   * Time the pullrequest was closed
   */
  closed_at: number
  /**
   * the hash of the commit
   */
  commit_hash: string
  /**
   * The ID of the commit
   */
  commit_id: string
  /**
   * Time the commit was created
   */
  committed_date: number
  /**
   * Time the pullrequest was last created
   */
  created: number
  /**
   * Time the pullrequest was created
   */
  created_at: number
  /**
   * Time the pullrequest was merged
   */
  merged_at: number
  /**
   * Number of the pullrequest
   */
  number: number
  /**
   * id of the pullrequest
   */
  pr_id: string
  /**
   * Time the pullrequest was published
   */
  published_at: number
  /**
   * Time of the first review activity on the pullrequest was created
   */
  review_first_activity_at: number
  /**
   * Time of the last review activity on the pullrequest was created
   */
  review_last_approval_at: number
  /**
   * Source ID associated with this connection source
   */
  source_id: number
  /**
   * state of the pullrequest
   */
  state: string
  /**
   * title of the pullrequest
   */
  title: string
  /**
   * Time the pullrequest was last updated
   */
  updated: number
  /**
   * Time the pullrequest was updated
   */
  updated_at: number
  /**
   * url of the pullrequest
   */
  url: string
}

/**
 * find_BadGateway_response_body result type (default view)
 */
export interface PullrequestsFindBadGatewayResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * find_BadRequest_response_body result type (default view)
 */
export interface PullrequestsFindBadRequestResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * find_Forbidden_response_body result type (default view)
 */
export interface PullrequestsFindForbiddenResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * find_InternalServer_response_body result type (default view)
 */
export interface PullrequestsFindInternalServerResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * find_NotFound_response_body result type (default view)
 */
export interface PullrequestsFindNotFoundResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

export interface PullrequestsFindResponseBody {
  /**
   * Harness account ID associated with this pullrequest
   */
  account_id: string
  /**
   * author of the pullrequest
   */
  author: string
  /**
   * Time the commit was authored
   */
  authored_date: number
  /**
   * Time the pullrequest was closed
   */
  closed_at: number
  /**
   * the hash of the commit
   */
  commit_hash: string
  /**
   * The ID of the commit
   */
  commit_id: string
  /**
   * Time the commit was created
   */
  committed_date: number
  /**
   * Time the pullrequest was last created
   */
  created: number
  /**
   * Time the pullrequest was created
   */
  created_at: number
  /**
   * Time the pullrequest was merged
   */
  merged_at: number
  /**
   * Number of the pullrequest
   */
  number: number
  /**
   * id of the pullrequest
   */
  pr_id: string
  /**
   * Time the pullrequest was published
   */
  published_at: number
  /**
   * Time of the first review activity on the pullrequest was created
   */
  review_first_activity_at: number
  /**
   * Time of the last review activity on the pullrequest was created
   */
  review_last_approval_at: number
  /**
   * Source ID associated with this connection source
   */
  source_id: number
  /**
   * state of the pullrequest
   */
  state: string
  /**
   * title of the pullrequest
   */
  title: string
  /**
   * Time the pullrequest was last updated
   */
  updated: number
  /**
   * Time the pullrequest was updated
   */
  updated_at: number
  /**
   * url of the pullrequest
   */
  url: string
}

/**
 * find_Unauthorized_response_body result type (default view)
 */
export interface PullrequestsFindUnauthorizedResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * list_BadGateway_response_body result type (default view)
 */
export interface PullrequestsListBadGatewayResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * list_BadRequest_response_body result type (default view)
 */
export interface PullrequestsListBadRequestResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * list_Forbidden_response_body result type (default view)
 */
export interface PullrequestsListForbiddenResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * list_InternalServer_response_body result type (default view)
 */
export interface PullrequestsListInternalServerResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * list_NotFound_response_body result type (default view)
 */
export interface PullrequestsListNotFoundResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * list_Unauthorized_response_body result type (default view)
 */
export interface PullrequestsListUnauthorizedResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * processsbom_BadGateway_response_body result type (default view)
 */
export interface SbomprocessorProcesssbomBadGatewayResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * processsbom_BadRequest_response_body result type (default view)
 */
export interface SbomprocessorProcesssbomBadRequestResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * processsbom_Forbidden_response_body result type (default view)
 */
export interface SbomprocessorProcesssbomForbiddenResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * processsbom_InternalServer_response_body result type (default view)
 */
export interface SbomprocessorProcesssbomInternalServerResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * processsbom_NotFound_response_body result type (default view)
 */
export interface SbomprocessorProcesssbomNotFoundResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * A sbom process request on ssca
 */
export interface SbomprocessorProcesssbomRequestBody {
  /**
   * name of the package
   */
  AccountID?: string
  /**
   * name of the package
   */
  ArtifactID?: string
  /**
   * stage name where sbom is generated
   */
  Format?: string
  /**
   * name of the package
   */
  PipelineExecutionID?: string
  /**
   * name of the package
   */
  PipelineIdentifier?: string
  /**
   * name of the package
   */
  SbomUrl?: string
  /**
   * name of the package
   */
  SequenceId?: number
  /**
   * name of the package
   */
  Tool?: string
}

/**
 * processsbom_Unauthorized_response_body result type (default view)
 */
export interface SbomprocessorProcesssbomUnauthorizedResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * find_BadGateway_response_body result type (default view)
 */
export interface SearchFindBadGatewayResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * find_BadRequest_response_body result type (default view)
 */
export interface SearchFindBadRequestResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * find_Forbidden_response_body result type (default view)
 */
export interface SearchFindForbiddenResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * find_InternalServer_response_body result type (default view)
 */
export interface SearchFindInternalServerResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * find_NotFound_response_body result type (default view)
 */
export interface SearchFindNotFoundResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

export interface SearchFindResponseBody {
  packageReferences: PackageReferenceResponseBody[]
}

/**
 * find_Unauthorized_response_body result type (default view)
 */
export interface SearchFindUnauthorizedResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * health_BadGateway_response_body result type (default view)
 */
export interface SystemHealthBadGatewayResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * health_InternalServer_response_body result type (default view)
 */
export interface SystemHealthInternalServerResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * version_BadGateway_response_body result type (default view)
 */
export interface SystemVersionBadGatewayResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

/**
 * version_InternalServer_response_body result type (default view)
 */
export interface SystemVersionInternalServerResponseBody {
  /**
   * Is the error a server-side fault?
   */
  fault: boolean
  /**
   * ID is a unique identifier for this particular occurrence of the problem.
   */
  id: string
  /**
   * Message is a human-readable explanation specific to this occurrence of the problem.
   */
  message: string
  /**
   * Name is the name of this class of errors.
   */
  name: string
  /**
   * Is the error temporary?
   */
  temporary: boolean
  /**
   * Is the error a timeout?
   */
  timeout: boolean
}

export interface SystemVersionResponseBody {
  /**
   * Build identifier
   */
  commit: string
  /**
   * Version number
   */
  version: string
}

/**
 * A package search request on ssca
 */
export interface PackageReferenceResponseBody {
  /**
   * name of the package
   */
  AccountName?: string
  /**
   * name of the package
   */
  Originator?: string
  /**
   * name of the package
   */
  PipelineIdentifier?: string
  /**
   * name of the package
   */
  SequenceId?: number
  /**
   * stage name where sbom is generated
   */
  StageName?: string
  /**
   * name of the package
   */
  VersionInfo?: string
  /**
   * name of the package
   */
  name?: string
}

export interface DevLoginQueryParams {
  /**
   * Harness account ID
   */
  accountIdentifier: string
  /**
   * Harness organization ID
   */
  orgIdentifier: string
  /**
   * Harness project ID
   */
  projectIdentifier: string
}

export type DevLoginProps = Omit<
  MutateProps<
    string,
    | DevLoginBadRequestResponseBody
    | DevLoginUnauthorizedResponseBody
    | DevLoginForbiddenResponseBody
    | DevLoginNotFoundResponseBody
    | DevLoginInternalServerResponseBody
    | DevLoginBadGatewayResponseBody,
    DevLoginQueryParams,
    DevLoginRequestBody,
    void
  >,
  'path' | 'verb'
>

export const DevLogin = (props: DevLoginProps) => (
  <Mutate<
    string,
    | DevLoginBadRequestResponseBody
    | DevLoginUnauthorizedResponseBody
    | DevLoginForbiddenResponseBody
    | DevLoginNotFoundResponseBody
    | DevLoginInternalServerResponseBody
    | DevLoginBadGatewayResponseBody,
    DevLoginQueryParams,
    DevLoginRequestBody,
    void
  >
    verb="POST"
    path={`/api/login`}
    base={getConfig('ssca/api/v1')}
    {...props}
  />
)

export type UseDevLoginProps = Omit<
  UseMutateProps<
    string,
    | DevLoginBadRequestResponseBody
    | DevLoginUnauthorizedResponseBody
    | DevLoginForbiddenResponseBody
    | DevLoginNotFoundResponseBody
    | DevLoginInternalServerResponseBody
    | DevLoginBadGatewayResponseBody,
    DevLoginQueryParams,
    DevLoginRequestBody,
    void
  >,
  'path' | 'verb'
>

export const useDevLogin = (props: UseDevLoginProps) =>
  useMutate<
    string,
    | DevLoginBadRequestResponseBody
    | DevLoginUnauthorizedResponseBody
    | DevLoginForbiddenResponseBody
    | DevLoginNotFoundResponseBody
    | DevLoginInternalServerResponseBody
    | DevLoginBadGatewayResponseBody,
    DevLoginQueryParams,
    DevLoginRequestBody,
    void
  >('POST', `/api/login`, { base: getConfig('ssca/api/v1'), ...props })

export interface PullrequestsListQueryParams {
  /**
   * Harness account ID
   */
  accountIdentifier: string
  /**
   * Harness organization ID
   */
  orgIdentifier: string
  /**
   * Harness project ID
   */
  projectIdentifier: string
}

export type PullrequestsListProps = Omit<
  GetProps<
    Pullrequest[],
    | PullrequestsListBadRequestResponseBody
    | PullrequestsListUnauthorizedResponseBody
    | PullrequestsListForbiddenResponseBody
    | PullrequestsListNotFoundResponseBody
    | PullrequestsListInternalServerResponseBody
    | PullrequestsListBadGatewayResponseBody,
    PullrequestsListQueryParams,
    void
  >,
  'path'
>

/**
 * List all pullrequests
 *
 * **Required security scopes for jwt**:
 *   * `core_project_view`
 */
export const PullrequestsList = (props: PullrequestsListProps) => (
  <Get<
    Pullrequest[],
    | PullrequestsListBadRequestResponseBody
    | PullrequestsListUnauthorizedResponseBody
    | PullrequestsListForbiddenResponseBody
    | PullrequestsListNotFoundResponseBody
    | PullrequestsListInternalServerResponseBody
    | PullrequestsListBadGatewayResponseBody,
    PullrequestsListQueryParams,
    void
  >
    path={`/api/v1/pullrequests`}
    base={getConfig('ssca/api/v1')}
    {...props}
  />
)

export type UsePullrequestsListProps = Omit<
  UseGetProps<
    Pullrequest[],
    | PullrequestsListBadRequestResponseBody
    | PullrequestsListUnauthorizedResponseBody
    | PullrequestsListForbiddenResponseBody
    | PullrequestsListNotFoundResponseBody
    | PullrequestsListInternalServerResponseBody
    | PullrequestsListBadGatewayResponseBody,
    PullrequestsListQueryParams,
    void
  >,
  'path'
>

/**
 * List all pullrequests
 *
 * **Required security scopes for jwt**:
 *   * `core_project_view`
 */
export const usePullrequestsList = (props: UsePullrequestsListProps) =>
  useGet<
    Pullrequest[],
    | PullrequestsListBadRequestResponseBody
    | PullrequestsListUnauthorizedResponseBody
    | PullrequestsListForbiddenResponseBody
    | PullrequestsListNotFoundResponseBody
    | PullrequestsListInternalServerResponseBody
    | PullrequestsListBadGatewayResponseBody,
    PullrequestsListQueryParams,
    void
  >(`/api/v1/pullrequests`, { base: getConfig('ssca/api/v1'), ...props })

export interface PullrequestsFindQueryParams {
  /**
   * Harness account ID
   */
  accountIdentifier: string
  /**
   * Harness organization ID
   */
  orgIdentifier: string
  /**
   * Harness project ID
   */
  projectIdentifier: string
}

export interface PullrequestsFindPathParams {
  /**
   * Source ID associated with this connection source
   */
  source_identifier: string
  /**
   * Number associated with the Pull Request
   */
  number: number
}

export type PullrequestsFindProps = Omit<
  GetProps<
    PullrequestsFindResponseBody,
    | PullrequestsFindBadRequestResponseBody
    | PullrequestsFindUnauthorizedResponseBody
    | PullrequestsFindForbiddenResponseBody
    | PullrequestsFindNotFoundResponseBody
    | PullrequestsFindInternalServerResponseBody
    | PullrequestsFindBadGatewayResponseBody,
    PullrequestsFindQueryParams,
    PullrequestsFindPathParams
  >,
  'path'
> &
  PullrequestsFindPathParams

/**
 * Find a pullrequest by identifier
 *
 * **Required security scopes for jwt**:
 *   * `core_project_view`
 */
export const PullrequestsFind = ({ source_identifier, number, ...props }: PullrequestsFindProps) => (
  <Get<
    PullrequestsFindResponseBody,
    | PullrequestsFindBadRequestResponseBody
    | PullrequestsFindUnauthorizedResponseBody
    | PullrequestsFindForbiddenResponseBody
    | PullrequestsFindNotFoundResponseBody
    | PullrequestsFindInternalServerResponseBody
    | PullrequestsFindBadGatewayResponseBody,
    PullrequestsFindQueryParams,
    PullrequestsFindPathParams
  >
    path={`/api/v1/pullrequests/${source_identifier}/${number}`}
    base={getConfig('ssca/api/v1')}
    {...props}
  />
)

export type UsePullrequestsFindProps = Omit<
  UseGetProps<
    PullrequestsFindResponseBody,
    | PullrequestsFindBadRequestResponseBody
    | PullrequestsFindUnauthorizedResponseBody
    | PullrequestsFindForbiddenResponseBody
    | PullrequestsFindNotFoundResponseBody
    | PullrequestsFindInternalServerResponseBody
    | PullrequestsFindBadGatewayResponseBody,
    PullrequestsFindQueryParams,
    PullrequestsFindPathParams
  >,
  'path'
> &
  PullrequestsFindPathParams

/**
 * Find a pullrequest by identifier
 *
 * **Required security scopes for jwt**:
 *   * `core_project_view`
 */
export const usePullrequestsFind = ({ source_identifier, number, ...props }: UsePullrequestsFindProps) =>
  useGet<
    PullrequestsFindResponseBody,
    | PullrequestsFindBadRequestResponseBody
    | PullrequestsFindUnauthorizedResponseBody
    | PullrequestsFindForbiddenResponseBody
    | PullrequestsFindNotFoundResponseBody
    | PullrequestsFindInternalServerResponseBody
    | PullrequestsFindBadGatewayResponseBody,
    PullrequestsFindQueryParams,
    PullrequestsFindPathParams
  >(
    (paramsInPath: PullrequestsFindPathParams) =>
      `/api/v1/pullrequests/${paramsInPath.source_identifier}/${paramsInPath.number}`,
    { base: getConfig('ssca/api/v1'), pathParams: { source_identifier, number }, ...props }
  )

export type SbomprocessorProcesssbomProps = Omit<
  MutateProps<
    void,
    | SbomprocessorProcesssbomBadRequestResponseBody
    | SbomprocessorProcesssbomUnauthorizedResponseBody
    | SbomprocessorProcesssbomForbiddenResponseBody
    | SbomprocessorProcesssbomNotFoundResponseBody
    | SbomprocessorProcesssbomInternalServerResponseBody
    | SbomprocessorProcesssbomBadGatewayResponseBody,
    void,
    SbomprocessorProcesssbomRequestBody,
    void
  >,
  'path' | 'verb'
>

/**
 * process & inject sbom
 */
export const SbomprocessorProcesssbom = (props: SbomprocessorProcesssbomProps) => (
  <Mutate<
    void,
    | SbomprocessorProcesssbomBadRequestResponseBody
    | SbomprocessorProcesssbomUnauthorizedResponseBody
    | SbomprocessorProcesssbomForbiddenResponseBody
    | SbomprocessorProcesssbomNotFoundResponseBody
    | SbomprocessorProcesssbomInternalServerResponseBody
    | SbomprocessorProcesssbomBadGatewayResponseBody,
    void,
    SbomprocessorProcesssbomRequestBody,
    void
  >
    verb="POST"
    path={`/api/v1/sbomprocessor`}
    base={getConfig('ssca/api/v1')}
    {...props}
  />
)

export type UseSbomprocessorProcesssbomProps = Omit<
  UseMutateProps<
    void,
    | SbomprocessorProcesssbomBadRequestResponseBody
    | SbomprocessorProcesssbomUnauthorizedResponseBody
    | SbomprocessorProcesssbomForbiddenResponseBody
    | SbomprocessorProcesssbomNotFoundResponseBody
    | SbomprocessorProcesssbomInternalServerResponseBody
    | SbomprocessorProcesssbomBadGatewayResponseBody,
    void,
    SbomprocessorProcesssbomRequestBody,
    void
  >,
  'path' | 'verb'
>

/**
 * process & inject sbom
 */
export const useSbomprocessorProcesssbom = (props: UseSbomprocessorProcesssbomProps) =>
  useMutate<
    void,
    | SbomprocessorProcesssbomBadRequestResponseBody
    | SbomprocessorProcesssbomUnauthorizedResponseBody
    | SbomprocessorProcesssbomForbiddenResponseBody
    | SbomprocessorProcesssbomNotFoundResponseBody
    | SbomprocessorProcesssbomInternalServerResponseBody
    | SbomprocessorProcesssbomBadGatewayResponseBody,
    void,
    SbomprocessorProcesssbomRequestBody,
    void
  >('POST', `/api/v1/sbomprocessor`, { base: getConfig('ssca/api/v1'), ...props })

export interface SearchFindQueryParams {
  /**
   * Harness account ID
   */
  accountIdentifier: string
  /**
   * Harness organization ID
   */
  orgIdentifier: string
  /**
   * Harness project ID
   */
  projectIdentifier: string
}

export interface SearchFindPathParams {
  /**
   * Source ID associated with this connection source
   */
  packagename: string
}

export type SearchFindProps = Omit<
  GetProps<
    SearchFindResponseBody,
    | SearchFindBadRequestResponseBody
    | SearchFindUnauthorizedResponseBody
    | SearchFindForbiddenResponseBody
    | SearchFindNotFoundResponseBody
    | SearchFindInternalServerResponseBody
    | SearchFindBadGatewayResponseBody,
    SearchFindQueryParams,
    SearchFindPathParams
  >,
  'path'
> &
  SearchFindPathParams

/**
 * Find a package references by name
 *
 * **Required security scopes for jwt**:
 *   * `core_project_view`
 */
export const SearchFind = ({ packagename, ...props }: SearchFindProps) => (
  <Get<
    SearchFindResponseBody,
    | SearchFindBadRequestResponseBody
    | SearchFindUnauthorizedResponseBody
    | SearchFindForbiddenResponseBody
    | SearchFindNotFoundResponseBody
    | SearchFindInternalServerResponseBody
    | SearchFindBadGatewayResponseBody,
    SearchFindQueryParams,
    SearchFindPathParams
  >
    path={`/api/v1/search/${packagename}`}
    base={getConfig('ssca/api/v1')}
    {...props}
  />
)

export type UseSearchFindProps = Omit<
  UseGetProps<
    SearchFindResponseBody,
    | SearchFindBadRequestResponseBody
    | SearchFindUnauthorizedResponseBody
    | SearchFindForbiddenResponseBody
    | SearchFindNotFoundResponseBody
    | SearchFindInternalServerResponseBody
    | SearchFindBadGatewayResponseBody,
    SearchFindQueryParams,
    SearchFindPathParams
  >,
  'path'
> &
  SearchFindPathParams

/**
 * Find a package references by name
 *
 * **Required security scopes for jwt**:
 *   * `core_project_view`
 */
export const useSearchFind = ({ packagename, ...props }: UseSearchFindProps) =>
  useGet<
    SearchFindResponseBody,
    | SearchFindBadRequestResponseBody
    | SearchFindUnauthorizedResponseBody
    | SearchFindForbiddenResponseBody
    | SearchFindNotFoundResponseBody
    | SearchFindInternalServerResponseBody
    | SearchFindBadGatewayResponseBody,
    SearchFindQueryParams,
    SearchFindPathParams
  >((paramsInPath: SearchFindPathParams) => `/api/v1/search/${paramsInPath.packagename}`, {
    base: getConfig('ssca/api/v1'),
    pathParams: { packagename },
    ...props
  })

export type SystemHealthProps = Omit<
  GetProps<void, SystemHealthInternalServerResponseBody | SystemHealthBadGatewayResponseBody, void, void>,
  'path'
>

/**
 * Check service health
 */
export const SystemHealth = (props: SystemHealthProps) => (
  <Get<void, SystemHealthInternalServerResponseBody | SystemHealthBadGatewayResponseBody, void, void>
    path={`/api/v1/system/health`}
    base={getConfig('ssca/api/v1')}
    {...props}
  />
)

export type UseSystemHealthProps = Omit<
  UseGetProps<void, SystemHealthInternalServerResponseBody | SystemHealthBadGatewayResponseBody, void, void>,
  'path'
>

/**
 * Check service health
 */
export const useSystemHealth = (props: UseSystemHealthProps) =>
  useGet<void, SystemHealthInternalServerResponseBody | SystemHealthBadGatewayResponseBody, void, void>(
    `/api/v1/system/health`,
    { base: getConfig('ssca/api/v1'), ...props }
  )

export type SystemVersionProps = Omit<
  GetProps<
    SystemVersionResponseBody,
    SystemVersionInternalServerResponseBody | SystemVersionBadGatewayResponseBody,
    void,
    void
  >,
  'path'
>

/**
 * Check service version
 */
export const SystemVersion = (props: SystemVersionProps) => (
  <Get<
    SystemVersionResponseBody,
    SystemVersionInternalServerResponseBody | SystemVersionBadGatewayResponseBody,
    void,
    void
  >
    path={`/api/v1/system/version`}
    base={getConfig('ssca/api/v1')}
    {...props}
  />
)

export type UseSystemVersionProps = Omit<
  UseGetProps<
    SystemVersionResponseBody,
    SystemVersionInternalServerResponseBody | SystemVersionBadGatewayResponseBody,
    void,
    void
  >,
  'path'
>

/**
 * Check service version
 */
export const useSystemVersion = (props: UseSystemVersionProps) =>
  useGet<
    SystemVersionResponseBody,
    SystemVersionInternalServerResponseBody | SystemVersionBadGatewayResponseBody,
    void,
    void
  >(`/api/v1/system/version`, { base: getConfig('ssca/api/v1'), ...props })
