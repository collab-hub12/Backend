import {PipeTransform, Injectable} from '@nestjs/common';

@Injectable()
export class ParseUserIdsPipe implements PipeTransform {
    transform(value: string): string[] {
        if (!value) return []
        // Split the string by commas and map to numbers
        const userIds = value.split(',')

        return userIds;
    }
}
