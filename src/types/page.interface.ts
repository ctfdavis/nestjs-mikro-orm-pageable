import { Pageable } from './pageable.type';

export interface Page<T extends object> {
    content: T[];
    pageable: Pageable;
}
