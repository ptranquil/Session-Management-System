import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
const { combine, label, printf } = format;

const logger = (filename: string) => {

    /** To get the timeformat in IST format */
    const getISTTimestamp = function () {
        var tzoffset = (new Date()).getTimezoneOffset() * 60000;
        var localISOTime = (new Date(Date.now() - tzoffset)).toISOString();
        return localISOTime
    }
    const timeFormat = getISTTimestamp()
    const time = timeFormat.slice(0, 19).replace('T', ' ');

    const myFormat = printf(({ level, message, label }: any) => {
        return `${time} [${label}] ${level}: ${message}`
    })

    return createLogger({
        format: combine(
            label({ label: path.basename(filename) }),
            myFormat
        ),
        transports: [
            new transports.Console(),
            new DailyRotateFile({
                filename: "logs-%DATE%.log",
                datePattern: "YYYY-MM-DD",
                dirname: "./logs",
                maxSize: "20m",
                maxFiles: "7d",
            }),
        ],
    });
}

export default logger;