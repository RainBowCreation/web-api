import * as fs from 'fs';
import * as path from 'path';

export class Logger {
    private logFilePath: string;

    constructor(logFileName: string) {
        this.logFilePath = path.join(__dirname, logFileName);
        console.log(this.logFilePath)
        // Ensure the log file exists or create it
        if (!fs.existsSync(this.logFilePath)) {
            fs.writeFileSync(this.logFilePath, '');
        }
    }

    public info(message: any): void {
        const callerInfo = this.getCallerInfo();
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}/INFO]: [${callerInfo}] ${message}`;

        // Output to console
        console.log(logMessage);

        // Append to file
        fs.appendFileSync(this.logFilePath, logMessage + '\n');
    }

    public error(message: string, e?: any[] | unknown): void {
        const callerInfo = this.getCallerInfo();
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}/ERROR]: [${callerInfo}] ${message}`;

        console.error(logMessage, e);

        fs.appendFileSync(this.logFilePath, logMessage + '\n');
    }

    private getCallerInfo(): string {
        // Capture the stack trace and extract the caller's class and method
        const stack = new Error().stack;
        if (!stack) return 'unknown/unknown';

        const lines = stack.split('\n');
        let callerLine = lines[3]; 

        // Handle case for main/global function (anonymous or called without a class context)
        if (callerLine.includes('<anonymous>')) {
            return 'main';
        }

        // Regular expression to match the caller line in stack trace
        const match = callerLine.match(/at\s+(.*)\s+\((.*)\)/);

        if (match && match[1]) {
            // Split class and method from function signature
            const funcParts = match[1].split('.');
            const methodName = funcParts.pop() || 'unknown';
            const className = funcParts.pop() || 'unknown';
            if ((methodName == 'unknown') !== (className == 'unknown')) {
                if (methodName != 'unknown') {
                    return methodName;
                }
                return className;
            }
            return `${className}/${methodName}`;
        }
        return 'unknown/unknown';
    }
}
