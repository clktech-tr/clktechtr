declare module 'express' {
  import { EventEmitter } from 'events';
  import { IncomingMessage, ServerResponse } from 'http';

  namespace Express {
    interface Multer {
      File: {
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

  export interface Request extends IncomingMessage {
    body: any;
    params: any;
    query: any;
    path: string;
    method: string;
    originalUrl: string;
    headers: {
      origin?: string;
      authorization?: string;
      [key: string]: string | string[] | undefined;
    };
    env?: string;
    file?: Express.Multer.File;
  }

  export interface Response extends ServerResponse {
    json(body: any): Response;
    send(body: any): Response;
    status(code: number): Response;
    sendFile(path: string): void;
    setHeader(name: string, value: string | string[]): Response;
    set(field: string | Record<string, string>, value?: string | string[]): Response;
    on(event: string, callback: (...args: any[]) => void): void;
  }

  export interface NextFunction {
    (err?: any): void;
  }

  export interface Express extends EventEmitter {
    (): Application;
    static: (root: string) => any;
    json: () => any;
    urlencoded: (options: { extended: boolean }) => any;
    use: (path: string | RequestHandler | ErrorRequestHandler, ...handlers: Array<RequestHandler | ErrorRequestHandler>) => Express;
  }

  export interface ErrorRequestHandler {
    (err: any, req: Request, res: Response, next: NextFunction): void;
  }

  export interface Application extends Express {
    use(path: string | RequestHandler | ErrorRequestHandler | any, ...handlers: Array<RequestHandler | ErrorRequestHandler>): Application;
    get(path: string | RequestHandler[], ...handlers: RequestHandler[]): Application;
    post(path: string, ...handlers: RequestHandler[]): Application;
    put(path: string, ...handlers: RequestHandler[]): Application;
    delete(path: string, ...handlers: RequestHandler[]): Application;
    patch(path: string, ...handlers: RequestHandler[]): Application;
    get(name: string): any;
    set(name: string, value: any): Application;
    get(path: string, ...handlers: RequestHandler[]): Application;
    post(path: string, ...handlers: RequestHandler[]): Application;
    put(path: string, ...handlers: RequestHandler[]): Application;
    delete(path: string, ...handlers: RequestHandler[]): Application;
  }

  export interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): void;
  }

  const express: Express;
  export default express;
}
