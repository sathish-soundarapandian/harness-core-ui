/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/**
 * Generated by @openapi-codegen
 *
 * @version 0.1.0-beta
 */
/**
 * @example {"comment":"This is the text to add as a comment."}
 */
export type AddCommentRequestBody = {
  /*
   * Comment to be added
   *
   * @example This is the text to add as a comment.
   */
  comment: string
}

/**
 * @example {"description":"This is the very long ticket description...","exists":false,"externalId":"ABC-1234","identifiers":{"idName":["value1","value2","value3"]},"issueType":"Bug","priority":"High","projectKey":"ABC","title":"A new ticket"}
 */
export type CreateTicketRequestBody = {
  /*
   * The description for this External Ticket
   *
   * @example This is the very long ticket description...
   */
  description?: string
  /*
   * Indicates the ticket already exists on the ticket provider
   *
   * @example false
   */
  exists?: boolean
  /*
   * The ID used to identify this External Ticket in the ticket provider. Only used if the "exists" field is true.
   *
   * @example ABC-1234
   */
  externalId?: string
  /*
   * Identifier(s) to associate with this ticket, in "key":"value" and/or "key":ArrayOf("values"...) form
   *
   * @example {"idName":["value1","value2","value3"]}
   */
  identifiers: {
    [key: string]: any
  }
  /*
   * The Jira issue type to use for this External Ticket (for Jira only)
   *
   * @example Bug
   */
  issueType?: string
  /*
   * The priority to use for this External Ticket
   *
   * @example High
   */
  priority?: string
  /*
   * The Jira project key to use for this External Ticket (for Jira only)
   *
   * @example ABC
   */
  projectKey?: string
  /*
   * The title for this External Ticket
   *
   * @example A new ticket
   */
  title?: string
}

/**
 * @example {"id":"abcdef1234567890ghijkl"}
 */
export type IDResult = {
  /*
   * Resource identifier
   *
   * @example abcdef1234567890ghijkl
   * @pattern ^[a-zA-Z0-9_-]{22}$
   */
  id: string
}

/**
 * @example {"priorities":[{"id":"Ipsa et id ut enim doloribus.","name":"Suscipit qui reiciendis vero officiis non."},{"id":"Ipsa et id ut enim doloribus.","name":"Suscipit qui reiciendis vero officiis non."},{"id":"Ipsa et id ut enim doloribus.","name":"Suscipit qui reiciendis vero officiis non."}]}
 */
export type ListPrioritiesResponse = {
  /*
   * The metadata for all priorities
   *
   * @example {"id":"Ipsa et id ut enim doloribus.","name":"Suscipit qui reiciendis vero officiis non."}
   * @example {"id":"Ipsa et id ut enim doloribus.","name":"Suscipit qui reiciendis vero officiis non."}
   * @example {"id":"Ipsa et id ut enim doloribus.","name":"Suscipit qui reiciendis vero officiis non."}
   */
  priorities: Priority[]
}

/**
 * @example {"projects":[{"key":"Vel officiis est totam omnis quia.","name":"Quas neque voluptatem in modi odio quibusdam.","ticketTypes":[{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."},{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."}]},{"key":"Vel officiis est totam omnis quia.","name":"Quas neque voluptatem in modi odio quibusdam.","ticketTypes":[{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."},{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."}]},{"key":"Vel officiis est totam omnis quia.","name":"Quas neque voluptatem in modi odio quibusdam.","ticketTypes":[{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."},{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."}]},{"key":"Vel officiis est totam omnis quia.","name":"Quas neque voluptatem in modi odio quibusdam.","ticketTypes":[{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."},{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."}]}]}
 */
