export enum JOINTTYPE { VOID = 0,
    NONE = 0,
    NORMAL = 1,
    TELEPORT = 2,
    LOOP = 3,
    LOCK = 4,
}

export function translateJointTypeCode(mapSize: JOINTTYPE): string {
    const entry = Object.entries(mapSize).find(([_, value]) => value === mapSize);
    return entry ? entry[0] : 'Unknown Joint Type';
}

// Function to translate status message to code
export function translateJointTypeMessage(message: string): JOINTTYPE | -1 {
    const entry = Object.entries(JOINTTYPE).find(([key, msg]) => msg === message);
    return entry ? parseInt(entry[0], 10) as JOINTTYPE : -1;
}