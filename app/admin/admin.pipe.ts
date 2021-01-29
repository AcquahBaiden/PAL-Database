import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'adminFilter' })
export class AdminFilterPipe implements PipeTransform {
  /**
   * Transform
   *
   * @param {any[]} items
   * @param {string} searchText
   * @returns {any[]}
   */
  transform(items: any[], searchText: string): any[] {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = searchText.toLocaleLowerCase();

    return items.filter(it => {
      return it.email.toLocaleLowerCase().includes(searchText);
    });
  }
}
