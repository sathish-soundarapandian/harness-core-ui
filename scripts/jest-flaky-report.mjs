/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import dotenv from 'dotenv'
import pkg from 'lodash'

const { countBy } = pkg

dotenv.config()

const createAuthToken = ({ username, password }) => {
  const encodedToken = btoa(username + ':' + password)
  return `Basic ${encodedToken}`
}

const loginAndGrabToken = async (headers, domain, authorization) => {
  const response = await fetch(`${domain}/gateway/api/users/login?`, {
    headers: headers,
    body: JSON.stringify({ authorization }),
    method: 'POST'
  })
  const cookieHeader = response.headers.get('set-cookie')

  const cookies = {}
  cookieHeader.split(`;`).forEach(cookie => {
    let [name, ...rest] = cookie.split(`=`)
    name = name?.trim()
    if (!name) return
    const value = rest.join(`=`).trim()
    if (!value) return
    cookies[name] = decodeURIComponent(value)
  })

  return cookies['Secure, token']
}

const jestReportGenerator = async (accountId, headers, domain) => {
  const buildNumberStart = process.env.buildNumber
  let flakyJests = []
  for (let i = 0; i < process.env.loopLength; i++) {
    const currentBuild = buildNumberStart - i
    const flakyJestForCurrentBuild = await (
      await fetch(
        `${domain}/gateway/ti-service/reports/test_cases?routingId=${accountId}&accountId=${accountId}&orgId=default&projectId=NextGenUI&buildId=${currentBuild}&pipelineId=Jest&report=junit&status=failed&testCaseSearchTerm=&sort=status&order=ASC&pageIndex=0&pageSize=100&stageId=Jest&stepId=Jest`,
        {
          headers,
          method: 'GET'
        }
      )
    ).json()
    flakyJests.push(flakyJestForCurrentBuild)
  }

  const jestFailedArray = []
  flakyJests.forEach(arr => {
    arr.content.forEach(data => {
      jestFailedArray.push(data.class_name + 'belongs to ' + data.suite_name)
    })
  })
  const report = []
  const temp = countBy(jestFailedArray)
  for (let key in temp) {
    report.push({ key: key, value: temp[key] })
  }
  report.sort((a, b) => (a.value < b.value ? 1 : -1))

  let result = ''
  for (let jestTest of report) {
    if (jestTest.value >= 20) {
      result += jestTest.key + ': ' + jestTest.value + ', '
    }
  }

  console.log(result)
  return report
}

const getServiceToken = async (headers, domain, accountId) => {
  const serviceToken = await (
    await fetch(`${domain}/gateway/ti-service/token?routingId=${accountId}&accountId=${accountId}`, {
      headers,
      method: 'GET'
    })
  ).text()
  return serviceToken
}

const main = async () => {
  const username = process.env.username
  const password = process.env.password
  const accountId = process.env.accountId
  const domain = 'https://app.harness.io'
  const headers = {
    accept: '*/*',
    'content-type': 'application/json',
    Referer: `${domain}/ng/`
  }

  const token = await loginAndGrabToken(headers, domain, createAuthToken({ username, password }))
  headers.authorization = `Bearer ${token}`

  const serviceToken = await getServiceToken(headers, domain, accountId)

  headers['x-harness-token'] = serviceToken

  jestReportGenerator(accountId, headers, domain)
}

main()
