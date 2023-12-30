import { type Request, type Response, type NextFunction } from 'express';
import { anonymousErrors } from '../utils/helper';
import { AnyZodObject } from 'zod';

const validateZod = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                params: req.params
            });
            next();
        } catch (e: any) {
            const errorMessage: string[] = [];
            e.errors.map((err: any) => {
                errorMessage.push(`errorField: ${err.path.join('.')} Message: ${err.message}`);
            })
            anonymousErrors(400, errorMessage, res);
            return;
        }
    }
}

export default validateZod;
