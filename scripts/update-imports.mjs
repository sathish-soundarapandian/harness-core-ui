/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import fs from 'fs'

function convertTypeOnlyImports(file) {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err}`)
      return
    }

    const convertedContent = data.replace(
      /^(import\s+{.*?})\s+from\s+'(restful-react)'/gm,
      "//@ts-ignore\n$1 from '$2';"
    )

    fs.writeFile(file, convertedContent, 'utf8', err => {
      if (err) {
        console.error(`Error writing file: ${err}`)
      } else {
        console.log(`Successfully converted type-only imports in ${file}`)
      }
    })
  })
}

const file = process.argv[2]
if (!file) {
  process.exit(1)
}

convertTypeOnlyImports(file)
