export class ListNode<T> {
  public id: string;
  public data: T;
  public next: ListNode<T> | null = null;
  public prev: ListNode<T> | null = null; // Doubly linked list capable
  public address: string;

  constructor(data: T, id?: string) {
    this.data = data;
    this.id = id || Math.random().toString(36).substring(2, 9);
    this.address = '0x' + Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0').toUpperCase();
  }
}

export class LinkedList<T extends { id: string; title?: string }> {
  public head: ListNode<T> | null = null;
  public tail: ListNode<T> | null = null;
  public size: number = 0;

  constructor(initialItems: T[] = []) {
    initialItems.forEach(item => this.insertTail(item));
  }

  public insertHead(data: T): ListNode<T> {
    const newNode = new ListNode(data, data.id);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.size++;
    return newNode;
  }

  public insertTail(data: T): ListNode<T> {
    const newNode = new ListNode(data, data.id);
    if (!this.tail) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }
    this.size++;
    return newNode;
  }

  public deleteById(id: string): boolean {
    let current = this.head;
    while (current) {
      if (current.data.id === id) {
        if (current.prev) {
          current.prev.next = current.next;
        } else {
          this.head = current.next; // deleting head
        }

        if (current.next) {
          current.next.prev = current.prev;
        } else {
          this.tail = current.prev; // deleting tail
        }

        this.size--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  public findById(id: string): { node: ListNode<T> | null; index: number; steps: number } {
    let current = this.head;
    let index = 0;
    let steps = 0;
    while (current) {
      steps++;
      if (current.data.id === id) {
        return { node: current, index, steps };
      }
      current = current.next;
      index++;
    }
    return { node: null, index: -1, steps };
  }

  public toArray(): { node: ListNode<T>; data: T; address: string; nextAddress: string | null }[] {
    const result = [];
    let current = this.head;
    while (current) {
      result.push({
        node: current,
        data: current.data,
        address: current.address,
        nextAddress: current.next ? current.next.address : 'NULL'
      });
      current = current.next;
    }
    return result;
  }
}
