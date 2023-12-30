import { NextFunction, Request, Response } from "express";
import { anonymousErrors } from "../utils/helper";
import logger from "../../logger";

export function checkbody(bodyAllowedList: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        for (const prop in req.body) {
            let unwantedParam = [];
            if (req.body.hasOwnProperty(prop) && !bodyAllowedList.has(prop)) {
                unwantedParam.push(prop);
            }
            if (unwantedParam.length) {
                logger(__filename).info(`Func(): checkbody message : Unexpected parameter ${prop} in POST body`);
                anonymousErrors(400, `Unexpected parameter ${prop} in POST body`, res);
                return;
            }
        }
        next();
    };
}
