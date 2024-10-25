export type ConfigurableParams = {
    map_size: number;
    a?: number;
    b?: number;
    c?: number;
    d?: number;
    e?: number;
    f?: number;
    g?: number;
};

// Helper function to get random integer between min and max (inclusive)
export const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to get random width and height that multiply to map_size
/*
export const getDimensions = (size: number): [number, number] => {
    const factors: number[] = [];
    for (let i = 1; i <= Math.sqrt(size); i++) {
        if (size % i === 0) {
            factors.push(i);
        }
    }
    const width = factors[Math.floor(Math.random() * factors.length)];
    const height = size / width;
    return [width, height];
};*/

export const getDimensions = (mapSize: number): [number, number] => {
    let minDimension = Math.ceil(mapSize / 10); // Minimum width and height based on mapSize

    // Find all possible pairs (width, height) where width * height = mapSize
    let possiblePairs = [];
    
    for (let width = minDimension; width <= mapSize; width++) {
        if (mapSize % width === 0) {  // width * height = mapSize, so height = mapSize / width
            let height = mapSize / width;
            if (height >= minDimension) { // Ensure height also satisfies the minDimension condition
                possiblePairs.push({ width, height });
            }
        }
    }

    // Randomly select one of the valid pairs
    if (possiblePairs.length > 0) {
        let pair = possiblePairs[getRandomInt(0, possiblePairs.length - 1)];
        return [pair.width, pair.height];
    } else {
        // In case no valid pair is found, which is unlikely for reasonable map sizes
        return [ minDimension, minDimension ];
    }
}

// Function to place a specific number in random positions
export const placeNumber = (grid: number[][], num: number, count: number, width: number, height: number) => {
    let placed = 0;
    while (placed < count) {
        const randX = Math.floor(Math.random() * width);
        const randY = Math.floor(Math.random() * height);

        if (grid[randY][randX] === 0) {
            grid[randY][randX] = num;
            placed++;
        }
    }
};

// Main function to generate the map
export function genMap(params: ConfigurableParams): number[][] {
    const { map_size, a, b, c, d, e, f, g } = params;

    // Step 1: Randomize values if not provided
    const max_a = Math.floor(map_size / 2);
    const sum_of_b_to_g = Math.floor(map_size / 2);

    const final_a = a !== undefined ? a : getRandomInt(1, max_a);

    let remaining = sum_of_b_to_g - (b || 0) - (c || 0) - (d || 0) - (e || 0) - (f || 0) - (g || 0);
    const final_b = b !== undefined ? b : getRandomInt(0, remaining);
    remaining -= final_b;
    const final_c = c !== undefined ? c : getRandomInt(0, remaining);
    remaining -= final_c;
    const final_d = d !== undefined ? d : getRandomInt(0, remaining);
    remaining -= final_d;
    const final_e = e !== undefined ? e : getRandomInt(0, remaining);
    remaining -= final_e;
    const final_f = f !== undefined ? f : getRandomInt(0, remaining);
    remaining -= final_f;
    const final_g = g !== undefined ? g : getRandomInt(0, remaining);

    // Step 2: Get random width and height for the map
    const [width, height] = getDimensions(map_size);

    // Step 3: Create grid filled with 0
    const grid: number[][] = Array.from({ length: height }, () => Array(width).fill(0));

    // Step 4: Place numbers in the grid
    placeNumber(grid, 1, final_a, width, height);
    placeNumber(grid, 2, final_b, width, height);
    placeNumber(grid, 3, final_c, width, height);
    placeNumber(grid, 4, final_d, width, height);
    placeNumber(grid, 5, final_e, width, height);
    placeNumber(grid, 6, final_f, width, height);
    placeNumber(grid, 7, final_g, width, height);

    return grid;
}