import { noop } from 'lodash-es'
class WorkerMocked {
  url: string | URL
  onmessage: (msg: any) => void
  options: WorkerOptions | undefined
  constructor(scriptURL: string | URL, options?: WorkerOptions | undefined) {
    this.url = scriptURL
    this.options = options
    this.onmessage = (msg: any) => {
      noop(msg)
    }
  }

  postMessage(msg: any) {
    this.onmessage(msg)
  }
}

export default WorkerMocked