export type ListProjectsResponse = {
  /*
   * The metadata for all projects
   *
   * @example {"key":"Vel officiis est totam omnis quia.","name":"Quas neque voluptatem in modi odio quibusdam.","ticketTypes":[{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."},{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."}]}
   * @example {"key":"Vel officiis est totam omnis quia.","name":"Quas neque voluptatem in modi odio quibusdam.","ticketTypes":[{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."},{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."}]}
   * @example {"key":"Vel officiis est totam omnis quia.","name":"Quas neque voluptatem in modi odio quibusdam.","ticketTypes":[{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."},{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."}]}
   * @example {"key":"Vel officiis est totam omnis quia.","name":"Quas neque voluptatem in modi odio quibusdam.","ticketTypes":[{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."},{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."}]}
   */
  projects: Project[]
}

export type MetadataListPrioritiesResponseBody = ListPrioritiesResponse

export type MetadataListProjectsResponseBody = ListProjectsResponse

/**
 * @example {"message":"Not Found","status":404}
 */
export type NotFound = {
  /*
   * @example Not Found
   */
  message: string
  /*
   * @default 404
   * @example 404
   * @format int64
   */
  status?: number
}

/**
 * @example {"link":"","page":4,"pageSize":20,"totalItems":230,"totalPages":12}
 */
export type Pagination = {
  /*
   * Link-based paging
   *
   * @example
   */
  link?: string
  /*
   * Page number (starting from 0)
   *
   * @example 4
   * @format int64
   */
  page: number
  /*
   * Requested page size
   *
   * @example 20
   * @format int64
   */
  pageSize: number
  /*
   * Total results available
   *
   * @example 230
   * @format int64
   */
  totalItems: number
  /*
   * Total pages available
   *
   * @example 12
   * @format int64
   */
  totalPages: number
}

/**
 * @example {"id":"Ipsa et omnis quia vel non.","name":"Atque ea sunt ipsum exercitationem aut sed."}
 */
export type Priority = {
  /*
   * @example Excepturi est esse et id ullam.
   */
  id: string
  /*
   * @example Adipisci molestias quis aut officiis.
   */
  name: string
}

/**
 * @example {"key":"Doloremque error nihil.","name":"Expedita non voluptates iste delectus sed.","ticketTypes":[{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."},{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."},{"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."}]}
 */
export type Project = {
  /*
   * @example Officia voluptatem voluptate.
   */
  key: string
  /*
   * @example Deserunt dignissimos ad et omnis voluptatem consequatur.
   */
  name: string
  /*
   * @example {"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."}
   * @example {"id":"Porro eligendi.","isSubtask":true,"name":"Est dolorum."}
   */
  ticketTypes?: TicketType[]
}

/**
 * @example {"additional":{"name":"value"},"connectorId":"my_jira_connector","module":"sto","service":"Jira"}
 */
export type SaveSettingRequestBody = {
  /*
   * Additional settings
   *
   * @example {"name":"value"}
   */
  additional?: {
    [key: string]: string
  }
  /*
   * The Harness connector ID to use for communication with the ticket provider
   *
   * @example my_jira_connector
   */
  connectorId: string
  /*
   * The Harness module for which these settings should apply
   *
   * @example sto
   */
  module?: string
  /*
   * The ticket provider to use
   *
   * @example Jira
   */
  service: 'Jira'
}

/**
 * @example {"commit":"96381692bf3a2bd7904769c6886e832435768b57","version":"v0.123.0"}
 */
export type ServiceVersion = {
  /*
   * Build identifier
   *
   * @example 96381692bf3a2bd7904769c6886e832435768b57
   */
  commit: string
  /*
   * Version number
   *
   * @example v0.123.0
   */
  version: string
}

/**
 * @example {"additional":{"name":"value"},"connectorId":"my_jira_connector","created":1651578240,"lastModified":1651578240,"module":"sto","service":"Jira"}
 */
export type Setting = {
  /*
   * Additional settings
   *
   * @example {"name":"value"}
   */
  additional?: {
    [key: string]: string
  }
  /*
   * The Harness connector ID to use for communication with the ticket provider
   *
   * @example my_jira_connector
   */
  connectorId: string
  /*
   * Unix timestamp at which the resource was created
   *
   * @example 1651578240
   * @format int64
   */
  created?: number
  /*
   * Unix timestamp at which the resource was most recently modified
   *
   * @example 1651578240
   * @format int64
   */
  lastModified?: number
  /*
   * The Harness module for which these settings should apply
   *
   * @example sto
   */
  module?: string
  /*
   * The ticket provider to use
   *
   * @example Jira
   */
  service: 'Jira'
}

