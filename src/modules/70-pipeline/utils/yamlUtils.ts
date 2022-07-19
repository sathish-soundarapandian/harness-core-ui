/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

interface GetYamlFileNameProps {
  isPipelineRemote?: boolean
  filePath?: string
  defaultName: string
}

export const getYamlFileName = ({ isPipelineRemote, filePath, defaultName }: GetYamlFileNameProps): string => {
  let fileName = defaultName

  if (isPipelineRemote && filePath) {
    // .harness/abc/xyz/name.yaml => name.yaml

    const parts = filePath.split('/')
    fileName = parts[parts.length - 1]
  }

  return fileName
}
