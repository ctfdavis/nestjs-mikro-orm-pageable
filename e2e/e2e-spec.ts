import * as request from 'supertest';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { ApplicationModule } from './src/app.module';
import { Pageable, Sort } from '../src';
import { makeTestData } from './src/testData';
import { TestDto } from './src/test.dto';

const defaultPageable: Pageable = {
    page: 1,
    offset: 0,
    size: 10,
    unpaged: false,
    totalPages: 100,
    totalElements: 1000,
    sort: []
};

describe('pageable', () => {
    let app: NestExpressApplication;
    let testData: TestDto[];

    beforeEach(async () => {
        testData = makeTestData();
        const express = require('express');
        const server = express();
        const adapter = new ExpressAdapter(server);
        app = await NestFactory.create<NestExpressApplication>(ApplicationModule, adapter, { logger: false });
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('should return the first page (size of 10) by default', () => {
        return request(app.getHttpServer())
            .get('/test')
            .expect(200)
            .expect({
                content: testData.slice(0, 10).map((t) => serialize(t)),
                pageable: defaultPageable
            });
    });

    it('should return the second page (size of 10)', () => {
        return request(app.getHttpServer())
            .get('/test?page=2')
            .expect(200)
            .expect({
                content: testData.slice(10, 20).map((t) => serialize(t)),
                pageable: {
                    ...defaultPageable,
                    page: 2,
                    offset: 10
                }
            });
    });

    it('should return a non-existing page (page of MAX_SAFE_INTEGER / 10, size of 10) with an empty content array', () => {
        return request(app.getHttpServer())
            .get(`/test?page=${Math.floor(Number.MAX_SAFE_INTEGER / 10)}`)
            .expect(200)
            .expect({
                content: [],
                pageable: {
                    ...defaultPageable,
                    page: Math.floor(Number.MAX_SAFE_INTEGER / 10),
                    offset: (Math.floor(Number.MAX_SAFE_INTEGER / 10) - 1) * 10
                }
            });
    });

    it('should return the first page (size of 1)', () => {
        return request(app.getHttpServer())
            .get('/test?size=1')
            .expect(200)
            .expect({
                content: testData.slice(0, 1).map((t) => serialize(t)),
                pageable: {
                    ...defaultPageable,
                    size: 1,
                    totalPages: 1000
                }
            });
    });

    describe('sorting', () => {
        it('should return the first page with sorting by id (DESC)', () => {
            return request(app.getHttpServer())
                .get('/test?sort=property[id];direction[desc];')
                .expect(200)
                .expect({
                    content: sort(testData, [{ property: 'id', direction: 'desc' }])
                        .slice(0, 10)
                        .map((t) => serialize(t)),
                    pageable: {
                        ...defaultPageable,
                        sort: [
                            {
                                property: 'id',
                                direction: 'desc'
                            }
                        ]
                    }
                });
        });

        it('should return the first page with sorting by description (DESC, nulls first)', () => {
            return request(app.getHttpServer())
                .get('/test?sort=property[description];direction[desc];nulls-first[true];')
                .expect(200)
                .expect({
                    content: sort(testData, [{ property: 'description', direction: 'desc', nullsFirst: true }])
                        .slice(0, 10)
                        .map((t) => serialize(t)),
                    pageable: {
                        ...defaultPageable,
                        sort: [
                            {
                                property: 'description',
                                direction: 'desc',
                                nullsFirst: true
                            }
                        ]
                    }
                });
        });

        it('should return the first page with sorting by description (DESC, nulls last) and by id (ASC)', () => {
            return request(app.getHttpServer())
                .get('/test?sort=property[description];direction[desc];nulls-first[false];&sort=property[id];direction[asc];')
                .expect(200)
                .expect({
                    content: sort(testData, [
                        { property: 'description', direction: 'desc', nullsFirst: false },
                        { property: 'id', direction: 'asc' }
                    ])
                        .slice(0, 10)
                        .map((t) => serialize(t)),
                    pageable: {
                        ...defaultPageable,
                        sort: [
                            {
                                property: 'description',
                                direction: 'desc',
                                nullsFirst: false
                            },
                            {
                                property: 'id',
                                direction: 'asc'
                            }
                        ]
                    }
                });
        });

        describe('enableSort', () => {
            it('should not return sorted results when querying with sort but enableSort is false', () => {
                return request(app.getHttpServer())
                    .get('/test/enable-sort-false?sort=property[id];direction[desc];')
                    .expect(200)
                    .expect({
                        content: testData.slice(0, 10).map((t) => serialize(t)),
                        pageable: defaultPageable
                    });
            });
        });
    });

    describe('enableUnpaged', () => {
        it('should not return unpaged results when querying with unpaged by default', () => {
            return request(app.getHttpServer())
                .get('/test?unpaged=true')
                .expect(200)
                .expect({
                    content: testData.slice(0, 10).map((t) => serialize(t)),
                    pageable: defaultPageable
                });
        });
        it('should return unpaged results when querying with unpaged and enableUnpaged is true', () => {
            return request(app.getHttpServer())
                .get('/test/enable-unpaged-true?unpaged=true')
                .expect(200)
                .expect({
                    content: testData.map((t) => serialize(t)),
                    pageable: {
                        ...defaultPageable,
                        page: 0,
                        size: 0,
                        totalPages: null,
                        unpaged: true
                    }
                });
        });
    });

    describe('enableSize', () => {
        it('should return the first page (size of 10) when querying size of 5 but enableSize is false', () => {
            return request(app.getHttpServer())
                .get('/test/enable-size-false?size=5')
                .expect(200)
                .expect({
                    content: testData.slice(0, 10).map((t) => serialize(t)),
                    pageable: defaultPageable
                });
        });
    });

    describe('limit', () => {
        it('should return five items on the second page (size of 10) when limit is set to 15', () => {
            return request(app.getHttpServer())
                .get('/test/limit-15?page=2')
                .expect(200)
                .expect({
                    content: testData.slice(10, 15).map((t) => serialize(t)),
                    pageable: {
                        ...defaultPageable,
                        page: 2,
                        offset: 10,
                        totalPages: 2,
                        totalElements: 15
                    }
                });
        });
    });

    describe('maxSize', () => {
        it('should return the first page (size of 5) when querying size of 10 but maxSize is 5', () => {
            return request(app.getHttpServer())
                .get('/test/max-size-5?size=10')
                .expect(200)
                .expect({
                    content: testData.slice(0, 5).map((t) => serialize(t)),
                    pageable: {
                        ...defaultPageable,
                        size: 5,
                        totalPages: 200
                    }
                });
        });
    });

    describe('limit & unpaged', () => {});
});

function serialize({ id, title, description, createdAt, updatedAt }: TestDto) {
    return {
        id,
        title,
        description,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString()
    };
}

function sort(testDtos: TestDto[], sorts: Sort[]) {
    for (let i = 0; i < sorts.length; i++) {
        testDtos.sort((a, b) => {
            const propsToCheck = sorts.slice(0, i).map((sort) => sort.property) as (keyof TestDto)[];
            if (propsToCheck.every((prop) => a[prop] === b[prop])) {
                const aProp = a[sorts[i].property as keyof TestDto];
                const bProp = b[sorts[i].property as keyof TestDto];
                if (aProp === null && bProp === null) {
                    return 1;
                }
                if (aProp === null) {
                    return sorts[i].nullsFirst ? -1 : 1;
                }
                if (bProp === null) {
                    return sorts[i].nullsFirst ? 1 : -1;
                }
                if (sorts[i].direction === 'asc') {
                    return aProp < bProp ? -1 : 1;
                }
                return aProp > bProp ? -1 : 1;
            }
            return 1;
        });
    }
    return testDtos;
}
