import { Page, Pageable } from '../types';
import { ApiProperty } from '@nestjs/swagger';
import { defaultPageable } from '../constants';

export class PageableResponse<T extends object> implements Page<T> {
    @ApiProperty()
    readonly content!: T[];

    @ApiProperty({
        type: 'object',
        properties: {
            page: { type: 'integer', minimum: 0 },
            size: { type: 'integer', minimum: 0 },
            offset: { type: 'integer', minimum: 0 },
            unpaged: { type: 'boolean' },
            totalPages: { type: 'integer', minimum: 0 },
            totalElements: { type: 'integer', minimum: 0 },
            sort: { type: 'array', items: { type: 'object' } }
        },
        example: defaultPageable
    })
    readonly pageable!: Pageable;
}
