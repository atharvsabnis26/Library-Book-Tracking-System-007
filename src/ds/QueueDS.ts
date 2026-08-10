export class Queue<T> {
  private items: T[] = [];
  public maxCapacity: number = 20;

  constructor(initialItems: T[] = []) {
    this.items = [...initialItems];
  }

  public enqueue(item: T): boolean {
    if (this.items.length >= this.maxCapacity) {
      return false;
    }
    this.items.push(item);
    return true;
  }

  public dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items.shift();
  }

  public peek(): T | undefined {
    return this.items[0];
  }

  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  public size(): number {
    return this.items.length;
  }

  public clear(): void {
    this.items = [];
  }

  public toArray(): T[] {
    return [...this.items];
  }

  public removeById(fn: (item: T) => boolean): boolean {
    const idx = this.items.findIndex(fn);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      return true;
    }
    return false;
  }
}
