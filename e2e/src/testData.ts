import { TestDto } from './test.dto';

export const makeTestData = (length = 1000) =>
    Array.from({ length }, (_, i) => {
        const id = i + 1;
        return new TestDto(id, `Test ${id}`, isPrimeNumber(id) ? null : `Test ${Math.floor(id / 10)} description`, new Date(10000000000), new Date(10000000000));
    });

function isPrimeNumber(num: number): boolean {
    if (num <= 1) {
        return false;
    }
    if (num <= 3) {
        return true;
    }

    if (num % 2 === 0 || num % 3 === 0) {
        return false;
    }

    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) {
            return false;
        }
    }

    return true;
}
