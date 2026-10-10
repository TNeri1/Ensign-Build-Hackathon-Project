export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = 'error',
  ) {
    super(message);
  }
}
export const notFound = (what = 'Not found') => new AppError(404, what, 'not_found');
export const badRequest = (msg: string) => new AppError(400, msg, 'bad_request');
export const forbidden = (msg = 'Forbidden') => new AppError(403, msg, 'forbidden');
export const unauthorized = (msg = 'Login required') => new AppError(401, msg, 'unauthorized');
