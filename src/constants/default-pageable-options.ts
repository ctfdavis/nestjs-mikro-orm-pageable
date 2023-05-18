import { PageableOptions } from '../types';

export const DEFAULT_MAX_SIZE = 100;

export const defaultPageableOptions: Required<PageableOptions> = {
    enableUnpaged: false,
    enableSize: true,
    enableSort: true,
    limit: null,
    maxSize: DEFAULT_MAX_SIZE
};
