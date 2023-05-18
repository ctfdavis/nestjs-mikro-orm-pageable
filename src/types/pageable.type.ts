import { Sort } from './sort.type';

export type Pageable<T extends Record<string, unknown> = NonNullable<unknown>> = {
    page: number;
    size: number;
    offset: number;
    unpaged: boolean;
    totalPages: number;
    totalElements: number;
    sort: Sort[];
} & T;

export type ExtendedPageable = Pageable<{ limit?: number }>;
