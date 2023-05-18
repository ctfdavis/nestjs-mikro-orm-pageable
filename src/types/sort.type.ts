export type SortDirection = 'asc' | 'desc';

export type Sort = {
    property: string;
    direction: SortDirection;
    nullsFirst?: boolean;
};
