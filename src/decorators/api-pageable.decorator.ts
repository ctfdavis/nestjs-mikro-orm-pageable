import { ApiExtraModels, ApiOkResponse, ApiQuery, getSchemaPath } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { sortRegex, defaultPageableOptions } from '../constants';
import { PageableOptions } from '../types';
import { PageableResponse } from '../dtos';

export function ApiPageable(pageableOptions: PageableOptions & { dto?: Function } = {}) {
    const { enableUnpaged, enableSize, enableSort, maxSize, dto } = { ...defaultPageableOptions, ...pageableOptions };
    const pattern = getPattern();
    return applyDecorators(
        ApiQuery({ name: 'page', required: false, description: 'Page number (starting from 1)', schema: { type: 'integer', minimum: 0 } }),
        enableSize ? ApiQuery({ name: 'size', required: false, description: 'Number of items on each page', schema: { type: 'integer', minimum: 0, maximum: maxSize } }) : () => {},
        enableSort
            ? ApiQuery({
                  name: 'sort',
                  required: false,
                  description: `Sorting of items via pattern: ${pattern}`,
                  example: 'property[id];direction[asc];nulls-first[true]',
                  schema: { type: 'array', items: { type: 'string', pattern } }
              })
            : () => {},
        enableUnpaged ? ApiQuery({ name: 'unpaged', required: false, type: 'boolean', description: 'Set to true to retrieve all items without pagination' }) : () => {},
        ApiExtraModels(PageableResponse, dto ?? (() => {})),
        ApiOkResponse({
            description: 'Page of items',
            schema: {
                allOf: [{ $ref: getSchemaPath(PageableResponse) }, { properties: { content: { type: 'array', items: dto ? { $ref: getSchemaPath(dto) } : undefined } } }]
            }
        })
    );
}

function getPattern() {
    const { property, direction, nullsFirst } = sortRegex;
    const propertyString = property.toString();
    const directionString = direction.toString();
    const nullsFirstString = nullsFirst.toString();
    const propertyPart = propertyString.substring(2, propertyString.length - 2);
    const directionPart = directionString.substring(2, directionString.length - 2);
    const nullsFirstPart = nullsFirstString.substring(2, nullsFirstString.length - 2);
    return `/^${propertyPart};${directionPart};(${nullsFirstPart};)?$/`;
}
