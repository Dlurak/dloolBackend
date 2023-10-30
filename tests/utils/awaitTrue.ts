/**
 * A function that returns a promise that resolves when the given boolean is true
 * If needed, the function will check the boolean every 100ms
 * @param boolean The boolean to await
 */
export const awaitTrue = async (boolean: () => boolean): Promise<void> => {
    return new Promise((resolve) => {
        if (boolean()) {
            resolve();
        } else {
            setTimeout(() => {
                resolve(awaitTrue(boolean));
            }, 50);
        }
    });
};
