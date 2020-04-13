import { TypedJSON } from 'typedjson';
export class Mapper {
    static async map(json, clazz) {
        const serializer = new TypedJSON(clazz, {
            errorHandler: (err) => {
                throw err;
            }
        });
        try {
            return serializer.parse(json);
        }
        catch (err) {
            throw { code: 422, error: 'Failed to parse parameters: ' + err.toLocaleString() };
        }
    }
}
//# sourceMappingURL=mapper.js.map