/**
 * Information about an External Ticket
 *
 * @example {"accountId":"abcdef1234567890ghijkl","created":1651578240,"description":"This is the very long ticket description...","exists":false,"externalId":"ABC-1234","id":"abcdef1234567890ghijkl","identifiers":{"idName":["value1","value2","value3"]},"issueType":"Bug","lastModified":1651578240,"module":"sto","orgId":"example_org","priority":"High","projectId":"example_project","projectKey":"ABC","status":"To Do","statusColor":"#42526E","title":"A new ticket"}
 */
export type Ticket = {
  /*
   * Harness Account ID
   *
   * @example abcdef1234567890ghijkl
   * @pattern ^[a-zA-Z0-9_-]{22}$
   */
  accountId: string
  /*
   * Unix timestamp at which the resource was created
   *
   * @example 1651578240
   * @format int64
   */
  created?: number
  /*
   * The description for this External Ticket
   *
   * @example This is the very long ticket description...
   */
  description?: string
  /*
   * Indicates the ticket already exists on the ticket provider
   *
   * @example false
   */
  exists?: boolean
  /*
   * The ID used to identify this External Ticket in the ticket provider. Only used if the "exists" field is true.
   *
   * @example ABC-1234
   */
  externalId: string
  /*
   * Resource identifier
   *
   * @example abcdef1234567890ghijkl
   * @pattern ^[a-zA-Z0-9_-]{22}$
   */
  id: string
  /*
   * Identifier(s) to associate with this ticket, in "key":"value" and/or "key":ArrayOf("values"...) form
   *
   * @example {"idName":["value1","value2","value3"]}
   */
  identifiers: {
    [key: string]: any
  }
  /*
   * The Jira issue type to use for this External Ticket (for Jira only)
   *
   * @example Bug
   */
  issueType?: string
  /*
   * Unix timestamp at which the resource was most recently modified
   *
   * @example 1651578240
   * @format int64
   */
  lastModified?: number
  /*
   * The Harness module responsible for this ticket
   *
   * @example sto
   */
  module: string
  /*
   * Harness Organization ID
   *
   * @example example_org
   * @pattern ^[A-Za-z_][A-Za-z0-9_]*$
   * @maxLength 128
   */
  orgId?: string
  /*
   * The priority to use for this External Ticket
   *
   * @example High
   */
  priority?: string
  /*
   * Harness Project ID
   *
   * @example example_project
   * @pattern ^[A-Za-z_][A-Za-z0-9_]*$
   * @maxLength 128
   */
  projectId?: string
  /*
   * The Jira project key to use for this External Ticket (for Jira only)
   *
   * @example ABC
   */
  projectKey?: string
  /*
   * The status of the External Ticket, from the Ticket Provider
   *
   * @example To Do
   */
  status?: string
  /*
   * The HTML color related to the status of the External Ticket, from the Ticket Provider
   *
   * @example #42526E
   */
  statusColor?: string
  /*
   * The title for this External Ticket
   *
   * @example A new ticket
   */
  title?: string
}

/**
 * @example {"id":"Provident ut ad quibusdam sequi et.","isSubtask":false,"name":"Debitis est."}
 */
export type TicketType = {
  /*
   * @example Eos sed dolor.
   */
  id: string
  /*
   * @example true
   */
  isSubtask: boolean
  /*
   * @example Culpa aliquam.
   */
  name: string
}

export type TicketsCreateTicketResponseBody = IDResult

