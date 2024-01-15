// A comparer used to determine if two entries are equal.
const isSameId = (a: any, b: any) => a._id === b._id;

// Get items that only occur in the left array,
// using the compareFunction to determine equality.
const onlyInLeft = (left: any, right: any, compareFunction: (a: any, b: any) => void) => 
left.filter((leftValue: any) =>
    !right.some((rightValue: any) => 
    compareFunction(leftValue, rightValue)));

export { isSameId, onlyInLeft };