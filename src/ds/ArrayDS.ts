export interface ArrayElement<T> {
  index: number;
  value: T;
  address: string;
}

export class CustomArray<T extends { id: string }> {
  private memory: (T | null)[];
  public capacity: number;
  public length: number = 0;

  constructor(capacity: number = 8, initialItems: T[] = []) {
    this.capacity = capacity;
    this.memory = new Array(capacity).fill(null);
    initialItems.forEach((item, idx) => {
      if (idx < capacity) {
        this.memory[idx] = item;
        this.length++;
      }
    });
  }

  public get(index: number): T | null {
    if (index < 0 || index >= this.capacity) return null;
    return this.memory[index];
  }

  public insertAt(index: number, item: T): { success: boolean; steps: string[] } {
    const steps: string[] = [];
    if (index < 0 || index > this.length || this.length >= this.capacity) {
      steps.push(`Error: Out of bounds or array full (Capacity: ${this.capacity}).`);
      return { success: false, steps };
    }

    steps.push(`Shift elements from index ${this.length - 1} down to ${index} rightward by 1 position (O(N)).`);
    for (let i = this.length; i > index; i--) {
      this.memory[i] = this.memory[i - 1];
    }
    this.memory[index] = item;
    this.length++;
    steps.push(`Inserted "${item.id}" into slot [${index}] in O(1) time after shifting.`);
    return { success: true, steps };
  }

  public deleteAt(index: number): { success: boolean; removedItem: T | null; steps: string[] } {
    const steps: string[] = [];
    if (index < 0 || index >= this.length) {
      steps.push(`Error: Invalid index ${index} for deletion.`);
      return { success: false, removedItem: null, steps };
    }

    const removed = this.memory[index];
    steps.push(`Removed item at index [${index}].`);
    steps.push(`Shift remaining elements leftward from index ${index + 1} to ${this.length - 1}.`);

    for (let i = index; i < this.length - 1; i++) {
      this.memory[i] = this.memory[i + 1];
    }
    this.memory[this.length - 1] = null;
    this.length--;

    return { success: true, removedItem: removed, steps };
  }

  public linearSearch(predicate: (item: T) => boolean): { index: number; comparisons: number; visitedIndices: number[] } {
    const visitedIndices: number[] = [];
    let comparisons = 0;

    for (let i = 0; i < this.length; i++) {
      visitedIndices.push(i);
      comparisons++;
      const item = this.memory[i];
      if (item && predicate(item)) {
        return { index: i, comparisons, visitedIndices };
      }
    }
    return { index: -1, comparisons, visitedIndices };
  }

  public toSnapshot(): { index: number; value: T | null; address: string }[] {
    const baseAddr = 0x2000;
    return this.memory.map((val, idx) => ({
      index: idx,
      value: val,
      address: '0x' + (baseAddr + idx * 4).toString(16).toUpperCase()
    }));
  }
}
