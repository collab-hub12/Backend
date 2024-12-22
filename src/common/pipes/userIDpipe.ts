import {PipeTransform, Injectable, BadRequestException} from '@nestjs/common';

@Injectable()
export class ParseUserIdsPipe implements PipeTransform {
    transform(value: string): number[] {

        // Split the string by commas and map to numbers
        const userIds = value.split(',').map((id) => {
            const num = Number(id);
            if (isNaN(num)) {
                throw new BadRequestException(`Invalid userId: ${id}`);
            }
            return num;
        });

        return userIds;
    }
}
