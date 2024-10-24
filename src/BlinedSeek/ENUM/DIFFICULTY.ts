export enum DIFFICULTY {
    NOOB = 0,
    EASY = 1,
    NORMAL = 2,
    HARD = 3,
    INSANE = 4,
    HARDCORE = 5
}

export function translateDifficultyCode(difficulty: DIFFICULTY): string {
    const entry = Object.entries(difficulty).find(([_, value]) => value === difficulty);
    return entry ? entry[0] : 'Unknown Status Difficulty';
}

// Function to translate status message to code
export function translateDifficultyMessage(message: string): DIFFICULTY | -1 {
    const entry = Object.entries(DIFFICULTY).find(([key, msg]) => msg === message);
    return entry ? parseInt(entry[0], 10) as DIFFICULTY : -1;
}