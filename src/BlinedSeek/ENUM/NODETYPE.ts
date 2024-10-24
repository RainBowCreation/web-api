export enum NODETYPE {
    VOID = 0,
    BLANK = 1,
    SHOP = 2,
    GOOD = 3,
    BAD = 4,
    TELEPORT = 5,
    FROZEN = 6
}

export function translateNodeTypeCode(mapSize: NODETYPE): string {
    const entry = Object.entries(mapSize).find(([_, value]) => value === mapSize);
    return entry ? entry[0] : 'Unknown Node Type';
}

// Function to translate status message to code
export function translateNoteTypeMessage(message: string): NODETYPE | -1 {
    const entry = Object.entries(NODETYPE).find(([key, msg]) => msg === message);
    return entry ? parseInt(entry[0], 10) as NODETYPE : -1;
}