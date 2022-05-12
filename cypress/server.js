/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const express = require('express')
const fs = require('fs')
const app = express()
const path = require('path')
const PORT = 8080

function checkFileExistsSync(filepath) {
  let flag = true
  try {
    fs.accessSync(filepath, fs.constants.F_OK)
  } catch (e) {
    flag = false
  }
  return flag
}

function getFile(req) {
  const url = req.url.split('?')[0].replace(/^\/gateway/, '')

  return path.resolve(__dirname, `fixtures${url}${req.method === 'POST' ? '.post' : ''}.json`)
}

app.all('*', (req, res) => {
  if (req.get('Content-Type') === 'text/plain') {
    res.setHeader('Content-Type', 'text/plain')
  } else {
    res.setHeader('Content-Type', 'application/json')
  }
  const file = getFile(req)
  if (['POST', 'GET', 'PUT'].indexOf(req.method) > -1 && checkFileExistsSync(file)) {
    res.end(fs.readFileSync(file))
  } else {
    res.end(
      JSON.stringify({
        correlationId: '',
        data: {},
        status: 'SUCCESS'
      })
    )
  }
})

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`)
})
