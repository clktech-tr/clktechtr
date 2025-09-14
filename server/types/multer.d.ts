declare module 'multer' {
  import { Request } from 'express';
  import { Options } from 'multer';

  interface Multer {
    (options?: Options): any;
    diskStorage(options: {
      destination?: string | ((req: Request, file: any, callback: (error: Error | null, destination: string) => void) => void);
      filename?: (req: Request, file: any, callback: (error: Error | null, filename: string) => void) => void;
    }): any;
    MulterError: Error;
  }

  interface FileFilterCallback {
    (error: Error | null, acceptFile: boolean): void;
  }

  const multer: Multer;
  export = multer;
}
