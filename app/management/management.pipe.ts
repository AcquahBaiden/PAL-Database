import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'managersFilter' })
export class ManagersFilterPipe implements PipeTransform {
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
      return it.firstName.toLocaleLowerCase().includes(searchText);
    });
  }
}
