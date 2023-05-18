import { Controller, Get } from '@nestjs/common';
import { Pageable, PageableDefault, PageableResponse } from '../../src';
import { TestDto } from './test.dto';
import { AppService } from './app.service';

@Controller('/test')
export class AppController {
    constructor(private appService: AppService) {}
    @Get('/')
    getTests(@PageableDefault() pageable: Pageable): Promise<PageableResponse<TestDto>> {
        return this.appService.listTests(pageable);
    }

    @Get('/enable-unpaged-true')
    getTestsEnableUnpagedTrue(@PageableDefault({ enableUnpaged: true }) pageable: Pageable): Promise<PageableResponse<TestDto>> {
        return this.appService.listTests(pageable);
    }

    @Get('/enable-size-false')
    getTestsEnableSizeFalse(@PageableDefault({ enableSize: false }) pageable: Pageable): Promise<PageableResponse<TestDto>> {
        return this.appService.listTests(pageable);
    }

    @Get('/enable-sort-false')
    getTestsEnableSortFalse(@PageableDefault({ enableSort: false }) pageable: Pageable): Promise<PageableResponse<TestDto>> {
        return this.appService.listTests(pageable);
    }

    @Get('/limit-15')
    getTestsLimit15(@PageableDefault({ limit: 15 }) pageable: Pageable): Promise<PageableResponse<TestDto>> {
        return this.appService.listTests(pageable);
    }

    @Get('/max-size-5')
    getTestsMaxSize5(@PageableDefault({ maxSize: 5 }) pageable: Pageable): Promise<PageableResponse<TestDto>> {
        return this.appService.listTests(pageable);
    }
}
