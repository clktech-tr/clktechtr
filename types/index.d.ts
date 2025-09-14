import { IncomingMessage, ServerResponse } from 'http';

declare global {
  namespace Express {
    interface Request extends IncomingMessage {
      body: any;
      params: any;
      query: any;
      files: Express.Multer.File[];
      file?: Express.Multer.File;
      user?: {
        id: number;
        username: string;
        role: string;
      };
    }

    interface Response extends ServerResponse {
      json(body: any): this;
      send(body: any): this;
      status(code: number): this;
      sendFile(path: string): void;
    }

    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}

declare module 'express-serve-static-core' {
  import { IncomingMessage, ServerResponse } from 'http';

  interface ParamsDictionary {
    [key: string]: string;
  }

  interface Request extends IncomingMessage {
    body: any;
    params: ParamsDictionary;
    query: any;
    file?: Express.Multer.File;
    files?: Express.Multer.File[];
  }

  interface Response extends ServerResponse {
    json(body: any): this;
    send(body: any): this;
    status(code: number): this;
    sendFile(path: string): void;
  }

  type NextFunction = (err?: any) => void;
  type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;

  interface IRouterMatcher<T> {
    (path: string | RegExp | Array<string | RegExp>, ...handlers: Array<RequestHandler>): T;
  }

  interface IRouter {
    get: IRouterMatcher<this>;
    post: IRouterMatcher<this>;
    put: IRouterMatcher<this>;
    patch: IRouterMatcher<this>;
    delete: IRouterMatcher<this>;
    use(...handlers: Array<RequestHandler>): this;
    use(path: string, ...handlers: Array<RequestHandler>): this;
  }

  interface Application extends IRouter {
    listen(port: number, callback?: () => void): void;
    get(name: string): any;
    set(name: string, value: any): this;
    handle(req: any, res: any, callback?: (err?: any) => void): void;
  }

  interface Express {
    (): Application;
    static(root: string, options?: any): RequestHandler;
    Router(options?: any): IRouter;
    json(options?: any): RequestHandler;
    urlencoded(options?: any): RequestHandler;
  }

  export { Request, Response, NextFunction, RequestHandler, Application, Express, ParamsDictionary };
}

declare module 'express' {
  import { Express, Request, Response, NextFunction, Application, RequestHandler } from 'express-serve-static-core';
  
  export { Express, Request, Response, NextFunction, Application, RequestHandler };
  
  const express: Express & { [key: string]: any };
  export default express;
}

declare module 'multer' {
  import { Request } from 'express';
  
  namespace multer {
    interface File extends Express.Multer.File {}

    interface Options {
      dest?: string;
      storage?: any;
      limits?: {
        fieldNameSize?: number;
        fieldSize?: number;
        fields?: number;
        fileSize?: number;
        files?: number;
        parts?: number;
        headerPairs?: number;
      };
      preservePath?: boolean;
      fileFilter?(req: Request, file: File, callback: (error: Error | null, acceptFile: boolean) => void): void;
    }

    class StorageEngine {}

    interface DiskStorageOptions {
      destination?: string | ((req: Request, file: File, callback: (error: Error | null, destination: string) => void) => void);
      filename?: (req: Request, file: File, callback: (error: Error | null, filename: string) => void) => void;
    }

    interface Instance {
      single(fieldname: string): any;
      array(fieldname: string, maxCount?: number): any;
      fields(fields: Array<{ name: string; maxCount?: number }>): any;
      none(): any;
      any(): any;
    }

    interface Multer extends Instance {
      (options?: Options): Multer.Instance;
      diskStorage(options: DiskStorageOptions): StorageEngine;
      memoryStorage(): StorageEngine;
      MulterError: typeof Error;
    }
  }

  interface MulterInstance extends multer.Instance {}
  
  declare const multer: multer.Multer;
  export = multer;
}

declare module 'multer' {
  import { Request } from 'express';

  interface Options {
    dest?: string;
    storage?: any;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    preservePath?: boolean;
    fileFilter?(req: Request, file: Express.Multer.File, callback: FileFilterCallback): void;
  }

  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }

  interface FileFilterCallback {
    (error: Error | null, acceptFile: boolean): void;
  }

  interface FileFilterCallback {
    (error: Error | null, acceptFile: boolean): void;
  }

  interface Multer {
    (options?: Options): any;
    diskStorage(options: {
      destination?: string | ((req: Request, file: File, callback: (error: Error | null, destination: string) => void) => void);
      filename?: (req: Request, file: File, callback: (error: Error | null, filename: string) => void) => void;
    }): any;
    single(fieldname: string): any;
    MulterError: typeof Error & {
      prototype: Error;
      constructor: (code: string) => Error;
    };
  }

  const multer: Multer;
  export = multer;
}

declare module 'zod' {
  export * from '@types/zod';
  export const z: any;
  export interface ZodType {
    infer: any;
  }
}

declare module 'drizzle-orm/pg-core' {
  export const pgTable: any;
  export const text: any;
  export const serial: any;
  export const integer: any;
  export const boolean: any;
  export const timestamp: any;
  export const jsonb: any;
}

declare module 'drizzle-zod' {
  export function createInsertSchema(table: any): any;
}

// Custom type definitions for our application
export interface AuthenticatedRequest extends Express.Request {
  user: {
    id: number;
    username: string;
    role: string;
  };
}

export interface JWTPayload {
  id: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}
