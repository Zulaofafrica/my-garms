// Profile & Measurements Types

export type Gender = 'male' | 'female';

export type ClothingSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';

// Male-specific measurements
export interface MaleMeasurements {
    height: string; // in cm or inches
    weight: string; // in kg or lbs
    shirtSize: ClothingSize;
    waistSize: string; // in inches
    inseam: string; // in inches
    blazerSize: string; // numeric size
    shoeSize: string; // numeric size
}

// Female-specific measurements
export interface FemaleMeasurements {
    height: string;
    weight: string;
    topsSize: ClothingSize;
    bottomSize: string;
    dressSize: string;
    waistSize: string;
    inseam: string;
    braSize: string; // e.g., "34B"
    shoeSize: string;
}

// Union type for measurements
export type Measurements = MaleMeasurements | FemaleMeasurements;

// Profile interface
export interface Profile {
    id: string;
    name: string;
    gender: Gender;
    measurements: MaleMeasurements | FemaleMeasurements;
    createdAt: string;
    updatedAt: string;
}

// Default empty measurements
export const getDefaultMaleMeasurements = (): MaleMeasurements => ({
    height: '',
    weight: '',
    shirtSize: 'M',
    waistSize: '',
    inseam: '',
    blazerSize: '',
    shoeSize: '',
});

export const getDefaultFemaleMeasurements = (): FemaleMeasurements => ({
    height: '',
    weight: '',
    topsSize: 'M',
    bottomSize: '',
    dressSize: '',
    waistSize: '',
    inseam: '',
    braSize: '',
    shoeSize: '',
});

// Generate unique ID
export const generateId = (): string => {
    return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
