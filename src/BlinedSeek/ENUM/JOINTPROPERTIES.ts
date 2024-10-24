export enum JOINTPROPERTIES { VOID = 0,
    ONEWAY = 1,
    TWOWAY = 2,
    COOLDOWN = 3,
}

export function translateJointPropertiesCode(mapSize: JOINTPROPERTIES): string {
    const entry = Object.entries(mapSize).find(([_, value]) => value === mapSize);
    return entry ? entry[0] : 'Unknown Joint Properties';
}

// Function to translate status message to code
export function translateJointPropertiesMessage(message: string): JOINTPROPERTIES | -1 {
    const entry = Object.entries(JOINTPROPERTIES).find(([key, msg]) => msg === message);
    return entry ? parseInt(entry[0], 10) as JOINTPROPERTIES : -1;
}