/**
 * @example {"pagination":{"link":"","page":4,"pageSize":20,"totalItems":230,"totalPages":12},"results":[{"accountId":"abcdef1234567890ghijkl","created":1651578240,"description":"This is the very long ticket description...","exists":false,"externalId":"ABC-1234","id":"abcdef1234567890ghijkl","identifiers":{"idName":["value1","value2","value3"]},"issueType":"Bug","lastModified":1651578240,"module":"sto","orgId":"example_org","priority":"High","projectId":"example_project","projectKey":"ABC","status":"To Do","statusColor":"#42526E","title":"A new ticket"},{"accountId":"abcdef1234567890ghijkl","created":1651578240,"description":"This is the very long ticket description...","exists":false,"externalId":"ABC-1234","id":"abcdef1234567890ghijkl","identifiers":{"idName":["value1","value2","value3"]},"issueType":"Bug","lastModified":1651578240,"module":"sto","orgId":"example_org","priority":"High","projectId":"example_project","projectKey":"ABC","status":"To Do","statusColor":"#42526E","title":"A new ticket"},{"accountId":"abcdef1234567890ghijkl","created":1651578240,"description":"This is the very long ticket description...","exists":false,"externalId":"ABC-1234","id":"abcdef1234567890ghijkl","identifiers":{"idName":["value1","value2","value3"]},"issueType":"Bug","lastModified":1651578240,"module":"sto","orgId":"example_org","priority":"High","projectId":"example_project","projectKey":"ABC","status":"To Do","statusColor":"#42526E","title":"A new ticket"},{"accountId":"abcdef1234567890ghijkl","created":1651578240,"description":"This is the very long ticket description...","exists":false,"externalId":"ABC-1234","id":"abcdef1234567890ghijkl","identifiers":{"idName":["value1","value2","value3"]},"issueType":"Bug","lastModified":1651578240,"module":"sto","orgId":"example_org","priority":"High","projectId":"example_project","projectKey":"ABC","status":"To Do","statusColor":"#42526E","title":"A new ticket"}]}
 */
export type TicketsListTicketsResponseBody = {
  pagination: Pagination
  /*
   * @example {"accountId":"abcdef1234567890ghijkl","created":1651578240,"description":"This is the very long ticket description...","exists":false,"externalId":"ABC-1234","id":"abcdef1234567890ghijkl","identifiers":{"idName":["value1","value2","value3"]},"issueType":"Bug","lastModified":1651578240,"module":"sto","orgId":"example_org","priority":"High","projectId":"example_project","projectKey":"ABC","status":"To Do","statusColor":"#42526E","title":"A new ticket"}
   * @example {"accountId":"abcdef1234567890ghijkl","created":1651578240,"description":"This is the very long ticket description...","exists":false,"externalId":"ABC-1234","id":"abcdef1234567890ghijkl","identifiers":{"idName":["value1","value2","value3"]},"issueType":"Bug","lastModified":1651578240,"module":"sto","orgId":"example_org","priority":"High","projectId":"example_project","projectKey":"ABC","status":"To Do","statusColor":"#42526E","title":"A new ticket"}
   * @example {"accountId":"abcdef1234567890ghijkl","created":1651578240,"description":"This is the very long ticket description...","exists":false,"externalId":"ABC-1234","id":"abcdef1234567890ghijkl","identifiers":{"idName":["value1","value2","value3"]},"issueType":"Bug","lastModified":1651578240,"module":"sto","orgId":"example_org","priority":"High","projectId":"example_project","projectKey":"ABC","status":"To Do","statusColor":"#42526E","title":"A new ticket"}
   * @example {"accountId":"abcdef1234567890ghijkl","created":1651578240,"description":"This is the very long ticket description...","exists":false,"externalId":"ABC-1234","id":"abcdef1234567890ghijkl","identifiers":{"idName":["value1","value2","value3"]},"issueType":"Bug","lastModified":1651578240,"module":"sto","orgId":"example_org","priority":"High","projectId":"example_project","projectKey":"ABC","status":"To Do","statusColor":"#42526E","title":"A new ticket"}
   */
  results: Ticket[]
}
