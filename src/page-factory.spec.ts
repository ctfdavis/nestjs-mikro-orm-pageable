import { EntityRepository, SqlEntityRepository } from '@mikro-orm/knex';
import { QueryOrder } from '@mikro-orm/core';
import { PageFactory } from './page-factory';
import { DriverName, Pageable } from './types';

type QbTestMethodMap = {
    select: jest.Mock;
    join: jest.Mock;
    joinAndSelect: jest.Mock;
    from: jest.Mock;
    where: jest.Mock;
    orderBy: jest.Mock;
    limit: jest.Mock;
    offset: jest.Mock;
    getCount: jest.Mock;
    getResultList: jest.Mock;
};

const defaultPageable: Pageable = {
    page: 0,
    size: 10,
    offset: 0,
    totalPages: 0,
    totalElements: 0,
    unpaged: false,
    sort: []
};

const pageableFactory = (values?: Partial<Pageable>): Pageable => ({
    ...defaultPageable,
    ...values
});

const mockRepoFactory = <T extends object = any>(values?: { count?: number; resultList?: T[]; driverName?: DriverName | string }): [SqlEntityRepository<T>, QbTestMethodMap, jest.Mock] => {
    const { count = 0, resultList = [], driverName = '' } = values || {};
    const qbTestMethodMap: QbTestMethodMap = {
        select: jest.fn().mockReturnThis(),
        join: jest.fn().mockReturnThis(),
        joinAndSelect: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(count),
        getResultList: jest.fn().mockReturnValue(resultList)
    };
    const createQueryBuilder = jest.fn().mockReturnValue(qbTestMethodMap);
    return [
        {
            createQueryBuilder,
            getEntityManager: jest.fn().mockReturnValue({
                getDriver: jest.fn().mockReturnValue({
                    constructor: {
                        name: driverName
                    }
                })
            })
        } as unknown as EntityRepository<T>,
        qbTestMethodMap,
        createQueryBuilder
    ];
};

describe('PageFactory', () => {
    describe('the "create" method', () => {
        describe('with default pagination options', () => {
            it('should create a Page object given a repository', async () => {
                const [mockRepo] = mockRepoFactory();
                const pageable = pageableFactory();
                const page = await new PageFactory(pageable, mockRepo).create();
                expect(page).toEqual({
                    content: [],
                    pageable
                });
            });
        });
        describe('with custom pagination options', () => {
            it('should create a Page object given a repository', async () => {
                const count = 20;
                const resultList = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
                const [mockRepo] = mockRepoFactory({
                    count,
                    resultList
                });
                const pageable = pageableFactory({
                    page: 1,
                    size: 5,
                    offset: 5
                });
                const page = await new PageFactory(pageable, mockRepo).create();
                expect(page).toEqual({
                    content: resultList,
                    pageable: {
                        ...pageable,
                        totalPages: 4,
                        totalElements: count
                    }
                });
            });
        });
    });
    describe('the "config" method', () => {
        describe('select', () => {
            it('should pass the right values to the select method on the query builder', async () => {
                const [mockRepo, qbTestMethodMap] = mockRepoFactory();
                const pageable = pageableFactory();
                await new PageFactory(pageable, mockRepo)
                    .config({
                        select: ['id', 'name']
                    })
                    .create();
                expect(qbTestMethodMap.select).toHaveBeenCalledWith(['id', 'name']);
            });
        });
        describe('sortable', () => {
            it('should filter the sort array to only include the sortable fields', async () => {
                const [mockRepo, qbTestMethodMap] = mockRepoFactory();
                const pageable = pageableFactory({
                    sort: [
                        {
                            property: 'id',
                            direction: 'asc',
                            nullsFirst: true
                        },
                        {
                            property: 'name',
                            direction: 'desc',
                            nullsFirst: false
                        },
                        {
                            property: 'age',
                            direction: 'asc'
                        },
                        {
                            property: 'gender',
                            direction: 'desc'
                        },
                        {
                            property: 'notSortable',
                            direction: 'asc',
                            nullsFirst: false
                        }
                    ]
                });
                await new PageFactory(pageable, mockRepo)
                    .config({
                        sortable: ['id', 'name', 'age', 'gender']
                    })
                    .create();
                expect(qbTestMethodMap.orderBy).toHaveBeenCalledWith({
                    id: QueryOrder.ASC_NULLS_FIRST,
                    name: QueryOrder.DESC_NULLS_LAST,
                    age: QueryOrder.ASC,
                    gender: QueryOrder.DESC
                });
            });
        });
        describe('relations', () => {
            it('should call the join method on the query builder for each relation', async () => {
                const [mockRepo, qbTestMethodMap] = mockRepoFactory();
                const pageable = pageableFactory();
                await new PageFactory(pageable, mockRepo)
                    .config({
                        relations: [
                            {
                                property: 'a'
                            },
                            {
                                property: 'b',
                                type: 'innerJoin'
                            },
                            {
                                property: 'b.c',
                                alias: 'cAlias',
                                cond: 'b.id = c.id',
                                path: 'b.c'
                            }
                        ]
                    })
                    .create();
                expect(qbTestMethodMap.join).toHaveBeenCalledWith('a', 'a', undefined, undefined, undefined);
                expect(qbTestMethodMap.join).toHaveBeenCalledWith('b', 'b', undefined, 'innerJoin', undefined);
                expect(qbTestMethodMap.join).toHaveBeenCalledWith('b.c', 'cAlias', 'b.id = c.id', undefined, 'b.c');
            });
        });
        describe('where', () => {
            it('should call the where method on the query builder given where', async () => {
                const [mockRepo, qbTestMethodMap] = mockRepoFactory();
                const pageable = pageableFactory();
                const where = {
                    $and: [{ id: { $gt: 1 }, 'length(title)': { $gt: 1 } }]
                };
                await new PageFactory(pageable, mockRepo)
                    .config({
                        where
                    })
                    .create();
                expect(qbTestMethodMap.where).toHaveBeenCalledWith(where);
            });
        });
        describe('alias', () => {
            it('should pass the alias to createQueryBuilder given alias', async () => {
                const [mockRepo, _qbTestMethodMap, createQueryBuilder] = mockRepoFactory();
                const pageable = pageableFactory();
                const alias = 'testAlias';
                await new PageFactory(pageable, mockRepo)
                    .config({
                        alias
                    })
                    .create();
                expect(createQueryBuilder).toHaveBeenCalledWith(alias);
            });
        });
    });
    describe('the "map" method', () => {
        it('should return the original result if no mapper is provided', async () => {
            const resultList = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
            const [mockRepo] = mockRepoFactory({
                count: 5,
                resultList
            });
            const pageable = pageableFactory();
            const page = await new PageFactory(pageable, mockRepo).create();
            expect(page.content).toEqual(resultList);
        });

        it('should return the mapped result if a mapper is provided', async () => {
            const resultList = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
            const [mockRepo] = mockRepoFactory<{ id: number }>({
                count: 5,
                resultList
            });
            const pageable = pageableFactory();
            const page = await new PageFactory(pageable, mockRepo).map((result) => ({ ...result, idPlus1: result.id + 1 })).create();
            expect(page.content).toEqual(resultList.map((item) => ({ ...item, idPlus1: item.id + 1 })));
        });
    });
});
