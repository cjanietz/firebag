const getClassValidator = () => {
    try {
        const { validate } = require('class-validator');
        return validate;
    } catch (err) {
        return null;
    }
};

export const validateClassValidator = async (obj: object) => {
    const validateFunc = getClassValidator();
    if (validateFunc) {
        return validateFunc(obj);
    } else {
        return null;
    }
};
