import { CustomParamFactory } from '@nestjs/common/interfaces';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { Pageable, PageableQuery } from '../types';
import { PageableDefault } from './pageable-default.decorator';
import { DEFAULT_MAX_SIZE } from '../constants';

function getParamDecoratorFactory<TData, TOutput>(decorator: Function): CustomParamFactory<TData, any, TOutput> {
    class Test {
        public test(@decorator() _value: TOutput): void {}
    }
    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
    return args[Object.keys(args)[0]].factory;
}

const decoratorFactory = getParamDecoratorFactory<Partial<PageableQuery>, Pageable>(PageableDefault);

function contextFactory(query: unknown) {
    return {
        switchToHttp: () => ({
            getRequest: () => ({
                query
            })
        })
    };
}

const defaultPageable: Pageable = {
    page: 1,
    size: 10,
    offset: 0,
    totalPages: 0,
    totalElements: 0,
    unpaged: false,
    sort: []
};

describe('PageableDefault', () => {
    it('should return default values when empty query is provided', () => {
        const context = contextFactory({});
        const pageable = decoratorFactory({}, context);
        expect(pageable).toEqual({
            page: 1,
            size: 10,
            offset: 0,
            totalPages: 0,
            totalElements: 0,
            unpaged: false,
            sort: []
        });
    });
    it('should return custom default values when empty query is provided', () => {
        const context = contextFactory({});
        const pageable = decoratorFactory(
            {
                page: 1,
                size: 20,
                unpaged: true,
                sort: [
                    {
                        property: 'test',
                        direction: 'asc',
                        nullsFirst: true
                    }
                ]
            },
            context
        );
        expect(pageable).toEqual({
            page: 1,
            size: 20,
            offset: 0,
            totalPages: 0,
            totalElements: 0,
            unpaged: true,
            sort: [
                {
                    property: 'test',
                    direction: 'asc',
                    nullsFirst: true
                }
            ]
        });
    });
    it.each([
        {
            query: {
                page: '1',
                size: '20',
                sort: 'property[test];direction[asc];nulls-first[true]'
            },
            expected: {
                page: 1,
                size: 20,
                offset: 0,
                totalPages: 0,
                totalElements: 0,
                unpaged: false,
                sort: [
                    {
                        property: 'test',
                        direction: 'asc',
                        nullsFirst: true
                    }
                ]
            }
        },
        {
            query: {
                page: '2',
                size: '4',
                sort: ['property[test];direction[asc];nulls-first[true]', 'property[@!*#-test2];direction[desc];nulls-first[false]', 'property[_test 3_];direction[asc]']
            },
            expected: {
                page: 2,
                size: 4,
                offset: 4,
                totalPages: 0,
                totalElements: 0,
                unpaged: false,
                sort: [
                    {
                        property: 'test',
                        direction: 'asc',
                        nullsFirst: true
                    },
                    {
                        property: '@!*#-test2',
                        direction: 'desc',
                        nullsFirst: false
                    },
                    {
                        property: '_test 3_',
                        direction: 'asc'
                    }
                ]
            }
        }
    ])('should return parsed values when query is provided', ({ query, expected }) => {
        const context = contextFactory(query);
        const pageable = decoratorFactory({}, context);
        expect(pageable).toEqual(expected);
    });
    describe('invalid input values', () => {
        it.each([
            {
                defaultValues: {
                    page: 1,
                    size: -20,
                    unpaged: true,
                    sort: []
                },
                expected: {
                    ...defaultPageable,
                    page: 1,
                    offset: 0,
                    unpaged: true
                }
            },
            {
                defaultValues: {
                    page: -1,
                    size: 20,
                    unpaged: false,
                    sort: []
                },
                expected: {
                    ...defaultPageable,
                    size: 20
                }
            },
            {
                defaultValues: {
                    page: Number.MAX_SAFE_INTEGER + 1
                },
                expected: {
                    ...defaultPageable
                }
            },
            {
                defaultValues: {
                    size: DEFAULT_MAX_SIZE + 1
                },
                expected: {
                    ...defaultPageable
                }
            },
            {
                defaultValues: {
                    page: Math.floor(Number.MAX_SAFE_INTEGER / 2),
                    size: 3
                },
                expected: {
                    ...defaultPageable
                }
            },
            {
                defaultValues: {
                    page: 0.1234567,
                    size: 9.87654321
                },
                expected: {
                    ...defaultPageable
                }
            }
        ])('should ignore invalid custom default values', ({ defaultValues, expected }) => {
            const context = contextFactory({});
            const pageable = decoratorFactory(defaultValues, context);
            expect(pageable).toEqual(expected);
        });
        it.each([
            {
                query: {
                    page: '1',
                    size: '-20',
                    unpaged: 'abc'
                },
                expected: {
                    ...defaultPageable
                }
            },
            {
                query: {
                    page: '-1',
                    size: '20',
                    sort: 'property[test];direction[xyz];nulls-first[true]'
                },
                expected: {
                    ...defaultPageable,
                    size: 20
                }
            },
            {
                query: {
                    page: 'abc',
                    size: 'xyz',
                    sort: 'property[a.b];direction[asc];nulls-first[true]'
                },
                expected: {
                    ...defaultPageable,
                    sort: [
                        {
                            property: 'a.b',
                            direction: 'asc',
                            nullsFirst: true
                        }
                    ]
                }
            },
            {
                query: {
                    page: `${Number.MAX_SAFE_INTEGER + 1}`
                },
                expected: {
                    ...defaultPageable
                }
            },
            {
                query: {
                    size: `${Number.MAX_SAFE_INTEGER + 1}`
                },
                expected: {
                    ...defaultPageable
                }
            },
            {
                query: {
                    page: `${Math.floor(Number.MAX_SAFE_INTEGER / 2)}`,
                    size: '3'
                },
                expected: {
                    ...defaultPageable
                }
            }
        ])('should ignore invalid query values', ({ query, expected }) => {
            const context = contextFactory(query);
            const pageable = decoratorFactory({}, context);
            expect(pageable).toEqual(expected);
        });
    });
});
