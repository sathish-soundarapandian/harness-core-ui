/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isUndefined } from 'lodash-es'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { GitSyncEntityDTO } from 'services/cd-ng'

export function getIdentifierFromName(str: string): string {
  return str
    .trim()
    .replace(/[^0-9a-zA-Z_$ ]/g, '') // remove special chars except _ and $
    .replace(/ +/g, '_') // replace spaces with _
}

export const illegalIdentifiers = [
  'or',
  'and',
  'eq',
  'ne',
  'lt',
  'gt',
  'le',
  'ge',
  'div',
  'mod',
  'not',
  'null',
  'true',
  'false',
  'new',
  'var',
  'return',
  'step',
  'parallel',
  'stepGroup',
  'org',
  'account'
]

export const DEFAULT_DATE_FORMAT = 'MM/DD/YYYY hh:mm a'
export const DATE_WITHOUT_TIME_FORMAT = 'MMMM Do YYYY'
export function pluralize(number: number): string {
  return number > 1 || number === 0 ? 's' : ''
}

export const regexEmail =
  /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const regexName = /^[A-Za-z0-9_.-][A-Za-z0-9 _.-]*$/

export const regexPositiveNumbers = /^[1-9]+[0-9]*$/

export const regexIdentifier = /^[a-zA-Z_.][0-9a-zA-Z_$]*$/

export const keyRegexIdentifier = /^([a-zA-Z_])([0-9a-zA-Z_$]*)+((\.[0-9a-zA-Z_$]+)*)$/

export const k8sLabelRegex = /[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*/

// https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/#syntax-and-character-set
export const k8sAnnotationRegex = /^[a-z0-9A-Z]([a-z0-9A-Z-_./])*[a-z0-9A-Z]$/

export const regexVersionLabel = /^[0-9a-zA-Z][\S]*$/

export const HarnessFolderName = /^[A-Za-z0-9_\-/][A-Za-z0-9 _\-/]*$/

export const GitSuffixRegex = /.git(\/)*$/g

export const folderPathName = /^[A-Za-z0-9_-][A-Za-z0-9 _-]*$/g

export const yamlFileExtension = '.yaml'

export const yamlPathRegex = /.*\.ya?ml$/

export const fullYamlPathRegex = /^(?!\.\/)(?!.*\.\.{1,})(?!.*\/\/.*)(?!.*\/\.\/.*)[\w\-./ ]+\.yaml$/

export const carriageReturnRegex = /(?:\\[rn])+/g

export const cpuLimitRegex = /^\d+(\.\d+)?$|^\d+m$|^$/

export const memorLimityRegex = /^(([0-9]*[.])?[0-9]+)([GM]i?)|^$/

// Borrowed from https://blog.markhatton.co.uk/2011/03/15/regular-expressions-for-ip-addresses-cidr-ranges-and-hostnames/
export const regexIpAddressV4 =
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/

export const regexIpAddressV4CIDR =
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))$/

export const regexIpAddressV6 =
  /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*/

export const regexIpAddressV6CIDR =
  /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/(12[0-8]|1[0-1][0-9]|[1-9][0-9]|[0-9]))$/

export const regexIPAllowlist = new RegExp(
  `(${regexIpAddressV4.source})|(${regexIpAddressV4CIDR.source})|(${regexIpAddressV6.source})|(${regexIpAddressV6CIDR.source})`
)

export const regexIpV4orV6 = new RegExp(`(${regexIpAddressV4.source})|(${regexIpAddressV6.source})`)

export const UNIQUE_ID_MAX_LENGTH = 64
export function toVariableStr(str: string): string {
  return `<+${str}>`
}

// adopted from https://github.com/sindresorhus/escape-string-regexp v5.0.0
export function escapeStringRegexp(str: string): string {
  // Escape characters with special meaning either inside or outside character sets.
  // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}

export function sanitizeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\u00a0/g, ' ')
}

export function getEntityNameFromType(entity: GitSyncEntityDTO['entityType']): string {
  return !isUndefined(entity)
    ? (entity.endsWith('s') ? entity.substring(0, entity.length - 1) : entity).toLowerCase()
    : ''
}

export const serviceDependencyIdRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/

export const portNumberRegex = /^[0-9]*$/

export const joinAsASentence = (items: string[], connectingPhrase: string): string => {
  if (!items.length) {
    return ''
  }
  const itemsClone = items.slice(0).filter((item: string) => !!item)
  const last = itemsClone.pop() || ''
  return itemsClone.length > 0 ? `${itemsClone.join(', ')} ${connectingPhrase} ${last}` : last
}

export const getScopeAppendedToIdentifier = (identifier: string, scope: string): string => {
  const scopedReference = scope !== Scope.PROJECT ? `${scope}.${identifier}` : identifier
  return scopedReference
}
