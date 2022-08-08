const staleTime = 60 * 1000

const app = { queries: { staleTime, retry: false } }

const _jest = { queries: { staleTime, retry: false } }

export default {
  app,
  jest: _jest
}
