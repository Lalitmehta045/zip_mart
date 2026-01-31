export const valideURLConvert = (name) => {
    const url = name?.toString().replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    return url;
}