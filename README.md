<div align="center">
  <h1> NestJS Mikro-ORM Pageable </h1>
</div>

A pageable package for convenient pagination and sorting implementation with MikroORM repositories in Nest.js.

## Features

- sort by multiple fields
- sort by nulls first or last
- unpaged response (i.e., disabling pagination)
- various pagination behavior and constraints configuration

## Limitations

- only work with Rest API
- only support MySQL, MariaDB, PostgreSQL and SQLite
- only support offset pagination

## Guide

### Prerequisites

- \>= Nest.js 8.0.0
- \>= MikroORM 5.0.0

### Installation

```bash
npm install nestjs-mikro-orm-pageable
```

### Basic Usage

```typescript
// articles.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PageableDefault } from 'nestjs-mikro-orm-pageable';
import { ArticlesService } from './articles.service.ts';
import { ArticleDto } from './dtos/article.dto.ts';

@Controller('/articles')
export class ArticlesController {
    constructor(private articlesService: ArticlesService) {}

    @Get('/')
    getArticles(@PageableDefault() pageable: Pageable): Promise<PageableResponse<ArticlesDto>> {
        return this.articlesService.listArticles(pageable);
    }
}
```

```typescript
// articles.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/sqlite';
import { Pageable, PageableResponse, PageFactory } from 'nestjs-mikro-orm-pageable';
import { ArticleEntity } from './article.entity';
import { ArticleDto } from './dtos/article.dto.ts';

@Injectable()
export class ArticlesService {
    constructor(@InjectRepository(ArticleEntity) private articleRepository: EntityRepository<ArticleEntity>) {}
    
    async listArticles(pageable: Pageable): Promise<PageableResponse<ArticleDto>> {
        return await new PageFactory(pageable, this.articleRepository).create();
    }
}
```

With `@PageableDefault`, you can now provide the below query parameters to `/articles`:

- page: the page number, starting from 1, e.g., `?page=1`
- size: the page size, default to 10, e.g., `?size=20`
- sort: the sort expression, e.g., `?sort=property[field1];direction[asc];nulls-first[true]`
- unpaged: whether to disable pagination, default to false, e.g., `?unpaged=true`

### Response Shape

An example of the response shape is shown as below:

```json
{
  "content": [
    {
      "id": 1,
      "title": "Article 1",
      "content": "Content 1",
      "createdAt": "2021-08-01T00:00:00.000Z",
      "updatedAt": "2021-08-01T00:00:00.000Z"
    }
  ],
  "pageable": {
    "page": 1,
    "size": 10,
    "offset": 0,
    "sort": [
      {
        "property": "id",
        "direction": "ASC",
        "nullsFirst": false
      }
    ],
    "unpaged": false,
    "totalPage": 1,
    "totalElement": 1
  }
}
```

### Swagger support

Use the `@ApiPageable` decorator for swagger integration:

```typescript
// articles.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PageableDefault } from 'nestjs-mikro-orm-pageable';
import { ArticlesService } from './articles.service.ts';
import { ArticleDto } from './dtos/article.dto.ts';

@Controller('/articles')
export class ArticlesController {
    constructor(private articlesService: ArticlesService) {}
    
    @Get('/') 
    @ApiPageable({
        dto: ArticleDto,
    }) 
    getArticles(@PageableDefault() pageable: Pageable): Promise<PageableResponse<ArticlesDto>> {
        return this.articlesService.listArticles(pageable);
    }
}
```
