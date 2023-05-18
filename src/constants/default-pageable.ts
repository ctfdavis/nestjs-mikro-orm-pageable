import { Pageable } from '../types';

export const defaultPageable: Pageable = {
    page: 1,
    size: 10,
    offset: 0,
    totalPages: 0,
    totalElements: 0,
    unpaged: false,
    sort: []
};
