import { generateSchemaTypes, generateReactQueryComponents } from '@openapi-codegen/typescript'
import { defineConfig } from '@openapi-codegen/cli'
export default defineConfig({
  ng: {
    from: {
      relativePath: 'src/framework/react-query/swagger-full.json',
      source: 'file'
    },
    outputDir: 'generated1',
    to: async context => {
      const filenamePrefix = 'ng'
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix
      })
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles
      })
    }
  }
})
