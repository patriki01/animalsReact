export type Gender = "female" | "male" | "other";
export type AnimalType = "cat" | "dog" | "other"

export type EditUser = {
    id: string,
    name?: string,
    banned?: boolean,
    gender?: Gender,
}

export type SimpleUser = {
    name: string,
    banned: boolean,
    gender: Gender,
};

export type User = SimpleUser & {
    id: string,
}

export type EditAnimal = {
    id: string,
    name?: string,
    type?: AnimalType,
    age?: number,
}

export type SimpleAnimal = {
    name: string,
    type: AnimalType,
    age: number,
};

export type Animal = SimpleAnimal & {
    id: string,
}
