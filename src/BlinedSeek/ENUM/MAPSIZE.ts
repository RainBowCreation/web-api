export enum MAPSIZE {
    VERY_SMALL = 3,
    SMALL = 5,
    NORMAL = 7,
    LARGE = 14,
    VERY_LARGE = 28
}

export function translateMapSizeCode(mapSize: MAPSIZE): string {
    const entry = Object.entries(mapSize).find(([_, value]) => value === mapSize);
    return entry ? entry[0] : 'Unknown Status Difficulty';
}

// Function to translate status message to code
export function translateMapSizeMessage(message: string): MAPSIZE | -1 {
    const entry = Object.entries(MAPSIZE).find(([key, msg]) => msg === message);
    return entry ? parseInt(entry[0], 10) as MAPSIZE : -1;
}