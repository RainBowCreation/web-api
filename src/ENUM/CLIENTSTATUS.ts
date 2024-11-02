// httpStatusCodes.ts
export enum CLIENTSTATUS {
    Disconnected = 0,
    Connected = 1
}

// Function to translate status code to message
export function translateClientStatusCode(code: CLIENTSTATUS): string {
    const entry = Object.entries(CLIENTSTATUS).find(([_, value]) => value === code);
    return entry ? entry[0] : 'Unknown Status Code';
}

// Function to translate status message to code
export function translateClientStatusMessage(message: string): CLIENTSTATUS | -1 {
    const entry = Object.entries(CLIENTSTATUS).find(([key, msg]) => msg === message);
    return entry ? parseInt(entry[0], 10) as CLIENTSTATUS : -1;
}