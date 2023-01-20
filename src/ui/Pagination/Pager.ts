export interface PagerConf {
  readonly page?: number
  readonly limit?: number
  readonly total?: number
  readonly lastPage?: number
}

/**
 * Class for paging manupulation
 */
export class Pager {
  private _page: number
  private _limit: number
  private _offset: number
  private _total: number | undefined
  private _lastPage: number

  constructor (conf: PagerConf = {}) {
    this._page = conf.page != null && conf.page >= 1 ? conf.page : 1
    this._limit = conf.limit != null && conf.limit >= 1 ? conf.limit : 20
    this._total = conf.total != null && conf.total >= 0 ? conf.total : undefined
    this._lastPage = this._total && this._limit !== 0 ? Math.ceil(this._total / this._limit) : 1
    if (this._total != null && this._total < this._limit * (this._page - 1)) {
      this._page = this._lastPage
    }
    this._offset = this._limit === 0 ? 0 : this._limit * (this._page - 1)
  }

  public get page () { return this._page }
  public get limit () { return this._limit }
  public get offset () { return this._offset }
  public get total () { return this._total }
  public get lastPage () { return this._lastPage }

  update (conf: PagerConf) {
    this._page = conf.page != null ? conf.page : this._page
    this._limit = conf.limit != null ? conf.limit : this._limit
    this._total = conf.total != null ? conf.total : this._total
    this._lastPage = this._total && this._limit != null && this._limit !== 0 ? Math.ceil(this._total / this._limit) : 1
    if (this._total != null && this._total <= this._limit * (this._page - 1)) {
      this._page = this._lastPage
    }
    this._offset = this._limit * (this._page - 1)
  }

  resetCount () {
    this._total = undefined
  }

  reset () {
    this._total = undefined
    this._lastPage = 1
    this._page = 1
    this._offset = 0
  }

  getPageOfNthItem (itemIndex: number) {
    return ~~(itemIndex / this._limit) + 1
  }
}
