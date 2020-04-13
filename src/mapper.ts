import { TypedJSON } from 'typedjson';

type IMappedClass<T> = new (...args: Array<any>) => T;

export class Mapper {
  public static async map<T>(json: any, clazz: IMappedClass<T>): Promise<T> {
    const serializer = new TypedJSON(clazz as any, {
      errorHandler: (err: Error) => {
        throw err;
      },
    });

    try {
      return serializer.parse(json) as T;
    } catch (err) {
      throw { code: 422, error: 'Failed to parse parameters: ' + err.toLocaleString() };
    }
  }

  // public static async mapList<T>(list: any, clazz: IMappedClass<T>): Promise<Array<T>> {
  //   const response = new Array<T>();
  //   for (const it of list) {
  //     const serializer = new TypedJSON(clazz as any, {
  //       errorHandler: (err: Error) => {
  //         throw err;
  //       }
  //     });
  //     try {
  //       response.push(await serializer.parse(it) as T);
  //     } catch (err) {
  //       Logger.error('Mapper', 'caught ' + err.toLocaleString());
  //       throw {code: 422, error: 'Failed to parse task parameter: ' + err.toLocaleString()};
  //     }
  //   }
  //
  //   return response;
  // }
}
