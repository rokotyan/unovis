export class CoreDataModel<T> {
  protected _data: T | undefined

  get data (): T | undefined {
    return this._data
  }

  set data (value: T | undefined) {
    this._data = value
  }

  constructor (data?: T) {
    this._data = data
  }
}
