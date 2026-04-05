import { Child } from './child.interface';
import { Volunteer } from './volunteer.interface';

export interface ProfileVersion<T> {
  id?: string;
  timestamp: number;
  profile: T;
}

export type ArchivedRecordType = 'child' | 'volunteer';

export interface ArchivedRecord<T = Child | Volunteer> {
  id: string;
  type: ArchivedRecordType;
  archivedAt: number;
  archivedReason: string;
  archivedReasonDetail?: string;
  profile: T;
}
