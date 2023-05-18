import { QBFilterQuery } from '@mikro-orm/core';

export type Relation = {
    property: string;
    type?: 'leftJoin' | 'innerJoin' | 'pivotJoin';
    alias?: string;
    andSelect?: boolean;
    cond?: QBFilterQuery;
    path?: string;
};
