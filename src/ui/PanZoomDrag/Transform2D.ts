import { Point2D } from './Point2D'

/** Transform of coordinate system (translate / scale) */
export class Transform2D {
  public readonly x: number
  public readonly y: number
  public readonly k: number // scale factor

  constructor (x: number, y: number, k: number) {
    if (k === 0) throw new Error('k can not be set to 0')
    this.x = x
    this.y = y
    this.k = k
  }

  public setPosition (x: number, y: number) {
    return new Transform2D(x, y, this.k)
  }

  public translate (x: number, y: number) {
    return new Transform2D(this.x + x, this.y + y, this.k)
  }

  public withScale (k: number): Transform2D {
    return new Transform2D(this.x / this.k * k, this.y / this.k * k, k)
  }

  public scale (k: number): Transform2D {
    return new Transform2D(this.x * k, this.y * k, this.k * k)
  }

  public apply (point: Point2D): Point2D {
    return new Point2D(point.x * this.k + this.x, point.y * this.k + this.y)
  }

  public revert (point: Point2D): Point2D {
    return new Point2D((point.x - this.x) / this.k, (point.y - this.y) / this.k)
  }

  public toString () {
    return `{x: ${this.x}, y: ${this.y}, k: ${this.k}}`
  }

  public isEqual (t2: Transform2D): boolean {
    return this.x === t2.x && this.y === t2.y && this.k === t2.k
  }
}
