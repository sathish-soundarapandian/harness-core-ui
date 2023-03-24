class UserActivityTrackerFactory {
  private lastActivity: number
  private checkAndRefreshToken: undefined | any
  constructor() {
    this.lastActivity = new Date().getTime()
    this.checkAndRefreshToken = {}
  }
  setCheckAndRefreshToken = (fn: any) => {
    console.log('seeting check and refersh token')
    this.checkAndRefreshToken.fn = fn
  }

  trackUserActivity = () => {
    if (document.getElementById('react-root')) {
      const ele = document
      ele?.addEventListener(
        'mousedown',
        () => {
          this.checkAndRefreshToken?.fn?.()
          console.log('mousedown document')
        },
        true
      )
      ele?.addEventListener('keypress', () => {
        this.checkAndRefreshToken?.fn?.()
        console.log('keypress document')
      })
    }
  }

  updateLastActivity() {
    this.lastActivity = new Date().getTime()
  }
  getLastAcitivity() {
    return this.lastActivity
  }
}

export default new UserActivityTrackerFactory()
